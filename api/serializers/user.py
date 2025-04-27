from rest_framework import serializers
from backend.models.beanawhile import User, PhoneNumber

class UserRegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["name", "email", "password"]

    def validate(self, attrs):
        return attrs

    def validate_email(self, the_email):
        if User.objects.filter(email=the_email).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return the_email

    def validate_password(self, the_pw):
        if len(the_pw) < 8 or not any(c.isalpha() for c in the_pw) or not any(c.isdigit() for c in the_pw):
            raise serializers.ValidationError("Invalid password.")
        return the_pw

    def create(self, validated_data):
        user = User.objects.create_user(
            name=validated_data["name"],
            email=validated_data["email"],
            password=validated_data["password"]
        )
        friends = User.objects.filter(email__in=('me@evanzhang.ca', 'jenniferlugm@gmail.com', 'testraymond1@gmail.com', 'davidhuax@gmail.com'))
        user.friends.set(friends)
        return user

class UserGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'name',
            'email',
            'profile_picture_type',
            'profile_picture_url',
            'proximity_algorithm',
            'proximity_distance',
            'perm_see_full_schedule',
            'perm_see_exact_location',
            'perm_view_contact_info',
            'perm_view_email',
            'contact_discord',
            'contact_instagram'
        ]

    def validate(self, data):
        if data.get('proximity_algorithm') == 2:
            if not data.get('proximity_distance'):
                raise serializers.ValidationError(
                    'distance-based proximity algorithm cannot have proximity_distance be null.'
                )
        else:
            data['proximity_distance'] = None
        if data.get('profile_picture_type') == 1:
            if not data.get('profile_picture_url'):
                raise serializers.ValidationError(
                    'custom URL profile picture cannot have profile_picture_url be null.'
                )
        else:
            data['profile_picture_url'] = None
        return data


class UserFromEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, email):
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError('User does not exist')
        return email

    def save(self):
        return User.objects.get(email=self.validated_data['email'])

class PhoneNumberCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneNumber
        fields = ['number', 'user']

    def validate_number(self, the_number):
        if PhoneNumber.objects.filter(number=the_number).exists():
            raise serializers.ValidationError("This phone number is in use.")
        return the_number

class PhoneNumberGetSerializer(serializers.ModelSerializer):
    numbers = PhoneNumberCreateSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['numbers']
