const express             = require('express');
var routes                = express.Router();
const multer              = require('multer')
const sharp               = require('sharp')
const path                = require('path');
const Enquiry             = require('../controller/Enquiry')
const { handleResponse }  = require('../utils/utilities');
const { validation }      = require('../utils/utilities')
const {checkAuthorization, checkCommonUserAuthentication}  = require('../middleware/Authorization');


module.exports = () => {
    
    routes.post('/enquiry-list', checkAuthorization, checkCommonUserAuthentication,(req, res) => {

            Enquiry.getEnquiryList(req, req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/enquiry-details', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {

            Enquiry.getEnquiryDetails(req, req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });
    routes.post('/get-specific-enquiry-details/:id', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {

            Enquiry.getEnquiryDetails(req, req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/submit-quotation', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {

        Enquiry.submitQuotation(req, req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/accept-reject-quotation', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {

        Enquiry.acceptRejectQuotation(req, req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });
    
    routes.post('/get-all-enquiry-list', checkAuthorization, checkCommonUserAuthentication, Enquiry.getEnquiryListAllUsers);

    routes.post('/cancel-enquiry', checkAuthorization, checkCommonUserAuthentication,(req, res) => {

        Enquiry.cancelEnquiry(req, req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
});

    return routes
}

