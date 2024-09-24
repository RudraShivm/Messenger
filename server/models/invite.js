import mongoose from "mongoose";

const InviteSchema = mongoose.Schema({
  user: {
    type: String,
    ref: "UserModel",
  },
  chat: mongoose.Schema.Types.ObjectId,
  inviteType : {type:String, required:true},
  expiryTime: { type: Date, required: true },
});

const InviteModel = mongoose.model("InviteModel", InviteSchema);

export default InviteModel;
