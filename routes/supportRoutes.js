const express = require("express");
var routes = express.Router();
const path = require("path");
const Support = require("../controller/Support");
const { handleResponse, handleController } = require("../utils/utilities");
const { validation } = require("../utils/utilities");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const { supportUpload } = require("../middleware/multer/supportMulter");

module.exports = () => {
  routes.post(
    "/submit-feedback",
    checkAuthorization,
    authenticationNAuthorization,
    supportUpload,
    (req, res) => {
      if (
        !req?.uploadedFiles?.["feedback_image"] ||
        req?.uploadedFiles?.["feedback_image"]?.length === 0
      ) {
        res.send({
          code: 415,
          message: "Feedback Image is required!",
          errObj: {},
        });
        return;
      }

      let obj = {
        ...req.body,
        feedback_image: req?.uploadedFiles?.["feedback_image"]?.map((file) =>
          typeof file == "string" && file?.startsWith("https")
            ? file
            : path.basename(file?.path)
        ),
      };

      handleController(Support.supportSubmission, req, res, obj);
    }
  );

  routes.post(
    "/submit-complaint",
    checkAuthorization,
    authenticationNAuthorization,
    supportUpload,
    (req, res) => {
      if (
        !req?.uploadedFiles?.["complaint_image"] ||
        req?.uploadedFiles?.["complaint_image"]?.length === 0
      ) {
        res.send({
          code: 415,
          message: "Complaint Image is required!",
          errObj: {},
        });
        return;
      }

      let obj = {
        ...req.body,
        complaint_image: req?.uploadedFiles?.["complaint_image"]?.map((file) =>
          typeof file == "string" && file?.startsWith("https")
            ? file
            : path.basename(file?.path)
        ),
      };

      handleController(Support.supportSubmission, req, res, obj);
    }
  );

  return routes;
};
