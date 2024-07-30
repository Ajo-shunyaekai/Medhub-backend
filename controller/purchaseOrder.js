const Purchaseorder = require('../schema/purchaseOrderSchema')
const mongoose      = require('mongoose');
const ObjectId      = mongoose.Types.ObjectId;

module.exports = {

    createPO : async(reqObj, callback) => {
        try {
            console.log(reqObj);
        } catch (error) {
            console.log(error);
        callback({code: 500, message: 'Internal Server Error'})
        }
    },
    
}    