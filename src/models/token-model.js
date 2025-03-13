import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    access_expires_at: { type: Date, required: true },
    refresh_expires_at: { type: Date, required: true },
  },
  { timestamps: true }
);

const TokenModel = mongoose.model("Token", TokenSchema);

export default TokenModel;
