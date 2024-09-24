import mongoose from "mongoose";

const ChatSchema = mongoose.Schema({
  chatType: String,
  userArr: [{ type: String, ref: "UserModel", default: [] }],
  settings: {
    groupInfo: {
      name: String,
      profile_picture: String,
      about: String,
      joiningDateMap: {
        type: Map,
        of: Date,
        default: () => new Map(),
      },
    },
    "bg-image": {
      type: String,
      default: "",
    },
    "message-bg-color": {
      type: String,
      default: "",
    },
    nickNameMap: [
      {
        _id: String,
        nickName: String,
      },
    ],
    blockedMap: [
      {
        _id: String,
        blockedUsers: [{ _id: String }],
      },
    ],
  },
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
          _id: String,
          name: String,
          profile_picture: String,
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
