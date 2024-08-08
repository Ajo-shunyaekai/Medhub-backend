const express             = require('express');
var routes                = express.Router();
const multer              = require('multer')
const sharp               = require('sharp')
const path                = require('path');
const Controller             = require('../controller/purchaseOrder')
const { handleResponse }  = require('../utils/utilities');
const { validation }      = require('../utils/utilities')
const {checkAuthorization, checkBuyerAuthentication, commonAuthentication, checkSupplierAuthentication}  = require('../middleware/Authorization');

module.exports = () => {
    
    routes.post('/create-po', checkAuthorization, commonAuthentication,(req, res) => {
            Controller.createPO(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/get-po-list', checkAuthorization, commonAuthentication,(req, res) => {
        Controller.getPOList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-po-details', checkAuthorization, commonAuthentication,(req, res) => {
        Controller.getPODetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/edit-po', checkAuthorization, commonAuthentication,(req, res) => {
        Controller.editPO(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
});

    

    return routes
}

