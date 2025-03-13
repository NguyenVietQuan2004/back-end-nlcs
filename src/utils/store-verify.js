import { BadRequestError } from "../error/error.js";

const validateStoreData = (storeData) => {
  if (!storeData.name) {
    throw new BadRequestError("Missing name store.");
  }
};

export default { validateStoreData };
