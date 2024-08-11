import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  about: String,
  profile_picture: String,
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
  signUpMethod: { type: String },
  refresh_token: { type: String },
  chats: [
    {
      user: { type: String, ref: "UserModel" },
      chat: { type: mongoose.Schema.Types.ObjectId, ref: "ChatModel" },
      lastMessageInfo: {
        sender: {
          type: String,
          ref: "UserModel",
        },

        messageType: {
          type: String,
          default: "text",
          required: true,
        },

        message: {
          type: String,
          default: "You can now chat with each other",
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
    },
  ],
  friends: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel" },
    },
  ],
});

//middleware
UserSchema.pre("save", function (next) {
  this.chats.sort((a, b) => {
    let timeA = new Date(a.lastMessageInfo.time).getTime();
    let timeB = new Date(b.lastMessageInfo.time).getTime();

    return timeA - timeB;
  });

  next();
});

const UserModel = mongoose.model("UserModel", UserSchema);
export default UserModel;
