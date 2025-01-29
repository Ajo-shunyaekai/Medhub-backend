const express                                    = require('express');
let routes                                       = express.Router();
const Controller                                 = require('../controller/Category')
const {checkAuthorization, checkAuthentication}  = require('../middleware/Authorization');
const { handleResponse, handleController }                         = require('../utils/utilities');

module.exports = () => {
 
    routes.post('/add-category', checkAuthorization, checkAuthentication, (req, res) => handleController(Controller.addCategory, req, res))

    routes.post('/list-categories', checkAuthorization, checkAuthentication, (req, res) => handleController(Controller.categoriesList, req, res))

    routes.post('/edit-category', checkAuthorization, checkAuthentication, (req, res) => handleController(Controller.editCategory, req, res))
    
    return routes;
}