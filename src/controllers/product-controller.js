import handleError from "../error/error.js";
import productService from "../services/product-service.js";

// [POST] /order/create-product
export const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res
      .status(201)
      .json({ success: true, statusCode: 201, message: "Create product successfully.", data: product, error: null });
  } catch (error) {
    handleError(res, error, "Create product");
  }
};

// [GET] /order
export const getProduct = async (req, res) => {
  try {
    const productData = await productService.getProduct(req.query);
    res
      .status(200)
      .json({ success: true, statusCode: 200, message: "Get product success.", data: productData, error: null });
  } catch (error) {
    handleError(res, error, "Get product");
  }
};

// [GET] /order/get-all
export const getAllProduct = async (req, res) => {
  try {
    const data = await productService.getAllProducts(req.query);
    res.status(200).json({ success: true, statusCode: 200, message: "Get list product success.", data, error: null });
  } catch (error) {
    handleError(res, error, "Get all products");
  }
};

// [PUT] /order
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productService.updateProduct(req.body);
    res
      .status(200)
      .json({ success: true, statusCode: 200, message: "Update product success.", data: updatedProduct, error: null });
  } catch (error) {
    handleError(res, error, "Update product");
  }
};

// [DELETE] /order
export const deleteProduct = async (req, res) => {
  try {
    const { _id: product_id, store_id } = req.body;
    await productService.deleteProduct({ product_id, store_id });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Delete product success.",
      data: null,
      error: null,
    });
  } catch (error) {
    handleError(res, error, "Delete product");
  }
};

// [GET] /order/get-by-ids
export const getAllProductById = async (req, res) => {
  try {
    const listProduct = await productService.getAllProductById(req.body.listIdProduct);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Get all products by id success.",
      data: { listProduct },
      error: null,
    });
  } catch (error) {
    handleError(res, error, "Get all products by id");
  }
};
