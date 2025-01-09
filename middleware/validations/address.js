const { body } = require("express-validator");

const addressValidationRules = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isString()
    .withMessage("Full name should be a string"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isString()
    .withMessage("Phone number should be a string")
    .isLength({ min: 10 })
    .withMessage("Phone number should be at least 10 characters long"),

  body("houseName")
    .notEmpty()
    .withMessage("House Name is required")
    .isString()
    .withMessage("House Name should be a string"),

  body("street")
    .notEmpty()
    .withMessage("Street is required")
    .isString()
    .withMessage("Street should be a string"),

  body("city")
    .notEmpty()
    .withMessage("City is required")
    .isString()
    .withMessage("City should be a string"),

  body("state")
    .notEmpty()
    .withMessage("State is required")
    .isString()
    .withMessage("State should be a string"),

  body("country")
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country should be a string"),

  body("postalCode")
    .optional()
    .isString()
    .withMessage("Postal code should be a string"),

  body("type")
    .notEmpty()
    .withMessage("Address type is required")
    .isIn(["company", "shop", "warehouse", "factory", "other"])
    .withMessage(
      "Address type must be one of: company, shop, warehouse, factory, other"
    ),

//   body("isDefault")
//     .optional()
//     .isBoolean()
//     .withMessage("isDefault must be a boolean"),
];

module.exports = { addressValidationRules };
