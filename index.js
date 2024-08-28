import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import authRoute from "./routes/authRoute.js";
import orderRoute from "./routes/orderRoute.js";
import messageRoute from "./routes/messageRoute.js";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(
  cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "RENT CAR SERVICE", __dirname });
});

app.use(userRoute);
app.use(productRoute);
app.use(authRoute);
app.use(orderRoute);
app.use(messageRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
