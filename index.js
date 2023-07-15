import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import session from "express-session";

import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import authRoute from "./routes/authRoute.js";
import orderRoute from "./routes/orderRoute.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({ message: "RENT CAR SERVICE" });
});
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: "auto",
    },
  })
);

app.use(userRoute);
app.use(productRoute);
app.use(authRoute);
app.use(orderRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
