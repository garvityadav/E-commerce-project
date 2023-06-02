const CustomAPIError = require("./custom-error");
const UnauthenticatedError = require("./unauthenticated-error");
const BadRequestError = require("./bad-request");
const UnAuthorisedError = require("./unauthorised-error");
const NotFoundError = require("./not-found-error");

module.exports = {
  CustomAPIError,
  UnauthenticatedError,
  BadRequestError,
  UnAuthorisedError,
  NotFoundError,
};
