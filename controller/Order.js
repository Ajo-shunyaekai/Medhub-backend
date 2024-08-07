const Order    = require('../schema/orderSchema')
const Support  = require('../schema/supportSchema')
const Invoice  = require('../schema/invoiceNumberSchema')
const Enquiry  = require('../schema/enquiryListSchema')

const initializeInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  if (count === 0) {
      const initialInvoiceNumber = new Invoice({ last_invoice_number: 18000 });
      await initialInvoiceNumber.save();
  }
};

module.exports = {

    createOrder : async(reqObj, callback) => {
       try {
        // await initializeInvoiceNumber();

        const orderId = 'ORD-' + Math.random().toString(16).slice(2);
      //   const itemIds = reqObj.items.map(item => item.product_id);

      //   const invoiceNumberDoc = await Invoice.findOneAndUpdate(
      //     {},
      //     { $inc: { last_invoice_number: 1 } },
      //     { new: true }
      // );

      // if (!invoiceNumberDoc) {
      //     return callback({ code: 500, message: 'Failed to generate invoice number' });
      // }

        const newOrder = new Order({
            order_id         : orderId,
            enquiry_id       : reqObj.enquiry_id,
            purchaseOrder_id : reqObj.purchaseOrder_id,
            buyer_id         : reqObj.buyer_id,
            supplier_id      : reqObj.supplier_id,
            invoice_no       : reqObj.invoice_no,
            invoice_date     : reqObj.invoice_date,
            payment_due_date : reqObj.payment_due_date,
            buyer_name       : reqObj.buyer_name,
            buyer_email      : reqObj.buyer_email,
            buyer_mobile     : reqObj.buyer_mobile,
            buyer_address    : reqObj.buyer_address,
            supplier_name    : reqObj.supplier_name,
            supplier_email   : reqObj.supplier_email,
            supplier_mobile  : reqObj.supplier_mobile,
            supplier_address : reqObj.supplier_address,       
            items            : reqObj.order_items,
            total_due_amount : reqObj.total_due_amount,
            order_status     : 'active',
            // payment_terms     : reqObj.payment_terms,
            // est_delivery_time : reqObj.est_delivery_time,
            // shipping_details  : reqObj.shipping_details,
            // remarks           : reqObj.remarks,
            // invoice_number    : invoiceNumberDoc.last_invoice_number
            // total_price  : reqObj.total_price,
        })

        newOrder.save().then(async() => {
          const updatedEnquiry = await Enquiry.findOneAndUpdate(
            { enquiry_id : reqObj.enquiry_id },
            {
                $set: {
                    enquiry_status  : 'order created'
                }
            },
            { new: true } 
        );
        if (!updatedEnquiry) {
            return callback({ code: 404, message: 'Enquiry not found', result: null });
        }
            return callback({code: 200, message: "Order created successfully"});
        })
        .catch((err) => {
            console.log('err in order request',err);
            return callback({code: 400, message: 'Error while creating the order'})
        })
       } catch (error) {
        callback({code: 500, message: 'Internal Server Error'})
       }
    },

    bookLogistics : async(reqObj, callback) => {
      try {
        console.log(reqObj)
        const {buyer_id, order_id, logistics_details} = reqObj

        const updatedOrder = await Order.findOneAndUpdate(
          { order_id : order_id },
          {
              $set: {
                logistics_details : logistics_details
              }
          },
          { new: true } 
      );
      if (!updatedOrder) {
          return callback({ code: 404, message: 'Order not found', result: null });
      }
          callback({code: 200, message: 'Updated', result: updatedOrder})

      } catch (error) {
        console.log(error)
       callback({code: 500, message: 'Internal Server Error'})
      }
    },

    buyerOrdersList: async (reqObj, callback) => {
        try {
          const {page_no, limit, filterKey, buyer_id} = reqObj
    
          const pageNo   = page_no || 1
          const pageSize = limit || 2
          const offset   = (pageNo - 1) * pageSize     
          
        Order.aggregate([
            {
                $match: { 
                    buyer_id     : reqObj.buyer_id,
                    order_status : reqObj.filterKey
                }
            },
            {
              $lookup: {
                from         : "suppliers",
                localField   : "supplier_id",
                foreignField : "supplier_id",
                as           : "supplier"
              }
            },
            {
              $project: {
                order_id          : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                items             : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                created_at        : 1,
                supplier          : { $arrayElemAt : ["$supplier", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.product_id",
                foreignField : "medicine_id",
                as           : "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image" : { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
              }
            },
            {
              $group: {
                _id               : "$_id",
                order_id          : { $first: "$order_id" },
                buyer_id          : { $first: "$buyer_id" },
                buyer_company     : { $first: "$buyer_company" },
                supplier_id       : { $first: "$supplier_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                created_at        : { $first: "$created_at" },
                supplier          : { $first: "$supplier" },
                totalPrice        : { $sum: "$items.item_price" }
              }
            },
            {
                $project: {
                    order_id          : 1,
                    buyer_id          : 1,
                    buyer_company     : 1,
                    supplier_id       : 1,
                    items             : 1,
                    payment_terms     : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "supplier.supplier_image" : 1,
                    "supplier.supplier_name"  : 1,
                }
            },
            { $sort : { created_at: -1 } },
            { $skip  : offset },
            { $limit : pageSize },
        ])
        .then((data) => {
            Order.countDocuments({order_status : filterKey, buyer_id: buyer_id})
            .then(totalItems => {
                const totalPages = Math.ceil(totalItems / pageSize);

                const responseData = {
                    data,
                    totalPages,
                    totalItems
                }
                callback({ code: 200, message: "Buyer Order List Fetched successfully", result: responseData });
            })
        })
        .catch((err) => {
            console.log('Error in fetching order list',err);
            callback({ code: 400, message: "Error in fetching order list", result: err });
        })
        } catch (error) {
          console.log('Intenal Server Error',error)
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
                    from         : "suppliers",
                    localField   : "supplier_id",
                    foreignField : "supplier_id",
                    as           : "supplier"
                  }
                },
                {
                  $project: {
                    order_id          : 1,
                    buyer_id          : 1,
                    buyer_company     : 1,
                    supplier_id       : 1,
                    items             : 1,
                    payment_terms     : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    invoice_number    : 1,
                    created_at        : 1,
                    supplier          : { $arrayElemAt: ["$supplier", 0] }
                  }
                },
                {
                  $unwind: "$items"
                },
                {
                  $lookup: {
                    from         : "medicines",
                    localField   : "items.product_id",
                    foreignField : "medicine_id",
                    as           : "medicine"
                  }
                },
                {
                  $addFields: {
                    "items.medicine_image" : {$arrayElemAt : ["$medicine.medicine_image", 0] },
                    "items.drugs_name"     : {$arrayElemAt  : ["$medicine.drugs_name",0]},
                    "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
                  }
                },
                {
                  $group: {
                    _id               : "$_id",
                    order_id          : { $first: "$order_id" },
                    buyer_id          : { $first: "$buyer_id" },
                    buyer_id          : { $first: "$buyer_company" },
                    supplier_id       : { $first: "$supplier_id" },
                    items             : { $push: "$items" },
                    payment_terms     : { $first: "$payment_terms" },
                    est_delivery_time : { $first: "$est_delivery_time" },
                    shipping_details  : { $first: "$shipping_details" },
                    remarks           : { $first: "$remarks" },
                    order_status      : { $first: "$order_status" },
                    invoice_number    : { $first: "$invoice_number" },
                    created_at        : {$first: "$created_at"},
                    supplier          : { $first: "$supplier" },
                    totalPrice        : { $sum: "$items.item_price" }
                  }
                },
                {
                    $project: {
                        order_id          : 1,
                        buyer_id          : 1,
                        buyer_company     : 1,
                        supplier_id       : 1,
                        items             : 1,
                        payment_terms     : 1,
                        est_delivery_time : 1,
                        shipping_details  : 1,
                        remarks           : 1,
                        order_status      : 1,
                        invoice_number    : 1,
                        created_at        : 1,
                        totalPrice        : 1,
                        "supplier.supplier_image" : 1,
                        "supplier.supplier_name"  : 1
                    }
                }
            ])
            .then((data) => {
                callback({ code: 200, message: "Details Fetched successfully", result: data[0] });
            })
            .catch((err) => {
                console.log(err);
                callback({ code: 400, message: "Error in fetching order details", result: err });
            })
            
        } catch (error) {
            
        }
    },

    cancelOrder : async(reqObj, callback) => {
       try {
        const {order_id, buyer_id, reason, order_type} = reqObj
        
        Order.updateOne(
          {order_id: order_id, buyer_id: buyer_id, order_status: order_type},
          {$set: {order_status: 'cancelled',cancellation_reason: reason}})
        .then((data) => {
          callback({ code: 200, message: "Order cancelled successfully", result: data });
        })
        .catch((err) => {
          callback({ code: 400, message: "Error while cancelling the order", result: err });
        })
       } catch (error) {
        callback({ code: 500, message: "Internal Server Error", result: error });
       }
    },

    orderFeedback : async(reqObj, callback) => {
      try {
        console.log(reqObj);
       const supportId    = 'SPT-' + Math.random().toString(16).slice(2);

       const newSupport = new Support({
        support_id    : supportId,
        user_id       : reqObj.buyer_id || reqObj.supplier_id ,
        user_type     : reqObj.user_type,
        order_id      : reqObj.order_id,
        support_type  : reqObj.support_type,
        reason        : reqObj.feedback,
        support_image : reqObj.feedback_image,
        status        : 0
       })
        newSupport.save().then((data) => {
          callback({ code: 200, message: "Feedback submitted Successfully", result: data });
        })
        .catch((err) => {
          callback({ code: 400, message: "Error while submitting feedback", result: err});
        })
      } catch (error) {
       callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },

    orderComplaint : async(reqObj, callback) => {
      try {
        const supportId    = 'SPT-' + Math.random().toString(16).slice(2);

        const newSupport = new Support({
         support_id    : supportId,
         user_id       : reqObj.buyer_id || reqObj.supplier_id,
         user_type     : reqObj.user_type,
         order_id      : reqObj.order_id,
         support_type  : reqObj.support_type,
         reason        : reqObj.complaint,
         support_image : reqObj.complaint_image,
         status        : 0,
     })
 
        newSupport.save().then((data) => {
          callback({ code: 200, message: "Complaint submitted Successfully", result: data });
        })
        .catch((err) => {
          callback({ code: 400, message: "Error while submitting complaint", result: err});
        })
      } catch (error) {
      callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },

    buyerInvoicesList: async (reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, buyer_id} = reqObj
  
        const pageNo   = page_no || 1
        const pageSize = limit || 1
        const offset   = (pageNo - 1) * pageSize     
        
        Order.aggregate([
            {
                $match: { 
                    buyer_id     : reqObj.buyer_id,
                    order_status : reqObj.filterKey
                }
            },
            {
              $lookup: {
                from         : "suppliers",
                localField   : "supplier_id",
                foreignField : "supplier_id",
                as           : "supplier"
              }
            },
            {
              $project: {
                order_id          : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                items             : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                invoice_number    : 1,
                created_at        : 1,
                supplier          : { $arrayElemAt : ["$supplier", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.product_id",
                foreignField : "medicine_id",
                as           : "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
              }
            },
            {
              $group: {
                _id               : "$_id",
                order_id          : { $first: "$order_id" },
                buyer_id          : { $first: "$buyer_id" },
                buyer_company     : { $first: "$buyer_company" },
                supplier_id       : { $first: "$supplier_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                invoice_number    : { $first: "$invoice_number" },
                created_at        : { $first: "$created_at" },
                supplier          : { $first: "$supplier" },
                totalPrice        : { $sum: "$items.item_price" }
              }
            },
            {
                $project: {
                    order_id          : 1,
                    buyer_id          : 1,
                    buyer_company     : 1,
                    supplier_id       : 1,
                    items             : 1,
                    payment_terms     : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    invoice_number    : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "supplier.supplier_image" : 1,
                    "supplier.supplier_name"     : 1,
                    "supplier.supplier_address"  : 1,
                }
            },
            { $sort : { created_at: -1 } },
            // { $skip  : offset },
            // { $limit : pageSize },
        ])
        .then((data) => {
            Order.countDocuments({order_status : filterKey, buyer_id: buyer_id})
            .then(totalItems => {
                const totalPages = Math.ceil(totalItems / pageSize);

                const responseData = {
                    data,
                    totalPages,
                    totalItems
                }
                callback({ code: 200, message: "List Fetched successfully", result: responseData });
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

    buyerInvoiceDetails : async (reqObj, callback) => {
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
                  from         : "suppliers",
                  localField   : "supplier_id",
                  foreignField : "supplier_id",
                  as           : "supplier"
                }
              },
              {
                $project: {
                  order_id          : 1,
                  buyer_id          : 1,
                  buyer_company     : 1,
                  supplier_id       : 1,
                  // supplier_name     : 1,
                  // supplier_address  : 1,
                  items             : 1,
                  payment_terms     : 1,
                  est_delivery_time : 1,
                  shipping_details  : 1,
                  remarks           : 1,
                  order_status      : 1,
                  invoice_number    : 1,
                  created_at        : 1,
                  supplier          : { $arrayElemAt: ["$supplier", 0] }
                }
              },
              {
                $unwind: "$items"
              },
              {
                $lookup: {
                  from         : "medicines",
                  localField   : "items.product_id",
                  foreignField : "medicine_id",
                  as           : "medicine"
                }
              },
              {
                $addFields: {
                  "items.medicine_image" : {$arrayElemAt : ["$medicine.medicine_image", 0] },
                  "items.drugs_name"     : {$arrayElemAt  : ["$medicine.drugs_name",0]},
                  "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
                }
              },
              {
                $group: {
                  _id               : "$_id",
                  order_id          : { $first: "$order_id" },
                  buyer_id          : { $first: "$buyer_id" },
                  buyer_company     : { $first: "$buyer_company" },
                  supplier_id       : { $first: "$supplier_id" },
                  // supplier_name     : { $first: "$supplier_name" },
                  // supplier_address  : { $first: "$supplier_address" },
                  items             : { $push: "$items" },
                  payment_terms     : { $first: "$payment_terms" },
                  est_delivery_time : { $first: "$est_delivery_time" },
                  shipping_details  : { $first: "$shipping_details" },
                  remarks           : { $first: "$remarks" },
                  order_status      : { $first: "$order_status" },
                  invoice_number    : { $first: "$invoice_number" },
                  created_at        : {$first: "$created_at"},
                  supplier          : { $first: "$supplier" },
                  totalPrice        : { $sum: "$items.item_price" }
                }
              },
              {
                  $project: {
                      order_id          : 1,
                      buyer_id          : 1,
                      buyer_company     : 1,
                      supplier_id       : 1,
                      // supplier_name     : 1,
                      // supplier_address  : 1,
                      items             : 1,
                      payment_terms     : 1,
                      est_delivery_time : 1,
                      shipping_details  : 1,
                      remarks           : 1,
                      order_status      : 1,
                      invoice_number    : 1,
                      created_at        : 1,
                      totalPrice        : 1,
                      "supplier.supplier_image"    : 1,
                      "supplier.supplier_name"     : 1,
                      "supplier.supplier_address"  : 1,
                      // "supplier.supplier_name"  : 1
                  }
              }
          ])
          .then((data) => {
              callback({ code: 200, message: "Details Fetched successfully", result: data[0] });
          })
          .catch((err) => {
              console.log(err);
              callback({ code: 400, message: "Error in fetching order details", result: err });
          })
          
      } catch (error) {
        console.log('Intenal Server Error',error)
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },

    supplierOrdersList: async (reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, supplier_id} = reqObj

        const pageNo   = page_no || 1
        const pageSize = limit || 2
        const offset   = (pageNo - 1) * pageSize  

        const adjustedFilterKey = filterKey === 'order-request' ? 'pending' : filterKey;  
        
        Order.aggregate([
            {
                $match: { 
                    supplier_id  : supplier_id,
                    order_status : adjustedFilterKey
                }
            },
            {
              $lookup: {
                from         : "buyers",
                localField   : "buyer_id",
                foreignField : "buyer_id",
                as           : "buyer"
              }
            },
            {
              $project: {
                order_id          : 1,
                supplier_id       : 1,
                buyer_name     : 1,
                buyer_id          : 1,
                items             : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                created_at        : 1,
                buyer          : { $arrayElemAt : ["$buyer", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.product_id",
                foreignField : "medicine_id",
                as           : "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image" : { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
              }
            },
            {
              $group: {
                _id               : "$_id",
                order_id          : { $first: "$order_id" },
                supplier_id       : { $first: "$supplier_id" },
                buyer_name        : { $first: "$buyer_name" },
                buyer_id          : { $first: "$buyer_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                created_at        : { $first: "$created_at" },
                buyer             : { $first: "$buyer" },
                totalPrice        : { $sum: "$items.item_price" }
              }
            },
            {
                $project: {
                    order_id          : 1,
                    supplier_id       : 1,
                    buyer_name        : 1,
                    buyer_id          : 1,
                    items             : 1,
                    payment_terms     : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "buyer.buyer_image" : 1,
                    "buyer.buyer_name"  : 1,
                }
            },
            { $sort : { created_at: -1 } },
            { $skip  : offset },
            { $limit : pageSize },
        ])
        .then((data) => {
            Order.countDocuments({order_status : adjustedFilterKey, supplier_id: supplier_id})
            .then(totalItems => {
                const totalPages = Math.ceil(totalItems / pageSize);

                const responseData = {
                    data,
                    totalPages,
                    totalItems
                }
                callback({ code: 200, message: "Supplier Order List Fetched successfully", result: responseData });
            })
        })
        .catch((err) => {
            console.log('Error in fetching order list',err);
            callback({ code: 400, message: "Error in fetching order list", result: err });
        })
      } catch (error) {
        console.log('Intenal Server Error',error)
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },

    supplierOrderDetails : async (reqObj, callback) => {
      try {
          const {seller_id, order_id, filterKey} = reqObj

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
                  from         : "suppliers",
                  localField   : "supplier_id",
                  foreignField : "supplier_id",
                  as           : "supplier"
                }
              },
              {
                $project: {
                  order_id          : 1,
                  buyer_id          : 1,
                  buyer_company     : 1,
                  country_of_origin : 1,
                  supplier_id       : 1,
                  items             : 1,
                  payment_terms     : 1,
                  est_delivery_time : 1,
                  shipping_details  : 1,
                  remarks           : 1,
                  order_status      : 1,
                  invoice_number    : 1,
                  created_at        : 1,
                  supplier          : { $arrayElemAt: ["$supplier", 0] }
                }
              },
              {
                $unwind: "$items"
              },
              {
                $lookup: {
                  from         : "medicines",
                  localField   : "items.product_id",
                  foreignField : "medicine_id",
                  as           : "medicine"
                }
              },
              {
                $addFields: {
                  "items.medicine_image" : {$arrayElemAt : ["$medicine.medicine_image", 0] },
                  "items.drugs_name"     : {$arrayElemAt  : ["$medicine.drugs_name",0]},
                  "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
                }
              },
              {
                $group: {
                  _id               : "$_id",
                  order_id          : { $first: "$order_id" },
                  buyer_id          : { $first: "$buyer_id" },
                  buyer_company     : { $first: "$buyer_company" },
                  buyer_name        : { $first: "$buyer_name" },
                  country_of_origin :  { $first: "$country_of_origin" },
                  supplier_id       : { $first: "$supplier_id" },
                  items             : { $push: "$items" },
                  payment_terms     : { $first: "$payment_terms" },
                  est_delivery_time : { $first: "$est_delivery_time" },
                  shipping_details  : { $first: "$shipping_details" },
                  remarks           : { $first: "$remarks" },
                  order_status      : { $first: "$order_status" },
                  invoice_number    : { $first: "$invoice_number" },
                  created_at        : {$first: "$created_at"},
                  supplier          : { $first: "$supplier" },
                  totalPrice        : { $sum: "$items.item_price" }
                }
              },
              {
                  $project: {
                      order_id          : 1,
                      buyer_id          : 1,
                      buyer_company     : 1,
                      buyer_name        : 1,
                      country_of_origin : 1,
                      supplier_id       : 1,
                      items             : 1,
                      payment_terms     : 1,
                      est_delivery_time : 1,
                      shipping_details  : 1,
                      remarks           : 1,
                      order_status      : 1,
                      invoice_number    : 1,
                      created_at        : 1,
                      totalPrice        : 1,
                      "supplier.supplier_image" : 1,
                      "supplier.supplier_name"  : 1
                  }
              }
          ])
          .then((data) => {
              callback({ code: 200, message: "Details Fetched successfully", result: data[0] });
          })
          .catch((err) => {
              console.log(err);
              callback({ code: 400, message: "Error in fetching order details", result: err });
          })
          
      } catch (error) {
          
      }
    },

    supplierInvoicesList: async (reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, supplier_id} = reqObj
  
        const pageNo   = page_no || 2
        const pageSize = limit || 2
        const offset   = (pageNo - 1) * pageSize     
        
        Order.aggregate([
            {
                $match: { 
                    supplier_id    : supplier_id,
                    order_status : reqObj.filterKey
                }
            },
            {
              $lookup: {
                from         : "suppliers",
                localField   : "supplier_id",
                foreignField : "supplier_id",
                as           : "supplier"
              }
            },
            {
              $project: {
                order_id          : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                items             : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                invoice_number    : 1,
                created_at        : 1,
                supplier          : { $arrayElemAt : ["$supplier", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.product_id",
                foreignField : "medicine_id",
                as           : "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
              }
            },
            {
              $group: {
                _id               : "$_id",
                order_id          : { $first: "$order_id" },
                buyer_id          : { $first: "$buyer_id" },
                buyer_company     : { $first: "$buyer_company" },
                supplier_id       : { $first: "$supplier_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                invoice_number    : { $first: "$invoice_number" },
                created_at        : { $first: "$created_at" },
                supplier          : { $first: "$supplier" },
                totalPrice        : { $sum: "$items.item_price" }
              }
            },
            {
                $project: {
                    order_id          : 1,
                    buyer_id          : 1,
                    buyer_company     : 1,
                    supplier_id       : 1,
                    items             : 1,
                    payment_terms     : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    invoice_number    : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "supplier.supplier_image" : 1,
                    "supplier.supplier_name"     : 1,
                    "supplier.supplier_address"  : 1,
                }
            },
            { $sort : { created_at: -1 } },
            { $skip  : offset },
            { $limit : pageSize },
        ])
        .then((data) => {
            Order.countDocuments({order_status : filterKey, supplier_id: supplier_id})
            .then(totalItems => {
                const totalPages = Math.ceil(totalItems / pageSize);

                const responseData = {
                    data,
                    totalPages,
                    totalItems
                }
                callback({ code: 200, message: "List Fetched successfully", result: responseData });
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

    proformaInvoiceList: async (reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, buyer_id} = reqObj
  
        const pageNo   = page_no || 1
        const pageSize = limit || 1
        const offset   = (pageNo - 1) * pageSize     
        
        Order.aggregate([
            {
                $match: { 
                    buyer_id     : reqObj.buyer_id,
                    order_status : reqObj.filterKey
                }
            },
            {
              $lookup: {
                from         : "suppliers",
                localField   : "supplier_id",
                foreignField : "supplier_id",
                as           : "supplier"
              }
            },
            {
              $lookup: {
                from         : "buyers",
                localField   : "buyer_id",
                foreignField : "buyer_id",
                as           : "buyer"
              }
            },
            {
              $project: {
                order_id          : 1,
                enquiry_id        : 1,
                buyer_id          : 1,
                supplier_id       : 1,
                buyer_name        : 1,
                buyer_address     : 1,
                buyer_email       : 1,
                buyer_mobile      : 1,
                supplier_name     : 1 ,
                supplier_address  : 1,
                supplier_email    : 1,
                supplier_mobile   : 1,
                items             : 1,
                total_due_amount  : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                invoice_no        : 1,
                created_at        : 1,
                supplier          : { $arrayElemAt : ["$supplier", 0] },
                buyer             : { $arrayElemAt : ["$buyer", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.product_id",
                foreignField : "medicine_id",
                as           : "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image" : { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
              }
            },
            {
              $group: {
                _id               : "$_id",
                order_id          : { $first: "$order_id" },
                enquiry_id        : { $first: "$enquiry_id" },
                buyer_id          : { $first: "$buyer_id" },
                supplier_id       : { $first: "$supplier_id" },
                buyer_name        : { $first: "$buyer_name" },
                buyer_address     : { $first: "$buyer_address" },
                buyer_email       : { $first: "$buyer_email" },
                buyer_mobile      : { $first: "$buyer_mobile" },
                supplier_name     : { $first: "$supplier_name" },
                supplier_address  : { $first: "$supplier_address" },
                supplier_email    : { $first: "$supplier_email" },
                supplier_mobile   : { $first: "$supplier_mobile" },
                items             : { $push: "$items" },
                total_due_amount  : { $first: "$total_due_amount" },
                payment_terms     : { $first: "$payment_terms" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                invoice_no        : { $first: "$invoice_no" },
                created_at        : { $first: "$created_at" },
                buyer             : { $first: "$buyer" },
                supplier          : { $first: "$supplier" },
                totalPrice        : { $sum: "$items.item_price" }
              }
            },
            {
                $project: {
                    order_id          : 1,
                    enquiry_id        : 1,
                    buyer_id          : 1,
                    supplier_id       : 1,
                    buyer_name        : 1,
                    buyer_address     : 1,
                    buyer_email       : 1,
                    buyer_mobile      : 1,
                    supplier_name     : 1 ,
                    supplier_address  : 1,
                    supplier_email    : 1,
                    supplier_mobile   : 1,
                    items             : 1,
                    total_due_amount  : 1,
                    payment_terms     : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    invoice_no        : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "buyer.buyer_image"         : 1,
                    "buyer.buyer_name"          : 1,
                    "buyer.buyer_address"       : 1,
                    "supplier.supplier_image"   : 1,
                    "supplier.supplier_name"    : 1,
                    "supplier.supplier_address" : 1,
                }
            },
            { $sort : { created_at: -1 } },
            // { $skip  : offset },
            // { $limit : pageSize },
        ])
        .then((data) => {
            Order.countDocuments({order_status : filterKey, buyer_id: buyer_id})
            .then(totalItems => {
                const totalPages = Math.ceil(totalItems / pageSize);

                const responseData = {
                    data,
                    totalPages,
                    totalItems
                }
                callback({ code: 200, message: "List Fetched successfully", result: responseData });
            })
        })
        .catch((err) => {
            console.log(err);
            callback({ code: 400, message: "Error in fetching order list", result: err });
        })
      } catch (error) {
        
      }
    }

}