require("dotenv").config();
const multer = require("multer");
const mime = require("mime-types"); // Import mime-types to resolve file extensions
const { sendErrorResponse } = require("../../utils/commonResonse");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const { usertype } = req.body;

    let usertype;
    if (req?.body?.usertype) {
      req?.body?.usertype?.toLowerCase() == "supplier"
        ? (usertype = "Supplier")
        : (usertype = "Buyer");
    } else if (req?.params?.userType) {
      req?.params?.userType?.toLowerCase() == "supplier"
        ? (usertype = "Supplier")
        : (usertype = "Buyer");
    }
    // Define the default upload path based on user type and fieldname
    let uploadPath =
      usertype === "Buyer"
        ? "./uploads/buyer/buyer_images"
        : usertype === "Supplier" && "./uploads/supplier/supplierImage_files";

    // Adjust upload path based on the specific file type
    if (file.fieldname === "tax_image" || file.fieldname === "tax_imageNew") {
      uploadPath =
        usertype === "Buyer"
          ? "./uploads/buyer/tax_images"
          : usertype === "Supplier" && "./uploads/supplier/tax_image";
    } else if (
      file.fieldname === "license_image" ||
      file.fieldname === "license_imageNew"
    ) {
      uploadPath =
        usertype === "Buyer"
          ? "./uploads/buyer/license_images"
          : usertype === "Supplier" && "./uploads/supplier/license_image";
    } else if (
      file.fieldname === "certificate_image" ||
      file.fieldname === "certificate_imageNew"
    ) {
      uploadPath =
        usertype === "Buyer"
          ? "./uploads/buyer/certificate_images"
          : usertype === "Supplier" && "./uploads/supplier/certificate_image";
    } else if (
      file.fieldname === "medical_practitioner_image" ||
      file.fieldname === "medical_practitioner_imageNew"
    ) {
      uploadPath =
        usertype === "Buyer"
          ? "./uploads/buyer/medical_practitioner_images"
          : usertype === "Supplier" &&
            "./uploads/supplier/medical_practitioner_image";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Resolve the file extension using mime-types
    const ext = mime.extension(file.mimetype) || "bin"; // Default to 'bin' for unknown MIME types
    cb(
      null,
      `${file.fieldname?.replaceAll("New", "")}-${file.originalname
        ?.replaceAll(" ", "")
        ?.replaceAll("." + ext, "")}-${Date.now()}.${ext}`
    ); // Use a timestamp for unique filenames
  },
});

const upload = multer({ storage: storage });

const authUpload = (req, res, next) => {
  upload.fields([
    { name: "buyer_image", maxCount: 1 },
    { name: "license_image", maxCount: 4 },
    { name: "tax_image", maxCount: 4 },
    { name: "certificate_image", maxCount: 4 },
    { name: "supplier_image", maxCount: 1 },
    { name: "license_image", maxCount: 4 },
    { name: "tax_image", maxCount: 4 },
    { name: "certificate_image", maxCount: 4 },
    { name: "medical_practitioner_image", maxCount: 4 },
    { name: "buyer_imageNew", maxCount: 1 },
    { name: "license_imageNew", maxCount: 4 },
    { name: "tax_imageNew", maxCount: 4 },
    { name: "certificate_imageNew", maxCount: 4 },
    { name: "supplier_imageNew", maxCount: 1 },
    { name: "license_imageNew", maxCount: 4 },
    { name: "tax_imageNew", maxCount: 4 },
    { name: "certificate_imageNew", maxCount: 4 },
    { name: "medical_practitioner_imageNew", maxCount: 4 },
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return sendErrorResponse(res, 500, "File upload error", err);
    }
    next();
  });
};

module.exports = { authUpload };
