const express                                    = require('express');
var routes                                       = express.Router();
const path                                       = require('path');
const Support                                      = require('../controller/Support')
const { handleResponse, handleController }                         = require('../utils/utilities');
const { validation }                             = require('../utils/utilities')
const {checkAuthorization, checkCommonUserAuthentication}  = require('../middleware/Authorization');
const createMulterMiddleware = require('../utils/imageUpload')

const imageUploadMiddleware = createMulterMiddleware([
    { fieldName: 'complaint_image', uploadPath: './uploads/buyer/order/complaint_images', maxCount: 10 },
    { fieldName: 'feedback_image', uploadPath: './uploads/buyer/order/feedback_images', maxCount: 10 },
]);

module.exports = () => {


    routes.post('/submit-feedback', checkAuthorization, checkCommonUserAuthentication, imageUploadMiddleware, (req, res) => {

        if (!req.files['feedback_image'] || req.files['feedback_image'].length === 0) {
            res.send({ code: 415, message: 'Feedback Image is required!', errObj: {} });
            return;
        }

        let obj = {
            ...req.body,
            feedback_image: req.files['feedback_image'].map(file => path.basename(file.path))
        }

        // handleController(Order.orderFeedback, req, res, obj)
        handleController(Support.supportSubmission, req, res, obj)
    });

    routes.post('/submit-complaint', checkAuthorization, checkCommonUserAuthentication, imageUploadMiddleware, (req, res) => {

        if (!req.files['complaint_image'] || req.files['complaint_image'].length === 0) {
            res.send({ code: 415, message: 'Complaint Image is required!', errObj: {} });
            return;
        }

        let obj = {
            ...req.body,
            complaint_image: req.files['complaint_image'].map(file => path.basename(file.path))
        }

        // handleController(Order.orderComplaint, req, res, obj)
        handleController(Support.supportSubmission, req, res, obj)
    });

    return routes;
}