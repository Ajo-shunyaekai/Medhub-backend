const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Admin')
const MedicineController                         = require('../controller/Medicine')
const { handleResponse, handleController }                         = require('../utils/utilities');
const {checkAuthorization, checkAuthentication, checkCommonUserAuthentication}  = require('../middleware/Authorization');

module.exports = () => {

    routes.post('/register', checkAuthorization, (req, res) => handleController(Controller.register, req, res));

    routes.post('/login', checkAuthorization, (req, res) => handleController(Controller.login, req, res));

    routes.post('/edit-profile', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.editAdminProfile, req, res));

    routes.post('/profile-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.adminProfileDetails, req, res));

    routes.post('/get-user-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getUserList, req, res));

    routes.post('/block-unblock-user', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.blockUnblockUser, req, res));

    routes.post('/get-supplier-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getSupplierList, req, res));

    routes.post('/get-supplier-list-csv', checkAuthorization, checkCommonUserAuthentication, Controller.getSupplierCSVList);
    
    routes.post('/get-buyer-list-csv', checkAuthorization, checkCommonUserAuthentication, Controller.getBuyerCSVList);

    routes.post('/get-supplier-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supplierDetails, req, res));

    routes.post('/get-supplier-reg-req-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getRegReqList, req, res));

    routes.post('/get-supplier-req-csv-list', checkAuthorization, checkCommonUserAuthentication, Controller.getSuppReqCSVList);

    routes.post('/accept-reject-supplier-registration', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.acceptRejectSupplierRegReq, req, res));

    routes.post('/get-buyer-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getBuyerList, req, res));

    routes.post('/get-buyer-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.buyerDetails, req, res));

    routes.post('/get-buyer-reg-req-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getBuyerRegReqList, req, res));

    routes.post('/accept-reject-buyer-registration', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.acceptRejectBuyerRegReq, req, res));

    routes.post('/get-buyer-supplier-reg-req-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getTotalRegReqList, req, res));

    routes.post('/get-buyer-supplier-aprroved-reg-req-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getTotalApprovedRegReqList, req, res));

    routes.post('/get-profile-edit-request-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getProfileUpdateReqList, req, res));

    routes.post('/action-profile-edit-req/:id', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.acceptRejectProfileEditRequest, req, res));

    routes.post('/accept-reject-add-medicine', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.acceptRejectAddMedicineReq, req, res));

    routes.post('/accept-reject-edit-medicine', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.acceptRejectEditMedicineReq, req, res));

    routes.post('/get-medicine-edit-request-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.medicineEditList, req, res));

    routes.post('/get-edit-medicine_details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.editMedicineDetails, req, res));

    routes.post('/get-medicine-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.allMedicineList, req, res));

    routes.post('/medicine-details', checkAuthorization, (req, res) => handleController(Controller.getMedicineDetails, req, res));

    routes.post('/all-medicine-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(MedicineController.allMedicineList, req, res));

    routes.post('/get-support-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supportList, req, res));

    routes.post('/get-support-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supportDetails, req, res));

    routes.post('/dashboard-data-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.adminDashboardDataList, req, res));

    routes.post('/buyer-order-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.buyerOrdersList, req, res));

    routes.post('/order-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.orderDetails, req, res));

    routes.post('/get-notification-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getNotificationList, req, res));

    routes.post('/get-notification-details-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getNotificationDetailsList, req, res));

    routes.post('/update-notification-status', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.updateStatus, req, res));

    routes.post('/get-inquiry-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.inquiriesList, req, res));

    routes.post('/get-inquiry-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.inquiryDetails, req, res));

    routes.post('/get-invoice-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.invoicesList, req, res));

    routes.post('/get-invoice-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.invoiceDetails, req, res));

    routes.post('/get-po-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getPOList, req, res));

    routes.post('/get-po-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getPODetails, req, res));
    
    routes.post('/get-transaction-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.transactionList, req, res));

    routes.post('/get-transaction-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.transactionDetails, req, res));

    routes.post('/get-profile-edit-requests/:type/:status',checkAuthorization, checkCommonUserAuthentication, Controller.getProfileEditRequestList)

    routes.post('/edit-profile-request/:id',checkAuthorization, checkCommonUserAuthentication, Controller.getProfileEditRequestList)

    routes.post('/get-profile-edit-requests',checkAuthorization, checkCommonUserAuthentication, Controller.getProfileEditRequestList)
    
    return routes;
}