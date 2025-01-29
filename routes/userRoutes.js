const express                                        = require('express');
var routes                                           = express.Router();
const Controller                                     = require('../controller/User')
const {validation, handleResponse, generateOtp, handleController}                   = require('../utils/utilities')
const {checkAuthorization, checkUserAuthentication}  = require('../middleware/Authorization')
const { validationSchema }                           = require('../utils/joi.validation');


module.exports = () => {

    routes.post('/register', checkAuthorization, (req, res) => {
        const errObj = validation(req.body, 'Register')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }

        const countryCode  = req.body.mobile_no.split(" ")[0]; 
        const number       = req.body.mobile_no.split(" ").slice(1).join(" ")

        const obj = {
            ...req.body,
            mobile: number,
            countryCode
        }
        handleController(Controller.register, req, res, obj)
    });

    routes.post('/login', checkAuthorization, async (req, res) => {
        const errObj = validation(req.body, 'Login')
        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        const newOtp = generateOtp()
             
        const obj = {
          email : req.body.email,
          otp   : newOtp
        }

        const response = await handleController(Controller.login, req, res)
        const response1 = await handleController(Controller.saveOtp, req, res, obj)
    });

    routes.post('/verify-otp', checkAuthorization, (req, res) => handleController(Controller.verifyOtp, req, res));

    routes.post('/update-password', checkAuthorization, checkUserAuthentication, (req, res) => {
        const errObj = validation(req.body, 'updatePassword')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        handleController(Controller.updatePassword, req, res)
    });

    routes.post('/edit-profile', checkAuthorization, checkUserAuthentication, (req, res) => {
        const errObj = validation(req.body, 'editProfile')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        handleController(Controller.editProfile, req, res)
    });

    routes.post('/get-user-list', checkAuthorization, (req, res) => {
        Controller.getUserList(req, req.body, result => {
            res.send({ code : 200, message : 'User list', result });
        });
    });
    routes.post('/get-user-list', checkAuthorization, (req, res) => {
        handleController(Controller.getUserList, req, res)
    });

    routes.post('/get-profile', checkAuthorization,checkUserAuthentication, (req, res) => {
        Controller.getProfile(req, req.body, result => {
            res.send({ code : 200, message : 'User list', result });
        });
    });
    routes.post('/get-profile', checkAuthorization, checkUserAuthentication, (req, res) => {
        handleController(Controller.getProfile, req, res)
    });

    return routes;
}