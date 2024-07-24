const express             = require('express');
var routes                = express.Router();
const multer              = require('multer')
const sharp               = require('sharp')
const path                = require('path');
const Enquiry             = require('../controller/Enquiry')
const { handleResponse }  = require('../utils/utilities');
const { validation }      = require('../utils/utilities')
const {checkAuthorization, checkBuyerAuthentication, commonAuthentication, checkSupplierAuthentication}  = require('../middleware/Authorization');


module.exports = () => {
    
    routes.post('/enquiry-list', checkAuthorization, commonAuthentication, async(req, res) => {

            Enquiry.getEnquiryList(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/enquiry-details', checkAuthorization, commonAuthentication, async(req, res) => {

            Enquiry.getEnquiryDetails(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    return routes;
}

