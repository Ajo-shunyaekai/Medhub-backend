const multer = require("multer");
const mime = require("mime-types"); // Import mime-types to resolve file extensions
const { sendErrorResponse } = require("../../utils/commonResonse");
const logErrorToFile = require("../../logs/errorLogs");
const { uploadMultipleFiles } = require("../../helper/aws-s3");
const path = require("path");
const fs = require("fs");

// Define allowed file types for specific fields
const allowedFileTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Custom file filter to validate file types for specific fields
const fileFilter = (req, file, cb) => {
  const { fieldname } = file;

  // Validate allowed file formats for specific fields
  const validFields = [
    "complianceFile",
    "guidelinesFile",
    "safetyDatasheet",
    "healthHazardRating",
    "environmentalImpact",
  ];

  if (validFields.includes(fieldname)) {
    if (!allowedFileTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Invalid file format. Allowed formats: PDF, JPG, PNG, DOC, DOCX"
        ),
        false
      );
    }
  }

  // If file is valid or not in the restricted fields, accept it
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "./uploads/products";
    cb(null, uploadPath); // Ensure the callback is called to continue the upload process
  },
  filename: (req, file, cb) => {
    const ext = mime.extension(file.mimetype) || "bin"; // Default to 'bin' for unknown MIME types
    cb(
      null,
      `${file.fieldname?.replaceAll("New", "")}-${file.originalname
        ?.replaceAll(" ", "")
        ?.replaceAll("." + ext, "")}-${Date.now()}.${ext}`
    ); // Use a timestamp for unique filenames
  },
});
const storageEdit = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "./uploads/products";
    cb(null, uploadPath); // Ensure the callback is called to continue the upload process
  },
  filename: (req, file, cb) => {
    const ext = mime.extension(file.mimetype) || "bin"; // Default to 'bin' for unknown MIME types
    cb(
      null,
      `${file.fieldname?.replaceAll("New", "")}-${file.originalname
        ?.replaceAll(" ", "")
        ?.replaceAll("." + ext, "")}-${Date.now()}.${ext}`
    ); // Use a timestamp for unique filenames
  },
});

const upload = multer({ storage: storage, fileFilter: fileFilter });
const uploadEdit = multer({ storage: storageEdit, fileFilter: fileFilter });

const addProductUpload = (req, res, next) => {
  upload.fields([
    { name: "image", maxCount: 4 },
    { name: "complianceFile", maxCount: 4 },
    { name: "guidelinesFile", maxCount: 4 },
    { name: "safetyDatasheet", maxCount: 4 },
    { name: "healthHazardRating", maxCount: 4 },
    { name: "environmentalImpact", maxCount: 4 },
    { name: "specificationFile", maxCount: 4 },
    { name: "performanceTestingReportFile", maxCount: 4 },
    { name: "dermatologistTestedFile", maxCount: 4 },
    { name: "pediatricianRecommendedFile", maxCount: 4 },
    { name: "healthClaimsFile", maxCount: 4 },
    { name: "interoperabilityFile", maxCount: 4 },
    { name: "purchaseInvoiceFile", maxCount: 4 },
  ])(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err); // Log the error to console for debugging
      logErrorToFile(err, req); // Log the error to a file for persistence
      if (err.message.includes("Invalid file format")) {
        return sendErrorResponse(res, 400, err.message, err); // Respond with 400 for invalid file format
      }
      return sendErrorResponse(res, 500, "File upload error", err); // Send a general error response for other cases
    }

    let uploadedFiles = {};

    const getUploadedFilesPath = async () => {
      if (req?.files?.["image"]) {
        uploadedFiles["image"] = await uploadMultipleFiles(
          req?.files?.["image"] || []
        );
      }
      if (req?.files?.["complianceFile"]) {
        uploadedFiles["complianceFile"] = await uploadMultipleFiles(
          req?.files?.["complianceFile"] || []
        );
      }
      if (req?.files?.["guidelinesFile"]) {
        uploadedFiles["guidelinesFile"] = await uploadMultipleFiles(
          req?.files?.["guidelinesFile"] || []
        );
      }
      if (req?.files?.["safetyDatasheet"]) {
        uploadedFiles["safetyDatasheet"] = await uploadMultipleFiles(
          req?.files?.["safetyDatasheet"] || []
        );
      }
      if (req?.files?.["healthHazardRating"]) {
        uploadedFiles["healthHazardRating"] = await uploadMultipleFiles(
          req?.files?.["healthHazardRating"] || []
        );
      }
      if (req?.files?.["environmentalImpact"]) {
        uploadedFiles["environmentalImpact"] = await uploadMultipleFiles(
          req?.files?.["environmentalImpact"] || []
        );
      }
      if (req?.files?.["specificationFile"]) {
        uploadedFiles["specificationFile"] = await uploadMultipleFiles(
          req?.files?.["specificationFile"] || []
        );
      }
      if (req?.files?.["performanceTestingReportFile"]) {
        uploadedFiles["performanceTestingReportFile"] =
          await uploadMultipleFiles(
            req?.files?.["performanceTestingReportFile"] || []
          );
      }
      if (req?.files?.["dermatologistTestedFile"]) {
        uploadedFiles["dermatologistTestedFile"] = await uploadMultipleFiles(
          req?.files?.["dermatologistTestedFile"] || []
        );
      }
      if (req?.files?.["pediatricianRecommendedFile"]) {
        uploadedFiles["pediatricianRecommendedFile"] =
          await uploadMultipleFiles(
            req?.files?.["pediatricianRecommendedFile"] || []
          );
      }
      if (req?.files?.["healthClaimsFile"]) {
        uploadedFiles["healthClaimsFile"] = await uploadMultipleFiles(
          req?.files?.["healthClaimsFile"] || []
        );
      }
      if (req?.files?.["interoperabilityFile"]) {
        uploadedFiles["interoperabilityFile"] = await uploadMultipleFiles(
          req?.files?.["interoperabilityFile"] || []
        );
      }
      if (req?.files?.["purchaseInvoiceFile"]) {
        uploadedFiles["purchaseInvoiceFile"] = await uploadMultipleFiles(
          req?.files?.["purchaseInvoiceFile"] || []
        );
      }

      // Function to remove the files from the local file system
      const removeLocalFiles = (files) => {
        files.forEach((file) => {
          // Resolve the absolute file path
          // const filePath = path.resolve(uploadPath, file.filename);
          const filePath = path.resolve(file?.destination, file.filename);

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
        ...(req?.files?.["image"] || []),
        ...(req?.files?.["complianceFile"] || []),
        ...(req?.files?.["guidelinesFile"] || []),
        ...(req?.files?.["safetyDatasheet"] || []),
        ...(req?.files?.["healthHazardRating"] || []),
        ...(req?.files?.["environmentalImpact"] || []),
        ...(req?.files?.["specificationFile"] || []),
        ...(req?.files?.["performanceTestingReportFile"] || []),
        ...(req?.files?.["dermatologistTestedFile"] || []),
        ...(req?.files?.["pediatricianRecommendedFile"] || []),
        ...(req?.files?.["healthClaimsFile"] || []),
        ...(req?.files?.["interoperabilityFile"] || []),
        ...(req?.files?.["purchaseInvoiceFile"] || []),
      ]);

      req.uploadedFiles = uploadedFiles;
      next();
    };

    // Call the function to handle the uploaded files
    await getUploadedFilesPath();
  });
};

const addProductUpload3 = (req, res, next) => {
  upload.fields([
    { name: "imageFront", maxCount: 1 },
    { name: "imageBack", maxCount: 1 },
    { name: "imageSide", maxCount: 1 },
    { name: "imageClosure", maxCount: 1 },
    { name: "guidelinesFile", maxCount: 4 },
    { name: "complianceFile", maxCount: 4 },
    { name: "categoryDetailsFile", maxCount: 4 },
    { name: "catalogue", maxCount: 1 },
    { name: "specificationSheet", maxCount: 1 },
    { name: "purchaseInvoiceFile", maxCount: 4 },
  ])(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err); // Log the error to console for debugging
      logErrorToFile(err, req); // Log the error to a file for persistence
      if (err.message.includes("Invalid file format")) {
        return sendErrorResponse(res, 400, err.message, err); // Respond with 400 for invalid file format
      }
      return sendErrorResponse(res, 500, "File upload error", err); // Send a general error response for other cases
    }

    let uploadedFiles = {};

    const getUploadedFilesPath = async () => {
      if (req?.files?.["imageFront"]) {
        uploadedFiles["imageFront"] = await uploadMultipleFiles(
          req?.files?.["imageFront"] || []
        );
      }
      if (req?.files?.["imageBack"]) {
        uploadedFiles["imageBack"] = await uploadMultipleFiles(
          req?.files?.["imageBack"] || []
        );
      }
      if (req?.files?.["imageSide"]) {
        uploadedFiles["imageSide"] = await uploadMultipleFiles(
          req?.files?.["imageSide"] || []
        );
      }
      if (req?.files?.["imageClosure"]) {
        uploadedFiles["imageClosure"] = await uploadMultipleFiles(
          req?.files?.["imageClosure"] || []
        );
      }
      if (req?.files?.["guidelinesFile"]) {
        uploadedFiles["guidelinesFile"] = await uploadMultipleFiles(
          req?.files?.["guidelinesFile"] || []
        );
      }
      if (req?.files?.["complianceFile"]) {
        uploadedFiles["complianceFile"] = await uploadMultipleFiles(
          req?.files?.["complianceFile"] || []
        );
      }
      if (req?.files?.["categoryDetailsFile"]) {
        uploadedFiles["categoryDetailsFile"] = await uploadMultipleFiles(
          req?.files?.["categoryDetailsFile"] || []
        );
      }
      if (req?.files?.["catalogue"]) {
        uploadedFiles["catalogue"] = await uploadMultipleFiles(
          req?.files?.["catalogue"] || []
        );
      }
      if (req?.files?.["specificationSheet"]) {
        uploadedFiles["specificationSheet"] = await uploadMultipleFiles(
          req?.files?.["specificationSheet"] || []
        );
      }
      if (req?.files?.["purchaseInvoiceFile"]) {
        uploadedFiles["purchaseInvoiceFile"] = await uploadMultipleFiles(
          req?.files?.["purchaseInvoiceFile"] || []
        );
      }

      // Function to remove the files from the local file system
      const removeLocalFiles = (files) => {
        files.forEach((file) => {
          // Resolve the absolute file path
          // const filePath = path.resolve(uploadPath, file.filename);
          const filePath = path.resolve(file?.destination, file.filename);

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
        ...(req?.files?.["imageFront"] || []),
        ...(req?.files?.["imageBack"] || []),
        ...(req?.files?.["imageSide"] || []),
        ...(req?.files?.["imageClosure"] || []),
        ...(req?.files?.["guidelinesFile"] || []),
        ...(req?.files?.["complianceFile"] || []),
        ...(req?.files?.["categoryDetailsFile"] || []),
        ...(req?.files?.["catalogue"] || []),
        ...(req?.files?.["specificationSheet"] || []),
        ...(req?.files?.["purchaseInvoiceFile"] || []),
      ]);

      req.uploadedFiles = uploadedFiles;
      next();
    };

    // Call the function to handle the uploaded files
    await getUploadedFilesPath();
  });
};

const editProductUpload = (req, res, next) => {
  const getMaxCount = (field) => {
    // Calculate the max count based on the files already uploaded for the field
    const fieldFiles = req?.body?.[field] || []; // Safely handle undefined fields
    return 4 - (Array.isArray(fieldFiles) ? fieldFiles.length : 0); // Ensure length works even for single file objects
  };

  uploadEdit.fields([
    { name: "imageNew", maxCount: getMaxCount("image") },
    { name: "complianceFileNew", maxCount: getMaxCount("complianceFile") },
    { name: "guidelinesFileNew", maxCount: getMaxCount("guidelinesFile") },
    { name: "safetyDatasheetNew", maxCount: getMaxCount("safetyDatasheet") },
    {
      name: "healthHazardRatingNew",
      maxCount: getMaxCount("healthHazardRating"),
    },
    {
      name: "environmentalImpactNew",
      maxCount: getMaxCount("environmentalImpact"),
    },
    {
      name: "specificationFileNew",
      maxCount: getMaxCount("specificationFile"),
    },
    {
      name: "performanceTestingReportFileNew",
      maxCount: getMaxCount("performanceTestingReportFile"),
    },
    {
      name: "dermatologistTestedFileNew",
      maxCount: getMaxCount("dermatologistTestedFile"),
    },
    {
      name: "pediatricianRecommendedFileNew",
      maxCount: getMaxCount("pediatricianRecommendedFile"),
    },
    { name: "healthClaimsFileNew", maxCount: getMaxCount("healthClaimsFile") },
    {
      name: "interoperabilityFileNew",
      maxCount: getMaxCount("interoperabilityFile"),
    },
    {
      name: "purchaseInvoiceFileNew",
      maxCount: getMaxCount("purchaseInvoiceFile"),
    },
  ])(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err); // Log the error to console for debugging
      logErrorToFile(err, req); // Log the error to a file for persistence
      return sendErrorResponse(res, 500, "File upload error", err); // Send an error response back
    }

    let uploadedFiles = {};

    const getUploadedFilesPath = async () => {
      if (req?.files?.["imageNew"]) {
        uploadedFiles["imageNew"] = await uploadMultipleFiles(
          req?.files?.["imageNew"] || []
        );
      }
      if (req?.files?.["complianceFileNew"]) {
        uploadedFiles["complianceFileNew"] = await uploadMultipleFiles(
          req?.files?.["complianceFileNew"] || []
        );
      }
      if (req?.files?.["guidelinesFileNew"]) {
        uploadedFiles["guidelinesFileNew"] = await uploadMultipleFiles(
          req?.files?.["guidelinesFileNew"] || []
        );
      }
      if (req?.files?.["safetyDatasheetNew"]) {
        uploadedFiles["safetyDatasheetNew"] = await uploadMultipleFiles(
          req?.files?.["safetyDatasheetNew"] || []
        );
      }
      if (req?.files?.["healthHazardRatingNew"]) {
        uploadedFiles["healthHazardRatingNew"] = await uploadMultipleFiles(
          req?.files?.["healthHazardRatingNew"] || []
        );
      }
      if (req?.files?.["environmentalImpactNew"]) {
        uploadedFiles["environmentalImpactNew"] = await uploadMultipleFiles(
          req?.files?.["environmentalImpactNew"] || []
        );
      }
      if (req?.files?.["specificationFileNew"]) {
        uploadedFiles["specificationFileNew"] = await uploadMultipleFiles(
          req?.files?.["specificationFileNew"] || []
        );
      }
      if (req?.files?.["performanceTestingReportFileNew"]) {
        uploadedFiles["performanceTestingReportFileNew"] =
          await uploadMultipleFiles(
            req?.files?.["performanceTestingReportFileNew"] || []
          );
      }
      if (req?.files?.["dermatologistTestedFileNew"]) {
        uploadedFiles["dermatologistTestedFileNew"] = await uploadMultipleFiles(
          req?.files?.["dermatologistTestedFileNew"] || []
        );
      }
      if (req?.files?.["pediatricianRecommendedFileNew"]) {
        uploadedFiles["pediatricianRecommendedFileNew"] =
          await uploadMultipleFiles(
            req?.files?.["pediatricianRecommendedFileNew"] || []
          );
      }
      if (req?.files?.["healthClaimsFileNew"]) {
        uploadedFiles["healthClaimsFileNew"] = await uploadMultipleFiles(
          req?.files?.["healthClaimsFileNew"] || []
        );
      }
      if (req?.files?.["interoperabilityFileNew"]) {
        uploadedFiles["interoperabilityFileNew"] = await uploadMultipleFiles(
          req?.files?.["interoperabilityFileNew"] || []
        );
      }
      if (req?.files?.["purchaseInvoiceFileNew"]) {
        uploadedFiles["purchaseInvoiceFileNew"] = await uploadMultipleFiles(
          req?.files?.["purchaseInvoiceFileNew"] || []
        );
      }

      // Function to remove the files from the local file system
      const removeLocalFiles = (files) => {
        files.forEach((file) => {
          // Resolve the absolute file path
          // const filePath = path.resolve(uploadPath, file.filename);
          const filePath = path.resolve(file?.destination, file.filename);

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
        ...(req?.files?.["imageNew"] || []),
        ...(req?.files?.["complianceFileNew"] || []),
        ...(req?.files?.["guidelinesFileNew"] || []),
        ...(req?.files?.["safetyDatasheetNew"] || []),
        ...(req?.files?.["healthHazardRatingNew"] || []),
        ...(req?.files?.["environmentalImpactNew"] || []),
        ...(req?.files?.["specificationFileNew"] || []),
        ...(req?.files?.["performanceTestingReportFileNew"] || []),
        ...(req?.files?.["dermatologistTestedFileNew"] || []),
        ...(req?.files?.["pediatricianRecommendedFileNew"] || []),
        ...(req?.files?.["healthClaimsFileNew"] || []),
        ...(req?.files?.["interoperabilityFileNew"] || []),
        ...(req?.files?.["purchaseInvoiceFileNew"] || []),
      ]);

      req.uploadedFiles = uploadedFiles;
      next();
    };

    // Call the function to handle the uploaded files
    await getUploadedFilesPath();
  });
};

const editProductUpload3 = (req, res, next) => {
  const getMaxCount = (field) => {
    // Calculate the max count based on the files already uploaded for the field
    const fieldFiles = req?.body?.[field] || []; // Safely handle undefined fields
    return 4 - (Array.isArray(fieldFiles) ? fieldFiles.length : 0); // Ensure length works even for single file objects
  };

  uploadEdit.fields([
    { name: "imageFrontNew", maxCount: 1 },
    { name: "imageBackNew", maxCount: 1 },
    { name: "imageSideNew", maxCount: 1 },
    { name: "imageClosureNew", maxCount: 1 },
    { name: "guidelinesFileNew", maxCount: getMaxCount("guidelinesFile") },
    { name: "complianceFileNew", maxCount: getMaxCount("complianceFile") },
    { name: "categoryDetailsFileNew", maxCount: 8 },
    { name: "catalogueNew", maxCount: getMaxCount("catalogue") },
    { name: "purchaseInvoiceFileNew", maxCount: getMaxCount("purchaseInvoiceFile") },
    {
      name: "specificationSheetNew",
      maxCount: getMaxCount("specificationSheet"),
    },
  ])(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err); // Log the error to console for debugging
      logErrorToFile(err, req); // Log the error to a file for persistence
      return sendErrorResponse(res, 500, "File upload error", err); // Send an error response back
    }

    let uploadedFiles = {};

    const getUploadedFilesPath = async () => {
      if (req?.files?.["imageFrontNew"]) {
        uploadedFiles["imageFrontNew"] = await uploadMultipleFiles(
          req?.files?.["imageFrontNew"] || []
        );
      }
      if (req?.files?.["imageBackNew"]) {
        uploadedFiles["imageBackNew"] = await uploadMultipleFiles(
          req?.files?.["imageBackNew"] || []
        );
      }
      if (req?.files?.["imageSideNew"]) {
        uploadedFiles["imageSideNew"] = await uploadMultipleFiles(
          req?.files?.["imageSideNew"] || []
        );
      }
      if (req?.files?.["imageClosureNew"]) {
        uploadedFiles["imageClosureNew"] = await uploadMultipleFiles(
          req?.files?.["imageClosureNew"] || []
        );
      }
      if (req?.files?.["guidelinesFileNew"]) {
        uploadedFiles["guidelinesFileNew"] = await uploadMultipleFiles(
          req?.files?.["guidelinesFileNew"] || []
        );
      }
      if (req?.files?.["complianceFileNew"]) {
        uploadedFiles["complianceFileNew"] = await uploadMultipleFiles(
          req?.files?.["complianceFileNew"] || []
        );
      }
      if (req?.files?.["categoryDetailsFileNew"]) {
        uploadedFiles["categoryDetailsFileNew"] = await uploadMultipleFiles(
          req?.files?.["categoryDetailsFileNew"] || []
        );
      }
      if (req?.files?.["catalogueNew"]) {
        uploadedFiles["catalogueNew"] = await uploadMultipleFiles(
          req?.files?.["catalogueNew"] || []
        );
      }
      if (req?.files?.["specificationSheetNew"]) {
        uploadedFiles["specificationSheetNew"] = await uploadMultipleFiles(
          req?.files?.["specificationSheetNew"] || []
        );
      }
      if (req?.files?.["purchaseInvoiceFileNew"]) {
        uploadedFiles["purchaseInvoiceFileNew"] = await uploadMultipleFiles(
          req?.files?.["purchaseInvoiceFileNew"] || []
        );
      }

      // Function to remove the files from the local file system
      const removeLocalFiles = (files) => {
        files.forEach((file) => {
          // Resolve the absolute file path
          // const filePath = path.resolve(uploadPath, file.filename);
          const filePath = path.resolve(file?.destination, file.filename);

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
        ...(req?.files?.["imageFrontNew"] || []),
        ...(req?.files?.["imageBackNew"] || []),
        ...(req?.files?.["imageSideNew"] || []),
        ...(req?.files?.["imageClosureNew"] || []),
        ...(req?.files?.["complianceFileNew"] || []),
        ...(req?.files?.["categoryDetailsFileNew"] || []),
        ...(req?.files?.["guidelinesFileNew"] || []),
        ...(req?.files?.["catalogueNew"] || []),
        ...(req?.files?.["specificationSheetNew"] || []),
        ...(req?.files?.["purchaseInvoiceFileNew"] || []),
      ]);

      req.uploadedFiles = uploadedFiles;
      next();
    };

    // Call the function to handle the uploaded files
    await getUploadedFilesPath();
  });
};

// Multer setup to handle CSV file uploads
const CSVupload = multer({ dest: "uploads/products" });

module.exports = {
  addProductUpload,
  editProductUpload,
  addProductUpload3,
  editProductUpload3,
  CSVupload,
};
