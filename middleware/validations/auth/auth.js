const { body, validationResult } = require("express-validator");
const { sendErrorResponse } = require("../../../utils/commonResonse");
const logErrorToFile = require("../../../logs/errorLogs");

// Helper: Conditional required field
const conditionalRequired = (field, userType, message) =>
  body(field)?.custom((value, { req }) => {
    if (req?.body?.userTpye?.toLowerCase() === userType && !value) {
      throw new Error(message);
    }
    return true;
  });

// Helper: Required array with non-empty string values
const requiredStringArray = (field, userType, message, itemMessage) =>
  body(field)?.custom((value, { req }) => {
    if (req?.body?.userTpye?.toLowerCase() === userType) {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(message);
      }
      const allValid = value.every(
        (item) => typeof item === "string" && item.trim() !== ""
      );
      if (!allValid) {
        throw new Error(itemMessage);
      }
    }
    return true;
  });

// Buyer-specific validations
const buyerFields = [
  [
    "buyer_type",
    "Buyer Type is required.",
    ["End User", "Distributor", "Medical Practitioner"],
  ],
  ["buyer_name", "Buyer Name is required."],
  ["buyer_email", "Buyer Email is required."],
  ["buyer_mobile", "Buyer Mobile Number is required."],
  ["buyer_country_code", "Buyer Country Code is required."],
  ["registration_no", "Buyer Registration No is required."],
  ["vat_reg_no", "Buyer VAT Reg No is required."],
  ["activity_code", "Buyer Activity Code is required."],
  ["contact_person_name", "Buyer Contact Person Name is required."],
  ["designation", "Buyer Designation is required."],
  ["contact_person_email", "Buyer Contact Person Email is required."],
  ["contact_person_mobile", "Buyer Contact Person Mobile is required."],
  [
    "contact_person_country_code",
    "Buyer Contact Person Country Code is required.",
  ],
  ["country_of_origin", "Country Of Origin is required."],
  ["description", "Description is required."],
  ["company_reg_address", "Company Reg Address is required."],
  ["locality", "Street is required."],
  ["country", "Country is required."],
];

// Supplier-specific validations
const supplierFields = [
  [
    "supplier_type",
    "Supplier Type is required.",
    ["Manufacturer", "Distributor", "Medical Practitioner"],
  ],
  ["supplier_name", "Supplier Name is required."],
  ["description", "Description is required."],
  ["supplier_address", "Supplier Address is required."],
  ["supplier_mobile", "Supplier Mobile is required."],
  ["supplier_country_code", "Supplier Country Code is required."],
  ["registration_no", "Registration No is required."],
  ["vat_reg_no", "VAT Reg No is required."],
  ["country_of_origin", "Country of Origin is required."],
  ["contact_person_name", "Contact Person Name is required."],
  ["designation", "Designation is required."],
  ["contact_person_mobile_no", "Contact Person Mobile No is required."],
  ["contact_person_country_code", "Contact Person Country Code is required."],
  ["contact_person_email", "Contact Person Email is required."],
  ["activity_code", "Activity Code is required."],
  ["tags", "Tags is required."],
  ["company_reg_address", "Company Reg Address is required."],
  ["locality", "Street is required."],
  ["country", "Country is required."],
];

// Build validation array
const authValidationRules = [
  // Buyer fields
  ...buyerFields?.map(([field, message, enumList]) => {
    if (enumList) {
      return body(field)?.custom((value, { req }) => {
        if (req?.body?.userTpye?.toLowerCase() === "buyer") {
          if (!value) throw new Error(message);
          if (!enumList.includes(value))
            throw new Error(`${field} is invalid.`);
        }
        return true;
      });
    } else {
      return conditionalRequired(field, "buyer", message);
    }
  }),

  requiredStringArray(
    "country_of_operation",
    "buyer",
    "Country of Operation is required for buyers.",
    "Each country in country_of_operation must be a non-empty string."
  ),

  // Supplier fields
  ...supplierFields?.map(([field, message, enumList]) => {
    if (enumList) {
      return body(field)?.custom((value, { req }) => {
        if (req?.body?.userTpye?.toLowerCase() === "supplier") {
          if (!value) throw new Error(message);
          if (!enumList.includes(value))
            throw new Error(`${field} is invalid.`);
        }
        return true;
      });
    } else {
      return conditionalRequired(field, "supplier", message);
    }
  }),

  requiredStringArray(
    "country_of_operation",
    "supplier",
    "Country of Operation is required for suppliers.",
    "Each country in country_of_operation must be a non-empty string."
  ),

  requiredStringArray(
    "approx_yearly_purchase_value",
    "supplier",
    "Approx Yearly Purchase Value is required for suppliers.",
    "Each value must be a non-empty string."
  ),

  requiredStringArray(
    "interested_in",
    "supplier",
    "Interested In is required for suppliers.",
    "Each value in interested_in must be a non-empty string."
  ),

  requiredStringArray(
    "categories",
    "supplier",
    "Categories is required for suppliers.",
    "Each category in categories must be a non-empty string."
  ),
];

// Error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation Error:", errors.array());
    logErrorToFile(errors.array(), req);
    return sendErrorResponse(res, 400, "Validation Error", errors.array());
  }
  next();
};

module.exports = { authValidationRules, handleValidationErrors };
