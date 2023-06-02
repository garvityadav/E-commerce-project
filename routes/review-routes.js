const express = require("express");
const router = express.Router();
const {
  createReview,
  updateReview,
  getAllReviews,
  getSingleReview,
  deleteReviews,
} = require("../controller/review-controller");
const { authenticateUser } = require("../middleware/authentication");

router.route("/").get(getAllReviews).post(authenticateUser, createReview);
router
  .route("/:id")
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReviews);

module.exports = router;
