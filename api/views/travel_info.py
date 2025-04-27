import datetime

import googlemaps
from django.conf import settings
from django.contrib.gis.geos import Point
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import TravelInfoSerializerWithClamp, TravelInfoQuerySerializer, TravelInfoUpsertSerializer, UserGetSerializer
from backend.models import Location, TravelInfo

DAY = datetime.timedelta(days=1)

class GetTravelInfo(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None, **kwargs):
        filters = TravelInfoQuerySerializer(data=request.query_params)
        filters.is_valid(raise_exception=True)

        friend = filters.validated_data['friend']
        start_date = filters.validated_data['start_date']
        end_date = filters.validated_data['end_date']

        q = Q()
        if start_date is not None:
            q |= Q(end_date__lt=start_date)
        if end_date is not None:
            q |= Q(start_date__gt=end_date)

        if friend is not None:
            user = request.user.friends.filter(email=friend).first()
            if user is None:
                raise ValidationError({'friend': ['unknown friend']})
        else:
            user = request.user

        serializer = TravelInfoSerializerWithClamp(
            user.travelinfo_set.exclude(q).order_by('start_date'),
            start_dates=[start_date],
            end_dates=[end_date],
            many=True,
        )
        return Response(serializer.data)


class UpsertTravelInfo(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None, **kwargs):
        data = TravelInfoUpsertSerializer(data=request.data)
        data.is_valid(raise_exception=True)

        start_date = data.validated_data['start_date']
        end_date = data.validated_data['end_date']
        google_id = data.validated_data['location']

        with transaction.atomic():
            # Two cases:
            # 1. A single travel info completely overlaps the new range, so we need to "split" the old travel info.
            # 2. Some subset of travel infos partially or is fully overlapped by the new range, so we need to delete / clamp.
            complete_overlap = request.user.travelinfo_set.filter(start_date__lte=start_date, end_date__gte=end_date).first()
            if complete_overlap is not None:
                # Case 1
                overlapped_start_date = complete_overlap.start_date
                overlapped_end_date = complete_overlap.end_date

                complete_overlap.delete()
                if overlapped_start_date != start_date:
                    complete_overlap.pk = None
                    complete_overlap.start_date = overlapped_start_date
                    complete_overlap.end_date = start_date - DAY
                    complete_overlap.save()
                if overlapped_end_date != end_date:
                    complete_overlap.pk = None
                    complete_overlap.start_date = end_date + DAY
                    complete_overlap.end_date = overlapped_end_date
                    complete_overlap.save()
            else:
                # Case 2
                request.user.travelinfo_set.filter(start_date__gte=start_date, end_date__lte=end_date).delete()
                request.user.travelinfo_set.filter(start_date__lt=start_date, end_date__gte=start_date).update(end_date=start_date - DAY)
                request.user.travelinfo_set.filter(start_date__lte=end_date, end_date__gt=end_date).update(start_date=end_date + DAY)

            if google_id is not None:
                try:
                    location_obj = Location.objects.get(google_id=google_id)
                except Location.DoesNotExist:
                    client = googlemaps.Client(key=settings.GOOGLE_MAPS_KEY)
                    try:
                        data = client.geocode(place_id=google_id)[0]
                    except (IndexError, googlemaps.exceptions.HTTPError):
                        raise ValidationError('invalid location')
                    location_obj = Location.objects.create(
                        google_id=google_id,
                        name=data['formatted_address'],
                        coordinates=Point([
                            data['geometry']['location']['lng'],
                            data['geometry']['location']['lat'],
                        ]),
                    )

                # Force evaluate
                adjacent_infos = list(
                    request.user.travelinfo_set
                    .filter(location=location_obj)
                    .filter(Q(end_date=start_date - DAY) | Q(start_date=end_date + DAY))
                )

                if len(adjacent_infos) == 0:
                    TravelInfo.objects.create(
                        user=request.user,
                        start_date=start_date,
                        end_date=end_date,
                        location=location_obj,
                    )
                elif len(adjacent_infos) == 1:
                    info = adjacent_infos[0]
                    info.start_date = min(info.start_date, start_date)
                    info.end_date = max(info.end_date, end_date)
                    info.save()
                elif len(adjacent_infos) == 2:
                    info = adjacent_infos[0]
                    info.start_date = min(info.start_date, adjacent_infos[1].start_date, start_date)
                    info.end_date = max(info.end_date, adjacent_infos[1].end_date, end_date)
                    info.save()
                    adjacent_infos[1].delete()

        return Response({})


class GetFriendsOverlappingTravelInfo(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None, **kwargs):
        filters = TravelInfoQuerySerializer(data=request.query_params)
        filters.is_valid(raise_exception=True)

        start_date = filters.validated_data['start_date']
        end_date = filters.validated_data['end_date']
        params = [request.user.id]
        where = ['m.user_id = %s']

        if start_date is not None:
            params += [start_date, start_date]
            where += ['f.end_date >= %s', 'm.end_date >= %s']
        if end_date is not None:
            params += [end_date, end_date]
            where += ['f.start_date <= %s', 'm.start_date <= %s']

        query = '''\
select f.*, m.start_date as overlap_start, m.end_date as overlap_end
from backend_travelinfo f inner join
     backend_location fl on f.location_id = fl.id inner join
     backend_location ml on st_distance(fl.coordinates, ml.coordinates) <= %s * 1000 inner join
     backend_travelinfo m on m.location_id = ml.id and m.start_date <= f.end_date and m.end_date >= f.start_date inner join
     backend_user_friends on from_user_id = m.user_id and to_user_id = f.user_id
where {where}
order by greatest(f.start_date, m.start_date)'''.format(where=' and '.join(where))

        objs = TravelInfo.objects.raw(query, params=[request.user.proximity_distance or 100] + params)

        resp = {}
        for obj in objs.iterator():
            if obj.user.pk not in resp:
                resp[obj.user.pk] = {**UserGetSerializer(obj.user).data, "overlap": []}
            resp[obj.user.pk]["overlap"].append(
                TravelInfoSerializerWithClamp(
                    obj,
                    start_dates=[start_date, obj.overlap_start],
                    end_dates=[end_date, obj.overlap_end],
                ).data,
            )
        return Response(resp.values())


# TODO: restrict, don't dump ALL data
class GetAllFriendsTravelInfo(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None, **kwargs):
        objs = TravelInfo.objects.filter(user__in=self.request.user.friends.all())

        resp = {}
        for obj in objs.iterator():
            if obj.user.pk not in resp:
                resp[obj.user.pk] = {**UserGetSerializer(obj.user).data, "info": []}
            resp[obj.user.pk]["info"].append(
                TravelInfoSerializerWithClamp(
                    obj,
                    start_dates=[],
                    end_dates=[],
                ).data,
            )
        return Response(resp.values())
