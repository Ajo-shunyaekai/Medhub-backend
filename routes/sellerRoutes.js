const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Seller')
const {checkAuthorization, checkAuthentication, checkSellerAuthentication}  = require('../middleware/Authorization');
const { handleResponse, handleController }                         = require('../utils/utilities');
const {validation}                               = require('../utils/utilities')


module.exports = () => {

    routes.post('/register', checkAuthorization, (req, res) => {
        const errObj = validation(req.body, 'sellerRegister')

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
    })

    routes.post('/login', checkAuthorization, (req, res) => {
        const errObj = validation(req.body, 'Login')
        if(Object.values(errObj).length){
            res.send( { code : 419, message : 'All fields are required', errObj });
            return;
        }
        handleController(Controller.login, req, res)
    })
    
   return routes
}