const { body, validationResult } = require("express-validator");
const { sendErrorResponse } = require("../../utils/commonResonse");
const logErrorToFile = require("../../logs/errorLogs");

const addressValidationRules = [
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required"),

  body("mobile_number").notEmpty().withMessage("Phone number is required"),

  body("company_reg_address")
    .notEmpty()
    .withMessage("Company Address is required"),

  body("locality")
    .notEmpty()
    .withMessage("Locality is required"),

  body("lamd_mark").optional(),

  body("country")
    .notEmpty()
    .withMessage("Country is required"),

  body("state").optional(),

  body("city").optional(),

  body("pincode").optional(),

  body("address_type")
    .notEmpty()
    .withMessage("Address type is required")
    .isIn(["Company", "Shop", "Warehouse", "Factory", "Other"])
    .withMessage(
      "Address type must be one of: Company, Shop, Warehouse, Factory, Other"
    ),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  console.log('errors')
  if (!errors.isEmpty()) {
    
    console.log("Internal Server Error:", errors.array());
    logErrorToFile(errors.array(), req);
    return sendErrorResponse(res, 400, "Validation Error", errors.array());
  }
  
  next();
};

module.exports = { addressValidationRules, handleValidationErrors };
