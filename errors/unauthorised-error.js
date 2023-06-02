const CustomAPIError = require("./custom-error");
const { StatusCodes } = require("http-status-codes");

class UnAuthorisedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

module.exports = UnAuthorisedError;
