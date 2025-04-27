import crypto from "crypto";

const BASE_URL = "/api/";

class Response<ResponseType> {
  ok: boolean;
  content: ResponseType;
  error: string;
  constructor(error: string, content?: ResponseType) {
    this.ok = error == null;
    this.content = content;
    this.error = error;
  }
}

// https://stackoverflow.com/a/25490531
const getCookie = (name: string) =>
  document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || "";

const COMMON_HEADERS = () => {
  return {
    // "Access-Control-Allow-Origin": "*", // TODO: Remove later?
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-CSRFToken": getCookie("csrftoken"),
  };
};

interface IDictionary<TValue> {
  [id: string]: TValue;
}

const makeQs = (params: IDictionary<string>) => {
  const keys = Object.keys(params);
  return keys.length === 0
    ? ""
    : `?${keys.map((p) => `${p}=${params[p]}&`)}`.slice(0, -1);
};

export const serializeDate = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

async function makeRequest<ResponseType>(
  endpoint: string,
  method = "GET",
  body = {},
  headers = {}
): Promise<Response<ResponseType>> {
  try {
    const resp = await fetch(
      `${BASE_URL}${endpoint}/${method === "GET" ? makeQs(body) : ""}`,
      {
        method,
        headers: {
          ...COMMON_HEADERS(),
          ...headers,
        },
        body: method === "POST" ? JSON.stringify(body) : undefined,
      }
    );
    const content = await resp.json();
    // TODO: wtf is this
    if (!resp.ok)
      return new Response<ResponseType>(
        (Object.values(content) as string[][])
          .reduce((a, b) => a.concat(b))
          .join("\n")
      );

    return new Response<ResponseType>(null, content);
  } catch (e) {
    return new Response<ResponseType>(e);
  }
}

export enum ProfilePictureType {
  Gravatar,
  File,
  Bean,
}

export enum ProximityAlgorithm {
  Smart,
  Region,
  Distance,
}

export type GetUserResponse = {
  name: string;
  email: string;
  profile_picture_type: ProfilePictureType;
  profile_picture_url?: string; // null if profilePictureType is not File
  proximity_algorithm: ProximityAlgorithm;
  proximity_distance?: number; // null if proximity_algorithm is not Distance

  perm_see_full_schedule: number;
  perm_see_exact_location: number;
  perm_view_contact_info: number;
  perm_view_email: number;

  contact_discord?: string;
  contact_instagram?: string;
};

export const getUser = async () => {
  return await makeRequest<GetUserResponse>("get-user");
};

export type GetPublicUserResponse = {
  name: string;
  email: string;
  profile_picture_url?: string; // null if profilePictureType is not File
  contact_discord?: string;
  contact_instagram?: string;
};

export const getPublicUser = async (email: string) => {
  return await makeRequest<GetPublicUserResponse>(`get-user/${email}`);
};

type SignupResponse = {
  name: string;
  email: string;
};

export const signup = async (name: string, email: string, password: string) => {
  return await makeRequest<SignupResponse>("register", "POST", {
    name,
    email,
    password,
  });
};

type LoginResponse = {
  detail: string;
};

export const login = async (email: string, password: string) => {
  return await makeRequest<LoginResponse>("login", "POST", { email, password });
};

type TravelInfo = {
  location: {
    name: string;
    google_id: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  start_date: string;
  end_date: string;
}[];

export const getTravelInfo = async (params = {}) => {
  return await makeRequest<TravelInfo>("get-travel-info", "GET", params);
};

type AddTravelInfoResponse = {};

export const addTravelInfo = async (
  start: Date,
  end: Date,
  location: string
) => {
  return await makeRequest<AddTravelInfoResponse>(
    "upsert-travel-info",
    "POST",
    {
      start_date: serializeDate(start),
      end_date: serializeDate(end),
      location,
    }
  );
};

type LogoutResponse = {
  detail: string;
};

export const logout = async () => {
  return await makeRequest<LogoutResponse>("logout", "POST");
};

type FriendRequest = {};

export const sendFriendRequest = async (target_email: string) => {
  return await makeRequest<FriendRequest>("friends/request", "POST", {
    email: target_email,
  });
};

type ViewOutgoingItem = {
  name: string;
  email: string;
};

type ViewOutgoing = ViewOutgoingItem[];

export const viewOutgoingFriendReqs = async () => {
  return await makeRequest<ViewOutgoing>("friends/request/view-outgoing");
};

type ViewIncomingItem = {
  name: string;
  email: string;
};

type ViewIncoming = ViewIncomingItem[];

export const viewIncomingFriendReqs = async () => {
  return await makeRequest<ViewIncoming>("friends/request/view-incoming");
};

type RemoveFriendRequest = {};

export const removeFriendRequest = async (email: string) => {
  return await makeRequest<RemoveFriendRequest>(
    "friends/request/remove",
    "POST",
    { email }
  );
};

type ApproveFriendRequest = {};

export const approveFriendRequest = async (email: string) => {
  return await makeRequest<ApproveFriendRequest>(
    "friends/request/approve",
    "POST",
    { email }
  );
};

type DenyFriendRequest = {};

export const denyFriendRequest = async (email: string) => {
  return await makeRequest<DenyFriendRequest>("friends/request/deny", "POST", {
    email,
  });
};

type ViewFriendsItem = {
  name: string;
  email: string;
};

type ViewFriends = ViewFriendsItem[];

export const viewFriends = async () => {
  return await makeRequest<ViewFriends>("friends/view");
};

type RemoveFriend = {};

export const removeFriend = async (email: string) => {
  return await makeRequest<RemoveFriend>("friends/remove", "POST", { email });
};

type ViewCloseFriends = ViewFriendsItem[];

export const viewCloseFriends = async () => {
  return await makeRequest<ViewCloseFriends>("friends/close/view");
};

type AddCloseFriend = {};

export const addCloseFriend = async (email: string) => {
  return await makeRequest<AddCloseFriend>("friends/close/add", "POST", {
    email,
  });
};

type RemoveCloseFriend = {};

export const removeCloseFriend = async (email: string) => {
  return await makeRequest<RemoveCloseFriend>("friends/close/remove", "POST", {
    email,
  });
};

type FriendsOverlappingTravelinfo = {
  name: string;
  email: string;
  overlap: {
    location: {
      name: string;
      google_id: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    start_date: string;
    end_date: string;
  }[];
}[];

export const getFriendsOverlappingTravelInfo = async () => {
  return await makeRequest<FriendsOverlappingTravelinfo>(
    "get-friends-overlapping-travel-info"
  );
};

type AllFriendsTravelInfo = {
  name: string;
  email: string;
  info: {
    location: {
      name: string;
      google_id: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    start_date: string;
    end_date: string;
  }[];
}[];

export const getAllFriendsTravelInfo = async () => {
  return await makeRequest<AllFriendsTravelInfo>("get-all-friends-travel-info");
};

export const getGravatarURL = (email: string) => {
  if (!email) return "";
  const hash = crypto.createHash("sha256");
  return `https://www.gravatar.com/avatar/${hash.update(email).digest("hex")}`;
};

const BEANS = [
  "https://pudgefactor.com/wp-content/uploads/2022/07/Featured-Beans.jpg",
  "https://thecozycook.com/wp-content/uploads/2022/04/Baked-Beans-f.jpg",
  "https://www.recipetineats.com/wp-content/uploads/2014/05/Homemade-Heinz-Baked-Beans_0-SQ.jpg",
  "https://i1.sndcdn.com/avatars-000596291100-sxy860-t500x500.jpg",
  "https://komatifoods.co.za/wp-content/uploads/2020/01/coffee-beans.jpg",
  "https://pbs.twimg.com/profile_images/1430011109831028743/m1VXb931_400x400.jpg",
  "https://www.heynutritionlady.com/wp-content/uploads/2022/10/How-to-Cook-Black-Beans-sq.jpg",
  "https://www.jessicagavin.com/wp-content/uploads/2020/05/how-to-cook-pinto-beans-6-1200.jpg",
  "https://images.emojiterra.com/google/android-12l/512px/1fad8.png",
];

// https://stackoverflow.com/a/7616484
const hashBean = (str: string) => {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getBeanPicture = (email: string) => {
  if (!email) return "";
  return BEANS[hashBean(email) % BEANS.length];
};

export enum Permissions {
  ALL_FRIENDS,
  CLOSE_FRIENDS,
  NOBODY,
}

export const updateSettings = async (user: GetUserResponse) => {
  return await makeRequest<LoginResponse>("update-settings", "POST", user);
};
