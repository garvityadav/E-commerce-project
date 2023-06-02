const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

//get all users
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  if (!users) {
    throw new CustomError.BadRequestError(
      "Somethings not working , please wait!"
    );
  }
  res.status(StatusCodes.OK).json({ users: users });
};

// get single user
const getSingleUser = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById({ _id: id }).select("-password");
  if (!user) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "No user found by given ID" });
  }
  checkPermissions(req.user, user._id);
  res
    .status(StatusCodes.OK)
    .json({ id: user._id, name: user.name, email: user.email });
};

//show current user
const showCurrentUser = (req, res) => {
  res.status(StatusCodes.OK).json(req.user);
};

//update user
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError(
      "Please provide necessary items for update"
    );
  }
  const user = await User.findOne({ _id: req.user.userID });
  user.email = email;
  user.name = name;
  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

//update User's Password
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide Email & old password & new Password"
    );
  }
  const user = await User.findById(req.user.userID);
  const isPasswordVerifiedOld = await user.comparePassword(oldPassword);
  const isPasswordVerifiedNew = await user.comparePassword(newPassword);
  if (!isPasswordVerifiedOld) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  if (isPasswordVerifiedNew) {
    throw new CustomError.UnauthenticatedError(
      "New password can not be same as old one"
    );
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({
    user: { userId: user._id, name: user.name, email: user.email },
  });
};

//exports
module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
