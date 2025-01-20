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
  addProfileEditRequest,
  verifyEmailAndResendOTP
} = require(`../controller/authController`);
const { sendErrorResponse } = require('../utils/commonResonse');
 
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // const { access_token, user_type } = req.headers;
//     const { user_type } = req.body;


//     console.log('user_type', user_type)

//     // if (!user_type) {
//     //   return res.status(400).send({  
//     //     code: 400,
//     //     message: "Need User Type",
//     //   });
//     // }

//     let uploadPath =
//       user_type == "Buyer"
//         ? "./uploads/buyer/buyer_images"
//         : user_type == "Supplier" && "./uploads/supplier/supplierImage_files";
//     if (file.fieldname === "tax_image") {
//       uploadPath =
//         user_type == "Buyer"
//           ? "./uploads/buyer/tax_images"
//           : user_type == "Supplier" && "./uploads/supplier/tax_image";
//     } else if (file.fieldname === "license_image") {
//       uploadPath =
//         user_type == "Buyer"
//           ? "./uploads/buyer/license_images"
//           : user_type == "Supplier" && "./uploads/supplier/license_image";
//     } else if (file.fieldname === "certificate_image") {
//       uploadPath =
//         user_type == "Buyer"
//           ? "./uploads/buyer/certificate_images"
//           : user_type == "Supplier" && "./uploads/supplier/certificate_image";
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
//   },
// });


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { user_type } = req.body;

    // Define the default upload path based on user type and fieldname
    let uploadPath =
      user_type === "Buyer"
        ? "./uploads/buyer/buyer_images"
        : user_type === "Supplier" && "./uploads/supplier/supplierImage_files";

    // Adjust upload path based on the specific file type
    if (file.fieldname === "tax_image" || file.fieldname === "new_tax_image") {
      uploadPath =
        user_type === "Buyer"
          ? "./uploads/buyer/tax_images"
          : user_type === "Supplier" && "./uploads/supplier/tax_image";
    } else if (file.fieldname === "license_image" || file.fieldname === "new_license_image") {
      uploadPath =
        user_type === "Buyer"
          ? "./uploads/buyer/license_images"
          : user_type === "Supplier" && "./uploads/supplier/license_image";
    } else if (file.fieldname === "certificate_image" || file.fieldname === "new_certificate_image") {
      uploadPath =
        user_type === "Buyer"
          ? "./uploads/buyer/certificate_images"
          : user_type === "Supplier" && "./uploads/supplier/certificate_image";
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
  // console.log("Before Multer", req); // Log before Multer processes the request
  upload.fields([
    { name: "buyer_image", maxCount: 1 },
    { name: "license_image", maxCount: 10 },
    { name: "tax_image", maxCount: 10 },
    { name: "certificate_image", maxCount: 10 },
    { name: 'supplier_image', maxCount: 1 },
    { name: 'license_image', maxCount: 10 },
    { name: 'tax_image', maxCount: 10},
    { name: 'certificate_image', maxCount: 10 },
    { name: "new_buyer_image", maxCount: 1 },
    { name: "new_license_image", maxCount: 10 },
    { name: "new_tax_image", maxCount: 10 },
    { name: "new_certificate_image", maxCount: 10 },
    { name: 'new_supplier_image', maxCount: 1 },
    { name: 'new_license_image', maxCount: 10 },
    { name: 'new_tax_image', maxCount: 10},
    { name: 'new_certificate_image', maxCount: 10 },
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return sendErrorResponse(res, 500, "File upload error", err);
      res.status(500).json({ error: "File upload error" });
      return;
    }
    // console.log("After Multer", req); // Log after Multer processes the request
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
router.post(`/request-profile-edit/:id`, checkAuthorization, cpUpload, addProfileEditRequest);

router.post(`/:id`, getLoggedinUserProfileDetails);

module.exports = router;

// router.get(`/:id`, getLoggedinUserProfileDetails);
 
// module.exports = router;

