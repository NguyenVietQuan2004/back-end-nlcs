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

  const listProduct = await ProductModel.find({ store_id, is_archived: false }).sort({ createdAt: -1 }).limit(5);

  const productWithHighestSold = await ProductVariantModel.aggregate([
    {
      $group: {
        _id: "$product_id",
        totalSold: { $sum: "$sold" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 1 },
  ]);
  const productBestSeller = productWithHighestSold.length
    ? await ProductModel.findById(productWithHighestSold[0]._id)
    : null;

  const productHighestSale = await ProductModel.findOne({ store_id }).sort({ sale: -1 }).limit(1);
  const listProductNewDiscover = await ProductModel.find({
    store_id,
    createdAt: {
      $gte: new Date().setHours(0, 0, 0, 0),
      $lt: new Date().setHours(23, 59, 59, 999),
    },
  }).sort({ createdAt: -1 });
  return {
    ImagesHomePage: imagesHomePage,
    listProductNewDiscover,
    listProductMostPopular: listProduct, // còn cái này
    productBestSeller,
    productHighestSales: productHighestSale,
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
