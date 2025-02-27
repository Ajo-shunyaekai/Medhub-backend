// const multer = require("multer");
// const mime = require("mime-types"); // Import mime-types to resolve file extensions
// const { sendErrorResponse } = require("../../utils/commonResonse");
// const logErrorToFile = require("../../logs/errorLogs");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Define the default upload path based on user type and fieldname
//     let uploadPath = "./uploads/products";
//     cb(null, uploadPath); // Ensure the callback is called to continue the upload process
//   },
//   filename: (req, file, cb) => {
//     // Resolve the file extension using mime-types
//     const ext = mime.extension(file.mimetype) || "bin"; // Default to 'bin' for unknown MIME types
//     cb(null, `${file.fieldname}-${Date.now()}.${ext}`); // Use a timestamp for unique filenames
//   },
// });

// const upload = multer({ storage: storage });

// const addProductUpload = (req, res, next) => {
//   upload.fields([
//     // General Information form section files
//     { name: "image", maxCount: 4 },
//     // Compliance & Certification form section files
//     { name: "complianceFile", maxCount: 4 },
//     // Additional Information form section files
//     { name: "guidelinesFile", maxCount: 4 },
//     // Health & Safety form section files
//     { name: "safetyDatasheet", maxCount: 4 },
//     { name: "healthHazardRating", maxCount: 4 },
//     { name: "environmentalImpact", maxCount: 4 },

//     // Technical Details form section files of Category - Medical Equipment and Devices, Diagnostic and Monitoring Devices, Home Healthcare Products
//     { name: "specificationFile", maxCount: 4 },
//     { name: "performanceTestingReportFile", maxCount: 4 },
//     // Compliance & Certification form section files of Category - Skin, Hair and Cosmetic Supplies
//     { name: "dermatologistTestedFile", maxCount: 4 },
//     { name: "pediatricianRecommendedFile", maxCount: 4 },
//     // Product Identification form section files of Category - Alternative Medicines
//     { name: "healthClaimsFile", maxCount: 4 },
//     // Technical Details form section files of Category - Healthcare IT Solutions
//     { name: "interoperabilityFile", maxCount: 4 },
//   ])(req, res, (err) => {
//     if (err) {
//       console.error("Multer Error:", err); // Log the error to console for debugging
//       logErrorToFile(err, req); // Log the error to a file for persistence
//       return sendErrorResponse(res, 500, "File upload error", err); // Send an error response back
//     }
//     next(); // Continue to the next middleware or route handler
//   });
// };

// const editProductUpload = (req, res, next) => {
//   upload.fields([
//     // General Information form section files
//     {
//       name: "image",
//       maxCount: req?.body?.image ? 4 - (req?.body?.image?.length || 0) : 4,
//     },
//     // Compliance & Certification form section files
//     {
//       name: "complianceFile",
//       maxCount: req?.body?.complianceFile
//         ? 4 - (req?.body?.complianceFile?.length || 0)
//         : 4,
//     },
//     // Additional Information form section files
//     {
//       name: "guidelinesFile",
//       maxCount: req?.body?.guidelinesFile
//         ? 4 - (req?.body?.guidelinesFile?.length || 0)
//         : 4,
//     },
//     // Health & Safety form section files
//     {
//       name: "safetyDatasheet",
//       maxCount: req?.body?.safetyDatasheet
//         ? 4 - (req?.body?.safetyDatasheet?.length || 0)
//         : 4,
//     },
//     {
//       name: "healthHazardRating",
//       maxCount: req?.body?.healthHazardRating
//         ? 4 - (req?.body?.healthHazardRating?.length || 0)
//         : 4,
//     },
//     {
//       name: "environmentalImpact",
//       maxCount: req?.body?.environmentalImpact
//         ? 4 - (req?.body?.environmentalImpact?.length || 0)
//         : 4,
//     },

//     // Technical Details form section files of Category - Medical Equipment and Devices, Diagnostic and Monitoring Devices, Home Healthcare Products
//     {
//       name: "specificationFile",
//       maxCount: req?.body?.specificationFile
//         ? 4 - (req?.body?.specificationFile?.length || 0)
//         : 4,
//     },
//     {
//       name: "performanceTestingReportFile",
//       maxCount: req?.body?.performanceTestingReportFile
//         ? 4 - (req?.body?.performanceTestingReportFile?.length || 0)
//         : 4,
//     },
//     // Compliance & Certification form section files of Category - Skin, Hair and Cosmetic Supplies
//     {
//       name: "dermatologistTestedFile",
//       maxCount: req?.body?.dermatologistTestedFile
//         ? 4 - (req?.body?.dermatologistTestedFile?.length || 0)
//         : 4,
//     },
//     {
//       name: "pediatricianRecommendedFile",
//       maxCount: req?.body?.pediatricianRecommendedFile
//         ? 4 - (req?.body?.pediatricianRecommendedFile?.length || 0)
//         : 4,
//     },
//     // Product Identification form section files of Category - Alternative Medicines
//     {
//       name: "healthClaimsFile",
//       maxCount: req?.body?.healthClaimsFile
//         ? 4 - (req?.body?.healthClaimsFile?.length || 0)
//         : 4,
//     },
//     // Technical Details form section files of Category - Healthcare IT Solutions
//     {
//       name: "interoperabilityFile",
//       maxCount: req?.body?.interoperabilityFile
//         ? 4 - (req?.body?.interoperabilityFile?.length || 0)
//         : 4,
//     },
//   ])(req, res, (err) => {
//     if (err) {
//       console.error("Multer Error:", err); // Log the error to console for debugging
//       logErrorToFile(err, req); // Log the error to a file for persistence
//       return sendErrorResponse(res, 500, "File upload error", err); // Send an error response back
//     }
//     next(); // Continue to the next middleware or route handler
//   });
// };

// module.exports = { addProductUpload, editProductUpload };
const multer = require("multer");
const mime = require("mime-types"); // Import mime-types to resolve file extensions
const { sendErrorResponse } = require("../../utils/commonResonse");
const logErrorToFile = require("../../logs/errorLogs");

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
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`); // Use a timestamp for unique filenames
  },
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

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
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err); // Log the error to console for debugging
      logErrorToFile(err, req); // Log the error to a file for persistence
      if (err.message.includes("Invalid file format")) {
        return sendErrorResponse(res, 400, err.message, err); // Respond with 400 for invalid file format
      }
      return sendErrorResponse(res, 500, "File upload error", err); // Send a general error response for other cases
    }
    next(); // Continue to the next middleware or route handler
  });
};

const editProductUpload = (req, res, next) => {
  const getMaxCount = (field) => {
    // Calculate the max count based on the files already uploaded for the field
    const fieldFiles = req?.body?.[field] || []; // Safely handle undefined fields
    return 4 - (Array.isArray(fieldFiles) ? fieldFiles.length : 0); // Ensure length works even for single file objects
  };

  upload.fields([
    { name: "image", maxCount: getMaxCount("image") },
    { name: "complianceFile", maxCount: getMaxCount("complianceFile") },
    { name: "guidelinesFile", maxCount: getMaxCount("guidelinesFile") },
    { name: "safetyDatasheet", maxCount: getMaxCount("safetyDatasheet") },
    { name: "healthHazardRating", maxCount: getMaxCount("healthHazardRating") },
    {
      name: "environmentalImpact",
      maxCount: getMaxCount("environmentalImpact"),
    },
    { name: "specificationFile", maxCount: getMaxCount("specificationFile") },
    {
      name: "performanceTestingReportFile",
      maxCount: getMaxCount("performanceTestingReportFile"),
    },
    {
      name: "dermatologistTestedFile",
      maxCount: getMaxCount("dermatologistTestedFile"),
    },
    {
      name: "pediatricianRecommendedFile",
      maxCount: getMaxCount("pediatricianRecommendedFile"),
    },
    { name: "healthClaimsFile", maxCount: getMaxCount("healthClaimsFile") },
    {
      name: "interoperabilityFile",
      maxCount: getMaxCount("interoperabilityFile"),
    },
  ])(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err); // Log the error to console for debugging
      logErrorToFile(err, req); // Log the error to a file for persistence
      return sendErrorResponse(res, 500, "File upload error", err); // Send an error response back
    }
    next(); // Continue to the next middleware or route handler
  });
};

// Multer setup to handle CSV file uploads
const CSVupload = multer({ dest: "uploads/products" });

module.exports = { addProductUpload, editProductUpload, CSVupload };
