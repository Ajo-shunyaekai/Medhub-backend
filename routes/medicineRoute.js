const express                                    = require('express');
var routes                                       = express.Router();
const path                                       = require('path');
const multer                                     = require('multer')
const Controller                                 = require('../controller/Medicine')
const { handleResponse }                         = require('../utils/utilities');
const {validation}                               = require('../utils/utilities')
const {imageUpload}                              = require('../utils/imageUpload')
const {checkAuthorization, checkAuthentication, checkCommonUserAuthentication}  = require('../middleware/Authorization');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = './uploads/medicine/product_files';
        if (file.fieldname === 'invoice_image') {
            uploadPath = './uploads/medicine/invoice_image';
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
        { name: 'product_image'},
        { name: 'invoice_image'}
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
    routes.post('/get-medicine-by-name', checkAuthorization, (req, res) => {
        Controller.getMedicineByName(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/add-medicine', checkAuthorization, checkCommonUserAuthentication, cpUpload, (req, res) => {

        if (!req.files['product_image'] || req.files['product_image'].length === 0) {
            res.send({ code: 415, message: 'Products Images fields are required!', errObj: {} });
            return;
        }
        const tags = req.body.tags.split(',');
    
        let obj = {
            ...req.body,
            tags : tags,
            medicine_image: req.files['product_image'].map(file => path.basename(file.path))
        }

        if(req.body.product_type === 'secondary market') {
            if (!req.files['invoice_image'] || req.files['invoice_image'].length === 0) {
                res.send({ code: 415, message: 'Invoice Images fields are required for secondary market!', errObj: {} });
                return;
            }
            obj.invoice_image = req.files['invoice_image'].map(file => path.basename(file.path));
        }
    
        if(obj.product_type === 'new') {
            let errObj = validation(obj, 'addNewProduct');
    
        if (Object.values(errObj).length) {
            res.send({ code: 422, message: 'All fields are required', errObj });
            return;
        }
        } else if(obj.product_type === 'secondary market') {
            let errObj = validation(obj, 'addSecondaryProduct');
    
            if (Object.values(errObj).length) {
                res.send({ code: 422, message: 'All fields are required', errObj });
                return;
            }
        }
        
        Controller.addMedicine(obj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/medicine-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.allMedicineList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/medicine-details', checkAuthorization, (req, res) => {
        Controller.getMedicineDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/edit-medicine', checkAuthorization, checkCommonUserAuthentication, cpUpload, (req, res) => {
        let allProductImages = [];
        let allInvoiceImages = [];
    
        if (typeof req.body.product_image === 'string') {
            allProductImages = [req.body.product_image];
        } else if (Array.isArray(req.body.product_image)) {
            allProductImages = [...req.body.product_image];
        }

        if (req.files['product_image']) {
            const newProductImages = req.files['product_image'].map(file => path.basename(file.path));
            allProductImages = [...allProductImages, ...newProductImages];
        }
        req.body.medicine_image = allProductImages;
    
        if (req.body.product_type === 'secondary market') {
            if (typeof req.body.invoice_image === 'string') {
                allInvoiceImages = [req.body.invoice_image];
            } else if (Array.isArray(req.body.invoice_image)) {
                allInvoiceImages = [...req.body.invoice_image];
            }

            if (req.files['invoice_image']) {
                const newInvoiceImages = req.files['invoice_image'].map(file => path.basename(file.path));
                allInvoiceImages = [...allInvoiceImages, ...newInvoiceImages];
            }
            req.body.invoice_image = allInvoiceImages;
        }

        let errObj = validation(req.body, 'editProduct');
    
        if (Object.values(errObj).length) {
            res.send({ code: 422, message: 'All fields are required', errObj });
            return;
        }
    
        Controller.editMedicine(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });
    
    
    routes.post('/medicine-edit-req-list', checkAuthorization, (req, res) => {
       
        Controller.medicineEditList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/filter', checkAuthorization, (req, res) => {
        Controller.filterMedicine(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/similar-medicine-list', checkAuthorization, (req, res) => {
       
        Controller.similarMedicineList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/other-medicine-list', checkAuthorization, (req, res) => {
       
        Controller.otherMedicineList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });
 
    return routes;
}