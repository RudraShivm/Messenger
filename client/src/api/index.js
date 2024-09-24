import axios from "axios";
import Cookies from "js-cookie";
import { getProfile } from "../store/indexedDB";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_BASE_URL}`,
});

// we can't setup API before login, if we try to manually type any other path that would lead to auth page
API.interceptors.request.use(async (req) => {
  let profile = await getProfile();
    if (profile) {
      const userId = profile.user._id;
      if (
        req.url !== "/user/signin" &&
        req.url !== "/user/googleSignin" &&
        req.url !== "/user/signout"
      ) {
        let token = Cookies.get("token");
        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
          req.headers["userId"] = userId;
        } else {
          throw {
            response: {
              status: 404,
              statusText: "Token Not Found",
            },
            message: "Token Not Found",
          };
        }
      }
    } else {
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
        throw {
          response: {
            status: 404,
            statusText: "UserData Not Found",
          },
          message: "UserData Not Found",
        };
      }
    }

  return req;
});

const handleApiCall = async (apiCall) => {
  const response = await apiCall();
  console.log(response);
  if (response?.data) {
    const { data } = response;
    const { access_token } = data;
    if (access_token) {
      Cookies.set("token", access_token, {
        secure: true,
        sameSite: "strict",
        expires: 7,
      });
      let { access_token: _, ...data_wo_access_token } = data;
      return { data: data_wo_access_token, ...response };
    }
  }
  return response;
};

export const signIn = async (formData) =>
  handleApiCall(() => API.post("/user/signin", formData));
export const signUp = async (formData) =>
  handleApiCall(() => API.post("/user/signup", formData));
export const googleSignIn = async (code) =>
  handleApiCall(() => API.post("/user/googleSignin", { code }));
export const signOut = async (userId, access_token) =>
  handleApiCall(() => API.post("/user/signout", { userId, access_token }));
export const loadChat = async (chatId) =>
  handleApiCall(() => API.get(`/chat/load/${chatId}`));
export const postMessage = async (userArr, chatId, messageObj) =>
  handleApiCall(() =>
    API.post(`/chat/postMessage/${chatId}`, { userArr, messageObj })
  );
export const reactMessage = async (userId, chatId, messageId, emoji) =>
  handleApiCall(() =>
    API.patch("/chat/postEmoji", { userId, chatId, messageId, emoji })
  );
export const addToSeenBy = async (chatId, userInfo) =>
  handleApiCall(() => API.patch("/chat/addToSeenBy", { chatId, userInfo }));
export const updateNickName = async (chatId, nickNameObj) => 
  handleApiCall(() =>
    API.patch("/chat/updateNickName", { chatId, nickNameObj })
  );
export const getAllUsers = async () =>
  handleApiCall(() => API.get("/user/allUsers"));
export const getPopulatedUserArr = async (userArr) =>
  handleApiCall(() => API.post(`/user/getPopulatedUserArr`, { userArr }));
export const createChat = async (userArr, chatType, chatCardInfo) =>
  handleApiCall(() =>
    API.post("/chat/create", { userArr, chatType, chatCardInfo })
  );
export const addToGroup = async (chatId) =>
  handleApiCall(() => API.post("/chat/addToGroup", { chatId }));
export const getInvite = async (inviteId) =>
  handleApiCall(() => API.get(`/invite/${inviteId}`));
export const createInvite = async (data) =>
  handleApiCall(() => API.post("/invite/create", { data }));
