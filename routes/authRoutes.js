const express = require('express');
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const Controller = require("../controller/Buyer");
const { handleResponse } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const { imageUpload } = require("../utils/imageUpload");
const mime = require('mime-types');
const {
  checkAuthorization,
  checkCommonUserAuthentication,
} = require("../middleware/Authorization");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedinUserProfileDetails,
  verifyEmail,
  verifyOTP,
  resetPassword,
  updatePassword,
  // addProfileEditRequest,
  verifyEmailAndResendOTP,
  updateProfileAndSendEditRequest
} = require(`../controller/authController`);
const { sendErrorResponse } = require('../utils/commonResonse');
const { validateUserInput, handleValidationErrors } = require('../middleware/validations/editProfile');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { usertype } = req.body;

    // Define the default upload path based on user type and fieldname
    let uploadPath =
      usertype === "Buyer"
        ? "./uploads/buyer/buyer_images"
        : usertype === "Supplier" && "./uploads/supplier/supplierImage_files";

    // Adjust upload path based on the specific file type
    if (file.fieldname === "tax_image" || file.fieldname === "new_tax_image") {
      uploadPath =
        usertype === "Buyer"
          ? "./uploads/buyer/tax_images"
          : usertype === "Supplier" && "./uploads/supplier/tax_image";
    } else if (file.fieldname === "license_image" || file.fieldname === "new_license_image") {
      uploadPath =
        usertype === "Buyer"
          ? "./uploads/buyer/license_images"
          : usertype === "Supplier" && "./uploads/supplier/license_image";
    } else if (file.fieldname === "certificate_image" || file.fieldname === "new_certificate_image") {
      uploadPath =
        usertype === "Buyer"
          ? "./uploads/buyer/certificate_images"
          : usertype === "Supplier" && "./uploads/supplier/certificate_image";
    } else if (file.fieldname === "medical_practitioner_image" || file.fieldname === "new_medical_practitioner_image") {
      uploadPath =
        usertype === "Buyer"
          ? "./uploads/buyer/medical_practitioner_images"
          : usertype === "Supplier" && "./uploads/supplier/medical_practitioner_image";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Resolve the file extension using mime-types
    const ext = mime.extension(file.mimetype) || 'bin'; // Default to 'bin' for unknown MIME types
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});
 
const upload = multer({ storage: storage });
 
const cpUpload = (req, res, next) => {
  upload.fields([
    { name: "buyer_image", maxCount: 1 },
    { name: "license_image", maxCount: 10 },
    { name: "tax_image", maxCount: 10 },
    { name: "certificate_image", maxCount: 10 },
    { name: 'supplier_image', maxCount: 1 },
    { name: 'license_image', maxCount: 10 },
    { name: 'tax_image', maxCount: 10},
    { name: 'certificate_image', maxCount: 10 },
    { name: 'medical_practitioner_image', maxCount: 10 },
    { name: "new_buyer_image", maxCount: 1 },
    { name: "new_license_image", maxCount: 10 },
    { name: "new_tax_image", maxCount: 10 },
    { name: "new_certificate_image", maxCount: 10 },
    { name: 'new_supplier_image', maxCount: 1 },
    { name: 'new_license_image', maxCount: 10 },
    { name: 'new_tax_image', maxCount: 10},
    { name: 'new_certificate_image', maxCount: 10 },
    { name: 'new_medical_practitioner_image', maxCount: 10 },
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return sendErrorResponse(res, 500, "File upload error", err);
    }
    next();
  });
};
 
router.post(`/register`, checkAuthorization, cpUpload, registerUser);

router.post(`/login`, loginUser);

router.post(`/verify-email`, verifyEmailAndResendOTP);
router.post(`/resend-otp`, verifyEmailAndResendOTP);

router.post(`/verify-otp`, verifyOTP);

router.post(`/reset-password`, resetPassword);

router.post(`/update-password/:id`, updatePassword);

router.post(`/edit-profile/:id`, checkAuthorization, validateUserInput, handleValidationErrors, updateProfileAndSendEditRequest);

router.put(`/:id`, checkAuthorization, cpUpload, validateUserInput, handleValidationErrors, updateProfileAndSendEditRequest);

router.post(`/:id`, getLoggedinUserProfileDetails);

module.exports = router;
