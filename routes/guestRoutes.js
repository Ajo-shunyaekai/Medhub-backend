const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Guest')
const {checkAuthorization, checkAuthentication}  = require('../middleware/Authorization');
const { handleResponse, handleController }                         = require('../utils/utilities');


module.exports = () => {

    // routes.post('/login', checkAuthorization, (req, res) => {  
    //         Controller.guestLogin(req, req.body, result => {
    //             const response = handleResponse(result);
    //             res.send(response);
    //         });
    // });
    routes.post('/login', checkAuthorization, (req, res) => handleController(Controller.guestLogin, req, res))

    // routes.post('/verify-otp', checkAuthorization, (req, res) => {  
    //     Controller.verifyOtp(req, req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     })
    // });
    routes.post('/verify-otp', checkAuthorization, (req, res) => handleController(Controller.verifyOtp, req, res));
    
    return routes;
}