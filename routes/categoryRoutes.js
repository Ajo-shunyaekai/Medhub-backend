const express                                    = require('express');
let routes                                       = express.Router();
const Controller                                 = require('../controller/Category')
const {checkAuthorization, checkAuthentication}  = require('../middleware/Authorization');
const { handleResponse }                         = require('../utils/utilities');

module.exports = () => {
    routes.post('/add-category', checkAuthorization, checkAuthentication, (req, res) => {
        Controller.addCategory(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/list-categories', checkAuthorization, checkAuthentication, (req, res) => {
        Controller.categoriesList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/edit-category', checkAuthorization, checkAuthentication, (req, res) => {
        Controller.editCategory(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });
    
    return routes;
}