const express = require("express");
var routes = express.Router();
const path = require("path");
const Controller = require("../controller/Order");
const Invoice = require("../controller/Invoice");
const { handleResponse, handleController } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const { invoiceUpload } = require("../middleware/multer/invoiceMulter");

module.exports = () => {
  routes.post(
    "/create-invoice",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Invoice.createInvoice, req, res)
  );

  routes.post(
    "/update-payment-status",
    checkAuthorization,
    authenticationNAuthorization,
    invoiceUpload,
    async (req, res) => {
      const { uploadedFiles } = req;
      if (
        !uploadedFiles["transaction_image"] ||
        uploadedFiles["transaction_image"].length === 0
      ) {
        res.send({
          code: 415,
          message: "Transaction Image field is required!",
          errObj: {},
        });
        return;
      }

      let obj = {
        ...req.body,
        // transaction_image: req.files["transaction_image"].map((file) =>
        //   path.basename(file.path)
        // ),
        transaction_image: uploadedFiles?.transaction_image,
      };
      handleController(Invoice.updatePaymentStatus, req, res, obj);
    }
  );

  routes.post(
    "/get-specific-invoice-details/:id",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Invoice.invoiceDetails, req, res)
  );

  return routes;
};
