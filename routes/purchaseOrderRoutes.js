const express = require("express");
var routes = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const Controller = require("../controller/purchaseOrder");
const { handleResponse, handleController } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");

module.exports = () => {
  routes.post(
    "/create-po",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => {
      const { supplierMobile, buyerMobile } = req.body.data;
      const countryCodeRegex = /^\+\d+/;

      const supplierCountryCode = supplierMobile.match(countryCodeRegex)[0];
      const supplierPhoneNumber = supplierMobile
        .replace(supplierCountryCode, "")
        .replace(/\D/g, "");
      const buyerCountryCode = buyerMobile.match(countryCodeRegex)[0];
      const buyerPhoneNumber = buyerMobile
        .replace(buyerCountryCode, "")
        .replace(/\D/g, "");

      req.body.data.supplier_country_code = supplierCountryCode;
      req.body.data.supplierMobile = supplierPhoneNumber;
      req.body.data.buyer_country_code = buyerCountryCode;
      req.body.data.buyerMobile = buyerPhoneNumber;

      handleController(Controller.createPO, req, res);
    }
  );

  routes.post(
    "/get-po-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.getPOList, req, res)
  );

  routes.post(
    "/get-po-details",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.getPODetails, req, res)
  );

  routes.post(
    "/edit-po",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => {
      const { supplierMobile, buyerMobile } = req.body.data;
      const countryCodeRegex = /^\+\d+/;

      const supplierCountryCode = supplierMobile.match(countryCodeRegex)[0];
      const supplierPhoneNumber = supplierMobile
        .replace(supplierCountryCode, "")
        .replace(/\D/g, "");
      const buyerCountryCode = buyerMobile.match(countryCodeRegex)[0];
      const buyerPhoneNumber = buyerMobile
        .replace(buyerCountryCode, "")
        .replace(/\D/g, "");

      req.body.data.supplier_country_code = supplierCountryCode;
      req.body.data.supplierMobile = supplierPhoneNumber;
      req.body.data.buyer_country_code = buyerCountryCode;
      req.body.data.buyerMobile = buyerPhoneNumber;
      handleController(Controller.editPO, req, res);
    }
  );

  return routes;
};
