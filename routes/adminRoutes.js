const express                                    = require('express');
var routes                                       = express.Router();
const Controller                                 = require('../controller/Admin')
const MedicineController                         = require('../controller/Medicine')
const { handleResponse }                         = require('../utils/utilities');
const {checkAuthorization, checkAuthentication, checkCommonUserAuthentication}  = require('../middleware/Authorization');

module.exports = () => {

    routes.post('/register', checkAuthorization,   (req, res) => {
        Controller.register(req.body, result => {
            res.send({ code : 200, message : 'Admin registration successfull', result });
        });
    });

    routes.post('/login', checkAuthorization, (req, res) => {  
        Controller.login(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/edit-profile', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
        Controller.editAdminProfile(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        }) 
    })

    routes.post('/profile-details', checkAuthorization, checkCommonUserAuthentication, async(req, res) => {
        Controller.adminProfileDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        })
    })

    routes.post('/get-user-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getUserList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/block-unblock-user', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.blockUnblockUser(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });


    //------------------------------------------ supplier ------------------------------------------//

    routes.post('/get-supplier-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getSupplierList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-supplier-list-csv', checkAuthorization, checkCommonUserAuthentication, Controller.getSupplierCSVList);
    
    routes.post('/get-buyer-list-csv', checkAuthorization, checkCommonUserAuthentication, Controller.getBuyerCSVList);

    routes.post('/get-supplier-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.supplierDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-supplier-reg-req-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getRegReqList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-supplier-req-csv-list', checkAuthorization, checkCommonUserAuthentication, Controller.getSuppReqCSVList);

    routes.post('/accept-reject-supplier-registration', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.acceptRejectSupplierRegReq(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    //------------------------------------------ supplier ------------------------------------------//


    //------------------------------------------ buyer ------------------------------------------//

    routes.post('/get-buyer-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getBuyerList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-buyer-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.buyerDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-buyer-reg-req-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getBuyerRegReqList(req.body, result => {
            const response = handleResponse(result)
            res.send(response)
        })
    })

    routes.post('/accept-reject-buyer-registration', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.acceptRejectBuyerRegReq(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    //------------------------------------------ buyer ------------------------------------------//

 
    //------------------------------------------ buyer/supplier ------------------------------------------//

    routes.post('/get-buyer-supplier-reg-req-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getTotalRegReqList(req.body, result => {
            const response = handleResponse(result)
            res.send(response)
        })
    })

    routes.post('/get-buyer-supplier-aprroved-reg-req-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getTotalApprovedRegReqList(req.body, result => {
            const response = handleResponse(result)
            res.send(response)
        })
    })

    routes.post('/get-profile-edit-request-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getProfileUpdateReqList(req.body, result => {
            const response = handleResponse(result)
            res.send(response)
        })
    })

    routes.post('/accept-reject-profile-edit-req', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.acceptRejectProfileEditRequest(req.body, result => {
            const response = handleResponse(result)
            res.send(response)
        })
    })

    //------------------------------------------ buyer/supplier ------------------------------------------//

    //------------------------------------------ medicine ------------------------------------------//

    routes.post('/accept-reject-add-medicine', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.acceptRejectAddMedicineReq(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/accept-reject-edit-medicine', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.acceptRejectEditMedicineReq(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-medicine-edit-request-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.medicineEditList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-edit-medicine_details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.editMedicineDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-medicine-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
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

    routes.post('/all-medicine-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        MedicineController.allMedicineList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    //------------------------------------------ medicine ------------------------------------------//


     //------------------------------------------ support ------------------------------------------//

    routes.post('/get-support-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.supportList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-support-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.supportDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

     //------------------------------------------ support ------------------------------------------//

    routes.post('/dashboard-data-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.adminDashboardDataList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/buyer-order-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.buyerOrdersList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/order-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.orderDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    // routes.post('/buyer-supplier-invoices-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
    //     Controller.invoicesList(req.body, result => {
    //         const response = handleResponse(result);
    //         res.send(response);
    //     });
    // });

    routes.post('/get-notification-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getNotificationList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-notification-details-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getNotificationDetailsList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/update-notification-status', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.updateStatus(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });



    //------------------------------------------ inquiry ------------------------------------------//
    routes.post('/get-inquiry-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.inquiriesList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-inquiry-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.inquiryDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    //------------------------------------------ inquiry ------------------------------------------//


     //------------------------------------------ invoice ------------------------------------------//
     routes.post('/get-invoice-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.invoicesList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-invoice-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.invoiceDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    //------------------------------------------ invoice ------------------------------------------//

     //------------------------------------------ transaction ------------------------------------------//
     routes.post('/get-po-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getPOList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-po-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.getPODetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    //------------------------------------------ transaction ------------------------------------------//

    //------------------------------------------ transaction ------------------------------------------//
    routes.post('/get-transaction-list', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.transactionList(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    routes.post('/get-transaction-details', checkAuthorization, checkCommonUserAuthentication, (req, res) => {
        Controller.transactionDetails(req.body, result => {
            const response = handleResponse(result);
            res.send(response);
        });
    });

    //------------------------------------------ transaction ------------------------------------------//
    
    return routes;
}