const express                                    = require('express');
let routes                                       = express.Router();
const multer                                     = require('multer')
const sharp                                      = require('sharp')
const path                                       = require('path');
const Controller                                 = require('../controller/Buyer')
const { handleResponse }                         = require('../utils/utilities');
const {validation}                               = require('../utils/utilities')
const {imageUpload}                              = require('../utils/imageUpload')

const {checkAuthorization, checkBuyerAuthentication}  = require('../middleware/Authorization');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = './uploads/buyer/buyer_images';
        if (file.fieldname === 'tax_image') {
            uploadPath = './uploads/buyer/tax_images';
        } else if (file.fieldname === 'license_image') {
            uploadPath = './uploads/buyer/license_images';
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
        { name: 'buyer_image', maxCount: 1 },
        { name: 'license_image', maxCount: 1 },
        { name: 'tax_image', maxCount: 1 },
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

    routes.post('/register', checkAuthorization, cpUpload, (req, res) => {
      
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
            // mobile             : number,
        }
        const errObj = validation(regObj, 'buyerRegister')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        
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

    routes.post('/edit-profile', checkAuthorization, checkBuyerAuthentication, (req, res) => {
        const errObj = validation(req.body, 'editBuyer')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        const countryCode  = req.body.mobile_no.split(" ")[0]; 
        const number       = req.body.mobile_no.split(" ").slice(1).join(" ")
        
        const obj = {
            ...req.body,
            mobile: number,
            countryCode
        }
        console.log('obj',obj);

        Controller.EditProfile(obj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/profile-details', checkAuthorization, checkBuyerAuthentication, (req, res) => {
        Controller.buyerProfileDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/supplier-list', checkAuthorization, checkBuyerAuthentication, (req, res) => {
        Controller.supplierList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/supplier-details', checkAuthorization, checkBuyerAuthentication, (req, res) => {
        Controller.supplierDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/buyer-supplier-orders', checkAuthorization, checkBuyerAuthentication, (req, res) => {
        
        Controller.buyerSupplierOrdersList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/orders-summary-details', checkAuthorization, checkBuyerAuthentication, (req, res) => {
        
        Controller.buyerDashboardOrderDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/orders-seller-country', checkAuthorization, checkBuyerAuthentication, (req, res) => {
        
        Controller.buyerOrderSellerCountry(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    return routes;

}