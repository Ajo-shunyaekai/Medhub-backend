const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Guest')
const {checkAuthorization, checkAuthentication}  = require('../middleware/Authorization');
const { handleResponse }                         = require('../utils/utilities');


module.exports = () => {

    routes.post('/login', checkAuthorization, (req, res) => {  
            Controller.guestLogin(req.body, result => {
                // res.send({ code : 200, message : 'o login success', result });
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/verify-otp', checkAuthorization, (req, res) => {  
        Controller.verifyOtp(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });
    
    return routes;
}