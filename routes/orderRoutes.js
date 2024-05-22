const express                                    = require('express');
var routes                                       = express.Router();
const Order                                      = require('../controller/Order')
const { handleResponse }                         = require('../utils/utilities');
const { validation }                             = require('../utils/utilities')
const {checkAuthorization, checkBuyerAuthentication}  = require('../middleware/Authorization');


module.exports = () => {
    routes.post('/order-request', checkAuthorization, checkBuyerAuthentication, (req, res) => {

        // let errObj = validation(obj, 'orderRequest');
    
        // if (Object.values(errObj).length) {
        //     res.send({ code: 422, message: 'All fields are required', errObj });
        //     return;
        // }
            Order.orderRequest(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/buyer-order-list', checkAuthorization, checkBuyerAuthentication, (req, res) => {

            Order.buyerOrdersList(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/order-details', checkAuthorization, checkBuyerAuthentication, (req, res) => {

            Order.buyerOrderDetails(req.body, result => {
                const response = handleResponse(result);
                res.send(response);
            });
    });

    routes.post('/cancel-order', checkAuthorization, checkBuyerAuthentication, (req, res) => {

        // let errObj = validation(obj,'cancelOrder');
    
        // if (Object.values(errObj).length) {
        //     res.send({ code: 422, message: 'All fields are required', errObj });
        //     return;
        // }

        Order.cancelOrder(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/submit-order-feedback', checkAuthorization, checkBuyerAuthentication, (req, res) => {

        Order.orderFeedback(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/submit-order-complaint', checkAuthorization, checkBuyerAuthentication, (req, res) => {

        Order.orderComplaint(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/buyer-invoice-list', checkAuthorization, checkBuyerAuthentication, (req, res) => {

        Order.buyerInvoicesList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
});

    
    return routes;
}