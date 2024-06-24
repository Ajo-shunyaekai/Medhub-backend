const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Admin')
const MedicineController                         = require('../controller/Medicine')
const { handleResponse }                         = require('../utils/utilities');
const {checkAuthorization, checkAuthentication, checkAdminAuthentication}  = require('../middleware/Authorization');


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

    routes.post('/get-user-list', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.getUserList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/block-unblock-user', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.blockUnblockUser(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/all-medicine-list', checkAuthorization, checkAdminAuthentication, (req, res) => {
        MedicineController.allMedicineList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-supplier-list', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.getSupplierList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-supplier-details', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.supplierDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-supplier-reg-req-list', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.getRegReqList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });


    routes.post('/accept-reject-supplier-registration', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.acceptRejectSupplierRegReq(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-buyer-list', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.getBuyerList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-buyer-details', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.buyerDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-buyer-reg-req-list', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.getBuyerRegReqList(req.body, result => {
            const response = handleResponse(result)
            res.send(response)
        })
    })

    routes.post('/accept-reject-buyer-registration', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.acceptRejectBuyerRegReq(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });


    routes.post('/get-profile-edit-request-list', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.getProfileUpdateReqList(req.body, result => {
            const response = handleResponse(result)
            res.send(response)
        })
    })

    routes.post('/accept-reject-profile-edit-req', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.acceptRejectProfileEditRequest(req.body, result => {
            const response = handleResponse(result)
            res.send(response)
        })
    })

    routes.post('/get-medicine-list', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.allMedicineList(req.body, result => {
            const response = handleResponse(result)
            res.send(response)
        })
    })

    routes.post('/medicine-details', checkAuthorization, (req, res) => {
        Controller.getMedicineDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/support-list', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.supportList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/support-details', checkAuthorization, checkAdminAuthentication, (req, res) => {
        Controller.supportDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });
    
    return routes;
}