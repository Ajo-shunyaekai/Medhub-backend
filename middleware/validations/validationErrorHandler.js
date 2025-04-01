const { validationResult } = require("express-validator");
const logErrorToFile = require("../../logs/errorLogs");
const { sendErrorResponse } = require("../../utils/commonResonse");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error("Internal Server Error:", errors.array());
    logErrorToFile(errors.array(), req);
    return sendErrorResponse(res, 400, "Validation Error", errors.array());
  }

  next();
};

module.exports = { handleValidationErrors };
