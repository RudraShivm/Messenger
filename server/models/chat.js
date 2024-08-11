import mongoose from "mongoose";

const ChatSchema = mongoose.Schema({
  messages: [
    {
      sender: {
        type: String,
        ref: "UserModel",
        required: true,
      },
      messageType: {
        type: String,
        required: true,
      },
      message: {
        type: String,
      },
      file: {
        name: String,
      },
      reaction: [
        {
          user: {
            type: String,
            ref: "UserModel",
          },
          emoji: {
            type: String,
            default: null,
          },
        },
      ],
      seenBy: [
        {
          type: String,
          ref: "UserModel",
        },
      ],
      time: {
        type: Date,
        default: Date.now,
        required: true,
      },
    },
  ],
});

const ChatModel = mongoose.model("ChatModel", ChatSchema);
export default ChatModel;
