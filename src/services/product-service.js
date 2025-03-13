import { BadRequestError, ConflictError } from "../error/error.js";
import productVerify from "../utils/product-verify.js";
import ProductModel from "../models/product/product-model.js";
import ProductVariantModel from "../models/product/product-variant-model.js";
import ProductHistoryModel from "../models/product/product-history-model.js";
import StoreModel from "../models/store-model.js";
import categoryService from "./category-service.js";
import mongoose from "mongoose";
import CategoryModel from "../models/category-model.js";

const coreQuery = [
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
];

const createProduct = async (product) => {
  const { error, value } = productVerify.productSchema.validate(product);
  // console.log(error.details);
  if (error) throw new BadRequestError("Missing data input create product");

  const { product_variants, ...productData } = value;

  const [storeExists, categoryExists] = await Promise.all([
    StoreModel.findById(productData.store_id).lean(),
    CategoryModel.findById(productData.category_id).lean(),
  ]);

  if (!storeExists) throw new BadRequestError("Store ID is wrong!");
  if (!categoryExists) throw new BadRequestError("Category ID is wrong!");

  const existingNameProduct = await ProductModel.findOne({
    name: productData.name,
    store_id: productData.store_id,
    category_id: productData.category_id,
  });
  if (existingNameProduct) throw new ConflictError("Name product is already exist!");

  const newProduct = await ProductModel.create(productData);
  const variants = product_variants.map((variant) => ({
    ...variant,
    product_id: newProduct._id,
  }));

  const dataVariants = await ProductVariantModel.insertMany(variants);

  let newAttributeCategory = [...categoryExists.attributes];
  const keysNew = productData.variants.map((obj) => obj.name);
  const valuesNew = productData.variants.map((obj) => obj.values);

  const attributesMap = newAttributeCategory.reduce((acc, attr) => {
    acc[attr.name] = new Set(attr.values);
    return acc;
  }, {});

  for (let i = 0; i < keysNew.length; i++) {
    const key = keysNew[i];
    const values = valuesNew[i] || [];
    if (attributesMap[key]) values.forEach((val) => attributesMap[key].add(val));
    else attributesMap[key] = new Set(values);
  }

  newAttributeCategory = Object.entries(attributesMap).map(([name, values]) => ({
    name,
    values: [...values],
  }));

  await CategoryModel.findByIdAndUpdate(
    categoryExists._id,
    { attributes: newAttributeCategory },
    { new: true, lean: true }
  );

  return {
    ...newProduct.toObject(),
    product_variants: dataVariants,
  };
};
const getProduct = async ({ _id, store_id }) => {
  // productVerify.productVerify("getProduct", _id);
  let product = null;
  let productsRelative = null;
  if (mongoose.Types.ObjectId.isValid(_id)) {
    [product] = await ProductModel.aggregate([
      { $match: { _id: _id && new mongoose.Types.ObjectId(_id) } },
      ...coreQuery,
    ]);
    "product", product;
    productsRelative = await ProductModel.aggregate([
      { $match: { category_id: product.category_id } },
      { $sample: { size: 8 } },
      ...coreQuery,
    ]);
  }
  // if (!product) throw new BadRequestError("Product ID or store ID is wrong.");
  const listCategory = await categoryService.getAllCategory(store_id);

  return { product, listCategory, productsRelative };
};

const getAllProducts = async (queryParams) => {
  const limit = parseInt(queryParams.limit) || 100;
  const page = parseInt(queryParams.page) || 1;
  const skip = limit * (page - 1);
  const { store_id, category_id, variants, is_archived, sortBy, value } =
    productVerify.validateQueryParamsProduct(queryParams);

  const query = { store_id: new mongoose.Types.ObjectId(store_id) };

  if (value) query.name = { $regex: new RegExp(value, "i") };
  if (category_id) query.category_id = new mongoose.Types.ObjectId(category_id);
  variants, typeof variants;
  if (variants?.length > 0) {
    query.variants = {
      $all: variants.map((variant) => ({
        $elemMatch: {
          name: variant.key,
          values: { $all: variant.values },
        },
      })),
    };
  }

  if (sortBy === "featured") query.is_featured = true;
  if (is_archived) query.is_archived = false;

  let basePipeline = [{ $match: query }, { $skip: skip }, { $limit: limit }, ...coreQuery];

  let customPipeline = [];

  if (sortBy === "newest") {
    customPipeline.push({ $sort: { createdAt: -1 } });
  } else if (sortBy === "asc" || sortBy === "desc") {
    const sortOrder = sortBy === "desc" ? -1 : 1;
    customPipeline.push(
      {
        $addFields: {
          firstPrice: {
            $reduce: {
              input: "$product_variants",
              initialValue: Number.MAX_VALUE,
              in: { $min: ["$$value", "$$this.price"] },
            },
          },
        },
      },
      { $sort: { firstPrice: sortOrder } }
    );
  }

  // customPipeline.push({ $project: { category_id: 0 } });

  const [listProduct, totalProduct] = await Promise.all([
    ProductModel.aggregate([...basePipeline, ...customPipeline]),
    ProductModel.countDocuments(query),
  ]);

  return { listProduct, totalProduct };
};

const updateCategoryAttributes = async (attributesProduct, attributesCategory, categoryExists) => {
  // Tạo object để tra cứu nhanh các attributes của category
  const categoryAttributeMap = new Map(
    attributesCategory.map((attr) => [attr.name, new Set(attr.values)]) // Dùng Set để kiểm tra giá trị nhanh hơn
  );

  let hasUpdate = false;

  // Duyệt qua tất cả attributes của product
  attributesProduct.forEach((attr) => {
    const existingValues = categoryAttributeMap.get(attr.name);

    if (existingValues) {
      // Tìm những giá trị chưa có trong category
      const newValues = attr.values.filter((value) => !existingValues.has(value));

      if (newValues.length > 0) {
        existingValues.forEach((value) => newValues.push(value)); // Giữ lại giá trị cũ
        categoryAttributeMap.set(attr.name, new Set(newValues));
        hasUpdate = true;
      }
    } else {
      // Nếu key chưa có, thêm mới
      categoryAttributeMap.set(attr.name, new Set(attr.values));
      hasUpdate = true;
    }
  });

  // Nếu có thay đổi, cập nhật lại category
  if (hasUpdate) {
    const newAttributeCategory = Array.from(categoryAttributeMap, ([name, values]) => ({
      name,
      values: Array.from(values), // Convert Set về mảng
    }));

    await CategoryModel.updateOne({ _id: categoryExists._id }, { $set: { attributes: newAttributeCategory } });
  }
};

const updateProduct = async ({ _id, ...productData }) => {
  const { error, value } = productVerify.productSchema.validate(productData);
  // console.log(error.details, "error");
  if (error) {
    throw new BadRequestError("Missing data input for updating product.");
  }
  const { product_variants, category, ...updateData } = value;
  const [storeExists, categoryExists] = await Promise.all([
    StoreModel.findById(updateData.store_id).lean(),
    CategoryModel.findById(updateData.category_id).lean(),
  ]);

  if (!storeExists) throw new BadRequestError("Store ID is wrong!");
  if (!categoryExists) throw new BadRequestError("Category ID is wrong!");

  const existingProduct = await ProductModel.findOne({ _id, store_id: updateData.store_id }).lean();
  if (!existingProduct) {
    throw new BadRequestError("Product ID or Store ID is incorrect.");
  }

  const updatedProduct = await ProductModel.findOneAndUpdate({ _id }, updateData, { new: true, lean: true });

  if (product_variants && product_variants.length > 0) {
    const bulkOperations = [];
    const newVariants = [];
    const productHistoryRecords = [];
    const existingVariants = await ProductVariantModel.find({ product_id: _id }).lean();

    for (const variant of product_variants) {
      if (variant._id) {
        const oldVariant = existingVariants.find((v) => v._id.toString() === variant._id);
        if (oldVariant && oldVariant.price !== variant.price) {
          productHistoryRecords.push({
            product_variant_id: variant._id,
            field_name: "price",
            value: oldVariant.price,
            start_date: oldVariant.createdAt,
            end_date: new Date(),
            reason: "Price updated",
          });
        }
        if (oldVariant.price !== variant.price || oldVariant.stock !== variant.stock) {
          bulkOperations.push({
            updateOne: {
              filter: { _id: variant._id },
              update: { $set: variant },
            },
          });
        }
      } else {
        newVariants.push({ ...variant, product_id: _id });
        await updateCategoryAttributes(updateData.variants, categoryExists.attributes, categoryExists);
      }
    }

    if (bulkOperations.length > 0) {
      await ProductVariantModel.bulkWrite(bulkOperations);
    }

    if (newVariants.length > 0) {
      await ProductVariantModel.insertMany(newVariants);
    }
    const updatedVariantsIds = product_variants.map((variant) => variant._id).filter(Boolean);
    const variantsToDelete = existingVariants.filter((variant) => !updatedVariantsIds.includes(variant._id.toString()));

    if (variantsToDelete.length > 0) {
      productHistoryRecords.push(
        ...variantsToDelete.map((variant) => ({
          product_variant_id: variant._id,
          field_name: "price",
          value: variant.price,
          start_date: variant.createdAt,
          end_date: new Date(),
          reason: "Product variant deleted",
        }))
      );
      await ProductVariantModel.deleteMany({ _id: { $in: variantsToDelete.map((v) => v._id) } });
    }

    if (productHistoryRecords.length > 0) {
      await ProductHistoryModel.insertMany(productHistoryRecords);
    }
  }

  const remainingVariants = await ProductVariantModel.find({ product_id: _id }).lean();

  return { ...updatedProduct, product_variants: remainingVariants, category: categoryExists };
};

const deleteProduct = async ({ product_id, store_id }) => {
  productVerify.productVerify("deleteProduct", { product_id, store_id });

  // const existOrderConnectWithProduct = await ordersModel.findOne({
  //   store_id,
  //   listProductOrder: { $elemMatch: { _id: product_id } },
  // });

  // if (existOrderConnectWithProduct) {
  //   throw new BadRequestError("This product is connecting with another order.");
  // }

  await ProductVariantModel.deleteMany({ product_id });

  const productDeleted = await ProductModel.findOneAndDelete({
    _id: product_id,
  });

  if (!productDeleted) {
    throw new BadRequestError("Product not found or not belonging to this store.");
  }

  return null;
};
const getAllProductById = async (listIdProduct) => {
  productVerify.productVerify("getAllProductById", listIdProduct);
  listIdProduct = listIdProduct.map((id) => new mongoose.Types.ObjectId(id));
  const listProduct = await ProductModel.aggregate([
    {
      $match: {
        _id: { $in: listIdProduct },
      },
    },
    ...coreQuery,
  ]);
  if (listProduct.length === 0) {
    throw new BadRequestError("No products found with the provided IDs.");
  }

  return listProduct;
};

export default { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct, getAllProductById };
