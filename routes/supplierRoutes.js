const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Supplier')
const path                                       = require('path');
const multer                                     = require('multer')
const sharp                                      = require('sharp')
const { handleResponse }                         = require('../utils/utilities');
const {validation}                               = require('../utils/utilities')
const {checkAuthorization, checkAuthentication, checkSupplierAuthentication}  = require('../middleware/Authorization');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//         //     return cb( new Error('Please upload a valid image file'))
//         //     }
//         cb(null, './uploads/supplier/supplierImage_files');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split("/")[1];
//         cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
//     },
// });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = './uploads/supplier/supplierImage_files';
        if (file.fieldname === 'tax_image') {
            uploadPath = './uploads/supplier/tax_image';
        } else if (file.fieldname === 'license_image') {
            uploadPath = './uploads/supplier/license_image';
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

        // const countryCode  = req.body.mobile_no.split(" ")[0]; 
        // const mob_number   = req.body.mobile_no.split(" ").slice(1).join(" ")

        // const regObj = {
        //     ...req.body,
        //     country_code   : countryCode,
        //     supplier_image : req.files['supplier_image'].map(file => path.basename(file.path))
        // }
        const supplierCountryCode     = req.body.supplier_mobile_no.split(" ")[0]; 
        const supplier_mobile_number  = req.body.supplier_mobile_no.split(" ").slice(1).join(" ")
        const person_mob_no           = req.body.contact_person_mobile.split(" ").slice(1).join(" ")
        const personCountryCode       = req.body.contact_person_mobile.split(" ")[0]; 
        
        const regObj = {
            ...req.body,
            supplier_mobile             : supplier_mobile_number,
            supplier_country_code       : supplierCountryCode,
            contact_person_mobile_no    : person_mob_no,
            contact_person_country_code : personCountryCode,
            supplier_image              : req.files['supplier_image'].map(file => path.basename(file.path)),
            license_image               : req.files['license_image'].map(file => path.basename(file.path)),
            tax_image                   : req.files['tax_image'].map(file => path.basename(file.path))
            // mobile             : number,
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

    routes.post('/edit-supplier', checkAuthorization, checkSupplierAuthentication, cpUpload, (req, res) => {

        if (!req.files['supplier_image'] || req.files['supplier_image'].length === 0) {
            res.send({ code: 415, message: 'Supplier Logo is required!', errObj: {} });
            return;
        }

        const countryCode = req.body.mobile_no.split(" ")[0]; 
        const mob_number  = req.body.mobile_no.split(" ").slice(1).join(" ")

        const reqObj = {
            ...req.body,
            country_code   : countryCode,
            mobile_no      : mob_number,
            supplier_image : req.files['supplier_image'].map(file => path.basename(file.path))
        }
        console.log(reqObj);
        Controller.editSupplier(reqObj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });
    
   return routes
}