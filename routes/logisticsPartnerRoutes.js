const express = require("express");
const router = express.Router();
const {
  addLogisticsPartner,
  getLogisticsList,
  getLogisticsDashboardData,
  getLogisticsDetails,
  updateLogisticsRequest,
  updateLogisticsTrackingStatus,
  assignLogisticsPartner,
  updateSupplierLogisticsChoice,
} = require("../controller/LogisticsPartner");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const {
  logisticsPartnerValidationRules,
} = require("../middleware/validations/logisticsPartner");
const { addLogisticsUpload } = require("../middleware/multer/logisticsMulter");

router.post(
  "/add-logistics-partner",
  checkAuthorization,
  authenticationNAuthorization,
  logisticsPartnerValidationRules,
  addLogisticsPartner
);

router.post(
  "/get-logistics-dashboard-data",
  checkAuthorization,
  authenticationNAuthorization,
  getLogisticsDashboardData
);

router.post(
  "/get-logistics-request-list",
  checkAuthorization,
  authenticationNAuthorization,
  getLogisticsList
);

router.post(
  "/get-logistics-details/:requestId",
  checkAuthorization,
  authenticationNAuthorization,
  getLogisticsDetails
);

router.post(
  "/update-logistics-details",
  checkAuthorization,
  authenticationNAuthorization,
  updateLogisticsRequest
);

router.post(
  "/assign-logistics-partner/:id/:partnerId",
  checkAuthorization,
  authenticationNAuthorization,
  assignLogisticsPartner
);

router.post(
  "/update-logistics-tracking-status/:id",
  checkAuthorization,
  addLogisticsUpload,
  authenticationNAuthorization,
  updateLogisticsTrackingStatus
);

router.post(
  "/update-supplier-logistics-choice/:id",
  checkAuthorization,
  authenticationNAuthorization,
  updateSupplierLogisticsChoice
);

module.exports = router;
