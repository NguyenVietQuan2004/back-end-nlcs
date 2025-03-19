import handleError from "../error/error.js";
import orderService from "../services/order-service.js";

// [POST] /order/create-order
export const createOrder = async (req, res) => {
  try {
    const data = await orderService.createOrder(req.body, req.user);
    res
      .status(201)
      .json({ success: true, statusCode: 201, message: "Create order successfully.", data: data, error: null });
  } catch (error) {
    handleError(res, error, "Create order");
  }
};

// [GET] /order/get-all
export const getAllOrders = async (req, res) => {
  try {
    const data = await orderService.getAllOrders(req.query.store_id);
    console.log(data);
    res
      .status(200)
      .json({ success: true, statusCode: 200, message: "Get all orders success.", data: data, error: null });
  } catch (error) {
    handleError(res, error, "Get all orders");
  }
};

// [PUT] /order
export const updateOrder = async (req, res) => {
  try {
    const data = await orderService.updateOrder(req.body);
    res.status(200).json({ success: true, statusCode: 200, message: "Update order success.", data: data, error: null });
  } catch (error) {
    handleError(res, error, "Update order");
  }
};

// [DELETE] /order
export const deleteOrder = async (req, res) => {
  try {
    await orderService.deleteOrder(req.body.order_id);

    res.status(200).json({ success: true, statusCode: 200, message: "Delete order success.", data: null, error: null });
  } catch (error) {
    handleError(res, error, "Delete order");
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const data = await orderService.getUserOrders(req.query.user_id);

    res.status(200).json({ success: true, statusCode: 200, message: "Get order success.", data: data, error: null });
  } catch (error) {
    handleError(res, error, "Get order");
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const data = await orderService.updateOrderStatus(req.body);
    res
      .status(200)
      .json({ success: true, statusCode: 200, message: "updated order success.", data: data, error: null });
  } catch (error) {
    handleError(res, error, "updated order");
  }
};
// [GET] /order
export const overviewOrder = async (req, res) => {
  try {
    const data = await orderService.overviewOrder(req.query.store_id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Get order overview success.",
      data: data,
      error: null,
    });
  } catch (error) {
    handleError(res, error, "Get order overview");
  }
};
