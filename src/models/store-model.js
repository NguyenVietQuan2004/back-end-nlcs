import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const StoreModel = mongoose.model("Store", StoreSchema);

export default StoreModel;
