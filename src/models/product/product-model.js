import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    search_keywords: { type: [String], default: [] },
    description: { type: String },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    is_featured: { type: Boolean, default: false },
    is_archived: { type: Boolean, default: false },
    images: { type: [String], default: [] },
    sales: { type: Number, default: 0 },
    variants: [
      {
        _id: false,
        name: { type: String, required: true },
        values: [{ type: String, required: true }],
      },
    ],
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);

export default ProductModel;
