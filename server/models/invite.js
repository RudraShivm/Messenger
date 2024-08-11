import mongoose from "mongoose";

const InviteSchema = mongoose.Schema({
  user: { type: String, required: true },
  expiryTime: { type: Date, required: true },
});

const InviteModel = mongoose.model("InviteModel", InviteSchema);

export default InviteModel;
