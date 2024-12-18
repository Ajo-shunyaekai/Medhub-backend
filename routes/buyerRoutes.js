const express                                    = require('express');
let routes                                       = express.Router();
const multer                                     = require('multer')
const sharp                                      = require('sharp')
const path                                       = require('path');
const Controller                                 = require('../controller/Buyer')
const { handleResponse }                         = require('../utils/utilities');
const {validation}                               = require('../utils/utilities')
const {imageUpload}                              = require('../utils/imageUpload')
const {checkAuthorization, checkCommonUserAuthentication }  = require('../middleware/Authorization');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = './uploads/buyer/buyer_images';
        if (file.fieldname === 'tax_image') {
            uploadPath = './uploads/buyer/tax_images';
        } else if (file.fieldname === 'license_image') {
            uploadPath = './uploads/buyer/license_images';
        } else if (file.fieldname === 'certificate_image') {
            uploadPath = './uploads/buyer/certificate_images';
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
        { name: 'buyer_image'},
        { name: 'license_image'},
        { name: 'tax_image'},
        { name: 'certificate_image'},
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

    routes.post('/register', checkAuthorization, cpUpload, async(req, res) => {
      
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

        console.log(regObj);
        
        Controller.Regsiter(regObj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/login', checkAuthorization, (req, res) => {
        const errObj = validation(req.body, 'Login')
        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }

        Controller.Login(req.body, result => {
            let randomNumber   = Math.random().toString();
            randomNumber       = randomNumber.substring(2, randomNumber.length);
            res.cookie('userCookie', randomNumber, { maxAge: 900000, httpOnly: true });

            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/edit-profile-request', checkAuthorization, checkCommonUserAuthentication, cpUpload, (req, res) => {

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
        // const countryCode  = req.body.mobile_no.split(" ")[0]; 
        // const number       = req.body.mobile_no.split(" ").slice(1).join(" ")
        
        // const obj = {
        //     ...req.body,
        //     mobile: number,
        //     countryCode
        // }
        // console.log('obj',obj);

        Controller.EditProfile(regObj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/profile-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.buyerProfileDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/supplier-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.supplierList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/my-supplier-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.mySupplierList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/supplier-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.supplierDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/supplier-product-list', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
        Controller.supplierProductList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/buyer-supplier-orders', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        
        Controller.buyerSupplierOrdersList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/orders-summary-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        
        Controller.buyerDashboardOrderDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/orders-seller-country', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        
        Controller.buyerOrderSellerCountry(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/support-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.supportList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/support-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.supportDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    //---------------------------------- add-to-list ---------------------------------//
    routes.post('/add-to-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.addToList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/show-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.showList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/delete-list-item', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.deleteListItem(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/send-enquiry', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.sendEnquiry(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-notification-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getNotificationList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-notification-details-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getNotificationDetailsList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/update-notification-status', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.updateStatus(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-invoice-count', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getInvoiceCount(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    // routes.post('/enquiry-list', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {

    //     Controller.getEnquiryList(req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    //  });

    // routes.post('/enquiry-details', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {

    //     Controller.getEnquiryDetails(req.body, result => {
    //             const response = handleResponse(result);
    //             res.send(response);
    //         });
    // });

    return routes;

}