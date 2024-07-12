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

    routes.post('/add-medicine', checkAuthorization, checkSupplierAuthentication, cpUpload, (req, res) => {
        

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

    // routes.post('/filter', checkAuthorization, (req, res) => {
    //     Controller.filterMedicine(req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });

    
    
    return routes;
}
