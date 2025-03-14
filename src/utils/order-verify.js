import { BadRequestError } from "../error/error.js";
import mongoose from "mongoose";

export const orderVerify = (method, data) => {
  const validateId = (id, field) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${field}.`);
    }
  };

  switch (method) {
    case "create":
      const { store_id, items, is_paid } = data;
      [store_id, is_paid].forEach((field, index) => {
        if (field == null) throw new BadRequestError(`Missing field: ${["store_id", "is_paid"][index]}`);
      });
      if (!items?.length) throw new BadRequestError("Items cannot be empty.");
      validateId(store_id, "store_id");
      break;

    case "update":
      validateId(data.order_id, "order_id");
      if (data.is_paid === undefined) throw new BadRequestError("Missing field: is_paid.");
      if (typeof data.is_paid !== "boolean") throw new BadRequestError("is_paid must be a boolean.");
      break;

    case "delete":
      validateId(data, "_id");
      break;
    case "getAll":
    case "overview":
      validateId(data, "store_id");
      break;

    default:
      throw new BadRequestError(`Unknown verification method: ${method}`);
  }
};
