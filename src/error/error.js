class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict error") {
    super(message, 409);
  }
}
class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}
const handleError = (res, error, action) => {
  console.error(`${action} error:`, error.message);
  return res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || "Something went wrong.",
    data: null,
    error: { description: error.message || "Something went wrong." },
  });
};
export default handleError;
export { AppError, NotFoundError, BadRequestError, UnauthorizedError, InternalServerError, ConflictError };
