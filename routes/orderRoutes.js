const express                                    = require('express');
var routes                                       = express.Router();
const path                                       = require('path');
const Order                                      = require('../controller/Order')
const { handleResponse, handleController }                         = require('../utils/utilities');
const { validation }                             = require('../utils/utilities')
const {checkAuthorization, checkCommonUserAuthentication}  = require('../middleware/Authorization');
const createMulterMiddleware = require('../utils/imageUpload')

const imageUploadMiddleware = createMulterMiddleware([
    { fieldName: 'complaint_image', uploadPath: './uploads/buyer/order/complaint_images', maxCount: 10 },
    { fieldName: 'feedback_image', uploadPath: './uploads/buyer/order/feedback_images', maxCount: 10 },
]);

module.exports = () => {

    routes.post('/create-order', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.createOrder, req, res));

    routes.post('/book-logistics', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.bookLogistics, req, res));

    routes.post('/submit-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.submitPickupDetails, req, res));

    routes.post('/buyer-order-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.buyerOrdersList, req, res));
    
    routes.post('/get-all-order-list', checkAuthorization, checkCommonUserAuthentication, Order?.getOrderListAllUsers);
    
    routes.post('/get-order-list-csv', checkAuthorization, checkCommonUserAuthentication, Order?.getOrderListCSV);

    routes.post('/order-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.buyerOrderDetails, req, res));

    routes.post('/get-specific-order-details/:id', checkAuthorization, checkCommonUserAuthentication, Order?.getSpecificOrderDetails);

    routes.post('/cancel-order', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.cancelOrder, req, res));

    routes.post('/submit-order-feedback', checkAuthorization, checkCommonUserAuthentication, imageUploadMiddleware, (req, res) => {

        if (!req.files['feedback_image'] || req.files['feedback_image'].length === 0) {
            res.send({ code: 415, message: 'Feedback Image is required!', errObj: {} });
            return;
        }

        let obj = {
            ...req.body,
            feedback_image: req.files['feedback_image'].map(file => path.basename(file.path))
        }

        handleController(Order.orderFeedback, req, res, obj)
    });

    routes.post('/submit-order-complaint', checkAuthorization, checkCommonUserAuthentication, imageUploadMiddleware, (req, res) => {

        if (!req.files['complaint_image'] || req.files['complaint_image'].length === 0) {
            res.send({ code: 415, message: 'Complaint Image is required!', errObj: {} });
            return;
        }

        let obj = {
            ...req.body,
            complaint_image: req.files['complaint_image'].map(file => path.basename(file.path))
        }

        handleController(Order.orderComplaint, req, res, obj)
    });

    routes.post('/buyer-invoice-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.buyerInvoicesList, req, res));

    routes.post('/invoice-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.buyerInvoiceDetails, req, res));

    routes.post('/supplier-order-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.supplierOrdersList, req, res));

    routes.post('/supplier-order-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.supplierOrderDetails, req, res));

    routes.post('/supplier-invoice-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.supplierInvoicesList, req, res));

    routes.post('/get-all-invoice-list', checkAuthorization, checkCommonUserAuthentication, Order.getInvoiceListForAllUsers);

    routes.post('/proforma-invoice-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController( Order.proformaInvoiceList, req, res));

    routes.post('/sales-filter', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Order.orderSalesFilterList, req, res));

    return routes;
}