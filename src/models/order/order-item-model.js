import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  product_variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
  quantity: { type: Number, required: true },
  snapshot_price: { type: Number, required: true },
});

const OrderItemModel = mongoose.model("OrderItem", OrderItemSchema);

export default OrderItemModel;
