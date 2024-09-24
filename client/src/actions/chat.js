import * as api from "../api/index";
import {
  LOADCHAT,
  UPDATECHAT,
  CREATECHAT,
  REACTMESSAGE,
  UPDATENICKNAME,
  ADDTOSEENBYARR,
} from "../constants/actionTypes";
import { errorDispatcher } from "../functions/errorDispatcher";
import {
  getProfile,
  updateProfile,
  updateProfileChats,
} from "../store/indexedDB";

export const loadChat =
  (chatObjId, chatId, navigate, location, setLoading) =>
  async (dispatch, getState) => {
    // drafting msg for old chat before loading new chat
    if (location.pathname.includes("/home/chat/")) {
      let msgElem = document.getElementById("msg")
      let msg = msgElem.value;
      let oldChatId = location.pathname.split("/")[4];
      dispatch(storeDraftMessages(oldChatId, msg));
    }

    try {
      const { data } = await api.loadChat(chatId);
      if (data) {
        let serialObj = { ...getState().auth.authData };
        let user = { ...serialObj.user, chats: [...serialObj.user.chats] };

        const nickNameMap = data.chat.settings.nickNameMap.reduce(
          (acc, item) => {
            acc.set(item._id, item.nickName);
            return acc;
          },
          new Map()
        );
        data.chat.settings.nickNameMap = nickNameMap;
        const blockedMap = data.chat.settings.blockedMap.reduce((acc, item) => {
          acc.set(item._id, item.blockedUsers);
          return acc;
        }, new Map());
        data.chat.settings.blockedMap = blockedMap;

        let chatIndex = user.chats.findIndex(
          (chatObj) =>
            chatObj.chat === data.chatId || chatObj.chat?._id == data.chatId
        );
        if (chatIndex !== -1) {
          user.chats[chatIndex] = {
            ...user.chats[chatIndex],
            chat: {
              draftMessage : user.chats[chatIndex].chat.draftMessage || "",
              ...data.chat,
            },
          };
        }

        serialObj = { ...serialObj, user: user };
        dispatch({ type: LOADCHAT, payload: { ...data, serialObj } });
        await updateProfile(serialObj);

        navigate(`/home/chat/${chatObjId}/${chatId}`);
        setLoading(false);
      }
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };
export const createChat =
  (userArr, chatType, chatCardInfo, navigate, setLoading) =>
  async (dispatch, getState) => {
    try {
      let serialObj = { ...getState().auth.authData };
      const chatsArr = serialObj.user.chats;
      const { data } = await api.createChat(userArr, chatType, chatCardInfo);
      if (
        data.chatsArrObj &&
        !chatsArr.find((obj) => obj._id == data.chatsArrObj._id)
      ) {
        let user = { ...serialObj.user, chats: [...serialObj.user.chats] };

        /* there are two cases when createChat calls CREATECHAT action it provides a chatObj with the
        actual chats and all. But for updateChatsArr, it responds to userUpdated stream and gives a
        chatModel document reference. So for the people who is creating the chats gets both object
        one after another. To resolve the issue and replace the references with actual documents
        the code became somewhat hard to understand. Thats why this comment was necessary. */

        let payloadChatId =
          typeof data.chatsArrObj.chat == "object"
            ? data.chatsArrObj.chat._id
            : data.chatsArrObj.chat;
        let existingChatObjIndex = user.chats.findIndex((chatObj) => {
          let chatObjId =
            typeof chatObj.chat == "object" ? chatObj.chat._id : chatObj.chat;
          return chatObjId == payloadChatId;
        });
        if (typeof data.chatsArrObj.chat == "object") {
          const nickNameMap = data.chatsArrObj.chat.settings.nickNameMap.reduce(
            (acc, item) => {
              acc.set(item._id, item.nickName);
              return acc;
            },
            new Map()
          );
          data.chatsArrObj.chat.settings = {
            ...data.chatsArrObj.chat.settings,
            nickNameMap: nickNameMap,
            blockedMap: data.chatsArrObj.chat.settings.blockedMap.reduce(
              (acc, item) => {
                acc.set(item._id, item.blockedUsers);
                return acc;
              },
              new Map()
            ),
          };
        }
        if (existingChatObjIndex == -1) {
          user.chats.push(data.chatsArrObj);
        } else {
          user.chats[existingChatObjIndex] = data.chatsArrObj;
        }

        serialObj = { ...serialObj, user: user };

        dispatch({ type: CREATECHAT, payload: serialObj });
        await updateProfile(serialObj);
        navigate(
          `/home/chat/${data.chatsArrObj._id}/${data.chatsArrObj.chat._id}`
        );
        setLoading(false);
      }
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };
export const addToGroup =
  (chatId, navigate, setLoading) => async (dispatch, getState) => {
    try {
      let serialObj = { ...getState().auth.authData };
      const chatsArr = serialObj.user.chats;
      const { data } = await api.addToGroup(chatId);
      if (
        data.chatsArrObj &&
        !chatsArr.find((obj) => obj._id == data.chatsArrObj._id)
      ) {
        let user = { ...serialObj.user, chats: [...serialObj.user.chats] };
        let payloadChatId =
          typeof data.chatsArrObj.chat == "object"
            ? data.chatsArrObj.chat._id
            : data.chatsArrObj.chat;
        let existingChatObjIndex = user.chats.findIndex((chatObj) => {
          let chatObjId =
            typeof chatObj.chat == "object" ? chatObj.chat._id : chatObj.chat;
          return chatObjId == payloadChatId;
        });

        if (typeof data.chatsArrObj.chat == "object") {
          const nickNameMap = data.chatsArrObj.chat.settings.nickNameMap.reduce(
            (acc, item) => {
              acc.set(item._id, item.nickName);
              return acc;
            },
            new Map()
          );
          data.chatsArrObj.chat.settings = {
            ...data.chatsArrObj.chat.settings,
            nickNameMap: nickNameMap,
            blockedMap: data.chatsArrObj.chat.settings.blockedMap.reduce(
              (acc, item) => {
                acc.set(item._id, item.blockedUsers);
                return acc;
              },
              new Map()
            ),
          };
        }

        if (existingChatObjIndex == -1) {
          user.chats.push(data.chatsArrObj);
        } else {
          user.chats[existingChatObjIndex] = data.chatsArrObj;
        }

        serialObj = { ...serialObj, user: user };

        dispatch({ type: CREATECHAT, payload: serialObj });
        await updateProfile(serialObj);
        navigate(`/home/chat/${data._id}/${data.chat._id}`);
        setLoading(false);
      }
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };
export const updateChatsArr = (chatObj) => async (dispatch, getState) => {
  try {
    let serialObj = { ...getState().auth.authData };
    let user = { ...serialObj.user, chats: [...serialObj.user.chats] };

    if (!user.chats.find((obj) => obj._id == chatObj._id)) {
      let payloadChatId =
        typeof chatObj.chat == "object" ? chatObj.chat._id : chatObj.chat;
      let existingChatObjIndex = user.chats.findIndex((chatObj) => {
        let chatObjId =
          typeof chatObj.chat == "object" ? chatObj.chat._id : chatObj.chat;
        return chatObjId == payloadChatId;
      });

      if (typeof chatObj.chat == "object") {
        const nickNameMap = chatObj.chat.settings.nickNameMap.reduce(
          (acc, item) => {
            acc.set(item._id, item.nickName);
            return acc;
          },
          new Map()
        );
        chatObj.chat.settings = {
          ...chatObj.chat.settings,
          nickNameMap: nickNameMap,
          blockedMap: chatObj.chat.settings.blockedMap.reduce((acc, item) => {
            acc.set(item._id, item.blockedUsers);
            return acc;
          }, new Map()),
        };
      }

      if (existingChatObjIndex == -1) {
        user.chats.push(chatObj);
      } else {
        user.chats[existingChatObjIndex] = chatObj;
      }

      serialObj = { ...serialObj, user: user };

      dispatch({ type: CREATECHAT, payload: serialObj });
      await updateProfile(serialObj);
    }
  } catch (error) {
    dispatch(
      errorDispatcher(error.response?.status || 500, { message: error.message })
    );
  }
};
//not an action creator, but wanted to keep all api callers together..
export const postMessage =
  (userArr, chatId, messageObj) => async (dispatch) => {
    try {
      await api.postMessage(userArr, chatId, messageObj);
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };

export const updateChat =
  (chatId, messageObj) => async (dispatch, getState) => {
    try {
      /* DONOT CHANGE STATE DIRECTLY.
      WASTED 1 DAY JUST BECAUSE I thought {...object} makes a deep copy of the object. I rather have to copy all properties that I am gonna change */
      let state = getState();
      let serialObj = { ...state.auth.authData };
      let user = { ...serialObj.user, chats: [...serialObj.user.chats] };
      let chatIndex = user.chats.findIndex((chatObj) => {
        let payloadChatId =
          typeof chatObj?.chat == "object" ? chatObj?.chat?._id : chatObj?.chat;
        return payloadChatId == chatId;
      });
      let chatObj = { ...user.chats[chatIndex], lastMessageInfo: messageObj };

      //when that particular chat is not loaded on this user
      if (typeof chatObj.chat == "object") {
        const messagesArr = [...chatObj.chat?.messages];
        if (
          messagesArr &&
          !messagesArr.find((msgObj) => msgObj._id == messageObj._id)
        ) {
          messagesArr.push(messageObj);
        }
        chatObj = {
          ...chatObj,
          chat: { ...chatObj.chat, messages: messagesArr },
        };
      }

      //brings the chat on top of the board
      user.chats.splice(chatIndex, 1);
      user.chats.push(chatObj);
      serialObj = { ...serialObj, user: user };
      await dispatch({
        type: UPDATECHAT,
        payload: serialObj,
      });
      await updateProfile(serialObj);
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };

export const reactMessage =
  (
    userId,
    chatObjId,
    chatId,
    messageId,
    messageArrIndex,
    reactionArrIndex,
    emoji
  ) =>
  async (dispatch, getState) => {
    try {
      let state = getState();
      let serialObj = { ...state.auth.authData };
      let user = { ...serialObj.user, chats: [...serialObj.user.chats] };
      let chatObj;
      if (chatObjId) {
        chatObj = user.chats.find((chatObj) => chatObj._id == chatObjId);
      } else {
        chatObj = user.chats.find((chatObj) => {
          let payloadChatId =
            typeof chatObj?.chat == "object"
              ? chatObj?.chat?._id
              : chatObj?.chat;
          return payloadChatId == chatId;
        });
      }

      //when that particular chat is not loaded on this user
      if (typeof chatObj.chat !== "object") return null;

      let chatIndex = user.chats.findIndex((c) => c._id === chatObj._id);
      let updatedChatObj = {
        ...chatObj,
        chat: { ...chatObj.chat, messages: [...chatObj.chat.messages] },
      };

      let msgObj;
      if (messageId) {
        msgObj = updatedChatObj.chat.messages.find(
          (msgObj) => msgObj._id == messageId
        );
      } else {
        msgObj = updatedChatObj.chat.messages[messageArrIndex];
      }
      if (!msgObj) return state;

      let msgIndex = updatedChatObj.chat.messages.findIndex(
        (m) => m._id === msgObj._id
      );
      let updatedMsgObj = { ...msgObj, reaction: [...msgObj.reaction] };

      let reactionObj;
      if (userId) {
        reactionObj = updatedMsgObj.reaction.find(
          (reactionObj) => reactionObj.user == userId
        );
      } else {
        reactionObj = updatedMsgObj.reaction[reactionArrIndex];
      }

      if (reactionObj) {
        let reactionIndex = updatedMsgObj.reaction.findIndex(
          (r) => r.user === reactionObj.user
        );
        let updatedReactionObj = {
          ...reactionObj,
          emoji: reactionObj.emoji == emoji ? null : emoji,
        };
        updatedMsgObj.reaction[reactionIndex] = updatedReactionObj;
      } else {
        updatedMsgObj.reaction.push({
          user: userId,
          emoji,
        });
      }

      updatedChatObj.chat.messages[msgIndex] = updatedMsgObj;
      user.chats[chatIndex] = updatedChatObj;
      serialObj = { ...serialObj, user: user };

      dispatch({ type: REACTMESSAGE, payload: serialObj });
      await updateProfile(serialObj);
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };

export const addToSeenBy =
  (chatId, seenByUsrInfo) => async (dispatch, getState) => {
    try {
      let state = getState();
      let serialObj = { ...state.auth.authData };
      let user = { ...serialObj.user, chats: [...serialObj.user.chats] };

      let chatObj = user.chats.find((chatObj) => {
        let payloadChatId =
          typeof chatObj?.chat == "object" ? chatObj?.chat?._id : chatObj?.chat;
        return payloadChatId == chatId;
      });

      if (!chatObj) return;

      let chatIndex = user.chats.findIndex((c) => c._id === chatObj._id);
      let updatedChatObj = {
        ...chatObj,
        chat: { ...chatObj.chat, messages: [...chatObj.chat.messages] },
      };

      if (
        !updatedChatObj.lastMessageInfo.seenBy.find(
          (item) => item._id == seenByUsrInfo._id
        )
      ) {
        updatedChatObj.lastMessageInfo = {
          ...updatedChatObj.lastMessageInfo,
          seenBy: [...updatedChatObj.lastMessageInfo.seenBy, seenByUsrInfo],
        };
      }

      if (typeof updatedChatObj.chat !== "object") {
        user.chats[chatIndex] = updatedChatObj;
        serialObj = { ...serialObj, user: user };
        dispatch({ type: ADDTOSEENBYARR, payload: serialObj });
        return;
      }
      /* checking if unseen for all messages. though it should not be problem for high speed api
      but I am facing some issues with the duration of api call responses. Maybe I will change it back later */
      for (let i = updatedChatObj.chat.messages.length - 1; i >= 0; i--) {
        let message = updatedChatObj.chat.messages[i];
        if (!message.seenBy.find((item) => item._id == seenByUsrInfo._id)) {
          updatedChatObj.chat.messages[i] = {
            ...message,
            seenBy: [...message.seenBy, seenByUsrInfo],
          };
        }

        //  else {
        //   break;
        // }
      }

      user.chats[chatIndex] = updatedChatObj;
      serialObj = { ...serialObj, user: user };

      dispatch({ type: ADDTOSEENBYARR, payload: serialObj });
      await updateProfile(serialObj);
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };

export const updateNickName =
  (chatId, nickNameObj) => async (dispatch, getState) => {
    try {
      const { data } = await api.updateNickName(chatId, nickNameObj);
      let serialObj = { ...getState().auth.authData };
      let user = { ...serialObj.user, chats: [...serialObj.user.chats] };

      let chatObj = user.chats.find((chatObj) => {
        let payloadChatId =
          typeof chatObj?.chat == "object" ? chatObj?.chat?._id : chatObj?.chat;
        return payloadChatId == data.chatId;
      });

      if (!chatObj) return;

      let chatIndex = user.chats.findIndex((c) => c._id === chatObj._id);
      let updatedChatObj = {
        ...chatObj,
        chat: {
          ...chatObj.chat,
          settings: {
            ...chatObj.chat.settings,
            nickNameMap: new Map(chatObj.chat.settings.nickNameMap),
          },
        },
      };

      updatedChatObj.chat.settings.nickNameMap.set(
        data.nickNameObj.userId,
        data.nickNameObj.nickName
      );

      user.chats[chatIndex] = updatedChatObj;
      serialObj = { ...serialObj, user: user };

      dispatch({
        type: UPDATENICKNAME,
        payload: serialObj,
      });
      await updateProfile(serialObj);
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };

export const storeDraftMessages =
  (chatId, message) => async (dispatch, getState) => {
    try {
      let serialObj = { ...getState().auth.authData };
      let user = { ...serialObj.user, chats: [...serialObj.user.chats] };
      let chatObj = user.chats.find((item) => item.chat._id == chatId);
      let chatIndex = user.chats.findIndex((c) => c._id === chatObj._id);
      let updatedChatObj = {
        ...chatObj,
        chat: { ...chatObj.chat, draftMessage: message },
      };

      user.chats[chatIndex] = updatedChatObj;
      serialObj = { ...serialObj, user: user };

      dispatch({
        type: REACTMESSAGE,
        payload: serialObj,
      });
      await updateProfile(serialObj);
    } catch (error) {
      dispatch(
        errorDispatcher(error.response?.status || 500, {
          message: error.message,
        })
      );
    }
  };
