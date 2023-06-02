const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

//register
const register = async (req, res) => {
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";
  const { email, name, password } = req.body;
  const emailCheck = await User.findOne({ email });
  if (emailCheck) {
    throw new CustomError.BadRequestError("Email already exist");
  } else {
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      password,
      role,
    });
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.CREATED).json({ user: tokenUser });
  }
};

//login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide Email & Password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  const isPasswordVerified = await user.comparePassword(password);
  if (!isPasswordVerified) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// logout
const logout = async (req, res) => {
  res.cookie("token", logout, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "Logged out!" });
};

module.exports = { register, login, logout };
