const { body, validationResult } = require("express-validator");
const { sendErrorResponse } = require("../../utils/commonResonse");
const logErrorToFile = require("../../logs/errorLogs");

// Validation middleware
const validateUserInput = [
  // Name validation
  body("name")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string"),

  // Email validation
  body("email")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  // Phone validation
  body("phone")
    .notEmpty()
    .withMessage("Phone cannot be empty"),
    // .isMobilePhone()
    // .withMessage("Please provide a valid phone number"),

  // Password validation
  body("newPassword")
    .optional()
    .custom((value, { req }) => {
      if (value) {
        // Check if oldPassword and confirmPassword exist when newPassword is provided
        if (!req.body.oldPassword || !req.body.confirmPassword) {
          throw new Error(
            "Old Password and Confirm Password are required when updating password"
          );
        }

        // Check if oldPassword is the same as newPassword
        if (req.body.oldPassword === value) {
          throw new Error(
            "New password cannot be the same as the old password"
          );
        }

        // Check if confirmPassword matches newPassword
        if (req.body.confirmPassword !== value) {
          throw new Error("New password and Confirm password must match");
        }

        // Validate the new password (8-15 chars, upper, lower, number)
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/;
        if (!passwordRegex.test(value)) {
          throw new Error(
            "Password must be 8-15 characters long, include an uppercase letter, lowercase letter, and a number"
          );
        }
      }
      return true;
    }),

  // Address validation
  body("address.company_reg_address")
    .notEmpty()
    .withMessage("Company registration address cannot be empty")
    .isString()
    .withMessage("Company registration address must be a string"),

  body("address.locality")
    .notEmpty()
    .withMessage("Locality cannot be empty")
    .isString()
    .withMessage("Locality must be a string"),

  // body("address.land_mark")
  //   .optional()
  //   .isString()
  //   .withMessage("Landmark must be a string"),

  // body("address.city")
  //   .optional()
  //   .isString()
  //   .withMessage("City must be a string"),

  // body("address.state")
  //   .optional()
  //   .isString()
  //   .withMessage("State must be a string"),

  body("address.country").notEmpty().withMessage("Country cannot be empty"),

  // body("address.pincode")
  //   .optional()
  //   .isString()
  //   .withMessage("State must be a string"),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Internal Server Error:", errors.array());
    logErrorToFile(errors.array(), req);
    return sendErrorResponse(res, 400, "Validation Error", errors.array());
  }
  next();
};

module.exports = { validateUserInput, handleValidationErrors };
