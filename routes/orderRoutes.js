const express                                    = require('express');
var routes                                       = express.Router();
const multer                                     = require('multer')
const sharp                                      = require('sharp')
const path                                       = require('path');
const Order                                      = require('../controller/Order')
const { handleResponse }                         = require('../utils/utilities');
const { validation }                             = require('../utils/utilities')
const {checkAuthorization, checkCommonUserAuthentication}  = require('../middleware/Authorization');
const createMulterMiddleware = require('../utils/Multer')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = './uploads/buyer/order/complaint_images';
        if (file.fieldname === 'complaint_image') {
            uploadPath = './uploads/buyer/order/complaint_images';
        } else if (file.fieldname === 'feedback_image') {
            uploadPath = './uploads/buyer/order/feedback_images';
        }
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
        { name: 'complaint_image' },
        { name: 'feedback_image'},
    ])(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            res.status(500).json({ error: 'File upload error' });
            return;
        }
        next();
    });
};

const imageUploadMiddleware = createMulterMiddleware([
    { fieldName: 'complaint_image', uploadPath: './uploads/buyer/order/complaint_images' },
    { fieldName: 'feedback_image', uploadPath: './uploads/buyer/order/feedback_images' },
    // { fieldName: 'license_image', uploadPath: './uploads/buyer/license_images' },
    // { fieldName: 'certificate_image', uploadPath: './uploads/buyer/certificate_images' },
]);


module.exports = () => {
    
    routes.post('/create-order', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {

        // let errObj = validation(req.body, 'orderRequest');
    
        // if (Object.values(errObj).length) {
        //     res.send({ code: 422, message: 'All fields are required', errObj });
        //     return;
        // }
            Order.createOrder(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/book-logistics', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
            Order.bookLogistics(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/submit-details', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
        Order.submitPickupDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
});

    routes.post('/buyer-order-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

            Order.buyerOrdersList(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/order-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

            Order.buyerOrderDetails(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/cancel-order', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

        // let errObj = validation(obj,'cancelOrder');
    
        // if (Object.values(errObj).length) {
        //     res.send({ code: 422, message: 'All fields are required', errObj });
        //     return;
        // }

        Order.cancelOrder(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/submit-order-feedback', checkAuthorization, checkCommonUserAuthentication, imageUploadMiddleware, (req, res) => {

        if (!req.files['feedback_image'] || req.files['feedback_image'].length === 0) {
            res.send({ code: 415, message: 'Feedback Image is required!', errObj: {} });
            return;
        }

        let obj = {
            ...req.body,
            feedback_image: req.files['feedback_image'].map(file => path.basename(file.path))
        }
        Order.orderFeedback(obj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
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
        Order.orderComplaint(obj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/buyer-invoice-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

        Order.buyerInvoicesList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/invoice-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

        Order.buyerInvoiceDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });


    //------------------------------------------------------ supplier order ------------------------------------------------------//
    routes.post('/supplier-order-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

        Order.supplierOrdersList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/supplier-order-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

        Order.supplierOrderDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });  
    });

    // routes.post('/proforma-invoice-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

    //     Order.supplierInvoicesList(req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });

    routes.post('/supplier-invoice-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

        Order.supplierInvoicesList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

     //------------------------------------------------------ supplier order ------------------------------------------------------//
     
     routes.post('/proforma-invoice-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {

        Order.proformaInvoiceList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });


    routes.post('/sales-filter', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Order.orderSalesFilterList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });


    return routes;
}