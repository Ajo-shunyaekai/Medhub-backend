const express                                    = require('express');
let routes                                       = express.Router();
const path                                       = require('path');
const Controller                                 = require('../controller/Buyer')
const { handleResponse, handleController }                         = require('../utils/utilities');
const {validation}                               = require('../utils/utilities')
const {checkAuthorization, checkCommonUserAuthentication }  = require('../middleware/Authorization');
const createMulterMiddleware = require('../utils/imageUpload')


const buyerUploadMiddleware = createMulterMiddleware([
    { fieldName: 'buyer_image', uploadPath: './uploads/buyer/buyer_images', maxCount: 1 },
    { fieldName: 'tax_image', uploadPath: './uploads/buyer/tax_images', maxCount: 10 },
    { fieldName: 'license_image', uploadPath: './uploads/buyer/license_images', maxCount: 10 },
    { fieldName: 'certificate_image', uploadPath: './uploads/buyer/certificate_images', maxCount: 10 },
]);

module.exports = () => {

    routes.post('/register', checkAuthorization, buyerUploadMiddleware, async (req, res) => {
        if (!req.files['buyer_image'] || req.files['buyer_image'].length === 0) {
            res.send({ code: 415, message: 'Company Logo is required!', errObj: {} });
            return;
        }
        if (!req.files['tax_image'] || req.files['tax_image'].length === 0) {
            res.send({ code: 415, message: 'Company tax image is required!', errObj: {} });
            return;
        }
        if (!req.files['license_image'] || req.files['license_image'].length === 0) {
            res.send({ code: 415, message: 'Company license image is required!', errObj: {} });
            return;
        }
        if (!req.files['certificate_image'] || req.files['certificate_image'].length === 0) {
            res.send({ code: 415, message: 'Company certificate image is required!', errObj: {} });
            return;
        }

        const buyerCountryCode    = req.body.buyer_mobile.split(" ")[0]; 
        const buyer_mobile_number = req.body.buyer_mobile.split(" ").slice(1).join(" ")
        const person_mob_no       = req.body.contact_person_mobile.split(" ").slice(1).join(" ")
        const personCountryCode   = req.body.contact_person_mobile.split(" ")[0]; 

        const regObj = {
            ...req.body,
            buyer_mobile                : buyer_mobile_number,
            buyer_country_code          : buyerCountryCode,
            contact_person_mobile       : person_mob_no,
            contact_person_country_code : personCountryCode,
            buyer_image                 : req.files['buyer_image'].map(file => path.basename(file.path)),
            license_image               : req.files['license_image'].map(file => path.basename(file.path)),
            tax_image                   : req.files['tax_image'].map(file => path.basename(file.path)),
            certificate_image           : req.files['certificate_image'].map(file => path.basename(file.path))
            // mobile             : number,
        }
        const errObj = validation(regObj, 'buyerRegister')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        
        handleController(Controller.Regsiter, req, res, regObj)
    });

    routes.post('/login', checkAuthorization, (req, res) => {
        const errObj = validation(req.body, 'Login')
        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }

        handleController(Controller.Login, req, res)
    });

    routes.post('/edit-profile-request', checkAuthorization, checkCommonUserAuthentication, buyerUploadMiddleware, (req, res) => {
        if (!req.files['buyer_image'] || req.files['buyer_image'].length === 0) {
            res.send({ code: 415, message: 'Buyer Logo is required!', errObj: {} });
            return;
        }
        if (!req.files['tax_image'] || req.files['tax_image'].length === 0) {
            res.send({ code: 415, message: 'Buyer tax image is required!', errObj: {} });
            return;
        }
        if (!req.files['license_image'] || req.files['license_image'].length === 0) {
            res.send({ code: 415, message: 'Buyer license image is required!', errObj: {} });
            return;
        }

        const buyerCountryCode    = req.body.buyer_mobile.split(" ")[0]; 
        const buyer_mobile_number = req.body.buyer_mobile.split(" ").slice(1).join(" ")
        const person_mob_no       = req.body.contact_person_mobile.split(" ").slice(1).join(" ")
        const personCountryCode   = req.body.contact_person_mobile.split(" ")[0]; 

        const regObj = {
            ...req.body,
            buyer_mobile                : buyer_mobile_number,
            buyer_country_code          : buyerCountryCode,
            contact_person_mobile       : person_mob_no,
            contact_person_country_code : personCountryCode,
            buyer_image                 : req.files['buyer_image'].map(file => path.basename(file.path)),
            license_image               : req.files['license_image'].map(file => path.basename(file.path)),
            tax_image                   : req.files['tax_image'].map(file => path.basename(file.path))
        }

        const errObj = validation(regObj, 'editBuyer')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }

        handleController(Controller.EditProfile, req, res, regObj)
    });

    routes.post('/get-specific-buyer-details/:id', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.buyerProfileDetails, req, res));
    
    // routes.post('/profile-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.buyerProfileDetails(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/profile-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.buyerProfileDetails, req, res));

    // routes.post('/supplier-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.supplierList(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/supplier-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supplierList, req, res));

    // routes.post('/my-supplier-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.mySupplierList(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/my-supplier-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.mySupplierList, req, res));

    // routes.post('/supplier-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.supplierDetails(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/supplier-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supplierDetails, req, res));

    // routes.post('/supplier-product-list', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
    //     Controller.supplierProductList(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/supplier-product-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supplierProductList, req, res));

    // routes.post('/buyer-supplier-orders', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        
    //     Controller.buyerSupplierOrdersList(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/buyer-supplier-orders', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.buyerSupplierOrdersList, req, res));

    // routes.post('/orders-summary-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        
    //     Controller.buyerDashboardOrderDetails(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/orders-summary-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.buyerDashboardOrderDetails, req, res));

    // routes.post('/orders-seller-country', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        
    //     Controller.buyerOrderSellerCountry(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/orders-seller-country', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.buyerOrderSellerCountry, req, res));

    // routes.post('/support-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.supportList(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/support-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supportList, req, res));

    // routes.post('/support-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.supportDetails(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/support-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.supportDetails, req, res));

    //---------------------------------- add-to-list ---------------------------------//
    // routes.post('/add-to-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.addToList(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/add-to-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.addToList, req, res));

    // routes.post('/show-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.showList(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/show-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.showList, req, res));

    // routes.post('/delete-list-item', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.deleteListItem(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/delete-list-item', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.deleteListItem, req, res));

    // routes.post('/send-enquiry', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.sendEnquiry(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/send-enquiry', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.sendEnquiry, req, res));

    // routes.post('/get-notification-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.getNotificationList(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/get-notification-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getNotificationList, req, res));

    // routes.post('/get-notification-details-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.getNotificationDetailsList(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/get-notification-details-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getNotificationDetailsList, req, res));

    // routes.post('/update-notification-status', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.updateStatus(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/update-notification-status', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.updateStatus, req, res));

    // routes.post('/get-invoice-count', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.getInvoiceCount(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });
    routes.post('/get-invoice-count', checkAuthorization, checkCommonUserAuthentication, (req, res) => handleController(Controller.getInvoiceCount, req, res));

    return routes;

}