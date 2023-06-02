const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Product = require("../models/product");
const path = require("path");

//Create-Product
const createProduct = async (req, res) => {
  req.body.user = req.user.userID;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product: product });
};

//Get-All-Products
const getAllProduct = async (req, res) => {
  const products = await Product.find({}).populate({
    path: "user",
    select: "name",
  });
  res
    .status(StatusCodes.OK)
    .json({ counts: products.length, products: products });
};

//Get-Single-Product
const getSingleProduct = async (req, res) => {
  const productID = req.params.id;
  const product = await Product.findOne({ _id: productID }).populate({
    path: "review",
  });
  if (!product) {
    throw new CustomError.NotFoundError("No product found");
  }
  res.status(StatusCodes.OK).json({ product: product });
};

//Update-Product
const updateProduct = async (req, res) => {
  const productID = req.params.id;
  const product = await Product.findOneAndUpdate({ _id: productID }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError("No product found");
  }
  res.status(StatusCodes.OK).json({ product: product });
};

//Delete-Product
const deleteProduct = async (req, res) => {
  const productID = req.params.id;
  const product = await Product.findOne({ _id: productID });
  if (!product) {
    throw new CustomError.NotFoundError("No product found");
  }
  await product.deleteOne();
  res.status(StatusCodes.OK).json({ success: "product removed" });
};

//Upload-Image
const uploadImage = async (req, res) => {
  const productImage = req.files.image;
  if (!productImage) {
    throw new CustomError.BadRequestError("No file uploaded");
  }
  if (!req.files.image.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please provide an image");
  }
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "The image size shouldn't exceed 1MB"
    );
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res
    .status(StatusCodes.OK)
    .json({ image: "uploads/" + `${productImage.name}` });
};

module.exports = {
  getAllProduct,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
