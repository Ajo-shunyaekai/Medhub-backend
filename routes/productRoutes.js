const express = require("express");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const router = express.Router();
const {
  addProductUpload,
  editProductUpload,
  CSVupload,
} = require("../middleware/multer/productMulter");
const {
  getAllProducts,
  getProductDetails,
  addProduct,
  addProduct2,
  editProduct,
  editProduct2,
  deleteProduct,
  bulkUpload,
  bulkUpload2,
  productSuppliers,
  otherProducts,
  previewBulkUpload,
  previewBulkUpload2,
  csvDownload,
  csvDownload2,
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

router.post(`/`, checkAuthorization, getAllProducts); // according to the market, user

router.post(
  `/bulk-upload`,
  checkAuthorization,
  authenticationNAuthorization,
  // bulkUpload
  bulkUpload2
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
  previewBulkUpload2
);

router.post(
  `/add`,
  checkAuthorization,
  authenticationNAuthorization,
  addProductUpload,
  categorySpecificValidationRules,
  generalValidationRules,
  handleValidationErrors,
  addProductFileMiddleware,
  // addProduct
  addProduct2
);

router.post(
  `/edit/:productId`,
  checkAuthorization,
  authenticationNAuthorization,
  editProductUpload,
  editCategorySpecificValidationRules,
  editGeneralValidationRules,
  handleValidationErrors,
  editProductFileMiddleware,
  // editProduct
  editProduct2
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
  `/get-all-qr-products/`,
  checkAuthorization,
  authenticationNAuthorization,
  getAllProductQualityReports
);

router.post(`/:id`, checkAuthorization, getProductDetails);

module.exports = router;
