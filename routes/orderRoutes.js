const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Order')
const {checkAuthorization, checkUserAuthentication}  = require('../middleware/Authorization');
const { handleResponse }                         = require('../utils/utilities');


module.exports = () => {

    routes.post('/create-order', checkAuthorization, checkUserAuthentication, (req, res) => {
            Controller.createOrder(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    
    
    return routes;
}