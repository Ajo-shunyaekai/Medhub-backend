const express                                    = require('express');
var routes                                       = express.Router();
const path                                       = require('path');
const Controller                                 = require('../controller/Order')
const Invoice                                    = require('../controller/Invoice')
const { handleResponse }                         = require('../utils/utilities');
const { validation }                             = require('../utils/utilities')
const {checkAuthorization, checkCommonUserAuthentication, }  = require('../middleware/Authorization');
const createMulterMiddleware = require('../utils/imageUpload')


const imageUploadMiddleware = createMulterMiddleware([
    { fieldName: 'transaction_image', uploadPath: './uploads/buyer/order/invoice_images', maxCount: 10 },
]);


module.exports = () => {
    
    routes.post('/create-invoice', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
        // let errObj = validation(req.body, 'orderRequest');
    
        // if (Object.values(errObj).length) {
        //     res.send({ code: 422, message: 'All fields are required', errObj });
        //     return;
        // }
            Invoice.createInvoice(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/update-payment-status', checkAuthorization, checkCommonUserAuthentication, imageUploadMiddleware, async(req, res) => {
        if (!req.files['transaction_image'] || req.files['transaction_image'].length === 0) {
            res.send({ code: 415, message: 'Transaction Image field is required!', errObj: {} });
            return;
        }
    
        let obj = {
            ...req.body,
            transaction_image: req.files['transaction_image'].map(file => path.basename(file.path))
        }
        
        Invoice.updatePaymentStatus(obj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    // routes.post('/submit-details', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
    //     Order.submitPickupDetails(req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });

    routes.post('/invoice-details', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
            Invoice.invoiceDetails(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });
    
    routes.get('/get-specific-invoice-details/:id', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
            Invoice.invoiceDetails(req, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });
 


    return routes;
}