import mongoose from "mongoose";

const UserChatSchema = new mongoose.Schema(
  {
    chat_room_id: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
  },
  { timestamps: false }
);

const UserChatModel = mongoose.model("UserChat", UserChatSchema);

export default UserChatModel;
