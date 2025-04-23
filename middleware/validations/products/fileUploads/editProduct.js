const logErrorToFile = require("../../../../logs/errorLogs");
const { sendErrorResponse, handleCatchBlockError } = require("../../../../utils/commonResonse");

const editProductFileMiddleware = (req, res, next) => {
  try {
    const { category, market } = req?.body;

    // Helper function to check file limits for specific fields
    const checkFileLimitForField = (fieldName) => {
      const savedFiles = req?.body?.[fieldName] ? req.body[fieldName] : []; // Files already saved
      const uploadedFiles = req?.files?.[fieldName] ? req.files[fieldName] : []; // Files being uploaded

      const savedFileCount = Array.isArray(savedFiles) ? savedFiles.length : 0;
      const uploadedFileCount = Array.isArray(uploadedFiles)
        ? uploadedFiles.length
        : 0;

      // Total file count (saved + uploaded)
      const totalFiles = savedFileCount + uploadedFileCount;
    };

    // Check for different field names where file upload might happen
    checkFileLimitForField("imageNew");
    checkFileLimitForField("complianceFileNew");
    checkFileLimitForField("guidelinesFileNew");
    checkFileLimitForField("safetyDatasheetNew");
    checkFileLimitForField("healthHazardRatingNew");
    checkFileLimitForField("environmentalImpactNew");
    checkFileLimitForField("specificationFileNew");
    checkFileLimitForField("performanceTestingReportFileNew");
    checkFileLimitForField("dermatologistTestedFileNew");
    checkFileLimitForField("pediatricianRecommendedFileNew");
    checkFileLimitForField("healthClaimsFileNew");
    checkFileLimitForField("interoperabilityFileNew");
    checkFileLimitForField("performaInvoiceFileNew");

    if (market == "secondary") {
      // Check if the purchaseInvoiceFile is uploaded
      if (
        (req?.body?.purchaseInvoiceFile?.length || 0) +
          (req?.files?.purchaseInvoiceFileNew?.length || 0) ===
        0
      ) {
        const err = new Error(
          "Purchase Invoice File is required for Secondary Market Product."
        );
        return handleCatchBlockError(req, res, err);
        logErrorToFile(err, req); // Log the error to a file for persistence
        return sendErrorResponse(res, 400, err.message, err); // Send an error response back
      }
    }

    // Check conditions for the "SkinHairCosmeticSupplies" category
    if (category == "SkinHairCosmeticSupplies") {
      if (req?.body?.dermatologistTested == "Yes") {
        // Check if the dermatologistTestedFile is uploaded
        if (
          (req?.body?.dermatologistTestedFile?.length || 0) +
            (req?.files?.dermatologistTestedFileNew?.length || 0) ===
          0
        ) {
          const err = new Error(
            "Dermatologist Tested file is required for SkinHairCosmeticSupplies when dermatologistTested is Yes"
          );
          return handleCatchBlockError(req, res, err);
          logErrorToFile(err, req); // Log the error to a file for persistence
          return sendErrorResponse(res, 400, err.message, err); // Send an error response back
        }
      }
    }

    if (req?.body?.pediatricianRecommendedFile == "Yes") {
      // Check if the pediatricianRecommendedFile is uploaded
      if (
        (req?.body?.pediatricianRecommendedFileFile?.length || 0) +
          (req?.files?.pediatricianRecommendedFileFileNew?.length || 0) ===
        0
      ) {
        const err = new Error(
          "Pediatrician Recommended file is required for SkinHairCosmeticSupplies when pediatricianRecommendedFile is Yes"
        );
        return handleCatchBlockError(req, res, err);
        logErrorToFile(err, req); // Log the error to a file for persistence
        return sendErrorResponse(res, 400, err.message, err); // Send an error response back
      }
    }

    // Check conditions for the "HealthcareITSolutions" category
    if (category == "HealthcareITSolutions") {
      // Check if the interoperabilityFile is uploaded
      if (
        (req?.body?.interoperabilityFile?.length || 0) +
          (req?.files?.interoperabilityFileNew?.length || 0) ===
        0
      ) {
        const err = new Error(
          "Interoperability file is required for HealthcareITSolutions"
        );
        return handleCatchBlockError(req, res, err);
        logErrorToFile(err, req); // Log the error to a file for persistence
        return sendErrorResponse(res, 400, err.message, err); // Send an error response back
      }
    }

    // If all validations pass, proceed to the next middleware or route handler
    next();
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
};

module.exports = editProductFileMiddleware;
