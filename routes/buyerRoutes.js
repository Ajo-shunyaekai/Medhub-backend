const express = require("express");
let routes = express.Router();
const path = require("path");
const Controller = require("../controller/Buyer");
const { handleResponse, handleController } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");

module.exports = () => {
  routes.post(
    "/get-specific-buyer-details/:id",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.buyerProfileDetails, req, res)
  );

  routes.post(
    "/my-supplier-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.mySupplierList, req, res)
  );

  routes.post(
    "/supplier-product-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.supplierProductList2, req, res)
  );

  routes.post(
    "/buyer-supplier-orders",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.buyerSupplierOrdersList, req, res)
  );

  routes.post(
    "/orders-summary-details",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) =>
      handleController(Controller.buyerDashboardOrderDetails, req, res)
  );

  routes.post(
    "/orders-seller-country",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.buyerOrderSellerCountry, req, res)
  );

  routes.post(
    "/add-to-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.addToList, req, res)
  );

  routes.post(
    "/show-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.showList, req, res)
  );

  routes.post(
    "/delete-list-item",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.deleteListItem, req, res)
  );

  routes.post(
    "/send-enquiry",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.sendEnquiry, req, res)
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

  return routes;
};
