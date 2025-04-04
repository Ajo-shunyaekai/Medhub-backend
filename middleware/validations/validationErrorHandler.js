const { validationResult } = require("express-validator");
const logErrorToFile = require("../../logs/errorLogs");
const { sendErrorResponse } = require("../../utils/commonResonse");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error(
      "Internal Server Error:",
      errors.array()?.map((ele) => ele?.msg)
    );
    logErrorToFile(
      errors.array()?.map((ele) => ele?.msg),
      req,
      "express-validator"
    );
    return sendErrorResponse(
      res,
      400,
      "Validation Error",
      errors.array()?.map((ele) => ele?.msg)
    );
  }

  next();
};

module.exports = { handleValidationErrors };
