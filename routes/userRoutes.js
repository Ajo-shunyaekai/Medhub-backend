const express                                        = require('express');
var routes                                           = express.Router();
const Controller                                     = require('../controller/User')
const {validation, handleResponse, generateOtp}                   = require('../utils/utilities')
const {checkAuthorization, checkUserAuthentication}  = require('../middleware/Authorization')
const { validationSchema }                           = require('../utils/joi.validation');


module.exports = () => {

    routes.post('/register', checkAuthorization, (req, res) => {
        console.log();
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

        Controller.register(obj, result => {

            let randomNumber   = Math.random().toString();
            randomNumber       = randomNumber.substring(2, randomNumber.length);
            res.cookie('userCookie', randomNumber, { maxAge: 900000, httpOnly: true });

            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/login', checkAuthorization, (req, res) => {
        const errObj = validation(req.body, 'Login')
        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }

        Controller.login(req.body, result => {
            // let randomNumber   = Math.random().toString();
            // randomNumber       = randomNumber.substring(2, randomNumber.length);
            // res.cookie('userCookie', randomNumber, { maxAge: 900000, httpOnly: true });
              const newOtp = generateOtp()
             
              const obj = {
                email : req.body.email,
                otp   : newOtp
              }

              Controller.saveOtp(obj, result => {
                   const response = handleResponse(result);
                    res.send(response);
              })
            // const response = handleResponse(result);
            // res.send(response);
        });
    });

    routes.post('/verify-otp', checkAuthorization, (req, res) => {
        Controller.verifyOtp(req.body, result => {
            // res.send({ code : 200, message : 'User list', result });
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/update-password', checkAuthorization, checkUserAuthentication, (req, res) => {
        const errObj = validation(req.body, 'updatePassword')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }

        Controller.updatePassword(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/edit-profile', checkAuthorization, checkUserAuthentication, (req, res) => {
        const errObj = validation(req.body, 'editProfile')

        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        Controller.editProfile(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-user-list', checkAuthorization, (req, res) => {
        Controller.getUserList(req.body, result => {
            res.send({ code : 200, message : 'User list', result });
        });
    });

    routes.post('/get-profile', checkAuthorization,checkUserAuthentication, (req, res) => {
        Controller.getProfile(req.body, result => {
            res.send({ code : 200, message : 'User list', result });
        });
    });

    return routes;
}