const express = require("express");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const router = express.Router();
const {
  addProductUpload,
  addProductUpload3,
  editProductUpload,
  editProductUpload3,
  CSVupload,
} = require("../middleware/multer/productMulter");
const {
  getAllProducts,
  getAllProducts2,
  getProductDetails,
  addProduct,
  addProduct2,
  addProduct3,
  editProduct,
  editProduct2,
  editProduct3,
  deleteProduct,
  bulkUpload,
  bulkUpload2,
  bulkUpload3,
  productSuppliers,
  otherProducts,
  previewBulkUpload,
  previewBulkUpload2,
  previewBulkUpload3,
  csvDownload,
  csvDownload2,
  uploadCsvSheet,
  getCsvTemplateFiles,
  getSupplierCsvFiles,
  updateSupplierCsvFile,
  deleteAdminCsvTemplateFile,
  getAllProductQualityReports,
} = require("../controller/Product");
const {
  categorySpecificValidationRules,
  generalValidationRules,
} = require("../middleware/validations/products/addProduct");
const {
  editCategorySpecificValidationRules,
  editGeneralValidationRules,
} = require("../middleware/validations/products/editProduct");
const {
  handleValidationErrors,
} = require("../middleware/validations/validationErrorHandler");
const editProductFileMiddleware = require("../middleware/validations/products/fileUploads/editProduct");
const addProductFileMiddleware = require("../middleware/validations/products/fileUploads/addProduct");
const { bulkProductCSVUpload } = require("../middleware/multer/bulkUpload");

router.post(`/`, checkAuthorization, getAllProducts2); // according to the market, user

router.post(
  `/bulk-upload`,
  checkAuthorization,
  authenticationNAuthorization,
  // bulkUpload
  // bulkUpload2
  bulkUpload3
);

router.post(
  `/csv-download`,
  checkAuthorization,
  authenticationNAuthorization,
  // csvDownload
  csvDownload2
);

router.post(
  `/preview-bulk-products`,
  checkAuthorization,
  authenticationNAuthorization,
  CSVupload.single("csvfile"),
  // previewBulkUpload
  // previewBulkUpload2
  previewBulkUpload3
);

router.post(
  `/add`,
  checkAuthorization,
  authenticationNAuthorization,
  addProductUpload3,
  categorySpecificValidationRules,
  generalValidationRules,
  handleValidationErrors,
  addProductFileMiddleware,
  // addProduct
  // addProduct2
  addProduct3
);

router.post(
  `/edit/:productId`,
  checkAuthorization,
  authenticationNAuthorization,
  editProductUpload3,
  editCategorySpecificValidationRules,
  editGeneralValidationRules,
  handleValidationErrors,
  editProductFileMiddleware,
  // editProduct
  // editProduct2
  editProduct3
);

router.post(
  `/delete/:id`,
  checkAuthorization,
  authenticationNAuthorization,
  deleteProduct
);

router.post(
  `/get-suppliers/:id`,
  checkAuthorization,
  authenticationNAuthorization,
  productSuppliers
);

router.post(
  `/get-other-products/:id`,
  checkAuthorization,
  authenticationNAuthorization,
  otherProducts
);

router.post(
  "/upload-csv-sheet/:category/:id",
  checkAuthorization,
  authenticationNAuthorization,
  bulkProductCSVUpload,
  uploadCsvSheet
);

router.post(
  "/get-supplier-csv-files/:id",
  checkAuthorization,
  authenticationNAuthorization,
  bulkProductCSVUpload,
  getSupplierCsvFiles
);

router.post(
  "/get-csv-template-files",
  checkAuthorization,
  authenticationNAuthorization,
  bulkProductCSVUpload,
  getCsvTemplateFiles
);

router.post(
  "/update-supplier-csv-file/:userId/:category/:id",
  checkAuthorization,
  authenticationNAuthorization,
  bulkProductCSVUpload,
  updateSupplierCsvFile
);

router.post(
  "/delete-csv-file/:userId/:category/:id",
  checkAuthorization,
  authenticationNAuthorization,
  bulkProductCSVUpload,
  deleteAdminCsvTemplateFile
);

router.post(
  `/get-all-qr-products/`,
  checkAuthorization,
  authenticationNAuthorization,
  getAllProductQualityReports
);

router.post(`/:id`, checkAuthorization, getProductDetails);

module.exports = router;
