const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Admin')
const MedicineController                         = require('../controller/Medicine')
const {checkAuthorization, checkAuthentication}  = require('../middleware/Authorization');
const { handleResponse }                         = require('../utils/utilities');


module.exports = () => {

    routes.post('/register', checkAuthorization,   (req, res) => {
            Controller.register(req.body, result => {
                res.send({ code : 200, message : 'Admin registration successfull', result });
            });
    });

    routes.post('/login', checkAuthorization, (req, res) => {  
            Controller.login(req.body, result => {
                res.send({ code : 200, message : 'Admin login success', result });
            });
    });

    routes.post('/get-user-list', checkAuthorization, checkAuthentication, (req, res) => {
            Controller.getUserList(req.body, result => {
                // res.send({ code : 200, message : 'User list', result });
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/block-unblock-user', checkAuthorization, checkAuthentication, (req, res) => {
            Controller.blockUnblockUser(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/all-medicine-list', checkAuthorization, checkAuthentication, (req, res) => {
            MedicineController.allMedicineList(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });
    
    return routes;
}