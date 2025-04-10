import { BadRequestError, NotFoundError } from "../error/error.js";
import mongoose from "mongoose";
import ProductVariantModel from "../models/product/product-variant-model.js";
import OrderItemModel from "../models/order/order-item-model.js";
import OrderModel from "../models/order/order-model.js";
import ProductModel from "../models/product/product-model.js";
import { orderVerify } from "../utils/order-verify.js";

const baseQuery = [
  {
    $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "user",
    },
  },
  {
    $set: {
      user: { $arrayElemAt: ["$user.fullname", 0] },
    },
  },
  {
    $lookup: {
      from: "orderitems",
      localField: "_id",
      foreignField: "order_id",
      as: "order_items",
    },
  },
  {
    $unwind: "$order_items",
  },
  {
    $lookup: {
      from: "productvariants",
      localField: "order_items.product_variant_id",
      foreignField: "_id",
      as: "product_variant",
    },
  },
  {
    $unwind: { path: "$product_variant", preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: "products",
      localField: "product_variant.product_id",
      foreignField: "_id",
      as: "products",
    },
  },
  {
    $lookup: {
      from: "productvariants",
      localField: "products._id",
      foreignField: "product_id",
      as: "all_product_variants",
    },
  },
  {
    $set: {
      product: { $arrayElemAt: ["$products", 0] },
    },
  },
  {
    $set: {
      "product.product_variants": "$all_product_variants", // ✅ Gán variants vào product
    },
  },
  {
    $group: {
      _id: "$_id",
      user_id: { $first: "$user_id" },
      user: { $first: "$user" },
      store_id: { $first: "$store_id" },
      is_paid: { $first: "$is_paid" },
      phone: { $first: "$phone" },
      address: { $first: "$address" },
      createdAt: { $first: "$createdAt" },
      updatedAt: { $first: "$updatedAt" },
      paid_at: { $first: "$paid_at" },
      order_items: {
        $push: {
          quantity: "$order_items.quantity",
          snapshot_price: "$order_items.snapshot_price",
          product_variant_id: "$product_variant._id",
          product: "$product",
        },
      },
    },
  },
];

const createOrder = async ({ store_id, items, phone, address, is_paid, user_id }, user) => {
  orderVerify("create", { store_id, items, phone, address, is_paid });
  const bulkUpdateOperations = [];
  const orderItems = [];

  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.product_variant_id)) {
      throw new BadRequestError(`Invalid product_variant_id: ${item.product_variant_id}`);
    }

    const productVariant = await ProductVariantModel.findById(item.product_variant_id);
    if (!productVariant) {
      throw new BadRequestError(`Product variant ${item.product_variant_id} not found.`);
    }

    if (productVariant.stock < item.quantity) {
      throw new BadRequestError(
        `Product variant ${item.product_variant_id} is out of stock. Available: ${productVariant.stock}, Requested: ${item.quantity}`
      );
    }

    bulkUpdateOperations.push({
      updateOne: {
        filter: { _id: item.product_variant_id },
        update: {
          $inc: {
            stock: -item.quantity,
            sold: item.quantity,
          },
        },
      },
    });

    orderItems.push({
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      snapshot_price: productVariant.price,
    });
  }

  if (bulkUpdateOperations.length > 0) {
    await ProductVariantModel.bulkWrite(bulkUpdateOperations, { upsert: false });
  }
  const newOrderData = {
    user_id,
    store_id,
    is_paid,
    phone,
    address,
    ...(is_paid && { paid_at: new Date() }),
  };

  const newOrder = await new OrderModel(newOrderData).save();
  orderItems.forEach((item) => (item.order_id = newOrder._id));
  await OrderItemModel.insertMany(orderItems);
  return newOrder;
};

const getAllOrders = async (store_id) => {
  orderVerify("getAll", store_id);
  const orderDetails = await OrderModel.aggregate([
    {
      $match: { store_id: new mongoose.Types.ObjectId(store_id) },
    },
    { $sort: { createdAt: -1 } }, // Sắp xếp theo thời gian mới nhất

    ...baseQuery,
  ]);
  return orderDetails;
};
const getUserOrders = async (user_id) => {
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    throw new BadRequestError("Invalid user_id");
  }

  const userOrders = await OrderModel.aggregate([
    {
      $match: { user_id: new mongoose.Types.ObjectId(user_id) },
    },
    ...baseQuery,
  ]);

  return userOrders;
};
const updateOrder = async ({ order_id, is_paid }) => {
  orderVerify("update", { order_id, is_paid });
  const updateData = { is_paid };
  if (is_paid) {
    updateData.paid_at = new Date();
  } else {
    updateData.paid_at = ""; //
  }

  const updatedOrder = await OrderModel.findByIdAndUpdate(order_id, updateData, { new: true });
  if (!updatedOrder) {
    throw new NotFoundError("Order not found.");
  }

  return updatedOrder;
};

const deleteOrder = async (order_id) => {
  orderVerify("delete", order_id);

  await OrderItemModel.deleteMany({ order_id });
  await OrderModel.findByIdAndDelete(order_id);

  return null;
};

const overviewOrder = async (store_id) => {
  orderVerify("overview", store_id);
  const [listOrderPaid, countProductsInStock] = await Promise.all([
    OrderModel.aggregate([
      {
        $match: {
          store_id: new mongoose.Types.ObjectId(store_id),
          is_paid: true,
        },
      },
      ...baseQuery,
    ]),
    ProductModel.countDocuments({
      store_id,
      is_archived: false,
    }),
  ]);
  return {
    listOrderPaid,
    countProductsInStock,
  };
};
const updateOrderStatus = async ({ order_id, is_paid }) => {
  if (!mongoose.Types.ObjectId.isValid(order_id)) {
    throw new BadRequestError("Invalid user_id");
  }

  const updateData = { is_paid };
  if (is_paid) {
    updateData.paid_at = new Date();
  } else {
    updateData.$unset = { paid_at: "" };
  }
  const updatedOrder = await OrderModel.findByIdAndUpdate(order_id, updateData, { new: true });
  if (!updatedOrder) {
    throw new BadRequestError("Order not found");
  }

  return updatedOrder;
};

export default {
  createOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
  overviewOrder,
  getUserOrders,
  updateOrderStatus,
};
