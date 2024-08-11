import * as api from "../api/index";
import {
  LOADCHAT,
  UPDATECHAT,
  CREATECHAT,
  REACTMESSAGE,
} from "../constants/actionTypes";
import { errorDispatcher } from "../functions/errorDispatcher";

export const loadChat =
  (chatObjId, chatId, navigate, setLoading) => async (dispatch) => {
    try {
      const { data } = await api.loadChat(chatId);
      if (data) {
        dispatch({ type: LOADCHAT, payload: data });
        navigate(`/home/chat/${chatObjId}/${chatId}`);
        setLoading(false);
      }
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, { message: error.message })
      );
    }
  };
export const createChat =
  (user1Id, user2Id, navigate, setLoading) => async (dispatch) => {
    try {
      const serialObj = JSON.parse(localStorage.getItem("profile"));
      const chatsArr = serialObj.user.chats;
      const { data } = await api.createChat(user1Id, user2Id);
      if (data && !chatsArr.find((obj) => obj._id == data._id)) {
        dispatch({ type: CREATECHAT, payload: data });
        navigate(`/home/chat/${data._id}/${data.chat._id}`); //update code
        setLoading(false);
      }
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, { message: error.message })
      );
    }
  };
export const updateChatsArr = (chatObj) => async (dispatch) => {
  try {
    const serialObj = JSON.parse(localStorage.getItem("profile"));
    const chatsArr = serialObj.user.chats;

    if (!chatsArr.find((obj) => obj._id == chatObj._id)) {
      const { data } = await api.getSingleUser(chatObj.user);
      if (data) {
        chatObj.user = data.existingUser;
        dispatch({ type: CREATECHAT, payload: chatObj });
      }
    }
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};

//not an action creator, but wanted to keep all api callers together..
export const postMessage =
  (user1Id, user2Id, chatId, messageObj) => async (dispatch) => {
    try {
      await api.postMessage(user1Id, user2Id, chatId, messageObj);
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, { message: error.message })
      );
    }
  };

export const updateChat =
  (chatId, messageObj, index, location, navigate) => async (dispatch) => {
    try {
      dispatch({
        type: UPDATECHAT,
        payload: { chatId, messageObj, index, location, navigate },
      });
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, { message: error.message })
      );
    }
  };

export const reactMessage =
  (userId, chatId, messageId, emoji) => async (dispatch) => {
    try {
      const response = await api.reactMessage(userId, chatId, messageId, emoji);
      return response;
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, { message: error.message })
      );
    }
  };

export const addToSeenBy = (chatId) => async (dispatch) => {
  try {
    const response = await api.addToSeenBy(chatId);
    return response;
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};
