require("dotenv").config();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
const { sendErrorResponse } = require("../../utils/commonResonse");
const { uploadMultipleFiles } = require("../../helper/aws-s3");

const getUploadPath = (req, file) => {
  let usertype;
  if (req?.body?.usertype) {
    req?.body?.usertype?.toLowerCase() === "supplier"
      ? (usertype = "Supplier")
      : (usertype = "Buyer");
  } else if (req?.params?.userType) {
    req?.params?.userType?.toLowerCase() === "supplier"
      ? (usertype = "Supplier")
      : (usertype = "Buyer");
  }

  let uploadPath =
    usertype === "Buyer"
      ? "./uploads/buyer/buyer_images"
      : usertype === "Supplier" && "./uploads/supplier/supplierImage_files";

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
    file.fieldname === "product_catalogue" ||
    file.fieldname === "product_catalogueNew"
  ) {
    uploadPath =
      usertype === "Buyer"
        ? "./uploads/buyer/product_catalogues"
        : usertype === "Supplier" && "./uploads/supplier/product_catalogue";
  }
  return uploadPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadPath(req, file);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = mime.extension(file.mimetype) || "bin";
    const newFileName = `${file.fieldname?.replaceAll(
      "New",
      ""
    )}-${file.originalname
      ?.replaceAll(" ", "")
      ?.replaceAll("." + ext, "")}-${Date.now()}.${ext}`;

    if (!req.uploadedFiles) {
      req.uploadedFiles = [];
    }
    req.uploadedFiles.push(newFileName);

    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage });

const authUpload = (req, res, next) => {
  upload.fields([
    { name: "buyer_image", maxCount: 1 },
    { name: "license_image", maxCount: 4 },
    { name: "tax_image", maxCount: 4 },
    { name: "certificate_image", maxCount: 4 },
    { name: "product_catalogue", maxCount: 4 },
    { name: "supplier_image", maxCount: 1 },
    { name: "medical_practitioner_image", maxCount: 4 },
    { name: "buyer_imageNew", maxCount: 1 },
    { name: "license_imageNew", maxCount: 4 },
    { name: "tax_imageNew", maxCount: 4 },
    { name: "certificate_imageNew", maxCount: 4 },
    { name: "product_catalogueNew", maxCount: 4 },
    { name: "supplier_imageNew", maxCount: 1 },
    { name: "medical_practitioner_imageNew", maxCount: 4 },
  ])(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return sendErrorResponse(res, 500, "File upload error", err);
    }

    let uploadedFiles = {};

    const getUploadedFilesPath = async () => {
      uploadedFiles["buyer_image"] = await uploadMultipleFiles(
        // req?.files?.["buyer_image"] || []
        (req?.files?.["buyer_image"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["supplier_image"] = await uploadMultipleFiles(
        // req?.files?.["supplier_image"] || []
        (req?.files?.["supplier_image"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["license_image"] = await uploadMultipleFiles(
        // req?.files?.["license_image"] || []
        (req?.files?.["license_image"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["certificate_image"] = await uploadMultipleFiles(
        // req?.files?.["certificate_image"] || []
        (req?.files?.["certificate_image"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["product_catalogue"] = await uploadMultipleFiles(
        // req?.files?.["product_catalogue"] || []
        (req?.files?.["product_catalogue"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["medical_certificate"] = await uploadMultipleFiles(
        // req?.files?.["medical_practitioner_image"] || []
        (req?.files?.["medical_practitioner_image"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["buyer_imageNew"] = await uploadMultipleFiles(
        // req?.files?.["buyer_imageNew"] || []
        (req?.files?.["buyer_imageNew"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["supplier_imageNew"] = await uploadMultipleFiles(
        // req?.files?.["supplier_imageNew"] || []
        (req?.files?.["supplier_imageNew"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["license_imageNew"] = await uploadMultipleFiles(
        // req?.files?.["license_imageNew"] || []
        (req?.files?.["license_imageNew"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["certificate_imageNew"] = await uploadMultipleFiles(
        // req?.files?.["certificate_imageNew"] || []
        (req?.files?.["certificate_imageNew"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["product_catalogueNew"] = await uploadMultipleFiles(
        // req?.files?.["product_catalogueNew"] || []
        (req?.files?.["product_catalogueNew"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );
      uploadedFiles["medical_certificateNew"] = await uploadMultipleFiles(
        // req?.files?.["medical_practitioner_imageNew"] || []
        (req?.files?.["medical_practitioner_imageNew"] || [])?.map((file) => ({
          ...file,
          path: file.path,
          filename: file.filename,
          contentType: file.mimetype,
        }))
      );

      // Function to remove the files from the local file system
      const removeLocalFiles = (files) => {
        files.forEach((file) => {
          const uploadPath = getUploadPath(req, file);

          // Resolve the absolute file path
          const filePath = path.resolve(uploadPath, file.filename);

          // Check if the file exists before trying to delete it
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(
                  `\n\n\n\nFailed to delete file ${filePath}:`,
                  err
                );
              } else {
              }
            });
          } else {
            console.error(`File not found: ${filePath}`);
          }
        });
      };

      // Remove uploaded files from local storage
      removeLocalFiles([
        ...(req?.files?.["buyer_image"] || []),
        ...(req?.files?.["supplier_image"] || []),
        ...(req?.files?.["license_image"] || []),
        ...(req?.files?.["certificate_image"] || []),
        ...(req?.files?.["product_catalogue"] || []),
        ...(req?.files?.["medical_practitioner_image"] || []),
        ...(req?.files?.["buyer_imageNew"] || []),
        ...(req?.files?.["supplier_imageNew"] || []),
        ...(req?.files?.["license_imageNew"] || []),
        ...(req?.files?.["certificate_imageNew"] || []),
        ...(req?.files?.["product_catalogueNew"] || []),
        ...(req?.files?.["medical_practitioner_imageNew"] || []),
      ]);

      req.uploadedFiles = uploadedFiles;
      next();
    };

    // Call the function to handle the uploaded files
    await getUploadedFilesPath();
  });
};

module.exports = { authUpload };
