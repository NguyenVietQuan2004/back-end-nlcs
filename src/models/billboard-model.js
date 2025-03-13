import mongoose from "mongoose";

const BillboardSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    image: { type: String, required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  },
  { timestamps: true }
);

const BillboardModel = mongoose.model("Billboard", BillboardSchema);

export default BillboardModel;
