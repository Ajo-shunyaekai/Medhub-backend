const express             = require('express');
var routes                = express.Router();
const multer              = require('multer')
const sharp               = require('sharp')
const path                = require('path');
const Controller             = require('../controller/purchaseOrder')
const { handleResponse }  = require('../utils/utilities');
const { validation }      = require('../utils/utilities')
const {checkAuthorization, checkCommonUserAuthentication}  = require('../middleware/Authorization');

module.exports = () => {
    
    routes.post('/create-po', checkAuthorization, checkCommonUserAuthentication,(req, res) => {
        const { supplierMobile, buyerMobile } = req.body.data;
        const countryCodeRegex = /^\+\d+/;

        const supplierCountryCode = supplierMobile.match(countryCodeRegex)[0];
        const supplierPhoneNumber = supplierMobile.replace(supplierCountryCode, '').replace(/\D/g, '');
        const buyerCountryCode = buyerMobile.match(countryCodeRegex)[0];
        const buyerPhoneNumber = buyerMobile.replace(buyerCountryCode, '').replace(/\D/g, '');
    
        req.body.data.supplier_country_code = supplierCountryCode;
        req.body.data.supplierMobile = supplierPhoneNumber;
        req.body.data.buyer_country_code = buyerCountryCode;
        req.body.data.buyerMobile = buyerPhoneNumber;

    console.log('new',req.body);
            Controller.createPO(req, req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/get-po-list', checkAuthorization, checkCommonUserAuthentication,(req, res) => {
        Controller.getPOList(req, req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-po-details', checkAuthorization, checkCommonUserAuthentication,(req, res) => {
        Controller.getPODetails(req, req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        }, res);
    });

    routes.post('/edit-po', checkAuthorization, checkCommonUserAuthentication,(req, res) => {
        const { supplierMobile, buyerMobile } = req.body.data;
        const countryCodeRegex = /^\+\d+/;

        const supplierCountryCode = supplierMobile.match(countryCodeRegex)[0];
        const supplierPhoneNumber = supplierMobile.replace(supplierCountryCode, '').replace(/\D/g, '');
        const buyerCountryCode = buyerMobile.match(countryCodeRegex)[0];
        const buyerPhoneNumber = buyerMobile.replace(buyerCountryCode, '').replace(/\D/g, '');
    
        req.body.data.supplier_country_code = supplierCountryCode;
        req.body.data.supplierMobile = supplierPhoneNumber;
        req.body.data.buyer_country_code = buyerCountryCode;
        req.body.data.buyerMobile = buyerPhoneNumber;
        Controller.editPO(req, req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
});

    

    return routes
}

