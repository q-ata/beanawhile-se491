from django.urls import include, path
from api.views import (
    GetTravelInfo,
    UpsertTravelInfo,
    GetAllFriendsTravelInfo,
    GetFriendsOverlappingTravelInfo,
    RegistrationEndpoint,
    LoginEndpoint,
    LogoutEndpoint,
    GetUser,
    GetPublicUser,
    ApproveFriendRequest,
    DenyFriendRequest,
    RemoveFriend,
    RemoveFriendRequest,
    RequestFriend,
    ViewIncomingFriendRequests,
    ViewOutgoingFriendRequests,
    ViewFriends,
    AddCloseFriend,
    RemoveCloseFriend,
    ViewCloseFriends,
    GetPhoneNumbers, 
    PhoneEndpoint,
    UpdateUser
)

urlpatterns = [
    path('get-travel-info/', GetTravelInfo.as_view()),
    path('upsert-travel-info/', UpsertTravelInfo.as_view()),
    path('get-friends-overlapping-travel-info/', GetFriendsOverlappingTravelInfo.as_view()),
    path('get-all-friends-travel-info/', GetAllFriendsTravelInfo.as_view()),
    path('get-user/', include([
        path('', GetUser.as_view()),
        path('<str:email>/', GetPublicUser.as_view())
    ])),
    path('update-settings/', UpdateUser.as_view()),
    path('register/', RegistrationEndpoint.as_view()),
    path('login/', LoginEndpoint.as_view()),
    path('logout/', LogoutEndpoint.as_view()),
    path('get-phone-numbers/', GetPhoneNumbers.as_view()),
    path('phone-numbers/', PhoneEndpoint.as_view()),
    path('friends/', include([
        path('request/', include([
            path('', RequestFriend.as_view()),
            path('view-incoming/', ViewIncomingFriendRequests.as_view()),
            path('view-outgoing/', ViewOutgoingFriendRequests.as_view()),
            path('approve/', ApproveFriendRequest.as_view()),
            path('deny/', DenyFriendRequest.as_view()),
            path('remove/', RemoveFriendRequest.as_view()),
        ])),
        path('view/', ViewFriends.as_view()),
        path('remove/', RemoveFriend.as_view()),
        path('close/', include([
            path('add/', AddCloseFriend.as_view()),
            path('remove/', RemoveCloseFriend.as_view()),
            path('view/', ViewCloseFriends.as_view()),
        ])),
    ])),
]
