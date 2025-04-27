from django.contrib.gis.geos import Point
from rest_framework import serializers

from backend.models import Location, TravelInfo


class TravelInfoUpsertSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    location = serializers.CharField(max_length=128, required=True)

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError('start date must occur after end date')
        return data


class TravelInfoQuerySerializer(serializers.Serializer):
    friend = serializers.EmailField(required=False, default=None)
    start_date = serializers.DateField(required=False, default=None)
    end_date = serializers.DateField(required=False, default=None)


class PointSerializerField(serializers.Field):
    def to_representation(self, value):
        if isinstance(value, Point):
            return {
                'lng': value.x,
                'lat': value.y,
            }
        return None

    def to_internal_value(self, data):
        try:
            return Point(data['lng'], data['lat'])
        except Exception:
            raise serializers.ValidationError("Invalid Point format")


class LocationSerializer(serializers.ModelSerializer):
    coordinates = PointSerializerField()

    class Meta:
        model = Location
        fields = ['google_id', 'name', 'coordinates']


class TravelInfoSerializerWithClamp(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    start_date = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()

    def __init__(self, *args, start_dates=[], end_dates=[], **kwargs):
        super().__init__(*args, **kwargs)
        self.start_date_clamp = start_dates
        self.end_date_clamp = end_dates

    def clamp_if_not_none(self, date, func, clamp_dates):
        clamp_dates = [x for x in clamp_dates if x is not None]
        return func(clamp_dates + [date])

    def get_start_date(self, obj):
        return self.clamp_if_not_none(obj.start_date, max, clamp_dates=self.start_date_clamp).isoformat()
    
    def get_end_date(self, obj):
        return self.clamp_if_not_none(obj.end_date, min, clamp_dates=self.end_date_clamp).isoformat()

    class Meta:
        model = TravelInfo
        fields = ['location', 'start_date', 'end_date']
