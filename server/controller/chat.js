import ChatModel from "../models/chat.js";
import UserModel from "../models/user.js";

export const loadChat = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await ChatModel.findOne({ _id: chatId });
    res.status(200).json({ chat, chatId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const postMessage = async (req, res) => {
  const { userId, access_token } = req;
  const { chatId } = req.params;
  const { userArr, messageObj } = req.body;
  // userIdArr ,msgObj instead of message
  try {
    await ChatModel.findOneAndUpdate(
      { _id: chatId },
      {
        $push: { messages: messageObj },
      },
      {
        new: true,
      }
    );

    for (let usrId of userArr) {
      await UserModel.findOneAndUpdate(
        { _id: usrId },
        {
          $set: {
            "chats.$[elem].lastMessageInfo": messageObj,
          },
        },
        {
          arrayFilters: [{ "elem.chat": chatId }],
          new: true,
        }
      );

      await UserModel.findOneAndUpdate(
        { _id: usrId },
        {
          $push: {
            chats: {
              $each: [],
              $sort: { "lastMessageInfo.time": 1 },
            },
          },
        }
      );
    }

    // adding the token to the result for the requests that go through middleware for authentication for possible access_token changes
    res
      .status(200)
      .json({ message: "Message posted successfully", token: access_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

export const reactMessage = async (req, res) => {
  const { access_token } = req;
  const { userId, chatId, messageId, emoji } = req.body;
  try {
    const chat = await ChatModel.findOne({ _id: chatId });
    const reactionObj = chat?.messages?.find((msg) => msg._id == messageId)?.reaction?.find((reaction) => reaction.user == userId);
    if (reactionObj) {
      await ChatModel.findOneAndUpdate(
        {
          _id: chatId,
          "messages._id": messageId,
          "messages.reaction.user": userId,
        },
        {
          $set: { "messages.$[msg].reaction.$[react].emoji": emoji },
        },
        {
          arrayFilters: [{ "msg._id": messageId }, { "react.user": userId }],
          upsert: true,
        }
      );
    } else {
      // Add a new reaction if it doesn't exist
      const chat = await ChatModel.findOneAndUpdate(
        {
          _id: chatId,
          "messages._id": messageId,
        },
        {
          $push: { "messages.$[msg].reaction": { user: userId, emoji } },
        },
        {
          arrayFilters: [{ "msg._id": messageId }],
          new: true, 
        }
      );
    }
    res
      .status(200)
      .json({ message: "Reaction updated successfully", token: access_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createChat = async (req, res) => {
  const { userId, access_token } = req;

  const { userArr, chatType, chatCardInfo } = req.body;
  try {
    let curr_user = {};
    let newChat;
    // for individual chat I am passing chatCardInfo as null, because the chatCardInfo for individual chat depends on each user
    let updatedChatCardInfo = chatCardInfo;
    if (chatType == "individual") {
      newChat = await ChatModel.create({
        chatType,
        userArr,
        messages: [],
      });
    } else if (chatType == "group") {
      const currDate = Date.now();
      const joiningDateMap = new Map();
      for (let usrId of userArr) {
        joiningDateMap.set(usrId, currDate);
      }
      newChat = await ChatModel.create({
        chatType,
        userArr,
        messages: [],
        settings: { groupInfo: { ...chatCardInfo, joiningDateMap } },
      });
      updatedChatCardInfo = { ...chatCardInfo, _id: newChat._id };
    }
    let user;
    let updatedUserArr = [];
    for (let usrId of userArr) {
      user = await UserModel.findOne({ _id: usrId }).select(
        "name about profile_picture"
      );
      updatedUserArr = [...updatedUserArr, user];
    }
    for (let usrId of userArr) {
      user = await UserModel.findOneAndUpdate(
        { _id: usrId },
        {
          $push: {
            chats: {
              chat: newChat._id,
              chatType,
              chatCardInfo:
                updatedChatCardInfo ||
                updatedUserArr.find((i) => i._id !== usrId),
              // updatedChatCardInfo now has userID or chatID depending on chatType which helps during processing invites
            },
          },
          $addToSet: {
            friends: {
              $each: updatedUserArr,
            },
          },
        },
        {
          new: true,
        }
      );
      if (usrId == userId) {
        curr_user = user;
      }
    }
    let chatsArrObj = curr_user.chats[curr_user.chats.length - 1];
    chatsArrObj.chat = newChat;

    res.status(200).json({
      chatsArrObj,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const addToGroup = async (req, res) => {
  const { userId, access_token } = req;
  const { chatId } = req.body;

  try {
    const existingChat = await ChatModel.findOneAndUpdate(
      { _id: chatId },
      {
        $addToSet: {
          "settings.userArr": userId,
        },
      }
    );
    let updatedUserArr = [];
    for (let usrId of existingChat.userArr) {
      let user;
      user = await UserModel.findOne({ _id: usrId }).select(
        "name about profile_picture"
      );
      updatedUserArr = [...updatedUserArr, user];
    }
    const user = await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          chats: {
            chat: existingChat._id,
            chatType: existingChat.chatType,
            chatCardInfo: {
              ...existingChat.settings.groupInfo,
              _id: existingChat._id,
            },
            // updatedChatCardInfo now has userID or chatID depending on chatType which helps during processing invites
          },
        },
        $addToSet: {
          friends: { $each: updatedUserArr },
        },
      },
      {
        new: true,
      }
    );
    let chatsArrObj = user.chats[user.chats.length - 1];
    chatsArrObj.chat = newChat;

    res.status(200).json({
      chatsArrObj,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//// have to improve time taken for updating seenBy array (16.6 s)
export const addToSeenBy = async (req, res) => {
  const { userId, access_token } = req;
  const { chatId, notSeenMessagesIdArr, userInfo } = req.body;

  //version error happens when I try to change documents in a loop so changes in database is enqueued in its own thread
  // which can essentially result in asynchronous ordering of changes and disrupt the version ordering also
  try {
    for (const messageId of notSeenMessagesIdArr) {
      await ChatModel.updateOne(
        { _id: chatId, "messages._id": messageId },
        { $addToSet: { "messages.$.seenBy": userInfo } }
      );
    }
    const chat = await ChatModel.findById(chatId);

    const userArr = chat.userArr;

    for (let userId of userArr) {
      await UserModel.updateOne(
        { _id: userId, "chats.chat": chatId },
        { $addToSet: { "chats.$.lastMessageInfo.seenBy": userInfo } }
      );
    }
    res.status(200).json({
      message: "Added user to seenBy array successfully",
      token: access_token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateNickName = async (req, res) => {
  const { userId, access_token } = req;
  const { chatId, nickNameObj } = req.body;
  try {
    const updated_Chat = await ChatModel.findOneAndUpdate(
      { _id: chatId },
      {
        $pull: {
          "settings.nickNameMap": { _id: nickNameObj.userId },
        },
      },
      { new: true }
    );
    console.log(updated_Chat);
    if (updated_Chat.chatType == "individual") {
      for (let usrId of updated_Chat.userArr) {
        console.log(usrId, updated_Chat.userArr);
        if (usrId !== nickNameObj.userId) {
          console.log("goooooooooooooooooooootem");
          await UserModel.findOneAndUpdate(
            { _id: usrId, "chats.chat": chatId },
            { $set: { "chats.$.chatCardInfo.name": nickNameObj.nickName } },
            { new: true }
          );
        }
      }
      await ChatModel.findOneAndUpdate(
        { _id: chatId },
        {
          $addToSet: {
            "settings.nickNameMap": {
              _id: nickNameObj.userId,
              nickName: nickNameObj.nickName,
            },
          },
        },
        { new: true }
      );
    } else {
      await ChatModel.findOneAndUpdate(
        { _id: chatId },
        {
          $addToSet: {
            "settings.nickNameMap": {
              _id: nickNameObj.userId,
              nickName: nickNameObj.nickName,
            },
          },
        },
        { new: true }
      );
    }

    res.status(200).json({
      chatId,
      nickNameObj,
      token: access_token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
