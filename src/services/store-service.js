import mongoose from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "../error/error.js";
import StoreModel from "../models/store-model.js";
import ProductModel from "../models/product/product-model.js";
import OrderModel from "../models/order/order-model.js";
import CategoryModel from "../models/category-model.js";
import storeVerify from "../utils/store-verify.js";

const createStore = async (newStoreFromClient, user) => {
  storeVerify.validateStoreData(newStoreFromClient);

  const nameExist = await StoreModel.findOne({ name: newStoreFromClient.name, user_id: user._id });
  if (nameExist) {
    throw new ConflictError("Name store already exists.");
  }

  newStoreFromClient.user_id = user._id;
  const store = new StoreModel(newStoreFromClient);
  await store.save();

  const { user_id: _, ...others } = store._doc;
  return others;
};

const getAllStore = async (user) => {
  return await StoreModel.find({ user_id: user._id }).select("-user_id").sort({ createdAt: -1 });
};

// const getStore = async (store_id, user) => {
const getStore = async (store_id) => {
  if (!store_id) {
    throw new BadRequestError("Missing Store ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }
  const store = await StoreModel.findOne({
    // user_id: user._id,
    _id: store_id,
  }).select("-user_id");

  if (!store) {
    throw new BadRequestError("Store ID is incorrect.");
  }

  return store;
};

const updateStore = async (newStore, user) => {
  if (!newStore.store_id || !newStore.newName || newStore.newName.trim().length === 0) {
    throw new BadRequestError("Missing or invalid store ID or name.");
  }
  const updatedStore = await StoreModel.findOneAndUpdate(
    { _id: newStore.store_id, user_id: user._id },
    { name: newStore.newName },
    { new: true }
  ).select("-user_id");

  if (!updatedStore) {
    throw new NotFoundError("Store not found or unauthorized.");
  }

  return updatedStore;
};

const deleteStore = async (store_id, user) => {
  if (!store_id) {
    throw new BadRequestError("Missing store ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }

  // const existBillboard = await billBoardsModel.findOne({ store_id });
  // const existCategories = await categoriesModel.findOne({ store_id });
  const existProduct = await ProductModel.findOne({ store_id });
  const existOrder = await OrderModel.findOne({ store_id });
  const existCategory = await CategoryModel.findOne({ store_id });
  // const existOrder = await ordersModel.findOne({ store_id });

  if (existCategory || existProduct || existOrder) {
    throw new ConflictError("You need to empty order, category, and product to delete store.");
  }

  const storeDeleted = await StoreModel.findOneAndDelete({ _id: store_id, user_id: user._id }).select("-user_id");

  if (!storeDeleted) {
    throw new NotFoundError("Store not found or unauthorized.");
  }

  return storeDeleted;
};

export default { createStore, getAllStore, getStore, updateStore, deleteStore };
