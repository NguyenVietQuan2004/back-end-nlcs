import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: false }
);

const ChatRoomModel = mongoose.model("ChatRoom", ChatRoomSchema);

export default ChatRoomModel;
