const express                                    = require('express');
var routes                                       = express.Router();
const path                                       = require('path');
const Controller                                 = require('../controller/Order')
const Invoice                                    = require('../controller/Invoice')
const { handleResponse, handleController }                         = require('../utils/utilities');
const { validation }                             = require('../utils/utilities')
const {checkAuthorization, checkCommonUserAuthentication, }  = require('../middleware/Authorization');
const createMulterMiddleware = require('../utils/imageUpload')


const imageUploadMiddleware = createMulterMiddleware([
    { fieldName: 'transaction_image', uploadPath: './uploads/buyer/order/invoice_images', maxCount: 10 },
]);


module.exports = () => {
    
    // routes.post('/create-invoice', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
    //     // let errObj = validation(req.body, 'orderRequest');
    
    //     // if (Object.values(errObj).length) {
    //     //     res.send({ code: 422, message: 'All fields are required', errObj });
    //     //     return;
    //     // }
    //         Invoice.createInvoice(req, req.body, result => {
    //             const response = handleResponse(result);
    //             res.send(response);
    //         });
    // });
    routes.post('/create-invoice', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Invoice.createInvoice, req, res));

    // routes.post('/update-payment-status', checkAuthorization, checkCommonUserAuthentication, imageUploadMiddleware, async(req, res) => {
    //     if (!req.files['transaction_image'] || req.files['transaction_image'].length === 0) {
    //         res.send({ code: 415, message: 'Transaction Image field is required!', errObj: {} });
    //         return;
    //     }
    
    //     let obj = {
    //         ...req.body,
    //         transaction_image: req.files['transaction_image'].map(file => path.basename(file.path))
    //     }
        
    //     Invoice.updatePaymentStatus(req, obj, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/update-payment-status', checkAuthorization, checkCommonUserAuthentication, imageUploadMiddleware, async(req, res) => {
        if (!req.files['transaction_image'] || req.files['transaction_image'].length === 0) {
            res.send({ code: 415, message: 'Transaction Image field is required!', errObj: {} });
            return;
        }
    
        let obj = {
            ...req.body,
            transaction_image: req.files['transaction_image'].map(file => path.basename(file.path))
        }
       handleController(Invoice.updatePaymentStatus, req, res, obj)
    });

    // routes.post('/invoice-details', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
    //         Invoice.invoiceDetails(req, req.body, result => {
    //             const response = handleResponse(result);
    //             res.send(response);
    //         });
    // });
    routes.post('/invoice-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Invoice.invoiceDetails, req, res));
    
    // routes.post('/get-specific-invoice-details/:id', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
    //         Invoice.invoiceDetails(req, req.body, result => {
    //             const response = handleResponse(result);
    //             res.send(response);
    // });
    routes.post('/get-specific-invoice-details/:id', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Invoice.invoiceDetails, req, res));
 


    return routes;
}