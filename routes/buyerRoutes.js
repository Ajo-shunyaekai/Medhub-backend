const express = require("express");
let routes = express.Router();
const path = require("path");
const Controller = require("../controller/Buyer");
const { handleResponse, handleController } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const {
  checkAuthorization,
  checkCommonUserAuthentication,
} = require("../middleware/Authorization");
const createMulterMiddleware = require("../utils/imageUpload");

const buyerUploadMiddleware = createMulterMiddleware([
  {
    fieldName: "buyer_image",
    uploadPath: "./uploads/buyer/buyer_images",
    maxCount: 1,
  },
  {
    fieldName: "tax_image",
    uploadPath: "./uploads/buyer/tax_images",
    maxCount: 4,
  },
  {
    fieldName: "license_image",
    uploadPath: "./uploads/buyer/license_images",
    maxCount: 4,
  },
  {
    fieldName: "certificate_image",
    uploadPath: "./uploads/buyer/certificate_images",
    maxCount: 4,
  },
]);

module.exports = () => {
  routes.post(
    "/get-specific-buyer-details/:id",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.buyerProfileDetails, req, res)
  );

  // routes.post('/profile-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.buyerProfileDetails, req, res));

  // routes.post('/supplier-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supplierList, req, res));

  routes.post(
    "/my-supplier-list",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.mySupplierList, req, res)
  );

  // routes.post('/supplier-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supplierDetails, req, res));

  routes.post(
    "/supplier-product-list",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.supplierProductList, req, res)
  );

  routes.post(
    "/buyer-supplier-orders",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.buyerSupplierOrdersList, req, res)
  );

  routes.post(
    "/orders-summary-details",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) =>
      handleController(Controller.buyerDashboardOrderDetails, req, res)
  );

  routes.post(
    "/orders-seller-country",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.buyerOrderSellerCountry, req, res)
  );

  // routes.post('/support-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supportList, req, res));

  // routes.post('/support-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supportDetails, req, res));

  routes.post(
    "/add-to-list",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.addToList, req, res)
  );

  routes.post(
    "/show-list",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.showList, req, res)
  );

  routes.post(
    "/delete-list-item",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.deleteListItem, req, res)
  );

  routes.post(
    "/send-enquiry",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.sendEnquiry, req, res)
  );

  routes.post(
    "/get-notification-list",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.getNotificationList, req, res)
  );

  routes.post(
    "/get-notification-details-list",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) =>
      handleController(Controller.getNotificationDetailsList, req, res)
  );

  routes.post(
    "/update-notification-status",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.updateStatus, req, res)
  );

  routes.post(
    "/get-invoice-count",
    checkAuthorization,
    checkCommonUserAuthentication,
    (req, res) => handleController(Controller.getInvoiceCount, req, res)
  );

  return routes;
};
