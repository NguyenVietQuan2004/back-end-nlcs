import CategoryModel from "../models/category-model.js";
import { BadRequestError, NotFoundError } from "../error/error.js";
import mongoose from "mongoose";
import ProductModel from "../models/product/product-model.js";

const createCategory = async ({ name, store_id }) => {
  if (!name || !store_id) {
    throw new BadRequestError("Missing information category.");
  }

  const categoryExist = await CategoryModel.findOne({ name, store_id });
  if (categoryExist) {
    throw new BadRequestError("Category name already exists.");
  }

  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }

  const category = new CategoryModel({ name, store_id });
  await category.save();

  return category;
};

const getCategory = async ({ _id }) => {
  if (!_id) {
    throw new BadRequestError("Category ID  are required.");
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new BadRequestError("Invalid Category ID format.");
  }

  const category = await CategoryModel.findById(_id);
  if (!category) {
    throw new NotFoundError("Category not found.");
  }

  return category;
};

const getAllCategory = async (store_id) => {
  if (!store_id) {
    throw new BadRequestError("Store ID is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }

  return await CategoryModel.find({ store_id }).sort({ createdAt: -1 });
};

const updateCategory = async ({ _id, name }) => {
  if (!name || !_id) {
    throw new BadRequestError("Missing information category.");
  }
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new BadRequestError("Invalid Category ID format.");
  }

  const category = await CategoryModel.findByIdAndUpdate(_id, { name }, { new: true });
  if (!category) {
    throw new NotFoundError("Category not found.");
  }

  return category;
};

const deleteCategory = async ({ _id }) => {
  if (!_id) {
    throw new BadRequestError("Category ID is required.");
  }
  const existProduct = await ProductModel.findOne({ category_id: _id });
  if (existProduct) {
    throw new BadRequestError("Category is linked to products. Please remove products first.");
  }

  return await CategoryModel.findByIdAndDelete(_id);
};
export default {
  getCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
  createCategory,
};
