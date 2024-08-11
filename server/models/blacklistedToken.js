import mongoose from "mongoose";

const blacklistedTokenSchema = mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
});

const BlacklistedTokenModel = mongoose.model(
  "BlacklistedTokenModel",
  blacklistedTokenSchema
);

export default BlacklistedTokenModel;
