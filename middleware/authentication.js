const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid!");
  } else {
    console.log(`Token from Auth middleware: ${token}`);
  }
  try {
    const { name, userID, role } = isTokenValid({ token });
    req.user = { userID, name, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid!");
  }
};

const authorisePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnAuthorisedError("Unauthorised Access!");
    }
    next();
  };
};

module.exports = { authenticateUser, authorisePermissions };
