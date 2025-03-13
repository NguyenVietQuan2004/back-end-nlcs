import handleError from "../error/error.js";
import categoryService from "../services/category-service.js";

// [POST] /category/create-category
export const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Create category success.",
      data: category,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Create category");
  }
};

// [GET]/ category
export const getCategory = async (req, res) => {
  try {
    const data = await categoryService.getCategory(req.query);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Get category success.",
      data,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Get category");
  }
};

// [GET] /category/get-all
export const getAllCategory = async (req, res) => {
  try {
    const listCategory = await categoryService.getAllCategory(req.query.store_id);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Get list category success.",
      data: listCategory,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Get all categories");
  }
};

// [PUT] /category
export const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.body);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Update category success.",
      data: updatedCategory,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Update category");
  }
};

// [DELETE] /category
export const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await categoryService.deleteCategory(req.body);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Delete category success.",
      data: deletedCategory,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Delete category");
  }
};
