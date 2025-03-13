import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    is_paid: { type: Boolean, default: false },
    paid_at: { type: Date },
    // status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "canceled"], default: "pending" },
    phone: { type: String, required: false, default: "" },
    address: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", OrderSchema);

export default OrderModel;
