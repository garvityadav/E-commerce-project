const {
  getAllProduct,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controller/product-controller");
const {
  authenticateUser,
  authorisePermissions,
} = require("../middleware/authentication");

const express = require("express");
const router = express.Router();

router
  .route("/")
  .post(authenticateUser, authorisePermissions("admin"), createProduct)
  .get(authenticateUser, authorisePermissions("admin"), getAllProduct);

router.route("/uploadImage").post(authenticateUser, uploadImage);

router
  .route("/:id")
  .patch(authenticateUser, updateProduct)
  .get(authenticateUser, getSingleProduct)
  .delete(authenticateUser, authorisePermissions("admin"), deleteProduct);

module.exports = router;
