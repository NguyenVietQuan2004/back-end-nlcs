import handleError from "../error/error.js";
import homepageImage from "../services/homepage-image-service.js";

// [POST] /homepage/create-homepage
export const createImagesHomePage = async (req, res) => {
  try {
    const imagesHomePage = await homepageImage.createImagesHomePage(req.body);
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Create ImagesHomePage success.",
      data: imagesHomePage,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Create ImagesHomePage");
  }
};

// [GET] /homepage
export const getImagesHomePage = async (req, res) => {
  try {
    const data = await homepageImage.getImagesHomePage(req.query);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Get ImagesHomePage success.",
      data,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Get ImagesHomePage");
  }
};

// [PUT] /homepage
export const updateImagesHomePage = async (req, res) => {
  try {
    const updatedImagesHomePage = await homepageImage.updateImagesHomePage(req.body);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Update ImagesHomePage success.",
      data: updatedImagesHomePage,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Update ImagesHomePage");
  }
};
