import axios from "axios";
import Cookies from "js-cookie";
const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_BASE_URL}`,
});
const user = localStorage.getItem("profile");
if (window.location.pathname !== "/auth") {
  // we can't setup API before login, if we try to manually type any other path that would lead to auth page
  API.interceptors.request.use((req) => {
    if (user) {
      const userId = JSON.parse(user).user._id;
      if (
        req.url !== "/user/signin" &&
        req.url !== "/user/googleSignin" &&
        req.url !== "/user/signout"
      ) {
        let token = Cookies.get("token");
        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
          req.headers["userId"] = userId;
          return req;
        } else {
          throw new Response("", {
            status: 404,
            statusText: "Token Not Found",
          });
        }
      }
    } else {
      window.location.href = "/auth";
      throw new Response("", {
        status: 404,
        statusText: "User Data Not Found",
      });
    }
  });
}

const handleApiCall = async (apiCall) => {
  const response = await apiCall();
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
export const postMessage = async (user1Id, user2Id, chatId, messageObj) =>
  handleApiCall(() =>
    API.post(`/chat/postMessage/${chatId}`, { user1Id, user2Id, messageObj })
  );
export const reactMessage = async (userId, chatId, messageId, emoji) =>
  handleApiCall(() =>
    API.patch("/chat/postEmoji", { userId, chatId, messageId, emoji })
  );
export const addToSeenBy = async (chatId) =>
  handleApiCall(() => API.patch("/chat/addToSeenBy", { chatId }));
export const getAllUsers = async () =>
  handleApiCall(() => API.get("/user/allUsers"));
export const getSingleUser = async (userId) =>
  handleApiCall(() => API.get(`/user/${userId}`));
export const createChat = async (user1Id, user2Id) =>
  handleApiCall(() => API.post("/chat/create", { user1Id, user2Id }));
export const getInvite = async (inviteId) =>
  handleApiCall(() => API.get(`/invite/${inviteId}`));
export const createInvite = async (userId) =>
  handleApiCall(() => API.post("/invite/create", { userId }));
