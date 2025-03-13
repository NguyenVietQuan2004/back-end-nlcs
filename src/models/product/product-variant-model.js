import mongoose from "mongoose";

const ProductVariantSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    variant_values: { type: Map, of: String, required: true },
    sold: { type: Number, default: 0 },
  },
  { timestamps: false }
);

const ProductVariantModel = mongoose.model("ProductVariant", ProductVariantSchema);

export default ProductVariantModel;
