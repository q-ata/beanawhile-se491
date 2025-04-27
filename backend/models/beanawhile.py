from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.gis.db.models import PointField
from django.contrib.gis.geos import Point


class UserManager(BaseUserManager):
    def create_user(self, name, email, password=None):
        """
        Create and save a user with given email, password
        """
        user = self.model(name = name,
            email = email,
            username = email, #TODO : is username field necessary?
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

class Location(models.Model):
    name = models.CharField(max_length=128, blank=True, null=False)
    google_id = models.CharField(max_length=128, blank=False, null=False, unique=True)
    coordinates = PointField(geography=True, default=Point(0.0, 0.0))

    def __str__(self):
        return self.name

class AreaCode(models.Model):
    # TODO: does the length include null terminator? are we wasting a byte by making length an exact pow of 2 lol
    code = models.CharField(max_length=8, blank=False, null=False)
    country = models.CharField(max_length=128, blank=False, null=False)

class User(AbstractUser):
    name = models.CharField(max_length=256)
    email = models.EmailField(unique=True)
    friends = models.ManyToManyField('self')
    close_friends = models.ManyToManyField('self', symmetrical=False)

    PROFILE_PICTURE_TYPES = (
        (0, 'GRAVATAR'),
        (1, 'FILE'),
        (2, 'BEAN'),
    )
    profile_picture_type = models.IntegerField(default=0, choices=PROFILE_PICTURE_TYPES, null=False)
    profile_picture_url = models.CharField(default=None, max_length=256, null=True)

    PROXIMITY_ALGORITHM_TYPES = (
        (0, 'SMART'),
        (1, 'REGION'),
        (2, 'DISTANCE'),
    )
    proximity_algorithm = models.IntegerField(default=0, choices=PROXIMITY_ALGORITHM_TYPES, null=False)
    proximity_distance = models.IntegerField(default=None, null=True)

    PERMISSION_TYPES = (
        (0, 'FRIENDS'),
        (1, 'CLOSE_FRIENDS'),
        (2, 'NOBODY')
    )
    perm_see_full_schedule = models.IntegerField(default=0, null=False, choices=PERMISSION_TYPES)
    perm_see_exact_location = models.IntegerField(default=0, null=False, choices=PERMISSION_TYPES)
    perm_view_contact_info = models.IntegerField(default=0, null=False, choices=PERMISSION_TYPES)
    perm_view_email = models.IntegerField(default=2, null=False, choices=PERMISSION_TYPES)
    
    contact_discord = models.CharField(default=None, null=True, max_length=256)
    contact_instagram = models.CharField(default=None, null=True, max_length=256)

    objects = UserManager()

    REQUIRED_FIELDS = [name, email]
    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email
    
class PhoneNumber(models.Model):
    number = models.CharField(max_length=16)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="numbers")

    def __str__(self):
        return self.number

class TravelInfo(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.ForeignKey(Location, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user}: {self.start_date} to {self.end_date} in {self.location}'

    class Meta:
        ordering = ('start_date',)


class FriendRequest(models.Model):
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_request_requester')
    requestee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_request_requestee')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'({self.requester}, {self.requestee})'

    class Meta:
        unique_together = ('requester', 'requestee')
