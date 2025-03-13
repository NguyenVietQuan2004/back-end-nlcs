import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../error/error.js";
import BillboardModel from "../models/billboard-model.js";
import StoreModel from "../models/store-model.js";
const createBillboard = async ({ label, image, store_id }) => {
  if (!label || !image || !store_id) {
    throw new BadRequestError("Missing information create billboard.");
  }
  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }

  const existingStore = await StoreModel.findOne({ _id: store_id });
  if (!existingStore) throw new NotFoundError("Store ID is wrong.");

  const billboard = new BillboardModel({ label, image, store_id });
  await billboard.save();
  return billboard;
};

const getBillboard = async ({ _id }) => {
  if (!_id) {
    throw new BadRequestError("Missing information get billboard.");
  }
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new BadRequestError("Invalid billboard ID format.");
  }

  const billboard = await BillboardModel.findOne({ _id });

  if (!billboard) {
    throw new NotFoundError("Billboard not found with given ID and Store ID.");
  }

  return billboard;
};

const getAllBillboard = async (store_id) => {
  if (!store_id) {
    throw new BadRequestError("Store ID is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("Invalid Store ID format.");
  }

  return await BillboardModel.find({ store_id }).sort({ createdAt: -1 });
};

const updateBillboard = async ({ _id, label, image }) => {
  if (!_id || !label?.trim() || !image?.trim()) {
    throw new BadRequestError("Billboard ID, label, and image are required.");
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new BadRequestError("Invalid Billboard ID format.");
  }

  const existBillboard = await BillboardModel.findOne({ _id });

  if (!existBillboard) {
    throw new NotFoundError("Invalid billboard ID.");
  }

  return await BillboardModel.findOneAndUpdate({ _id }, { label, image }, { new: true });
};

const deleteBillboard = async ({ _id }) => {
  if (!_id) {
    throw new BadRequestError("Billboard ID are required.");
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new BadRequestError("Invalid Billboard ID format.");
  }

  const billboardDeleted = await BillboardModel.findOneAndDelete({ _id });
  if (!billboardDeleted) {
    throw new NotFoundError("Billboard not found or already deleted.");
  }

  return billboardDeleted;
};

export default { createBillboard, getBillboard, getAllBillboard, updateBillboard, deleteBillboard };
