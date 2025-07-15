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
    let uploadPath = "./uploads/bids";
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
    let uploadPath = "./uploads/bids";
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

const addBidUpload = (req, res, next) => {
  upload.fields([{ name: "bidDocs", maxCount: 4 }])(req, res, async (err) => {
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
      if (req?.files?.["bidDocs"]) {
        uploadedFiles["bidDocs"] = await uploadMultipleFiles(
          // req?.files?.["bidDocs"] || []
          (req?.files?.["bidDocs"] || [])?.map((file) => ({
            ...file,
            path: file.path,
            filename: file.filename,
            contentType: file.mimetype,
          }))
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
      removeLocalFiles([...(req?.files?.["bidDocs"] || [])]);

      req.uploadedFiles = uploadedFiles;
      next();
    };

    // Call the function to handle the uploaded files
    await getUploadedFilesPath();
  });
};

const editBidUpload = (req, res, next) => {
  const getMaxCount = (field) => {
    // Calculate the max count based on the files already uploaded for the field
    const fieldFiles = req?.body?.[field] || []; // Safely handle undefined fields
    return 4 - (Array.isArray(fieldFiles) ? fieldFiles.length : 0); // Ensure length works even for single file objects
  };

  uploadEdit.fields([{ name: "bidDocsNew", maxCount: getMaxCount("bidDocs") }])(
    req,
    res,
    async (err) => {
      if (err) {
        console.error("Multer Error:", err); // Log the error to console for debugging
        logErrorToFile(err, req); // Log the error to a file for persistence
        return sendErrorResponse(res, 500, "File upload error", err); // Send an error response back
      }

      let uploadedFiles = {};

      const getUploadedFilesPath = async () => {
        if (req?.files?.["bidDocsNew"]) {
          uploadedFiles["bidDocsNew"] = await uploadMultipleFiles(
            // req?.files?.["bidDocsNew"] || []
            (req?.files?.["bidDocsNew"] || [])?.map((file) => ({
              ...file,
              path: file.path,
              filename: file.filename,
              contentType: file.mimetype,
            }))
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
        removeLocalFiles([...(req?.files?.["bidDocsNew"] || [])]);

        req.uploadedFiles = uploadedFiles;
        next();
      };

      // Call the function to handle the uploaded files
      await getUploadedFilesPath();
    }
  );
};

module.exports = {
  addBidUpload,
  editBidUpload,
};
