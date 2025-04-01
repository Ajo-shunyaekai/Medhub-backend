// Common Success Response Function
const sendSuccessResponse = (res, statusCode, message, data = null) => {
  return res?.status(statusCode).send({
    code: statusCode,
    message: message,
    data: data || {},
  });
};

// Common Error Response Function
const sendErrorResponse = (res, statusCode, message, result = null) => {
  return res?.status(statusCode).send({
    code: statusCode,
    message: message,
    result: result || {},
  });
};

module.exports = { sendSuccessResponse, sendErrorResponse}