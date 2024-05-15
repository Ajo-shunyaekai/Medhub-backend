const Order              = require('../schema/orderSchema')

module.exports = {

    createOrder : async(reqObj, callback) => {
       try {
        const orderId    = 'ORD-' + Math.random().toString(16).slice(2);
        const itemIds    = reqObj.items.map(item => item.product_id);

        const newOrder = new Order({
            order_id     : orderId,
            user_id      : reqObj.user_id,
            items        : reqObj.items,
            total_price  : reqObj.total_price,
            status       : reqObj.status
        })

        newOrder.save().then(() => {
            callback({code: 200, message: 'Order Created'})
        })
        .catch((err) => {
            callback({code: 400, message: 'Error in Order Creation'})
        })
       } catch (error) {
        callback({code: 500, message: 'Internal Server Error'})
       }
        
        
    },

    

}