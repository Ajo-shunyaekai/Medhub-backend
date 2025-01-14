const express = require('express');
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const Controller = require("../controller/Buyer");
const { handleResponse } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const { imageUpload } = require("../utils/imageUpload");
const {
  checkAuthorization,
  checkCommonUserAuthentication,
} = require("../middleware/Authorization");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedinUserProfileDetails,
} = require(`../controller/authController`);
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const { access_token, user_type } = req.headers;
    const { user_type } = req.body;


    console.log('user_type', user_type)

    // if (!user_type) {
    //   return res.status(400).send({  
    //     code: 400,
    //     message: "Need User Type",
    //   });
    // }

    let uploadPath =
      user_type == "Buyer"
        ? "./uploads/buyer/buyer_images"
        : user_type == "Supplier" && "./uploads/supplier/supplierImage_files";
    if (file.fieldname === "tax_image") {
      uploadPath =
        user_type == "Buyer"
          ? "./uploads/buyer/tax_images"
          : user_type == "Supplier" && "./uploads/supplier/tax_image";
    } else if (file.fieldname === "license_image") {
      uploadPath =
        user_type == "Buyer"
          ? "./uploads/buyer/license_images"
          : user_type == "Supplier" && "./uploads/supplier/license_image";
    } else if (file.fieldname === "certificate_image") {
      uploadPath =
        user_type == "Buyer"
          ? "./uploads/buyer/certificate_images"
          : user_type == "Supplier" && "./uploads/supplier/certificate_image";
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
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
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      res.status(500).json({ error: "File upload error" });
      return;
    }
    // console.log("After Multer", req); // Log after Multer processes the request
    next();
  });
};
 
router.post(`/register`, checkAuthorization, cpUpload, registerUser);
router.post(`/login`, loginUser);

router.post(`/:id`, getLoggedinUserProfileDetails);

module.exports = router;

// router.get(`/:id`, getLoggedinUserProfileDetails);
 
// module.exports = router;

