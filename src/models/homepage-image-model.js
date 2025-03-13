import mongoose from "mongoose";

const HomepageImageSchema = new mongoose.Schema(
  {
    billboard_feature: {
      type: [String], // Cho phép lưu một mảng các chuỗi
      required: true,
    },
    billboard_banner: { type: String, required: true },
    background_insurance: { type: String, required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  },
  { timestamps: true }
);

const HomepageImagesModel = mongoose.model("HomepageImage", HomepageImageSchema);

export default HomepageImagesModel;
