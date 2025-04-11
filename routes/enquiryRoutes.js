const express             = require('express');
var routes                = express.Router();
const multer              = require('multer')
const sharp               = require('sharp')
const path                = require('path');
const Enquiry             = require('../controller/Enquiry')
const { handleResponse, handleController }  = require('../utils/utilities');
const { validation }      = require('../utils/utilities')
const {checkAuthorization, authenticationNAuthorization}  = require('../middleware/Authorization');


module.exports = () => {    
    
    // routes.post('/enquiry-list', checkAuthorization, authenticationNAuthorization, (req, res) => handleController(Enquiry.getEnquiryList, req, res));

    routes.post('/enquiry-details', checkAuthorization, authenticationNAuthorization, (req, res) => handleController(Enquiry.getEnquiryDetails, req, res));

    routes.post('/get-specific-enquiry-details/:id', checkAuthorization, authenticationNAuthorization, (req, res) => handleController(Enquiry.getEnquiryDetails, req, res));

    routes.post('/submit-quotation', checkAuthorization, authenticationNAuthorization, (req, res) => handleController(Enquiry.submitQuotation, req, res));

    routes.post('/accept-reject-quotation', checkAuthorization, authenticationNAuthorization, (req, res) => handleController(Enquiry.acceptRejectQuotation, req, res));
    
    routes.post('/get-all-enquiry-list', checkAuthorization, authenticationNAuthorization, Enquiry.getEnquiryListAllUsers);

    routes.post('/cancel-enquiry', checkAuthorization, authenticationNAuthorization, (req, res) => handleController(Enquiry.cancelEnquiry, req, res));

    return routes
}

