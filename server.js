import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import routes from "./src/routes/index.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONT_END_BASE_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next();
});
app.use(cookieParser());
app.use(bodyParser.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
const URL = process.env.DATABASE_URL;

mongoose
  .connect(URL, {})
  .then(() => {
    console.log("Connected to DB");
    routes(app);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("errl", err);
  });
