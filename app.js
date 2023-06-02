require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const connectDB = require("./db/db.connect");
const fileUpload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");

const morgan = require("morgan");

//middlewares
require("express-async-errors");
const cookieParser = require("cookie-parser");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authRouter = require("./routes/auth-routes");
const userRouter = require("./routes/user-routes");
const productRouter = require("./routes/product-routes");
const reviewRouter = require("./routes/review-routes");
const orderRouter = require("./routes/order-routes");
app.use(express.json());
app.use(express.static("./public"));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}
console.log(process.env.NODE_ENV);
//Routes
app.get("/", (req, res) => {
  res.send("E-commerce website");
});

app.use("/cookie", (req, res) => {
  console.log(req.signedCookies);
  res.send("Cookie JWT");
});
app.use("/api/v1/auth", authRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

//Connect
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("db Connected");
    app.listen(port, () => {
      console.log("Server started on port: " + port);
    });
  } catch (err) {}
  //database connect message
};

start();
