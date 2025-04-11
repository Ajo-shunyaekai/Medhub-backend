const express = require("express");
var routes = express.Router();
const path = require("path");
const Controller = require("../controller/Medicine");
const { handleResponse, handleController } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const createMulterMiddleware = require("../utils/imageUpload");

const medicineUploadMiddleware = createMulterMiddleware([
  {
    fieldName: "product_image",
    uploadPath: "./uploads/medicine/product_files",
    maxCount: 4,
  },
  {
    fieldName: "invoice_image",
    uploadPath: "./uploads/medicine/invoice_image",
    maxCount: 1,
  },
]);

module.exports = () => {
  routes.post("/get-medicine-by-name", checkAuthorization, (req, res) =>
    handleController(Controller.getMedicineByName, req, res)
  );

  routes.post(
    "/add-medicine",
    checkAuthorization,
    authenticationNAuthorization,
    medicineUploadMiddleware,
    (req, res) => {
      if (
        !req.files["product_image"] ||
        req.files["product_image"].length === 0
      ) {
        res.send({
          code: 415,
          message: "Products Images fields are required!",
          errObj: {},
        });
        return;
      }
      const tags = req.body.tags.split(",");

      let obj = {
        ...req.body,
        tags: tags,
        medicine_image: req.files["product_image"].map((file) =>
          path.basename(file.path)
        ),
      };

      if (req.body.product_type === "secondary market") {
        if (
          !req.files["invoice_image"] ||
          req.files["invoice_image"].length === 0
        ) {
          res.send({
            code: 415,
            message: "Invoice Images fields are required for secondary market!",
            errObj: {},
          });
          return;
        }
        obj.invoice_image = req.files["invoice_image"].map((file) =>
          path.basename(file.path)
        );
      }

      if (obj.product_type === "new") {
        let errObj = validation(obj, "addNewProduct");

        if (Object.values(errObj).length) {
          res.send({ code: 422, message: "All fields are required", errObj });
          return;
        }
      } else if (obj.product_type === "secondary market") {
        let errObj = validation(obj, "addSecondaryProduct");

        if (Object.values(errObj).length) {
          res.send({ code: 422, message: "All fields are required", errObj });
          return;
        }
      }

      handleController(Controller.addMedicine, req, res, obj);
    }
  );

  routes.post(
    "/medicine-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.allMedicineList, req, res)
  );

  routes.post("/medicine-details", checkAuthorization, (req, res) =>
    handleController(Controller.getMedicineDetails, req, res)
  );

  routes.post(
    "/edit-medicine",
    checkAuthorization,
    authenticationNAuthorization,
    medicineUploadMiddleware,
    (req, res) => {
      let allProductImages = [];
      let allInvoiceImages = [];

      if (typeof req.body.product_image === "string") {
        allProductImages = [req.body.product_image];
      } else if (Array.isArray(req.body.product_image)) {
        allProductImages = [...req.body.product_image];
      }

      if (req.files["product_image"]) {
        const newProductImages = req.files["product_image"].map((file) =>
          path.basename(file.path)
        );
        allProductImages = [...allProductImages, ...newProductImages];
      }
      req.body.medicine_image = allProductImages;

      if (req.body.product_type === "secondary market") {
        if (typeof req.body.invoice_image === "string") {
          allInvoiceImages = [req.body.invoice_image];
        } else if (Array.isArray(req.body.invoice_image)) {
          allInvoiceImages = [...req.body.invoice_image];
        }

        if (req.files["invoice_image"]) {
          const newInvoiceImages = req.files["invoice_image"].map((file) =>
            path.basename(file.path)
          );
          allInvoiceImages = [...allInvoiceImages, ...newInvoiceImages];
        }
        req.body.invoice_image = allInvoiceImages;
      }

      let errObj = validation(req.body, "editProduct");

      if (Object.values(errObj).length) {
        res.send({ code: 422, message: "All fields are required", errObj });
        return;
      }

      handleController(Controller.editMedicine, req, res);
    }
  );

  routes.post("/medicine-edit-req-list", checkAuthorization, (req, res) =>
    handleController(Controller.medicineEditList, req, res)
  );

  routes.post("/filter", checkAuthorization, (req, res) =>
    handleController(Controller.filterMedicine, req, res)
  );

  routes.post("/similar-medicine-list", checkAuthorization, (req, res) =>
    handleController(Controller.similarMedicineList, req, res)
  );

  routes.post("/other-medicine-list", checkAuthorization, (req, res) =>
    handleController(Controller.otherMedicineList, req, res)
  );

  routes.post(
    "/get-all-medicines-list",
    checkAuthorization,
    Controller.getSpecificMedicinesList
  );
  routes.post(
    "/get-all-medicines-list-csv",
    checkAuthorization,
    Controller.getMedicinesListCSV
  );

  routes.post(
    "/get-specific-medicine-details/:id",
    checkAuthorization,
    Controller.getSpecificMedicineDetails
  );

  return routes;
};
