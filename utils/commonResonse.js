const { default: mongoose } = require("mongoose");
const logErrorToFile = require("../logs/errorLogs");

// Common Success Response Function
const sendSuccessResponse = (res, statusCode, message, data = null) => {
  return res?.status(statusCode).send({
    code: statusCode,
    message: message,
    data: data || {},
  });
};

const cookiesOptions = {
  httpOnly: true,
  secure: true,
};

// Common Error Response Function
const sendErrorResponse = (res, statusCode, message, result = null) => {
  return res?.status(statusCode).send({
    code: statusCode,
    message: message,
    result: result || {},
  });
};

const handleCatchBlockError = async (req, res, error, middlewareObj) => {
  try {
    let message =
      middlewareObj?.message ||
      "An unexpected error occurred. Please try again later.";
    let statusCode = middlewareObj?.status || 500;
    let errObj = error;
    let dbError = false;

    if (
      mongoose.Error.ValidationError &&
      error instanceof mongoose.Error.ValidationError
    ) {
      const messages = Object.values(error?.errors).map(
        (error) => error?.message
      );
      const uniqueMessages = [...new Set(messages)];
      dbError = true;
      message = "Validation failed";
      statusCode = 400;
      errObj = uniqueMessages;
    } else if (
      mongoose.Error.CastError &&
      error instanceof mongoose.Error.CastError
    ) {
      dbError = true;
      message = `Invalid value for ${error.path}`;
      statusCode = 400;
      errObj = error?.errors;
    } else if (
      mongoose.Error.VersionError &&
      error instanceof mongoose.Error.VersionError
    ) {
      dbError = true;
      message = "Version mismatch error";
      statusCode = 409;
      errObj = error?.errors;
    } else if (
      mongoose.Error.DivergentArrayError &&
      error instanceof mongoose.Error.DivergentArrayError
    ) {
      dbError = true;
      message = "Array projection error";
      statusCode = 400;
      errObj = error?.errors;
    } else if (
      mongoose.Error.MongooseServerSelectionError &&
      error instanceof mongoose.Error.MongooseServerSelectionError
    ) {
      dbError = true;
      message = "Unable to connect to the database";
      statusCode = 500;
      errObj = error?.errors;
    } else if (
      mongoose.Error.OverwriteModelError &&
      error instanceof mongoose.Error.OverwriteModelError
    ) {
      dbError = true;
      message = "Model has already been defined";
      statusCode = 500;
      errObj = error?.errors;
    } else if (
      mongoose.Error.ObjectExpectedError &&
      error instanceof mongoose.Error.ObjectExpectedError
    ) {
      dbError = true;
      message = "Expected an object value";
      statusCode = 400;
      errObj = error?.errors;
    }

    // Log the error to a file
    console.error("Internal Server Error:", errObj);
    await logErrorToFile(errObj, req, dbError ? "DB Error" : undefined); // Assuming logErrorToFile is an async function

    // Send the error response to the client
    return sendErrorResponse(res, statusCode, message, errObj);
  } catch (err) {
    // If something goes wrong in the try block, send a generic server error
    console.error("Unexpected Error:", err);
    await logErrorToFile(err, req); // Assuming logErrorToFile is an async function
    return sendErrorResponse(res, 500, "An unexpected error occurred", err);
  }
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  handleCatchBlockError,
  cookiesOptions,
};
