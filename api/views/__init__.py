from api.views.travel_info import GetTravelInfo, UpsertTravelInfo, GetFriendsOverlappingTravelInfo, GetAllFriendsTravelInfo
from api.views.user import RegistrationEndpoint, LoginEndpoint, LogoutEndpoint, GetUser, GetPublicUser, GetPhoneNumbers, PhoneEndpoint, UpdateUser
from api.views.friends import (
    AddCloseFriend,
    ApproveFriendRequest,
    DenyFriendRequest,
    RemoveCloseFriend,
    RemoveFriend,
    RemoveFriendRequest,
    RequestFriend,
    ViewCloseFriends,
    ViewIncomingFriendRequests,
    ViewOutgoingFriendRequests,
    ViewFriends,
)
