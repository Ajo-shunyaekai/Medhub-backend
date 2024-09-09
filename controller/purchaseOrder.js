const PurchaseOrder = require('../schema/purchaseOrderSchema')
const Enquiry       = require('../schema/enquiryListSchema')
const mongoose      = require('mongoose');
const ObjectId      = mongoose.Types.ObjectId;
const Buyer        = require('../schema/buyerSchema')
const Supplier     = require('../schema/supplierSchema')
const Notification = require('../schema/notificationSchema')
const nodemailer         = require('nodemailer');

var transporter = nodemailer.createTransport({
  host   : "smtp.gmail.com",
  port   : 587,
  secure : false, // true for 465, false for other ports
  type   : "oauth2",
  // service : 'gmail',
  auth : {
      user : process.env.SMTP_USER_ID,
      pass : process.env.SMTP_USER_PASSWORD
  }
});
const sendMailFunc = (email, subject, body) =>{
  
  var mailOptions = {
      from    : process.env.SMTP_USER_ID,
      to      : email,
      subject : subject,
      // text    : 'This is text mail, and sending for testing purpose'
      html:body 
  };
  transporter.sendMail(mailOptions);
}

module.exports = {
 
    createPO: async (reqObj, callback) => {
        try {
            const purchaseOrderId = 'PO-' + Math.random().toString(16).slice(2,10)
            const { buyer_id, enquiry_id, supplier_id, itemIds, grandTotalAmount,rejectedIds,
                data: {
                    poDate,
                    poNumber,
                    supplierName,
                    supplierAddress,
                    supplierEmail,
                    supplierMobile,
                    supplier_country_code,
                    supplierRegNo,
                    buyerName,
                    buyerAddress,
                    buyerEmail,
                    buyerMobile,
                    buyer_country_code,
                    buyerRegNo,
                    orderItems,
                    description,
                    rejectedItems
                }
            } = reqObj;

            const supplier = await Supplier.findOne({ supplier_id: supplier_id });
            const buyer = await Buyer.findOne({ buyer_id: buyer_id });

            const enquiry = await Enquiry.findOne({enquiry_id});
    
            if (!enquiry) {
                return callback({ code: 404, message: 'Enquiry not found' });
            }
           
            enquiry.quotation_items.forEach(detail => {
                if (itemIds.some(itemId => detail._id.equals(new ObjectId(itemId)) && detail.status === 'accepted')) {
                    detail.status = 'PO created';
                }
            });

            enquiry.quotation_items.forEach(detail => {
                if (rejectedIds.some(rejectedItemId => detail._id.equals(new ObjectId(rejectedItemId)) && detail.status === 'rejected')) {
                    detail.status = 'rejected';
                }
            });
    
            orderItems.forEach(orderItem => {
                const enquiryItem = enquiry.items.find(item => item.medicine_id === orderItem.medicine_id);
                if (enquiryItem) {
                    console.log('enquiryItem',enquiryItem);
                    enquiryItem.status = 'PO created';
                } 
            });

            rejectedItems.forEach(rejectedItem => {
                const enquiryItem = enquiry.items.find(item => item.medicine_id === rejectedItem.medicine_id);
                if (enquiryItem) {
                    console.log('enquiryItem',enquiryItem);
                    enquiryItem.status = 'rejected';
                } 
            });
            enquiry.enquiry_status = 'PO created';
            await enquiry.save();

            const formattedOrderItems = orderItems.map(item => ({
                medicine_id       : item.medicine_id,
                medicine_name     : item.medicine_details.medicine_name,
                quantity_required : item.quantity_required,
                est_delivery_days : item.est_delivery_days,
                unit_price        : item.unit_price,
                total_amount      : item.totalAmount,
                counter_price     : item.counter_price,
                target_price      : item.target_price,
                status            : 'pending'
            }));

            const newPO = new PurchaseOrder({
                purchaseOrder_id: purchaseOrderId,
                enquiry_id,
                buyer_id,
                supplier_id,
                po_number               : poNumber,
                po_date                 : poDate,
                buyer_name              : buyerName,
                buyer_address           : buyerAddress,
                buyer_mobile            : buyerMobile,
                buyer_country_code      : buyer_country_code,
                buyer_email             : buyerEmail,
                buyer_regNo             : buyerRegNo,
                supplier_name           : supplierName,
                supplier_address        : supplierAddress,
                supplier_mobile         : supplierMobile,
                supplier_country_code   : supplier_country_code,
                supplier_email          : supplierEmail,
                supplier_regNo          : supplierRegNo,
                order_items             : formattedOrderItems,
                total_amount            : grandTotalAmount,
                additional_instructions : description,
                po_status               : 'active',
            });
            await newPO.save();
            const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10);
            const newNotification = new Notification({
                notification_id  : notificationId,
                event_type       : 'PO created',
                event            : 'purchaseorder',
                from             : 'buyer',
                to               : 'supplier',
                from_id          : buyer_id,
                to_id            : supplier_id,
                event_id         : enquiry_id,
                link_id          : purchaseOrderId,
                message          : `Purchase order created for ${enquiry_id}`,
                status           : 0
            })
            await newNotification.save()


            const body = `Hello ${supplier.supplier_name}, <br />
                                Purchase Order created for <strong>${enquiry_id}</strong>.<br />
                                <br /><br />
                                Thanks & Regards <br />
                                Team Deliver`;
  
                  await sendMailFunc('ajo@shunyaekai.tech', 'Purchase Order Created!', body);


            callback({ code: 200, message: 'Purchase Order Created Successfully', data: newPO });
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
                        total_amount            : 1,
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
                        total_amount            : 1,
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
                    $sort: { created_at: -1 }
                },
                {
                    $skip: offset
                },
                {
                    $limit: page_size
                },
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
                        purchaseOrder_id : purchaseOrder_id,
                        // buyer_id         : buyer_id,
                        // supplier_id      : supplier_id
                        // enquiry_id: enquiry_id
                    }
                },
                {
                    $lookup: {
                        from         : "enquiries",
                        localField   : "enquiry_id",
                        foreignField : "enquiry_id",
                        as           : "enquiry_details"
                    }
                },
                {
                    $lookup: {
                        from         : "buyers",
                        localField   : "buyer_id",
                        foreignField : "buyer_id",
                        as           : "buyer_details"
                    }
                },
                {
                    $lookup: {
                        from         : "suppliers",
                        localField   : "supplier_id",
                        foreignField : "supplier_id",
                        as           : "supplier_details"
                    }
                },
                {
                    $unwind: "$order_items"
                },
                {
                    $lookup: {
                        from         : "medicines",
                        localField   : "order_items.medicine_id",
                        foreignField : "medicine_id",
                        as           : "medicine_details"
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
                        _id                     : "$_id",
                        enquiry_id              : { $first: "$enquiry_id" },
                        purchaseOrder_id        : { $first: "$purchaseOrder_id" },
                        po_date                 : { $first: "$po_date" },
                        po_number               : { $first: "$po_number" },
                        additional_instructions : { $first: "$additional_instructions" },
                        po_status               : { $first: "$po_status" },
                        total_amount            : { $first: "$total_amount" },
                        buyer_name              : { $first: "$buyer_name" },
                        buyer_address           : { $first: "$buyer_address" },
                        buyer_mobile            : { $first: "$buyer_mobile" },
                        buyer_country_code         : { $first: "$buyer_country_code" },
                        buyer_email             : { $first: "$buyer_email" },
                        buyer_regNo             : { $first: "$buyer_regNo" },
                        supplier_name           : { $first: "$supplier_name" },
                        supplier_address        : { $first: "$supplier_address" },
                        supplier_mobile         : { $first: "$supplier_mobile" },
                        supplier_country_code         : { $first: "$supplier_country_code" },
                        supplier_email          : { $first: "$supplier_email" },
                        supplier_regNo          : { $first: "$supplier_regNo" },
                        supplier_name           : { $first: "$supplier_name" },
                        buyer_id                : { $first: "$buyer_id" },
                        supplier_id             : { $first: "$supplier_id" },
                        order_items             : { $push: "$order_items" },
                        buyer_details           : { $first: "$buyer_details" },
                        supplier_details        : { $first: "$supplier_details" },
                        enquiry_details        : { $first: "$enquiry_details" },
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

    editPO: async (reqObj, callback) => {
        try {
            const { 
                buyer_id,
                purchaseOrder_id, 
                supplier_id, 
                enquiry_id,
                grandTotalAmount,
                data: {
                    poDate,
                    poNumber,
                    supplierName,
                    supplierAddress,
                    supplierEmail,
                    supplierMobile,
                    supplier_country_code,
                    supplierRegNo,
                    buyerName,
                    buyerAddress,
                    buyerEmail,
                    buyerMobile,
                    buyer_country_code,
                    buyerRegNo,
                    orderItems,
                    description
                }
            } = reqObj;

            const supplier = await Supplier.findOne({ supplier_id: supplier_id });
            const buyer = await Buyer.findOne({ buyer_id: buyer_id });
            
            const purchaseOrder = await PurchaseOrder.findOne({ purchaseOrder_id });
            
            if (!purchaseOrder) {
                return callback({ code: 404, message: 'Purchase Order not found' });
            }
    
            if (purchaseOrder.supplier_id !== supplier_id || purchaseOrder.enquiry_id !== enquiry_id) {
                return callback({ code: 403, message: 'Unauthorized to edit this Purchase Order' });
            }
            
            purchaseOrder.po_date                 = poDate || purchaseOrder.po_date;
            purchaseOrder.po_number               = poNumber || purchaseOrder.po_number;
            purchaseOrder.supplier_name           = supplierName || purchaseOrder.supplier_name;
            purchaseOrder.supplier_address        = supplierAddress || purchaseOrder.supplier_address;
            purchaseOrder.supplier_email          = supplierEmail || purchaseOrder.supplier_email;
            purchaseOrder.supplier_mobile         = supplierMobile || purchaseOrder.supplier_mobile;
            purchaseOrder.supplier_country_code   = supplier_country_code || purchaseOrder.supplier_country_code;
            purchaseOrder.supplier_regNo          = supplierRegNo || purchaseOrder.supplier_regNo;
            purchaseOrder.buyer_name              = buyerName || purchaseOrder.buyer_name;
            purchaseOrder.buyer_address           = buyerAddress || purchaseOrder.buyer_address;
            purchaseOrder.buyer_email             = buyerEmail || purchaseOrder.buyer_email;
            purchaseOrder.buyer_mobile            = buyerMobile || purchaseOrder.buyer_mobile;
            purchaseOrder.buyer_country_code      = buyer_country_code || purchaseOrder.buyer_country_code;
            purchaseOrder.buyer_regNo             = buyerRegNo || purchaseOrder.buyer_regNo;
            purchaseOrder.additional_instructions = description || purchaseOrder.additional_instructions;
            
            if (orderItems) {
                purchaseOrder.order_items = orderItems.map(item => ({
                    medicine_id       : item.medicine_id,
                    medicine_name     : item.medicine_name,
                    quantity_required : item.quantity_required,
                    est_delivery_days : item.est_delivery_days,
                    unit_price        : item.unit_price,
                    // total_amount      : item.counter_price || item.target_price || item.total_amount ,
                    total_amount      : item.total_amount,
                    counter_price     : item.counter_price,
                    target_price      : item.target_price,
                    status            : 'pending'
                }));
            }
            
            await purchaseOrder.save();

            const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10);
            const newNotification = new Notification({
                notification_id  : notificationId,
                event_type       : 'PO edited',
                event            : 'purchaseorder',
                from             : 'buyer',
                to               : 'supplier',
                from_id          : buyer_id,
                to_id            : supplier_id,
                event_id         : enquiry_id,
                link_id          : purchaseOrder_id,
                message          : 'Purchase order edited',
                status           : 0
            })
            await newNotification.save()


            const body = `Hello ${supplier.supplier_name}, <br />
                                Purchase Order edited for <strong>${purchaseOrder_id}</strong>.<br />
                                <br /><br />
                                Thanks & Regards <br />
                                Team Deliver`;
  
                  await sendMailFunc('ajo@shunyaekai.tech', 'Purchase Order Edited!', body);

            callback({ code: 200, message: 'Purchase Order updated successfully', data: purchaseOrder });
        } catch (error) {
            console.log('Internal Server Error', error);
            callback({ code: 500, message: 'Internal Server Error' });
        }
    },
    
}    