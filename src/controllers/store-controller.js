import handleError from "../error/error.js";
import storeService from "../services/store-service.js";

// [POST] /store/create-store
export const createStore = async (req, res) => {
  try {
    const store = await storeService.createStore(req.body, req.user);
    res.status(201).json({
      data: store,
      message: "Create store success.",
      success: true,
      statusCode: 201,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Create store");
  }
};

// [GET] /store/get-all
export const getAllStore = async (req, res) => {
  try {
    const listStore = await storeService.getAllStore(req.user);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Get list store success.",
      data: listStore,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Get all stores");
  }
};

// [GET] /store
export const getStore = async (req, res) => {
  try {
    const store = await storeService.getStore(req.query._id, req.user);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Get store success.",
      data: store,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Get store");
  }
};

// [PUT] /store
export const updateStore = async (req, res) => {
  try {
    const updatedStore = await storeService.updateStore({ store_id: req.body._id, newName: req.body.name }, req.user);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Update store success.",
      data: updatedStore,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Update store");
  }
};

// [DELETE] /store
export const deleteStore = async (req, res) => {
  try {
    const storeDeleted = await storeService.deleteStore(req.body._id, req.user);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Delete store success.",
      data: storeDeleted,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Delete store");
  }
};
