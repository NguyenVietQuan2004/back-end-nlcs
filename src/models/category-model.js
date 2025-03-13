import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    attributes: {
      type: [
        {
          name: { type: String, required: true },
          values: { type: [String], default: [] },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model("Category", CategorySchema);

export default CategoryModel;
