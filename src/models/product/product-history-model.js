import mongoose from "mongoose";

const ProductHistorySchema = new mongoose.Schema(
  {
    product_variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    field_name: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date },
    reason: { type: String },
  },
  { timestamps: true }
);

const ProductHistoryModel = mongoose.model("ProductHistory", ProductHistorySchema);

export default ProductHistoryModel;
