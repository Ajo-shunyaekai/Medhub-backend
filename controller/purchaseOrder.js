const PurchaseOrder = require('../schema/purchaseOrderSchema')
const mongoose      = require('mongoose');
const ObjectId      = mongoose.Types.ObjectId;

module.exports = {

    createPO : async(reqObj, callback) => {
        try {
            console.log(reqObj);
            const { buyer_id, enquiry_id, supplier_id, itemIds,
                    data: {
                        poDate,
                        poNumber,
                        supplierName,
                        supplierAddress,
                        supplierEmail,
                        supplierMobile,
                        supplierRegNo,
                        buyerName,
                        buyerAddress,
                        buyerEmail,
                        buyerMobile,
                        buyerRegNo,
                        orderItems,
                        description
                    }
            } = reqObj;


    
            const formattedOrderItems = orderItems.map(item => ({
                medicine_id       : item.medicine_id,
                medicine_name     : item.medicine_details.medicine_name,
                quantity_required : item.quantity_required,
                unit_price        : item.unit_price,
                total_amount      : item.counter_price || item.target_price,
                status            : 'pending'
            }));
    
            const newPO = new PurchaseOrder({
                purchaseOrder_id : 'PO-' + Math.random().toString(16).slice(2), 
                enquiry_id,
                buyer_id,
                supplier_id,
                po_number               : poNumber,
                po_date                 : poDate,
                buyer_name              : buyerName,
                buyer_address           : buyerAddress,
                buyer_mobile            : buyerMobile,
                buyer_email             : buyerEmail,
                buyer_regNo             : buyerRegNo,
                supplier_name           : supplierName,
                supplier_address        : supplierAddress,
                supplier_mobile         : supplierMobile,
                supplier_email          : supplierEmail,
                supplier_regNo          : supplierRegNo,
                order_items             : formattedOrderItems,
                additional_instructions : description,
                po_status               : 'pending', 
            });

            await newPO.save();
            // const itemId = ObjectId.isValid(detail.itemId) ? new ObjectId(detail.itemId) : null;
            callback({ code: 200, message: 'Purchase Order created successfully', data: newPO });
        } catch (error) {
            console.log('Internal Server Error', error);
            callback({ code: 500, message: 'Internal Server Error' });
        }
    },

    getPOList : async(reqObj, callback) => {
        try {
        const { supplier_id, buyer_id, status, pageNo, pageSize } = reqObj
        const page_no   = pageNo || 1
        const page_size = pageSize || 2
        const offset    = (page_no - 1) * page_size
        const query     = {}
        
        if(!supplier_id) {
            query.buyer_id = buyer_id,
            query.po_status = status 
        } else if(!buyer_id) {
            query.supplier_id = supplier_id,
            query.po_status = status 
        }

        const matchCondition = {};
        if (buyer_id && !supplier_id) {
            matchCondition.buyer_id = buyer_id;
        } else if (supplier_id && !buyer_id) {
            matchCondition.supplier_id = supplier_id;
        }
        if (status) {
            matchCondition.po_status = status;
        }
        
            PurchaseOrder.aggregate([
                {
                    $match: matchCondition
                },
                {
                    $lookup : {
                        from         : "buyers",
                        localField   : "buyer_id",
                        foreignField : "buyer_id",
                        as           : "buyer_details",
                    }
                },
                {
                    $lookup : {
                        from         : "suppliers",
                        localField   : "supplier_id",
                        foreignField : "supplier_id",
                        as           : "supplier_details",
                    }
                },
                {
                    $project: {
                        purchaseOrder_id        : 1,
                        po_number               : 1,
                        po_date                 : 1,
                        buyer_name              : 1,
                        buyer_address           : 1,
                        buyer_mobile            : 1,
                        buyer_email             : 1,
                        buyer_regNo             : 1,
                        supplier_name           : 1,
                        supplier_address        : 1,
                        supplier_mobile         : 1,
                        supplier_email          : 1,
                        supplier_regNo          : 1,
                        additional_instructions : 1,
                        po_status               : 1,
                        order_items             : 1,
                        enquiry_id              : 1,
                        created_at              : 1,
                        updated_at              : 1,
                        
                        buyer : {
                            $arrayElemAt : ["$buyer_details", 0]
                        },
                        supplier : {
                            $arrayElemAt : ["$supplier_details", 0]
                        },
                    }
                },
                {
                    $project: {
                        purchaseOrder_id        : 1,
                        po_number               : 1,
                        po_date                 : 1,
                        buyer_name              : 1,
                        buyer_address           : 1,
                        buyer_mobile            : 1,
                        buyer_email             : 1,
                        buyer_regNo             : 1,
                        supplier_name           : 1,
                        supplier_address        : 1,
                        supplier_mobile         : 1,
                        supplier_email          : 1,
                        supplier_regNo          : 1,
                        additional_instructions : 1,
                        po_status               : 1,
                        order_items             : 1,
                        enquiry_id              : 1,
                        created_at              : 1,
                        updated_at              : 1,
                        "buyer.buyer_id"             : 1,
                        "buyer.buyer_name"           : 1,
                        "buyer.buyer_type"           : 1,
                        "buyer.buyer_mobile"         : 1,
                        "buyer.buyer_image"          : 1,
                        "buyer.country_of_origin"    : 1,
                        "supplier.supplier_id"       : 1,
                        "supplier.supplier_name"     : 1,
                        "supplier.supplier_type"     : 1,
                        "supplier.supplier_mobile"   : 1,
                        "supplier.supplier_image"    : 1,
                        "supplier.country_of_origin" : 1,
                    }
                },
                {
                    $skip: offset
                },
                {
                    $limit: page_size
                },
                {
                  $sort: { created_at: -1 }
                }
            ])
            .then(async(data) => {
                const totalItems = await PurchaseOrder.countDocuments(matchCondition);
                const totalPages = Math.ceil(totalItems / page_size);

                const returnObj = {
                    data,
                    totalPages,
                    totalItems
                };
                callback({code: 200, message: 'PO list', result: returnObj})
            })
            .catch((err) => {
            callback({code: 400, message: 'Error while fetching PO list', result: err})
            })
        } catch (error) {
            console.log(error);
        callback({code: 500, message: 'Internal Server Error'})
        }
    },

    getPODetails: async (reqObj, callback) => {
        try {
            const {purchaseOrder_id, buyer_id, supplier_id, enquiry_id} = reqObj
            PurchaseOrder.aggregate([
                {
                    $match: {
                        purchaseOrder_id: purchaseOrder_id,
                        buyer_id: buyer_id,
                        // enquiry_id: enquiry_id
                    }
                },
                {
                    $lookup: {
                        from: "buyers",
                        localField: "buyer_id",
                        foreignField: "buyer_id",
                        as: "buyer_details"
                    }
                },
                {
                    $lookup: {
                        from: "suppliers",
                        localField: "supplier_id",
                        foreignField: "supplier_id",
                        as: "supplier_details"
                    }
                },
                {
                    $unwind: "$order_items"
                },
                {
                    $lookup: {
                        from: "medicines",
                        localField: "order_items.medicine_id",
                        foreignField: "medicine_id",
                        as: "medicine_details"
                    }
                },
                {
                    $unwind: "$medicine_details"
                },
                {
                    $addFields: {
                        "order_items.medicine_details": "$medicine_details"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        purchaseOrder_id: { $first: "$purchaseOrder_id" },
                        buyer_id: { $first: "$buyer_id" },
                        supplier_id: { $first: "$supplier_id" },
                        order_items: { $push: "$order_items" },
                        buyer_details: { $first: "$buyer_details" },
                        supplier_details: { $first: "$supplier_details" },
                    }
                }
            ])
            .then((data) => {
                callback({ code: 200, message: 'Purchase Order details' , result: data[0]});
            })
            .catch((err) => {
                callback({ code: 400, message: 'Error while fetching purchase order details' , result: err});   
            })
        } catch (error) {
            console.log(error);
            callback({ code: 500, message: 'Internal Server Error', result: error });
        }
    },
    
}    