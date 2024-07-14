import ChatModel from "../models/chat.js";
import UserModel from "../models/user.js";
export const loadChat = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await ChatModel.findOne({ _id: chatId }).exec();

    res.status(200).json({ chat, chatId });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const postMessage = async (req, res) => {
  const { userId } = req;
  const { chatId } = req.params;
  const { user1Id, user2Id, sender, message } = req.body;
  try {
    if (user1Id == userId && user2Id==userId ) {
      return res.status(403).json({ message: "You do not have permission to update this profile." });
    }
    const chat = await ChatModel.findOne({ _id: chatId });

    // more codes to write
    chat.messages.push({ sender, message });
    await chat.save();


    //hard part to accept :(
    const user1 = await UserModel.findOne({ _id: user1Id });
    const chatObj1 = user1.chats.filter(chatObj => chatObj.user == user2Id)[0];
    chatObj1.lastMessageInfo.message = message;
    chatObj1.lastMessageInfo.time = Date.now();
    //when a subdocument is changed mongoose might not detect that because of how mongoose
    //handles dirty checking
    user1.markModified(`chats`);
    
    await user1.save();
    
    const user2 = await UserModel.findOne({ _id: user2Id });
    const chatObj2 = user2.chats.filter(chatObj => chatObj.user == user1Id)[0];
    chatObj2.lastMessageInfo.message = message;
    chatObj2.lastMessageInfo.time = Date.now();
    user2.markModified(`chats`);
    await user2.save();

    res.status(200).json({ message: "Message posted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createChat = async (req, res) => {
  const { userId } = req;
  //user1 is currentUser and user2 is secondUser
  const { user1Id, user2Id } = req.body;
  try {
    if (user1Id == userId && user2Id==userId ) {
      return res.status(403).json({ message: "You do not have permission to update this profile." });
    }

    const newChat = await ChatModel.create({ messages: [] });
    const user1 = await UserModel.findOne({ _id: user1Id });
    user1.chats.push({ user: user2Id, chat: newChat._id });
    await user1.save();
    const user2 = await UserModel.findOne({ _id: user2Id });
    user2.chats.push({ user: user1Id, chat: newChat._id });
    await user2.save();
    
    res
      .status(200)
      .json({
        _id: user1.chats[user1.chats.length - 1]._id,
        user: {
          _id: user2._id,
          name: user2.name,
          profile_picture: user2.profile_picture,
        },
        chat: newChat,
        lastMessageInfo: user1.chats[user1.chats.length - 1].lastMessageInfo,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
