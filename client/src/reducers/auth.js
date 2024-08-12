import {
  ADDTOSEENBYARR,
  AUTH,
  CREATECHAT,
  LOADCHAT,
  LOGOUT,
  POSTMESSAGE,
  REACTMESSAGE,
  UPDATECHAT,
  UPDATESEARCH,
} from "../constants/actionTypes";
import Cookies from "js-cookie";

const authReducer = (
  state = { authData: null, searchResult: null },
  action
) => {
  let serialObj = {};
  let user = {};
  let chatObj;
  let searchResult;
  switch (action.type) {
    case AUTH:
      localStorage.setItem(
        "profile",
        JSON.stringify({ user: action?.data.user })
      );
      // Cookies usage checkList : HttpOnly, SameSite: Strict or Lax , Short-lived Tokens, Validate Tokens
      Cookies.set("token", action?.data.token, {
        secure: true,
        sameSite: "strict",
        expires: 7,
      });
      // if an account is inactive for 7 or more days, user has to authenticate again
      return { ...state, authData: { user: action?.data.user } };

    case LOGOUT:
      localStorage.removeItem("profile");
      return { ...state, authData: null };

    case LOADCHAT:
      serialObj = JSON.parse(localStorage.getItem("profile"));
      user = serialObj.user;
      user.chats.filter(
        (chatObj) =>
          chatObj.chat === action?.payload.chatId ||
          chatObj.chat?._id == action?.payload.chatId
      )[0].chat = action?.payload.chat;

      localStorage.setItem("profile", JSON.stringify({ ...serialObj, user }));
      return { ...state, authData: serialObj };

    case UPDATECHAT:
      serialObj = JSON.parse(localStorage.getItem("profile"));
      user = serialObj.user;

      chatObj = user.chats.filter((chatObj) => {
        let payloadChatId =
          typeof chatObj?.chat == "object" ? chatObj?.chat?._id : chatObj?.chat;
        return payloadChatId == action?.payload.chatId;
      })[0];

      //when that particular chat is not loaded on this user
      if (!typeof chatObj.chat == "object") return state;

      const messagesArr = chatObj.chat?.messages;
      if (
        messagesArr &&
        !messagesArr.find(
          (msgObj) => msgObj._id == action?.payload.messageObj._id
        )
      ) {
        messagesArr.push(action?.payload.messageObj);
      }

      chatObj.lastMessageInfo = action?.payload.messageObj;

      //brings the chat on top of the board
      const indexOfChatObj = user.chats.findIndex((chatObj) => {
        let payloadChatId =
          typeof chatObj?.chat == "object" ? chatObj?.chat?._id : chatObj?.chat;
        return payloadChatId == action?.payload.chatId;
      });
      chatObj = user.chats.splice(indexOfChatObj, 1)[0];
      user.chats.push(chatObj);

      localStorage.setItem("profile", JSON.stringify(serialObj));
      return { ...state, authData: serialObj };

    case CREATECHAT:
      serialObj = JSON.parse(localStorage.getItem("profile"));
      user = serialObj.user;
      //there are two cases when createChat calls CREATECHAT action it provides a chatObj with the
      //actual chats and all. But for updateChatsArr, it responds to userUpdated stream and gives a
      //chatModel document reference. So for the people who is creating the chats gets both object
      //one after another. To resolve the issue and replace the references with actual documents
      // the code became somewhat hard to understand. Thats why this comment was necessary.

      let payloadChatId =
        typeof action?.payload.chat == "object"
          ? action?.payload.chat._id
          : action?.payload.chat;
      let existingChatObjIndex = user.chats.findIndex((chatObj) => {
        let chatObjId =
          typeof chatObj.chat == "object" ? chatObj.chat._id : chatObj.chat;
        return chatObjId == payloadChatId;
      });
      if (existingChatObjIndex == -1) {
        user.chats.push(action?.payload);
      } else if (typeof action?.payload.chat == "object") {
        user.chats[existingChatObjIndex] = action?.payload;
      }

      localStorage.setItem("profile", JSON.stringify(serialObj));
      return { ...state, authData: serialObj };

    case UPDATESEARCH:
      serialObj = JSON.parse(localStorage.getItem("profile"));
      user = serialObj.user;
      searchResult = user.chats.filter((chatObj) =>
        chatObj.user.name.toLowerCase().includes(action?.payload.toLowerCase())
      );
      return { ...state, searchResult };

    case REACTMESSAGE:
      serialObj = JSON.parse(localStorage.getItem("profile"));
      user = serialObj.user;

      if (action?.payload.chatObjId) {
        chatObj = user.chats.find(
          (chatObj) => chatObj._id == action?.payload.chatObjId
        );
      } else {
        chatObj = user.chats.find((chatObj) => {
          let payloadChatId =
            typeof chatObj?.chat == "object"
              ? chatObj?.chat?._id
              : chatObj?.chat;
          return payloadChatId == action?.payload.chatId;
        });
      }

      //when that particular chat is not loaded on this user
      if (typeof chatObj.chat !== "object") return state;

      let msgObj;
      if (action?.payload.messageId) {
        msgObj = chatObj.chat?.messages.find(
          (msgObj) => msgObj._id == action?.payload.messageId
        );
      } else {
        msgObj = chatObj.chat?.messages.at(action?.payload.messageArrIndex);
      }
      if (!msgObj) return state;

      let reactionObj;
      if (action?.payload.userId) {
        reactionObj = msgObj.reaction.find(
          (reactionObj) => reactionObj.user == action?.payload.userId
        );
      } else {
        reactionObj = msgObj.reaction.at(action?.payload.reactionArrIndex);
      }

      if (reactionObj) {
        reactionObj.emoji =
          reactionObj.emoji == action?.payload.emoji
            ? null
            : action?.payload.emoji;

      } else {
        msgObj.reaction.push({
          user: action?.payload.userId,
          emoji: action?.payload.emoji,
        });
      }

      localStorage.setItem("profile", JSON.stringify(serialObj));
      return { ...state, authData: serialObj };

    case ADDTOSEENBYARR:
      serialObj = JSON.parse(localStorage.getItem("profile"));
      user = serialObj.user;
      chatObj = user.chats.find((chatObj) => {
        let payloadChatId =
          typeof chatObj?.chat == "object" ? chatObj?.chat?._id : chatObj?.chat;
        return payloadChatId == action?.payload.chatId;
      });

      if (
        !chatObj.lastMessageInfo.seenBy.find(
          (item) => item == action?.payload.seenByUsrId
        )
      ) {
        chatObj.lastMessageInfo.seenBy.push(action?.payload.seenByUsrId);
      }
      if (typeof chatObj.chat !== "object")
        return { ...state, authData: serialObj };

      for (let i = chatObj.chat.messages.length - 1; i >= 0; i--) {
        if (
          !chatObj.chat.messages[i].seenBy.find(
            (item) => item == action?.payload.seenByUsrId
          )
        ) {
          chatObj.chat.messages[i].seenBy.push(action?.payload.seenByUsrId);
        } else {
          break;
        }
      }

      localStorage.setItem("profile", JSON.stringify(serialObj));
      serialObj = JSON.parse(localStorage.getItem("profile"));

      return { ...state, authData: serialObj };

    default:
      return state;
  }
};

export default authReducer;
