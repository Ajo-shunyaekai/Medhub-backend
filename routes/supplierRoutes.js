const express = require("express");
var routes = express.Router();
const Controller = require("../controller/Supplier");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const { handleResponse, handleController } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const createMulterMiddleware = require("../utils/imageUpload");

const supplierUploadMiddleware = createMulterMiddleware([
  {
    fieldName: "supplier_image",
    uploadPath: "./uploads/supplier/supplierImage_files",
    maxCount: 1,
  },
  {
    fieldName: "tax_image",
    uploadPath: "./uploads/supplier/tax_image",
    maxCount: 4,
  },
  {
    fieldName: "license_image",
    uploadPath: "./uploads/supplier/license_image",
    maxCount: 4,
  },
  {
    fieldName: "certificate_image",
    uploadPath: "./uploads/supplier/certificate_image",
    maxCount: 4,
  },
]);

module.exports = () => {
  routes.post("/get-filter-values", checkAuthorization, (req, res) =>
    handleController(Controller.filterValues, req, res)
  );

  routes.post(
    "/get-specific-supplier-details/:id",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.supplierProfileDetails, req, res)
  );

  routes.post(
    "/orders-summary-details",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) =>
      handleController(Controller.supplierDashboardOrderDetails, req, res)
  );

  routes.post(
    "/orders-buyer-country",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) =>
      handleController(Controller.supplierOrderSupplierCountry, req, res)
  );

  routes.post(
    "/get-notification-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.getNotificationList, req, res)
  );

  routes.post(
    "/get-notification-details-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) =>
      handleController(Controller.getNotificationDetailsList, req, res)
  );

  routes.post(
    "/update-notification-status",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.updateStatus, req, res)
  );

  routes.post(
    "/get-invoice-count",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.getInvoiceCount, req, res)
  );

  routes.post(
    `/get-all-suppliers-list`,
    checkAuthorization,
    authenticationNAuthorization,
    Controller.getAllSuppliersList
  );

  routes.post(
    `/get-csv-suppliers-list`,
    checkAuthorization,
    authenticationNAuthorization,
    Controller.getCSVSuppliersList
  );

  return routes;
};
