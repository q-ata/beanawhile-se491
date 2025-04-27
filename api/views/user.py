from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from api.serializers import UserRegisterSerializer, UserGetSerializer, PhoneNumberGetSerializer, PhoneNumberCreateSerializer, UserFromEmailSerializer
from backend.models import PhoneNumber
from django.db import transaction

class RegistrationEndpoint(APIView):
    permission_classes= [AllowAny]
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        serializer = UserRegisterSerializer(data = request.data)

        if serializer.is_valid():
            user = serializer.create(serializer.validated_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginEndpoint(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            return Response({'detail': 'Logged in.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutEndpoint(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        logout(request)
        return Response({'detail': 'Logged out'}, status=status.HTTP_200_OK)
    

class GetUser(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        serializer = UserGetSerializer(self.request.user)
        return Response(serializer.data)
    
class GetPublicUser(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request, email):
        data = UserFromEmailSerializer(data={'email': email})
        data.is_valid(raise_exception=True)
        requestee = data.save()
        serializer = UserGetSerializer(requestee)

        if request.user.pk == requestee.pk or request.user.friends.filter(pk=requestee.pk).exists():
            return Response(serializer.data)
        return Response({'error: not found'}, status=status.HTTP_404_NOT_FOUND)
    
class UpdateUser(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, format=None, **kwargs):
        user = UserGetSerializer(self.request.user, data=self.request.data, partial=True)
        if user.is_valid():
            user.save()
            return Response({})
        else:
            return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)

class GetPhoneNumbers(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        serializer = PhoneNumberGetSerializer(self.request.user)
        return Response(serializer.data)
    
class PhoneEndpoint(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        tempDict = request.data.copy()  # could just pass in user instead
        tempDict['user'] = self.request.user.id

        serializer = PhoneNumberCreateSerializer(data = tempDict)

        if serializer.is_valid():
            serializer.create(serializer.validated_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        number = PhoneNumber.objects.filter(number=request.data["number"], 
                                            user=self.request.user.id)
        if number.exists():
            number.delete()

        return Response(status=status.HTTP_200_OK)

        
