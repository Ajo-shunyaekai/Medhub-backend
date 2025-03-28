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
