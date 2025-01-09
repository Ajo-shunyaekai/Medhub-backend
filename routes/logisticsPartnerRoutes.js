const express                                        = require('express');
var routes                                           = express.Router();
const Controller                                     = require('../controller/LogisticsPartner')
const {validation, handleResponse, generateOtp}      = require('../utils/utilities')
const {checkAuthorization, checkUserAuthentication}  = require('../middleware/Authorization')
const { validationSchema }                           = require('../utils/joi.validation');


module.exports = () => {

    routes.post('/add-logistics-partner', checkAuthorization, (req, res) => {
        console.log();
        const errObj = validation(req.body, 'AddPartner')

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


    return routes;
}