import {
  ADDTOSEENBYARR,
  AUTH,
  CREATECHAT,
  LOADCHAT,
  LOGOUT,
  POSTMESSAGE,
  REACTMESSAGE,
  UPDATE_FILE_URL,
  UPDATE_FRIENDS,
  UPDATECHAT,
  UPDATECHATCARDINFO,
  UPDATECREATEGROUPSEARCH,
  UPDATEHOMESEARCH,
  UPDATENICKNAME,
} from "../constants/actionTypes";

const authReducer = (
  state = { authData: null, searchResult: null },
  action
) => {
  let serialObj = {};
  let user = {};
  let chatObj;
  let homeSearchResult;
  let createGroupSearchResult;
  switch (action.type) {
    case AUTH:
      return { ...state, authData: { user: action?.payload.user } };

    case LOGOUT:
      return { ...state, authData: null };

    case LOADCHAT:
      serialObj = action?.payload.serialObj;

      /* localStorage will not store the files URL as the URL expired with window close.
      So here I am not touching previously loaded chat for preserving files URL in redux store, though it might be problem for the case when deleting chat messages is added */

      // here I tried to only change the messages that have been added new, so that I can minimize the changes in state
      // but ultimately I had to change the chatObj and return new state with newly made chatObj from that process (making the hard work useless)

      /* let chatsArr_state = state.authData.user.chats;
      let chat_state = chatsArr_state.filter(
        (chatObj) =>
          chatObj.chat === action?.payload.chatId ||
          chatObj.chat?._id == action?.payload.chatId
      )[0].chat;
      if (typeof chat_state == "object") {
        const existingMessages = chat_state.messages || [];
        const newMessages = action?.payload.chat.messages || [];

        // Create a map of existing messages by _id
        const existingMessagesMap = new Map(
          existingMessages.map((msg) => [msg._id, msg])
        );

        // Merge messages
        const mergedMessages = newMessages.map((newMsg) =>
          existingMessagesMap.has(newMsg._id)
            ? existingMessagesMap.get(newMsg._id)
            : newMsg
        );
        chat_state = {
          ...action?.payload.chat,
          messages: mergedMessages,
        };
        let index;
        let newChatsArr = chatsArr_state.map((item) =>
          item.chat == chat_state._id || item.chat._id == chat_state._id
            ? { ...item, chat: chat_state }
            : item
        );
        return {
          ...state,
          authData: { user: { ...state.authData.user, chats: newChatsArr } },
        };
      } else {
        chat_state = action?.payload.chat;
        let newChatsArr = chatsArr_state.map((item) =>
          item.chat == chat_state._id || item.chat._id == chat_state._id
            ? { ...item, chat: chat_state }
            : item
        );
        return {
          ...state,
          authData: { user: { ...state.authData.user, chats: newChatsArr } },
        };
      } */
      
      return {
        ...state,
        authData: serialObj,
      };

    case UPDATECHAT:
      serialObj = action?.payload;
      const updatedSerialObj = {
        ...serialObj,
      };
      return {
        ...state,
        authData: updatedSerialObj,
      };

    case CREATECHAT:
      serialObj = action?.payload;
      return {
        ...state,
        authData: {
          ...state.authData,
          user: {
            ...state.authData?.user,
            chats: serialObj.user.chats, // Ensure friends is a new Map
          },
        },
      };

    case UPDATEHOMESEARCH:
      serialObj = action?.payload.serialObj;
      user = serialObj.user;
      homeSearchResult = user.chats.filter(
        (chatObj) =>
          chatObj.chatCardInfo.name
            .toLowerCase()
            .includes(action?.payload.searchTerm.toLowerCase()) ||
          (typeof chatObj.chat == "object" &&
            chatObj.chat?.userArr.find((item) => {
              return user.friends
                .get(item)
                .name.toLowerCase()
                .includes(action?.payload.searchTerm.toLowerCase());
            }))
      );
      return { ...state, homeSearchResult };

    case UPDATECREATEGROUPSEARCH:
      serialObj = action?.payload.serialObj;
      user = serialObj.user;
      createGroupSearchResult = user.friends.filter(
        (item) =>
          item._id !== user._id &&
          item.name
            .toLowerCase()
            .includes(action?.payload.searchTerm.toLowerCase())
      );
      return { ...state, createGroupSearchResult };

    case REACTMESSAGE:
      serialObj = action?.payload;
      return {
        ...state,
        authData: serialObj,
      };

    case ADDTOSEENBYARR:
      serialObj = action?.payload;
      return {
        ...state,
        authData: serialObj,
      };

    case UPDATE_FILE_URL:
      serialObj = state.authData;
      user = serialObj.user;
      chatObj = user.chats.find((chatObj) => {
        let payloadChatId = chatObj?.chat?._id;
        return payloadChatId == action?.payload.chatId;
      });
      const messageObj = chatObj.chat.messages.find(
        (item) => item._id == action?.payload.msgObjId
      );
      messageObj.file.fileURL = action?.payload.fileURL;

      return {
        ...state,
        authData: serialObj,
      };

    case UPDATENICKNAME:
      serialObj = action?.payload;
      return {
        ...state,
        authData: serialObj,
      };

    case UPDATE_FRIENDS:
      serialObj = action?.payload;
      return {
        ...state,
        authData: {
          ...state.authData,
          user: {
            ...state.authData?.user,
            friends: new Map(serialObj.user.friends), // Ensure friends is a new Map
          },
        },
      };

    case UPDATECHATCARDINFO:
      serialObj = action?.payload;
      return {
        ...state,
        authData: serialObj,
      };
    default:
      return state;
  }
};

export default authReducer;
