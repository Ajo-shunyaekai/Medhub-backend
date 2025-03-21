const express = require("express");
const {
  checkAuthorization,
  checkCommonUserAuthentication,
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
  editProduct,
  deleteProduct,
  addBulkProducts,
  productSuppliers,
  otherProducts,
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
  `/add-bulk-products`,
  checkAuthorization,
  checkCommonUserAuthentication,
  CSVupload.single("csvfile"),
  addBulkProducts
);

router.post(
  `/add`,
  checkAuthorization,
  checkCommonUserAuthentication,
  addProductUpload,
  categorySpecificValidationRules,
  generalValidationRules,
  handleValidationErrors,
  addProductFileMiddleware,
  addProduct
);

router.post(
  `/edit/:productId`,
  checkAuthorization,
  checkCommonUserAuthentication,
  editProductUpload,
  editCategorySpecificValidationRules,
  editGeneralValidationRules,
  handleValidationErrors,
  editProductFileMiddleware,
  editProduct
);

router.post(
  `/delete/:id`,
  checkAuthorization,
  checkCommonUserAuthentication,
  deleteProduct
);

router.post(
  `/get-suppliers/:id`,
  checkAuthorization,
  checkCommonUserAuthentication,
  productSuppliers
);

router.post(
  `/get-other-products/:id`,
  checkAuthorization,
  checkCommonUserAuthentication,
  otherProducts
);


router.post(`/:id`, checkAuthorization, getProductDetails);


module.exports = router;
