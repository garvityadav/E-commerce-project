const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Reviews = require("../models/review");
const Products = require("../models/product");
const { checkPermissions } = require("../utils");

//Create review
const createReview = async (req, res) => {
  const productID = req.body.productID;
  const userID = req.user.userID;
  const isProductValid = await Products.findOne({ _id: productID });
  if (!isProductValid) {
    throw new CustomError.BadRequestError("Please fill valid product ID");
  }
  const isReviewRepeated = await Reviews.findOne({
    product: productID,
    user: userID,
  });
  if (isReviewRepeated) {
    throw new CustomError.UnAuthorisedError("Review already submitted");
  }
  req.body.product = productID;
  req.body.user = userID;
  const review = await Reviews.create(req.body);

  res.status(StatusCodes.CREATED).json({ review: review });
};

//Update Review using :id params
const updateReview = async (req, res) => {
  const reviewID = req.params.id;
  const { rating, comment, title } = req.body;

  if (!reviewID) {
    throw new CustomError.BadRequestError("Please enter the review ID");
  }
  const review = await Reviews.findById({ _id: reviewID });
  if (!review) {
    throw new CustomError.NotFoundError("review not found");
  }
  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.comment = comment;
  review.title = title;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

//Get all the reviews
const getAllReviews = async (req, res) => {
  const reviews = await Reviews.find({})
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({
      path: "user",
      select: "name",
    });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews: reviews });
};

//Get a single review using :id params
const getSingleReview = async (req, res) => {
  const reviewID = req.params.id;
  if (!reviewID) {
    throw new CustomError.BadRequestError("Please enter the review ID");
  }
  const isReviewIDValid = await Reviews.findById({ _id: reviewID });
  if (!isReviewIDValid) {
    throw new CustomError.BadRequestError("Invalid ID");
  }
  res.status(StatusCodes.OK).json({ reveiw: isReviewIDValid });
};

//Delete reviews using :id params
const deleteReviews = async (req, res) => {
  const reviewID = req.params.id;
  if (!reviewID) {
    throw new CustomError.BadRequestError("Please enter the review ID");
  }
  const review = await Reviews.findById({ _id: reviewID });
  if (!review) {
    throw new CustomError.NotFoundError("review not found");
  }

  checkPermissions(req.user, review.user);
  await review.deleteOne();

  res.status(StatusCodes.OK).json({ msg: "Deleted sucessfully" });
};

module.exports = {
  createReview,
  updateReview,
  getAllReviews,
  getSingleReview,
  deleteReviews,
};
