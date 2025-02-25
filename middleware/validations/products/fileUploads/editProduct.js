const logErrorToFile = require("../../../../logs/errorLogs");
const { sendErrorResponse } = require("../../../../utils/commonResonse");

const editProductFileMiddleware = (req, res, next) => {
  console.log("Custom middleware was called");

  const { category } = req?.body;

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

    if (totalFiles > 4) {
      const err = new Error(
        `You can only upload a maximum of 4 files for ${fieldName}. Currently, you have ${savedFileCount} saved files.`
      );
      logErrorToFile(err, req); // Log the error to a file for persistence
      return sendErrorResponse(res, 400, err.message, err); // Send an error response back
    }
  };

  // Check for different field names where file upload might happen
  checkFileLimitForField("image");
  checkFileLimitForField("complianceFile");
  checkFileLimitForField("guidelinesFile");
  checkFileLimitForField("safetyDatasheet");
  checkFileLimitForField("healthHazardRating");
  checkFileLimitForField("environmentalImpact");
  checkFileLimitForField("specificationFile");
  checkFileLimitForField("performanceTestingReportFile");
  checkFileLimitForField("dermatologistTestedFile");
  checkFileLimitForField("pediatricianRecommendedFile");
  checkFileLimitForField("healthClaimsFile");
  checkFileLimitForField("interoperabilityFile");

  // Check conditions for the "SkinHairCosmeticSupplies" category
  if (category == "SkinHairCosmeticSupplies") {
    if (req?.body?.dermatologistTested == "Yes") {
      // Check if the dermatologistTestedFile is uploaded
      if (
        (req?.body?.dermatologistTestedFile?.length || 0) +
          (req?.files?.dermatologistTestedFile?.length || 0) ===
        0
      ) {
        const err = new Error(
          "Dermatologist Tested file is required for SkinHairCosmeticSupplies when dermatologistTested is Yes"
        );
        logErrorToFile(err, req); // Log the error to a file for persistence
        return sendErrorResponse(res, 400, err.message, err); // Send an error response back
      }
    }

    if (req?.body?.pediatricianRecommendedFile == "Yes") {
      // Check if the pediatricianRecommendedFile is uploaded
      if (
        (req?.body?.pediatricianRecommendedFileFile?.length || 0) +
          (req?.files?.pediatricianRecommendedFileFile?.length || 0) ===
        0
      ) {
        const err = new Error(
          "Pediatrician Recommended file is required for SkinHairCosmeticSupplies when pediatricianRecommendedFile is Yes"
        );
        logErrorToFile(err, req); // Log the error to a file for persistence
        return sendErrorResponse(res, 400, err.message, err); // Send an error response back
      }
    }
  }

  // Check conditions for the "DiagnosticAndMonitoringDevices" category
  if (category == "DiagnosticAndMonitoringDevices") {
    // Check if the dermatologistTestedFile is uploaded
    if (
      (req?.body?.dermatologistTestedFile?.length || 0) +
        (req?.files?.dermatologistTestedFile?.length || 0) ===
      0
    ) {
      const err = new Error(
        "Dermatologist Tested file is required for DiagnosticAndMonitoringDevices"
      );
      logErrorToFile(err, req); // Log the error to a file for persistence
      return sendErrorResponse(res, 400, err.message, err); // Send an error response back
    }
  }

  // Check conditions for the "HealthcareITSolutions" category
  if (category == "HealthcareITSolutions") {
    // Check if the interoperabilityFile is uploaded
    if (
      (req?.body?.interoperabilityFile?.length || 0) +
        (req?.files?.interoperabilityFile?.length || 0) ===
      0
    ) {
      const err = new Error(
        "Interoperability file is required for HealthcareITSolutions"
      );
      logErrorToFile(err, req); // Log the error to a file for persistence
      return sendErrorResponse(res, 400, err.message, err); // Send an error response back
    }
  }

  // If all validations pass, proceed to the next middleware or route handler
  next();
};

module.exports = editProductFileMiddleware;
