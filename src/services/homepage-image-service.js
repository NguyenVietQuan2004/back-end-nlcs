import HomepageImageModel from "../models/homepage-image-model.js";
import { BadRequestError, NotFoundError } from "../error/error.js";
import mongoose from "mongoose";
import ProductModel from "../models/product/product-model.js";
import ProductVariantModel from "../models/product/product-variant-model.js";

const createImagesHomePage = async ({ billboard_feature, billboard_banner, background_insurance, store_id }) => {
  if (!billboard_feature || !billboard_banner || !background_insurance || !store_id) {
    throw new BadRequestError("Missing information for ImagesHomePage.");
  }

  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }

  const existImagesHomePage = await HomepageImageModel.findOne({ store_id });
  if (existImagesHomePage) {
    throw new BadRequestError("ImagesHomePage already exists for this store.");
  }

  const imagesHomePage = new HomepageImageModel({
    billboard_feature,
    billboard_banner,
    background_insurance,
    store_id,
  });
  await imagesHomePage.save();

  return imagesHomePage;
};

const getImagesHomePage = async ({ store_id }) => {
  if (!store_id) {
    throw new BadRequestError("Store ID is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }

  const imagesHomePage = await HomepageImageModel.findOne({ store_id });
  if (!imagesHomePage) {
    throw new NotFoundError("ImagesHomePage not found for this store.");
  }

  const productWithHighestSold = await ProductVariantModel.aggregate([
    {
      $group: {
        _id: "$product_id",
        totalSold: { $sum: "$sold" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);
  const bestSellerIds = productWithHighestSold.map((item) => new mongoose.Types.ObjectId(item._id));
  const productBestSeller = await ProductModel.aggregate([
    {
      $match: { _id: { $in: bestSellerIds } }, // 🔥 Lọc theo danh sách 10 sản phẩm thay vì chỉ 1
    },
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "product_id",
        as: "product_variants",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
  ]);

  const productHighestSales = await ProductModel.aggregate([
    { $match: { store_id: new mongoose.Types.ObjectId(store_id) } },
    { $sort: { sales: -1 } },
    { $limit: 9 },
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "product_id",
        as: "product_variants",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
  ]);
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  const listProductNewDiscover = await ProductModel.aggregate([
    {
      $match: {
        // createdAt: { $gte: todayStart, $lt: todayEnd },
        store_id: new mongoose.Types.ObjectId(store_id),
      },
    },
    { $sort: { createdAt: -1 } }, // Sắp xếp theo thời gian mới nhất
    { $limit: 10 },
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "product_id",
        as: "product_variants",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
  ]);
  // Trả về kết quả
  return {
    ImagesHomePage: imagesHomePage,
    listProductNewDiscover,
    // listProductMostPopular: listProduct, // còn cái này
    productBestSeller: productBestSeller,
    productHighestSales: productHighestSales,
  };
};

const updateImagesHomePage = async ({ store_id, billboard_feature, billboard_banner, background_insurance }) => {
  if (!store_id || !billboard_feature || !billboard_banner || !background_insurance) {
    throw new BadRequestError("Missing information for ImagesHomePage.");
  }

  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }

  const updatedImagesHomePage = await HomepageImageModel.findOneAndUpdate(
    { store_id },
    { billboard_feature, billboard_banner, background_insurance },
    { new: true }
  );

  if (!updatedImagesHomePage) {
    throw new NotFoundError("ImagesHomePage not found for this store.");
  }

  return updatedImagesHomePage;
};

const deleteImagesHomePage = async ({ store_id }) => {
  if (!store_id) {
    throw new BadRequestError("Store ID is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }

  const deletedImagesHomePage = await HomepageImageModel.findOneAndDelete({ store_id });
  if (!deletedImagesHomePage) {
    throw new NotFoundError("ImagesHomePage not found for this store.");
  }

  return deletedImagesHomePage;
};

export default {
  createImagesHomePage,
  getImagesHomePage,
  updateImagesHomePage,
  deleteImagesHomePage,
};
