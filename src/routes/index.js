import authRoute from "./auth-route.js";
import storeRoute from "./store-route.js";
import billboardRoute from "./billboard-route.js";
import categoryRoute from "./category-route.js";
import homepageRoute from "./homepage-image-route.js";
import productRoute from "./product-route.js";
import orderRoute from "./order-route.js";

export default function Routes(app) {
  app.use("/auth", authRoute);
  app.use("/store", storeRoute);
  app.use("/billboard", billboardRoute);
  app.use("/category", categoryRoute);
  app.use("/homepage", homepageRoute);
  app.use("/product", productRoute);
  app.use("/order", orderRoute);
}
