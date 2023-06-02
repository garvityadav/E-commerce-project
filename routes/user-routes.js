const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorisePermissions,
} = require("../middleware/authentication");

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controller/user-controller");

router
  .route("/")
  .get(authenticateUser, authorisePermissions("admin"), getAllUsers);
router.route("/showUser").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
