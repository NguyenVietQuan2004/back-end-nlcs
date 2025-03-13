import handleError from "../error/error.js";
import billboardService from "../services/billboard-service.js";

// [POST] /billboard/create-billboard
export const createBillboard = async (req, res) => {
  try {
    const billboard = await billboardService.createBillboard(req.body);
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Create billboard success.",
      data: billboard,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Create billboard");
  }
};

// [GET] /billboard
export const getBillboard = async (req, res) => {
  try {
    const billboard = await billboardService.getBillboard(req.query);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Get billboard success.",
      data: billboard,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Get billboard");
  }
};

// [GET] /billboard/get-all
export const getAllBillboard = async (req, res) => {
  try {
    const listBillboard = await billboardService.getAllBillboard(req.query.store_id);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Get list billboard success.",
      data: listBillboard,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Get all billboards");
  }
};

// [PUT] /billboard
export const updateBillboard = async (req, res) => {
  try {
    const updatedBillboard = await billboardService.updateBillboard(req.body);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Update billboard success.",
      data: updatedBillboard,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Update billboard");
  }
};

// [DELETE] /billboard
export const deleteBillboard = async (req, res) => {
  try {
    const billboardDeleted = await billboardService.deleteBillboard(req.body);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Delete billboard success.",
      data: billboardDeleted,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Delete billboard");
  }
};
