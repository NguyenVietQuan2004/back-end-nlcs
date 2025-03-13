import { BadRequestError } from "../error/error.js";

export const isValidGoogleAccount = (user) => {
  const requiredFields = ["fullname", "avatar", "method", "google_account_id"];

  if (!user.phone_number && !user.email) {
    return false;
  }

  for (const field of requiredFields) {
    if (!user[field]) {
      return false;
    }
  }

  return true;
};

// thêm avatar vào
export const isValidAccount = (user) => {
  // const requiredFields = ["fullname", "phone_number", "email", "password", "method"];
  const requiredFields = ["fullname", "email", "password", "method"];
  for (const field of requiredFields) {
    if (!user[field]) {
      throw new BadRequestError("Missing input data!");
    }
  }
};
export const isValidUser = (user) => {
  const method = user.method;
  if (!method) {
    throw new BadRequestError("Phương thức đăng nhập không được chỉ định!");
  }
  if (method === "google") {
    if (!isValidGoogleAccount(user)) {
      throw new BadRequestError("Thiếu thông tin khi đăng nhập với Google!");
    }
  } else if (method === "account") {
    if (!user.email || !user.password) {
      throw new BadRequestError("Thiếu thông tin tài khoản hoặc mật khẩu!");
    }
  } else {
    throw new BadRequestError("Phương thức đăng nhập không hợp lệ!");
  }
};
