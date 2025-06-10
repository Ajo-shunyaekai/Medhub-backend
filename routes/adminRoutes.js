const express = require("express");
var routes = express.Router();
const Controller = require("../controller/Admin");
const { handleResponse, handleController } = require("../utils/utilities");
const {
  checkAuthorization,
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const { authUpload } = require("../middleware/multer/authMulter");

module.exports = () => {
  routes.post(
    "/get-supplier-list-csv",
    checkAuthorization,
    authenticationNAuthorization,
    Controller.getSupplierCSVList
  );

  routes.post(
    "/get-buyer-list-csv",
    checkAuthorization,
    authenticationNAuthorization,
    Controller.getBuyerCSVList
  );

  routes.post(
    "/get-supplier-reg-req-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.getRegReqList, req, res)
  );

  routes.post(
    "/get-supplier-req-csv-list",
    checkAuthorization,
    authenticationNAuthorization,
    Controller.getSuppReqCSVList
  );

  routes.post(
    "/accept-reject-supplier-registration",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) =>
      handleController(Controller.acceptRejectSupplierRegReq, req, res)
  );

  routes.post(
    "/get-buyer-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.getBuyerList, req, res)
  );

  routes.post(
    "/get-buyer-reg-req-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.getBuyerRegReqList, req, res)
  );

  routes.post(
    "/accept-reject-buyer-registration",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.acceptRejectBuyerRegReq, req, res)
  );

  routes.post(
    "/get-buyer-supplier-reg-req-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.getTotalRegReqList, req, res)
  );

  routes.post(
    "/get-buyer-supplier-aprroved-reg-req-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) =>
      handleController(Controller.getTotalApprovedRegReqList, req, res)
  );

  routes.post(
    "/get-profile-edit-request-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.getProfileUpdateReqList, req, res)
  );

  routes.post(
    "/action-profile-edit-req/:id",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) =>
      handleController(Controller.acceptRejectProfileEditRequest, req, res)
  );

  routes.post(
    "/accept-reject-add-medicine",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) =>
      handleController(Controller.acceptRejectAddMedicineReq, req, res)
  );

  routes.post(
    "/accept-reject-edit-medicine",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) =>
      handleController(Controller.acceptRejectEditMedicineReq, req, res)
  );

  routes.post(
    "/get-medicine-edit-request-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.medicineEditList, req, res)
  );

  routes.post(
    "/get-edit-medicine_details",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.editMedicineDetails, req, res)
  );

  routes.post(
    "/get-support-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.supportList, req, res)
  );

  routes.post(
    "/get-support-details",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.supportDetails, req, res)
  );

  routes.post(
    "/dashboard-data-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.adminDashboardDataList, req, res)
  );

  routes.post(
    "/buyer-order-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.buyerOrdersList, req, res)
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
    "/get-inquiry-details",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.inquiryDetails, req, res)
  );

  routes.post(
    "/get-transaction-list",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.transactionList, req, res)
  );

  routes.post(
    "/get-transaction-details",
    checkAuthorization,
    authenticationNAuthorization,
    (req, res) => handleController(Controller.transactionDetails, req, res)
  );

  routes.post(
    "/get-profile-edit-requests",
    checkAuthorization,
    authenticationNAuthorization,
    Controller.getProfileEditRequestList
  );

  routes.post(
    "/get-profile-edit-request-details/:type/:id",
    checkAuthorization,
    authenticationNAuthorization,
    Controller.getProfileEditRequestDetails
  );

  routes.post(
    "/update-profile-edit-request-details/:id",
    checkAuthorization,
    authenticationNAuthorization,
    Controller.updateProfileRequest
  );

  routes.post(
    "/edit-profile-details/:userType/:id",
    checkAuthorization,
    authenticationNAuthorization,
    authUpload,
    Controller.editProfileDetails
  );

  // routes.post("/update-admin-password",
  //   Controller.updatePassword
  // )

  // routes.post("/add-new-admin", Controller.addNewAdmin);

  return routes;
};
