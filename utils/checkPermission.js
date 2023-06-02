const CustomError = require("../errors");console.log

const checkPermissions = (requestUser, resourceUserID) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userID === resourceUserID.toString()) return;
  throw new CustomError.UnAuthorisedError(
    "Not Authorised to access this route"
  );
};

module.exports = checkPermissions;
