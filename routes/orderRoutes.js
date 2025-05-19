const express = require("express");
var routes = express.Router();
const path = require("path");
const Order = require("../controller/Order");
const { handleResponse, handleController } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");

module.exports = () => {
  routes.post(
    "/create-order",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Order.createOrder, req, res)
  );

  routes.post(
    "/book-logistics",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Order.bookLogistics, req, res)
  );

  routes.post(
    "/submit-pickup-details",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Order.submitPickupDetails, req, res)
  );

  routes.post(
    "/get-all-order-list",
    checkAuthorization,
    authenticationNAuthorization,
    Order?.getOrderListAllUsers
  );

  routes.post(
    "/get-order-list-csv",
    checkAuthorization,
    authenticationNAuthorization,
    Order?.getOrderListCSV
  );

  routes.post(
    "/get-specific-order-details/:id",
    checkAuthorization,
    authenticationNAuthorization,
    Order?.getSpecificOrderDetails
  );

  routes.post(
    "/cancel-order",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Order.cancelOrder, req, res)
  );

  routes.post(
    "/get-all-invoice-list",
    checkAuthorization,
    authenticationNAuthorization,
    Order.getInvoiceListForAllUsers
  );

  routes.post(
    "/sales-filter",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Order.orderSalesFilterList, req, res)
  );

  routes.post(
    "/remind-supplier/:id",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Order.remindSupplierToProceedOrder, req, res)
  );

  return routes;
};
