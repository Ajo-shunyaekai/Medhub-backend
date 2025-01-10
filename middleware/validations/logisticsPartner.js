const { body } = require("express-validator");

const logisticsPartnerValidationRules = [
  body("company_name")
    .notEmpty()
    .withMessage("Company name is required")
    .isString()
    .withMessage("Company name must be a string"),

  body("contact_person")
    .notEmpty()
    .withMessage("Contact person is required")
    .isString()
    .withMessage("Contact person must be a string"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be valid"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?\d{10,15}$/)
    .withMessage(
      "Phone number must be a string with 10 to 15 digits, optionally starting with '+'"
    ),

  body("address.street")
    .notEmpty()
    .withMessage("Street is required")
    .isString()
    .withMessage("Street must be a string"),

  body("address.city")
    .notEmpty()
    .withMessage("City is required")
    .isString()
    .withMessage("City must be a string"),

  body("address.state")
    .notEmpty()
    .withMessage("State is required")
    .isString()
    .withMessage("State must be a string"),

  body("address.country")
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string"),

  body("address.zip_code")
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage("Zip code must be a valid format (e.g., 12345 or 12345-6789)"),
];

module.exports = { logisticsPartnerValidationRules };