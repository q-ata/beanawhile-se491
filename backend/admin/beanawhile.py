from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as UserAdminOld

from backend.models import User, Location, TravelInfo, FriendRequest


class UserAdmin(UserAdminOld):
    pass


class LocationAdmin(admin.ModelAdmin):
    fields = ('name', 'google_id', 'coordinates')
    list_display = ('name', 'google_id', 'coordinates')
    search_fields = ('name', 'google_id')
    readonly_fields = ('coordinates', 'google_id')


class TravelInfoAdmin(admin.ModelAdmin):
    fields = ('user', 'start_date', 'end_date', 'location', 'added_at', 'modified_at')
    list_display = ('user', 'start_date', 'end_date', 'location', 'modified_at')
    readonly_fields = ('start_date', 'end_date', 'added_at', 'modified_at')


class FriendRequestAdmin(admin.ModelAdmin):
    pass


admin.site.register(User, UserAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(TravelInfo, TravelInfoAdmin)
admin.site.register(FriendRequest, FriendRequestAdmin)

