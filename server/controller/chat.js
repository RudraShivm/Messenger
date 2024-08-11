import ChatModel from "../models/chat.js";
import UserModel from "../models/user.js";

export const loadChat = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await ChatModel.findOne({ _id: chatId }).exec();

    res.status(200).json({ chat, chatId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const postMessage = async (req, res) => {
  const { userId, access_token } = req;
  const { chatId } = req.params;
  const { user1Id, user2Id, messageObj } = req.body;
  // userIdArr ,msgObj instead of message
  try {
    if (user1Id == userId && user2Id == userId) {
      return res.status(403).json({
        message: "You do not have permission to update this profile.",
      });
    }

    await ChatModel.findOneAndUpdate(
      { _id: chatId },
      {
        $push: { messages: messageObj },
      },
      {
        new: true,
      }
    );

    await UserModel.findOneAndUpdate(
      { _id: user1Id, "chats.user": user2Id },
      {
        $set: {
          "chats.$[elem].lastMessageInfo": messageObj,
        },
      },
      {
        arrayFilters: [{ "elem.user": user2Id }],
        new: true,
      }
    );

    await UserModel.findOneAndUpdate(
      { _id: user2Id, "chats.user": user1Id },
      {
        $set: {
          "chats.$[elem].lastMessageInfo": messageObj,
        },
      },
      {
        arrayFilters: [{ "elem.user": user1Id }],
        new: true,
      }
    );

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
    const messageObj = chat.messages.find((msgObj) => msgObj._id == messageId);
    let reactionObj = messageObj.reaction.find(
      (reactionObj) => reactionObj.user == userId
    );
    //for now not updating lastMessage reaction. doesn't matter as I am not using it
    if (!reactionObj) {
      messageObj.reaction.push({ user: userId, emoji });
    } else {
      reactionObj.emoji = reactionObj.emoji == emoji ? null : emoji;
    }
    await chat.save();
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
  //user1 is currentUser and user2 is secondUser
  // userIdArr
  const { user1Id, user2Id } = req.body;
  try {
    if (user1Id == userId && user2Id == userId) {
      return res.status(403).json({
        message: "You do not have permission to update this profile.",
      });
    }
    const newChat = await ChatModel.create({ messages: [] });
    const user1 = await UserModel.findOneAndUpdate(
      { _id: user1Id },
      {
        $push: { chats: { user: user2Id, chat: newChat._id } },
      },
      {
        new: true,
      }
    );

    const user2 = await UserModel.findOneAndUpdate(
      { _id: user2Id },
      {
        $push: { chats: { user: user1Id, chat: newChat._id } },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      _id: user1.chats[user1.chats.length - 1]._id,
      user: {
        _id: user2._id,
        name: user2.name,
        profile_picture: user2.profile_picture,
      },
      chat: newChat,
      lastMessageInfo: user1.chats[user1.chats.length - 1].lastMessageInfo,
      token: access_token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const addToSeenBy = async (req, res) => {
  const { userId, access_token } = req;
  const { chatId } = req.body;

  //version error happens when I try to change documents in a loop so changes in database is enqueued in its own thread
  // which can essentially result in asynchronous ordering of changes and disrupt the version ordering also
  try {
    const chat = await ChatModel.findOne({ _id: chatId });
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      if (!chat.messages[i].seenBy.find((item) => item == userId)) {
        chat.messages[i].seenBy.push(userId);
        await chat.save();
        if (i == chat.messages.length - 1) {
          // last Message update
          const users = await UserModel.find({
            chats: {
              $elemMatch: {
                chat: chatId,
              },
            },
          });

          for (let user of users) {
            let chatObj = user.chats.find((chatObj) => chatObj.chat == chatId);
            if (chatObj && !chatObj.lastMessageInfo.seenBy.includes(userId)) {
              chatObj.lastMessageInfo.seenBy.push(userId);
              await UserModel.findByIdAndUpdate(
                user._id,
                { chats: user.chats },
                { new: true }
              );
            }
          }
        }
      } else {
        break;
      }
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
