const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Supplier')
const path                                       = require('path');
const multer                                     = require('multer')
const sharp                                      = require('sharp')
const { handleResponse }                         = require('../utils/utilities');
const {validation}                               = require('../utils/utilities')
const {checkAuthorization, checkAuthentication, checkCommonUserAuthentication}  = require('../middleware/Authorization');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = './uploads/supplier/supplierImage_files';
        if (file.fieldname === 'tax_image') {
            uploadPath = './uploads/supplier/tax_image';
        } else if (file.fieldname === 'license_image') {
            uploadPath = './uploads/supplier/license_image';
        }else if (file.fieldname === 'certificate_image') {
            uploadPath = './uploads/supplier/certificate_image';
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
        { name: 'supplier_image', maxCount: 1 },
        { name: 'license_image' },
        { name: 'tax_image'},
        { name: 'certificate_image' },
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
        if (!req.files['supplier_image'] || req.files['supplier_image'].length === 0) {
            res.send({ code: 415, message: 'Supplier Logo is required!', errObj: {} });
            return;
        }
        if (!req.files['tax_image'] || req.files['tax_image'].length === 0) {
            res.send({ code: 415, message: 'Supplier tax image is required!', errObj: {} });
            return;
        }
        if (!req.files['license_image'] || req.files['license_image'].length === 0) {
            res.send({ code: 415, message: 'Supplier license image is required!', errObj: {} });
            return;
        }

        if (!req.files['certificate_image'] || req.files['certificate_image'].length === 0) {
            res.send({ code: 415, message: 'Supplier Certificate image is required!', errObj: {} });
            return;
        }

        const supplierCountryCode    = req.body.supplier_mobile_no.split(" ")[0]; 
        const supplier_mobile_number = req.body.supplier_mobile_no.split(" ").slice(1).join(" ")
        const person_mob_no          = req.body.contact_person_mobile.split(" ").slice(1).join(" ")
        const personCountryCode      = req.body.contact_person_mobile.split(" ")[0]; 
       

        // return false
        const regObj = {
            ...req.body,
            supplier_mobile             : supplier_mobile_number,
            supplier_country_code       : supplierCountryCode,
            contact_person_mobile_no    : person_mob_no,
            contact_person_country_code : personCountryCode,
            supplier_image              : req.files['supplier_image'].map(file => path.basename(file.path)),
            license_image               : req.files['license_image'].map(file => path.basename(file.path)),
            tax_image                   : req.files['tax_image'].map(file => path.basename(file.path)),
            certificate_image           : req.files['certificate_image'].map(file => path.basename(file.path))
        }

        const errObj = validation(regObj, 'supplierRegister')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        
        Controller.register(regObj, result => {
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

        Controller.login(req.body, result => {
            let randomNumber   = Math.random().toString();
            randomNumber       = randomNumber.substring(2, randomNumber.length);
            res.cookie('userCookie', randomNumber, { maxAge: 900000, httpOnly: true });

            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-filter-values', checkAuthorization, (req, res) => {
        Controller.filterValues(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/edit-supplier-request', checkAuthorization, checkCommonUserAuthentication, cpUpload, async(req, res) => {

        if (!req.files['supplier_image'] || req.files['supplier_image'].length === 0) {
            res.send({ code: 415, message: 'Supplier Logo is required!', errObj: {} });
            return;
        }
        if (!req.files['tax_image'] || req.files['tax_image'].length === 0) {
            res.send({ code: 415, message: 'Supplier tax image is required!', errObj: {} });
            return;
        }
        if (!req.files['license_image'] || req.files['license_image'].length === 0) {
            res.send({ code: 415, message: 'Supplier license image is required!', errObj: {} });
            return;
        }

        const supplierCountryCode     = req.body.supplier_mobile_no.split(" ")[0]; 
        const supplier_mobile_number  = req.body.supplier_mobile_no.split(" ").slice(1).join(" ")
        const person_mob_no           = req.body.contact_person_mobile.split(" ").slice(1).join(" ")
        const personCountryCode       = req.body.contact_person_mobile.split(" ")[0]; 
        
        const editObj = {
            ...req.body,
            supplier_mobile             : supplier_mobile_number,
            supplier_country_code       : supplierCountryCode,
            contact_person_mobile_no    : person_mob_no,
            contact_person_country_code : personCountryCode,
            supplier_image              : req.files['supplier_image'].map(file => path.basename(file.path)),
            license_image               : req.files['license_image'].map(file => path.basename(file.path)),
            tax_image                   : req.files['tax_image'].map(file => path.basename(file.path))
        }
        
        const errObj = validation(editObj, 'supplierEdit')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        
        Controller.editSupplier(editObj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-supplier-details/:id', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.supplierProfileDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    })

    routes.post('/profile-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.supplierProfileDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/buyer-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.buyerDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/change-password', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.changePassword(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/orders-summary-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        
        Controller.supplierDashboardOrderDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/orders-buyer-country', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        
        Controller.supplierOrderSupplierCountry(req.body, result => {
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


    routes.post('/medicine-request-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.medicinRequestList(req.body, result => {
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
    
   return routes
}