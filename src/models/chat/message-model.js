import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chat_room_id: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
    text: { type: String, required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;
