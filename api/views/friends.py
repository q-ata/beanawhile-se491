from django.db import transaction, IntegrityError

from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import UserFromEmailSerializer, UserGetSerializer
from backend.models import User, FriendRequest


class RequestFriend(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None, **kwargs):
        data = UserFromEmailSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        requestee = data.save()

        if requestee == request.user:
            raise ValidationError({'email': ['cannot friend yourself']})
        if request.user.friends.filter(pk=requestee.pk).exists():
            raise ValidationError({'email': ['already friends']})
        try:
            FriendRequest.objects.create(requester=request.user, requestee=requestee)
        except IntegrityError:
            raise ValidationError({'email': ['friend request already pending']})

        return Response({})


class ViewIncomingFriendRequests(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None, **kwargs):
        requesters = User.objects.filter(pk__in=request.user.friend_request_requestee.values_list('requester__pk', flat=True))
        serializer = UserGetSerializer(requesters, many=True)
        return Response(serializer.data)


class ViewOutgoingFriendRequests(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None, **kwargs):
        requesters = User.objects.filter(pk__in=request.user.friend_request_requester.values_list('requestee__pk', flat=True))
        serializer = UserGetSerializer(requesters, many=True)
        return Response(serializer.data)


class ApproveFriendRequest(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None, **kwargs):
        data = UserFromEmailSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        requester = data.save()

        with transaction.atomic():
            deleted = FriendRequest.objects.filter(requester=requester, requestee=request.user).delete()[0]
            if not deleted:
                raise ValidationError({'email': ['no such friend request']})
            requester.friends.add(request.user)
        return Response({})


class DenyFriendRequest(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None, **kwargs):
        data = UserFromEmailSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        requester = data.save()

        deleted = FriendRequest.objects.filter(requester=requester, requestee=request.user).delete()[0]
        if not deleted:
            raise ValidationError({'email': ['no such friend request']})
        return Response({})


class RemoveFriendRequest(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None, **kwargs):
        data = UserFromEmailSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        requestee = data.save()

        deleted = FriendRequest.objects.filter(requester=request.user, requestee=requestee).delete()[0]
        if not deleted:
            raise ValidationError({'email': ['no such friend request']})
        return Response({})


class ViewFriends(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None, **kwargs):
        serializer = UserGetSerializer(request.user.friends.all(), many=True)
        return Response(serializer.data)


class RemoveFriend(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None, **kwargs):
        data = UserFromEmailSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        friend = data.save()

        request.user.friends.remove(friend)
        request.user.close_friends.remove(friend)
        return Response({})


class AddCloseFriend(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None, **kwargs):
        data = UserFromEmailSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        friend = data.save()

        with transaction.atomic():
            if not request.user.friends.filter(id=friend.id).exists():
                raise ValidationError({'email': ['cannot become close friends with someone who is not your friend']})
            request.user.close_friends.add(friend)
        return Response({})


class RemoveCloseFriend(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None, **kwargs):
        data = UserFromEmailSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        friend = data.save()

        request.user.close_friends.remove(friend)
        return Response({})


class ViewCloseFriends(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None, **kwargs):
        serializer = UserGetSerializer(request.user.close_friends.all(), many=True)
        return Response(serializer.data)
