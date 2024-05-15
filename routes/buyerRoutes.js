const express                                    = require('express');
let routes                                       = express.Router();
const multer                                     = require('multer')
const Controller                                 = require('../controller/Buyer')
const { handleResponse }                         = require('../utils/utilities');
const {validation}                               = require('../utils/utilities')
const {imageUpload}                              = require('../utils/imageUpload')

const {checkAuthorization, checkBuyerAuthentication}  = require('../middleware/Authorization');

module.exports = () => {

    routes.post('/register', checkAuthorization, (req, res) => {
        const errObj = validation(req.body, 'buyerRegister')

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
        Controller.Regsiter(obj, result => {
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

        Controller.Login(req.body, result => {
            let randomNumber   = Math.random().toString();
            randomNumber       = randomNumber.substring(2, randomNumber.length);
            res.cookie('userCookie', randomNumber, { maxAge: 900000, httpOnly: true });

            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/edit-profile', checkAuthorization, checkBuyerAuthentication, (req, res) => {
        const errObj = validation(req.body, 'editBuyer')

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
        console.log('obj',obj);

        Controller.EditProfile(obj, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    return routes;

}