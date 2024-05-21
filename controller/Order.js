const Order              = require('../schema/orderSchema')

module.exports = {

    orderRequest : async(reqObj, callback) => {
        console.log(reqObj);
       try {
        const orderId    = 'ORD-' + Math.random().toString(16).slice(2);
        const itemIds    = reqObj.items.map(item => item.product_id);

        const newOrder = new Order({
            order_id          : orderId,
            buyer_id          : reqObj.buyer_id,
            supplier_id       : reqObj.supplier_id,
            items             : reqObj.items,
            payment_terms     : reqObj.payment_terms,
            est_delivery_time : reqObj.est_delivery_time,
            shipping_details  : reqObj.shipping_details,
            remarks           : reqObj.remarks,
            order_status      : reqObj.status
            // total_price  : reqObj.total_price,
            
        })

        newOrder.save().then(() => {
            // callback({code: 200, message: 'Order Created'})
            return callback({code: 200, message: "Order Request send successfully"});
        })
        .catch((err) => {
            console.log('err in order request',err);
            return callback({code: 400, message: 'Error in Order Creation'})
        })
       } catch (error) {
        callback({code: 500, message: 'Internal Server Error'})
       }
        
        
    },

    buyerOrdersList: async (reqObj, callback) => {
        try {
          const {pageNo, pageSize, filterKey,buyer_id} = reqObj
    
          const page_no   = pageNo || 1
          const page_size = pageSize || 1
          const offset    = (page_no - 1) * page_size    

        Order.aggregate([
            {
                $match: { 
                    buyer_id: reqObj.buyer_id,
                    order_status: reqObj.filterKey
                }
            },
            {
              $lookup: {
                from: "suppliers",
                localField: "supplier_id",
                foreignField: "supplier_id",
                as: "supplier"
              }
            },
            {
              $project: {
                order_id: 1,
                buyer_id: 1,
                supplier_id: 1,
                items: 1,
                payment_terms: 1,
                est_delivery_time: 1,
                shipping_details: 1,
                remarks: 1,
                order_status: 1,
                created_at: 1,
                supplier: { $arrayElemAt: ["$supplier", 0] }
              }
            },
            {
              $unwind: "$items" // Unwind to work with each item separately
            },
            {
              $lookup: {
                from: "medicines",
                localField: "items.product_id",
                foreignField: "medicine_id",
                as: "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] }
              }
            },
            {
              $group: {
                _id: "$_id",
                order_id: { $first: "$order_id" },
                buyer_id: { $first: "$buyer_id" },
                supplier_id: { $first: "$supplier_id" },
                items: { $push: "$items" },
                payment_terms: { $first: "$payment_terms" },
                est_delivery_time: { $first: "$est_delivery_time" },
                shipping_details: { $first: "$shipping_details" },
                remarks: { $first: "$remarks" },
                order_status: { $first: "$order_status" },
                created_at: { $first: "$created_at" },
                supplier: { $first: "$supplier" }
              }
            },
            {
                $project: {
                    order_id: 1,
                    buyer_id: 1,
                    supplier_id: 1,
                    items: 1,
                    payment_terms: 1,
                    est_delivery_time: 1,
                    shipping_details: 1,
                    remarks: 1,
                    order_status: 1,
                    created_at: 1,
                    "supplier.supplier_image": 1,
                    "supplier.supplier_name": 1
                }
            },
            { $skip: offset },
            { $limit: page_size },
        ])
        .then((data) => {
            // console.log(data);
            Order.countDocuments({order_status : filterKey, buyer_id: buyer_id})
            .then(totalItems => {
                // console.log(totalItems);
                const totalPages = Math.ceil(totalItems / page_size);

                const responseData = {
                    data,
                    totalPages
                }
                
                callback({ code: 200, message: "List Fetched successfully", result: responseData });
                // callback({ code: 200, message: "Medicine list fetched successfully", result: data, total_pages: totalPages });
            })
           
        })
        .catch((err) => {
            console.log(err);
            callback({ code: 400, message: "Error in fetching order list", result: err });
        })
         
        } catch (error) {
          callback({ code: 500, message: "Internal Server Error", result: error });
        }
    },

    buyerOrderDetails : async (reqObj, callback) => {
        try {
            const {buyer_id, order_id, filterKey} = reqObj

            Order.aggregate([
                {
                    $match: { 
                        order_id     : order_id,
                        // buyer_id     : buyer_id,
                        // order_status : filterKey
                    }
                },
                {
                  $lookup: {
                    from: "suppliers",
                    localField: "supplier_id",
                    foreignField: "supplier_id",
                    as: "supplier"
                  }
                },
                {
                  $project: {
                    order_id: 1,
                    buyer_id: 1,
                    supplier_id: 1,
                    items: 1,
                    payment_terms: 1,
                    est_delivery_time: 1,
                    shipping_details: 1,
                    remarks: 1,
                    order_status: 1,
                    supplier: { $arrayElemAt: ["$supplier", 0] }
                  }
                },
                {
                  $unwind: "$items"
                },
                {
                  $lookup: {
                    from: "medicines",
                    localField: "items.product_id",
                    foreignField: "medicine_id",
                    as: "medicine"
                  }
                },
                {
                  $addFields: {
                    "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
                    "items.drugs_name" : {$arrayElemAt: ["$medicine.drugs_name",0]}
                  }
                },
                {
                  $group: {
                    _id: "$_id",
                    order_id: { $first: "$order_id" },
                    buyer_id: { $first: "$buyer_id" },
                    supplier_id: { $first: "$supplier_id" },
                    items: { $push: "$items" },
                    payment_terms: { $first: "$payment_terms" },
                    est_delivery_time: { $first: "$est_delivery_time" },
                    shipping_details: { $first: "$shipping_details" },
                    remarks: { $first: "$remarks" },
                    order_status: { $first: "$order_status" },
                    supplier: { $first: "$supplier" }
                  }
                },
                {
                    $project: {
                        order_id: 1,
                        buyer_id: 1,
                        supplier_id: 1,
                        items: 1,
                        payment_terms: 1,
                        est_delivery_time: 1,
                        shipping_details : 1,
                        remarks: 1,
                        order_status: 1,
                        "supplier.supplier_image": 1,
                        "supplier.supplier_name": 1
                    }
                }
            ])
            .then((data) => {
                callback({ code: 200, message: "List Fetched successfully", result: data[0] });
            })
            .catch((err) => {
                console.log(err);
                callback({ code: 400, message: "Error in fetching order list", result: err });
            })
            
        } catch (error) {
            
        }
    }

}