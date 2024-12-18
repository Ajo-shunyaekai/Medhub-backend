const express                                    = require('express');
var routes                                       = express.Router();
const multer                                     = require('multer')
const sharp                                      = require('sharp')
const path                                       = require('path');
const Controller                                 = require('../controller/Order')
const Invoice                                    = require('../controller/Invoice')
const { handleResponse }                         = require('../utils/utilities');
const { validation }                             = require('../utils/utilities')
const {checkAuthorization, checkCommonUserAuthentication, }  = require('../middleware/Authorization');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = './uploads/buyer/order/invoice_images';
        if (file.fieldname === 'transaction_image') {
            uploadPath = './uploads/buyer/order/invoice_images';
        }
        //  else if (file.fieldname === 'feedback_image') {
        //     uploadPath = './uploads/buyer/order/feedback_images';
        // }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const upload = multer({ storage: storage });

const cpUpload = (req, res, next) => {
    upload.fields([
        { name: 'transaction_image' },
        // { name: 'feedback_image'},
    ])(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            res.status(500).json({ error: 'File upload error' });
            return;
        }
        next();
    });
};


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

    routes.post('/update-payment-status', checkAuthorization, checkCommonUserAuthentication, cpUpload, async(req, res) => {
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
 


    return routes;
}