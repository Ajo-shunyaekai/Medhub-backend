const logErrorToFile = require("../../../../logs/errorLogs");
const { sendErrorResponse } = require("../../../../utils/commonResonse");
 
const addProductFileMiddleware = (req, res, next) => {
 
  const { category, market } = req?.body;
 
  // Check if files are uploaded
  const uploadedFiles = req?.files ? Object.values(req.files) : [];
 
  // Check for maximum file limit
  const totalFiles = uploadedFiles.reduce(
    (acc, fileList) => acc + fileList.length,
    0
  );

  // if (totalFiles > 4) {
  //   const err = new Error("You can only upload a maximum of 4 files.");
  //   logErrorToFile(err, req); // Log the error to a file for persistence
  //   return sendErrorResponse(res, 400, err.message, err); // Send an error response back
  // }
  
  // Log the uploaded files for debugging
 
  if (market == "secondary") {
    // Check if the purchaseInvoiceFile is uploaded
    if (!req?.files?.purchaseInvoiceFile) {
      const err = new Error(
        "Purchase Invoice File is required for Secondary Market Product."
      );
      logErrorToFile(err, req); // Log the error to a file for persistence
      return sendErrorResponse(res, 400, err.message, err); // Send an error response back
    }
  }
 
  // Check conditions for the "SkinHairCosmeticSupplies" category
  if (category == "SkinHairCosmeticSupplies") {
    if (req?.body?.dermatologistTested == "Yes") {
      // Check if the dermatologistTestedFile is uploaded
      if (!req?.files?.dermatologistTestedFile) {
        const err = new Error(
          "Dermatologist Tested file is required for Skin Hair Cosmetic Supplies when dermatologist Tested is Yes"
        );
        logErrorToFile(err, req); // Log the error to a file for persistence
        return sendErrorResponse(res, 400, err.message, err); // Send an error response back
      }
    }
 
    if (req?.body?.pediatricianRecommended == "Yes") {
      // Check if the pediatricianRecommendedFile is uploaded
      if (!req?.files?.pediatricianRecommendedFile) {
        const err = new Error(
          "Pediatrician Recommended file is required for Skin Hair Cosmetic Supplies when pediatrician Recommended is Yes"
        );
        logErrorToFile(err, req); // Log the error to a file for persistence
        return sendErrorResponse(res, 400, err.message, err); // Send an error response back
      }
    }
  }
 
  // Check conditions for the "DiagnosticAndMonitoringDevices" category
  if (category == "DiagnosticAndMonitoringDevices") {
    // Check if the dermatologistTestedFile is uploaded
    // if (!req?.files?.dermatologistTestedFile) {
    //   const err = new Error(
    //     "Dermatologist Tested file is required for Diagnostic And Monitoring Devices"
    //   );
    //   logErrorToFile(err, req); // Log the error to a file for persistence
    //   return sendErrorResponse(res, 400, err.message, err); // Send an error response back
    // }
  }
 
  // Check conditions for the "HealthcareITSolutions" category
  if (category == "HealthcareITSolutions") {
    // Check if the interoperabilityFile is uploaded
    if (!req?.files?.interoperabilityFile) {
      const err = new Error(
        "Interoperability file is required for Healthcare IT Solutions"
      );
      logErrorToFile(err, req); // Log the error to a file for persistence
      return sendErrorResponse(res, 400, err.message, err); // Send an error response back
    }
  }
 
  // If all validations pass, proceed to the next middleware or route handler
  next();
};
 
module.exports = addProductFileMiddleware;