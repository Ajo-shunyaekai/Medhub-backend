const {
  sendErrorResponse,
  handleCatchBlockError,
} = require("../../../utils/commonResonse");

const addUserFileMiddleware = (req, res, next) => {
  try {
    const { usertype } = req.body;
    const errArr = [];
    if (usertype?.toLowerCase() == "buyer") {
      // Validate the required files for "Buyer" type
      if (!req.files["buyer_image"] || req.files["buyer_image"].length === 0) {
        errArr.push("Company Logo is required.");
      }
      if (
        !req.files["license_image"] ||
        req.files["license_image"].length === 0
      ) {
        errArr.push("Company license image is required.");
      }
      if (
        req?.body?.buyer_type == "Medical Practitioner" &&
        (!req.files["medical_practitioner_image"] ||
          req.files["medical_practitioner_image"].length === 0)
      ) {
        errArr.push("Medical Practitioner Certificate image is required.");
      }
    } else if (usertype?.toLowerCase() == "supplier") {
      if (
        !req.files["supplier_image"] ||
        req.files["supplier_image"].length === 0
      ) {
        errArr.push("Supplier Logo is required.");
      }
      if (
        !req.files["license_image"] ||
        req.files["license_image"].length === 0
      ) {
        errArr.push("Supplier license image is required.");
      }

      if (
        req?.body?.supplier_type == "Medical Practitioner" &&
        (!req.files["medical_practitioner_image"] ||
          req.files["medical_practitioner_image"].length === 0)
      ) {
        errArr.push("Medical Practitioner Certificate image is required.");
      }
    }
    if (errArr?.length > 0) {
      return sendErrorResponse(res, 415, "Few files are missing", errArr);
    }
    next();
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

const editUserFileMiddleware = (req, res, next) => {
  try {
    const { usertype } = req.body;
    const errArr = [];
    if (usertype?.toLowerCase() == "buyer") {
      // Validate the required files for "Buyer" type
      if (
        (req?.files?.["buyer_imageNew"]?.length || 0) +
          (req?.body?.["buyer_image"]?.length || 0) ===
        0
      ) {
        errArr?.push("Company Logo is required.");
      }
      if (
        (req?.files?.["license_imageNew"]?.length || 0) +
          (req?.body?.["license_image"]?.length || 0) ===
        0
      ) {
        errArr?.push("Company license image is required.");
      }
      if (
        req?.body?.buyer_type == "Medical Practitioner" &&
        (req?.files?.["medical_practitioner_imageNew"]?.length || 0) +
          (req?.body?.["medical_practitioner_image"]?.length || 0) ===
          0
      ) {
        errArr?.push("Medical Practitioner Certificate image is required.");
      }
    } else if (usertype?.toLowerCase() == "supplier") {
      if (
        (req?.files?.["supplier_imageNew"]?.length || 0) +
          (req?.body?.["supplier_image"]?.length || 0) ===
        0
      ) {
        errArr?.push("Supplier Logo is required.");
      }
      if (
        (req?.files?.["license_imageNew"]?.length || 0) +
          (req?.body?.["license_image"]?.length || 0) ===
        0
      ) {
        errArr?.push("Supplier license image is required.");
      }

      if (
        req?.body?.supplier_type == "Medical Practitioner" &&
        (req?.files?.["medical_practitioner_imageNew"]?.length || 0) +
          (req?.body?.["medical_practitioner_image"]?.length || 0) ===
          0
      ) {
        errArr?.push("Medical Practitioner Certificate image is required.");
      }
    }
    if (errArr?.length > 0) {
      return sendErrorResponse(res, 415, "Few files are missing", errArr);
    }
    next();
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

module.exports = { addUserFileMiddleware, editUserFileMiddleware };
