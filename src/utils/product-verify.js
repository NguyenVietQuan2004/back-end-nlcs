import Joi from "joi";
import mongoose from "mongoose";
import { BadRequestError } from "../error/error.js";
const objectIdRule = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }, "ObjectId Validation")
  .required();

const productSchema = Joi.object({
  name: Joi.string().trim().max(255).required(),
  search_keywords: Joi.array().items(Joi.string().trim()).default([]),
  description: Joi.string().trim().required(),
  store_id: objectIdRule,
  category_id: objectIdRule,
  is_featured: Joi.boolean().default(false),
  is_archived: Joi.boolean().default(false),
  sales: Joi.number().default(0),
  images: Joi.array().items(Joi.string().uri()).default([]),
  variants: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(1).required(),
        values: Joi.array().items(Joi.string().trim().min(1).required()).min(1).required(),
      })
    )
    .default([]),
  product_variants: Joi.array()
    .items(
      Joi.object({
        _id: objectIdRule.optional(),
        sku: Joi.string()
          .trim()
          // .regex(/^[a-zA-Z0-9_-]+$/)
          .required()
          .messages({
            "string.pattern.base": "SKU must contain only letters, numbers, hyphens, or underscores.",
          }),
        price: Joi.number().greater(0).required(),
        stock: Joi.number().min(0).default(0),
        variant_values: Joi.object().min(1).required().messages({
          "object.min": "Variant values must contain at least one key-value pair.",
        }),
      })
    )
    .min(1)
    .required(),
});

const validateQueryParamsProduct = (queryParams) => {
  const { store_id, category_id, variants, is_archived, sortBy, value } = queryParams;
  if (!store_id || !mongoose.Types.ObjectId.isValid(store_id)) {
    throw new BadRequestError("store_id is required and must be a valid ObjectId");
  }
  if (category_id && !mongoose.Types.ObjectId.isValid(category_id)) {
    throw new BadRequestError("category_id must be a valid ObjectId");
  }

  let parsedVariants = [];

  if (variants) {
    try {
      parsedVariants = JSON.parse(variants);
      if (!Array.isArray(parsedVariants)) {
        throw new Error();
      }
    } catch (error) {
      throw new BadRequestError("variants must be a valid JSON array");
    }
  }

  const validSortOptions = ["newest", "asc", "desc", "featured"];
  if (sortBy && !validSortOptions.includes(sortBy)) {
    throw new BadRequestError(`sortBy must be one of: ${validSortOptions.join(", ")}`);
  }

  return { store_id, category_id, variants: parsedVariants, is_archived, sortBy, value };
};

const productVerify = (method, data) => {
  const validateId = (id, field) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${field}.`);
    }
  };

  switch (method) {
    case "getAllProductById":
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new BadRequestError("Product IDs are required and should be in an array.");
      }
      data.forEach((productId) => validateId(productId, "product_id"));
      break;

    case "deleteProduct":
      const { product_id } = data;
      if (!product_id) {
        throw new BadRequestError("Product ID  is missing.");
      }
      validateId(product_id, "product_id");
      break;

    default:
      throw new BadRequestError(`Unknown verification method: ${method}`);
  }
};

export default { productSchema, validateQueryParamsProduct, productVerify };
