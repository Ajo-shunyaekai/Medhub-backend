const express                                    = require('express');
var routes                                       = express.Router();
const path                                       = require('path');
const multer                                     = require('multer')
const Controller                                 = require('../controller/Medicine')
const { handleResponse }                         = require('../utils/utilities');
const {validation}                               = require('../utils/utilities')
const {imageUpload}                              = require('../utils/imageUpload')
const {checkAuthorization, checkAuthentication, checkSupplierAuthentication, checkSellerAuthentication}  = require('../middleware/Authorization');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/medicine/product_files');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const upload = multer({ storage: storage });

const cpUpload = (req, res, next) => {
    upload.fields([
        { name: 'product_image', maxCount: 4 },
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

    routes.post('/add-medicine', checkAuthorization, checkSupplierAuthentication, cpUpload, (req, res) => {
        
        if (!req.files['product_image'] || req.files['product_image'].length === 0) {
            res.send({ code: 415, message: 'Products Images fields are required!', errObj: {} });
            return;
        }
    
        let obj = {
            ...req.body,
            medicine_image: req.files['product_image'].map(file => path.basename(file.path))
        }
    
        let errObj = validation(obj, 'addProduct');
    
        if (Object.values(errObj).length) {
            res.send({ code: 422, message: 'All fields are required', errObj });
            return;
        }
    
        Controller.addMedicine(obj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/medicine-list', checkAuthorization, (req, res) => {
       
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

    routes.post('/edit-medicine', checkAuthorization, checkSupplierAuthentication, cpUpload, (req, res) => {
      
        if (!req.files['product_image'] || req.files['product_image'].length === 0) {
            res.send({ code: 415, message: 'Medicine Images fields are required!', errObj: {} });
            return;
        }
    
        let obj = {
            ...req.body,
            medicine_image: req.files['product_image'].map(file => file.path).join(',')
        }
    
        let errObj = validation(obj, 'editProduct');
    
        if (Object.values(errObj).length) {
            res.send({ code: 422, message: 'All fields are required', errObj });
            return;
        }
    
        Controller.editMedicine(obj, result => {
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

    // routes.post('/filter', checkAuthorization, (req, res) => {
    //     Controller.filterMedicine(req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });

    
    
    return routes;
}
