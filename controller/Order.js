const Order    = require('../schema/orderSchema')
const Support  = require('../schema/supportSchema')
const Invoice  = require('../schema/invoiceNumberSchema')
const Invoices = require('../schema/invoiceSchema')
const Enquiry  = require('../schema/enquiryListSchema')
const Buyer        = require('../schema/buyerSchema')
const Supplier     = require('../schema/supplierSchema')
const Notification = require('../schema/notificationSchema')
const PurchaseOrder = require('../schema/purchaseOrderSchema')
const Address = require("../schema/addressSchema");
const Logistics = require('../schema/logisticsSchema')
const nodemailer         = require('nodemailer');
const { flattenData } = require('../utils/csvConverter')
const { parse } = require('json2csv');
const fs = require('fs');
const path = require('path');
const { addStageToOrderHistory } = require('./orderHistory')
const logErrorToFile = require('../logs/errorLogs')
const { sendErrorResponse } = require('../utils/commonResonse')


  const transporter = nodemailer.createTransport({
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
    
    const mailOptions = {
        from    : process.env.SMTP_USER_ID,
        to      : email,
        subject : subject,
        // text    : 'This is text mail, and sending for testing purpose'
        html:body
        
    };
    transporter.sendMail(mailOptions);
  }

  const initializeInvoiceNumber = async () => {
    const count = await Invoice.countDocuments();
    if (count === 0) {
        const initialInvoiceNumber = new Invoice({ last_invoice_number: 18000 });
        await initialInvoiceNumber.save();
    }
  };

module.exports = {

   createOrder : async (req, res, reqObj, callback) => {
       try {

        const orderId = 'ORD-' + Math.random().toString(16).slice(2, 10);
        const paymentTermsArray = reqObj.data.paymentTerms.split('\n').map(term => term.trim());

        const supplier = await Supplier.findOne({ supplier_id: reqObj.supplier_id });
        const buyer = await Buyer.findOne({ buyer_id: reqObj.buyer_id });

        const newOrder = new Order({
            order_id          : orderId,
            enquiry_id        : reqObj.enquiry_id,
            purchaseOrder_id  : reqObj.purchaseOrder_id,
            buyer_id          : reqObj.buyer_id,
            supplier_id       : reqObj.supplier_id,
            invoice_no        : reqObj.data.invoiceNumber,
            invoice_date      : reqObj.data.invoiceDate,
            deposit_requested : reqObj.data.depositRequested,
            // deposit_due       : reqObj.data.depositDue,
            deposit_due_date  : reqObj.data.depositDueDate,
            payment_due_date  : reqObj.data.dueDate,
            payment_terms     : paymentTermsArray,
            buyer_name        : reqObj.data.buyerName,
            buyer_email       : reqObj.data.buyerEmail,
            buyer_mobile      : reqObj.data.buyerMobile,
            buyer_address     : reqObj.data.buyerAddress,
            supplier_name     : reqObj.data.supplierName,
            supplier_email    : reqObj.data.supplierEmail,
            supplier_mobile   : reqObj.data.supplierMobile,
            supplier_address  : reqObj.data.supplierAddress,       
            items             : reqObj.orderItems || reqObj.data.orderItems,
            total_due_amount  : reqObj.data.totalDueAmount,
            grand_total       : reqObj.data.totalAmount,
            total_amount_paid : 0,
            pending_amount    : reqObj.data.totalAmount,
            order_status      : 'active',
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
        
            //   (id, stageName, stageDescription, stageDate, stageReference, stageReferenceType)
            // const updatedOrderHistory = await addStageToOrderHistory(updatedEnquiry?._id, 'Order Created', new Date(), newOrder?._id, 'Order',)
         const updatedPO = await PurchaseOrder.findOneAndUpdate(
            { purchaseOrder_id : reqObj.purchaseOrder_id },
            {
                $set: {
                    po_status  : 'order created'
                }
            },
            { new: true } 
        );
        if (!updatedPO) {
          return callback({ code: 404, message: 'Purchase Order not found', result: null });
      }
          const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10);
          const newNotification = new Notification({
            notification_id : notificationId,
            event_type      : 'Order created',
            event           : 'order',
            from            : 'supplier',
            to              : 'buyer',
            from_id         : reqObj.supplier_id,
            to_id           : reqObj.buyer_id,
            event_id        : orderId,
            connected_id    : reqObj.enquiry_id,
            message         : `Order Created! Your order has been created for ${reqObj.enquiry_id}`,
            status          : 0
        })
        await newNotification.save()

       const subject = `Order Confirmation from  ${supplier.supplier_name}`
       let itemsTable = `<table border="1" cellpadding="5" cellspacing="0">
                              <tr>
                                  <th>Product Name</th>
                                  <th>Quantity</th>
                                  <th>Price</th>
                                  <th>Tax</th>
                                  <th>Total Amount</th>
                              </tr>`;
                        reqObj.orderItems.forEach(item => {
                        itemsTable += `<tr>
                                  <td>${item.medicine_name}</td>
                                  <td>${item.quantity_required}</td>
                                  <td>${item.counter_price || item.target_price} AED</td>
                                  <td>${item.unit_tax}%</td>
                                  <td>${item.total_amount} AED</td>
                              </tr>`;
                        });
                        itemsTable += `</table>`;

                        // Email Body
                        const body = `
                        <p>Dear ${buyer.buyer_name},</p>
                        <p>Thank you for your order. We are pleased to confirm order and the details as follows:</p>
                        ${itemsTable}
                        <p>We have begun processing your order and will keep you informed about its status. </p>
                        <p>If you need further assistance, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
                        <p>Thanks & Regards,<br/>MedHub Global Team</p>
                        `;

                        // Sending the email to multiple recipients (supplier and buyer)
                        const recipientEmails = [buyer.buyer_email, 'ajo@shunyaekai.tech'];  // Add more emails if needed
                        await sendMailFunc(recipientEmails.join(','), subject, body);
            return callback({code: 200, message: "Order Created Successfully"});
        })
        .catch((err) => {
            console.log('err in order request',err);
            return callback({code: 400, message: 'Error while creating the order'})
        })
       } catch (error) {
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
       }
    },

    //new code
    // bookLogistics: async (req, res, reqObj, callback) => {
    //   try {
    //     const { buyer_id, supplier_id, order_id, buyer_logistics_data, is_registered } = reqObj;
    //     const {full_name, email, mobile_number, house_name, locality, city, state, country, pincode, type } = reqObj.buyer_logistics_data
    
    //     if (!buyer_id || !supplier_id || !order_id || !buyer_logistics_data) {
    //       return callback({ code: 400, message: 'Missing required fields', result: null });
    //     }

    //     const buyer = await Buyer.findOne({ buyer_id });
    //     if (!buyer) {
    //       return callback({ code: 404, message: 'Buyer not found', result: null });
    //     }
    //     const supplier = await Supplier.find({ supplier_id });
    //     if (!supplier) {
    //       return callback({ code: 404, message: 'Supplier not found', result: null });
    //     }
    //     // const address = await Address.findOne({ user_id: buyer_id });
    //     if(!is_registered) {
    //       const newAddress = new Address({
    //         user_id: buyer?._id,
    //         full_name,
    //         email,
    //         mobile_number,
    //         house_name,
    //         locality,
    //         city,
    //         state,
    //         country,
    //         pincode,
    //         type,
    //         // isDefault,
    //     });
    //     await newAddress.save();
    //     }
       

    //     const updatedOrder = await Order.findOneAndUpdate(
    //       { order_id },
    //       {
    //         $set: {
    //           buyer_logistics_data,
    //           status: 'Awaiting Details from Supplier',
    //         },
    //       },
    //       { new: true }
    //     );
    
    //     if (!updatedOrder) {
    //       return callback({ code: 404, message: 'Order not found', result: null });
    //     }
    //     //   (id, stageName, stageDescription, stageDate, stageReference, stageReferenceType)
    //     const updatedOrderHistory = await addStageToOrderHistory(updatedOrder?._id, 'Delivery Details Submitted', new Date(), updatedOrder?._id, 'Order',)

    //   //   const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10);
    //   //   const newNotification = new Notification({
    //   //     notification_id : notificationId,
    //   //     event_type      : 'Logistics booking request',
    //   //     event           : 'order',
    //   //     from            : 'buyer',
    //   //     to              : 'supplier',
    //   //     from_id         : buyer_id,
    //   //     to_id           : supplier_id,
    //   //     event_id        : order_id,
    //   //     message         : `Logisctics Booking Request! A logistics booking request has been initiated for ${order_id}`,
    //   //     status          : 0
    //   //   })
    //   //  await newNotification.save()

    // // const body = `Hello ${supplier.supplier_name}, <br />
    // //               Logistics Booking details has been submitted by ${buyer.buyer_name} for <strong>${order_id}</strong>.<br />
    // //               <br /><br />
    // //               Thanks & Regards <br />
    // //               MedHub Global Team`;

    // // await sendMailFunc(supplier.supplier_email, 'Logistics Booking Details Submitted!', body);
    
    //     // Success response
    //     // return callback(null, {
    //     //   code: 200,
    //     //   message: 'Logistics request submitted successfully',
    //     //   result: updatedOrder,
    //     // });
    //     callback({code: 200, message: 'Logistics Details Submitted Successfully', result: updatedOrder})
    //   } catch (error) {
    //     // Error handling
    //     console.error('Error in bookLogistics:', error);
    //     return callback({
    //       code: 500,
    //       message: 'Internal Server Error',
    //       result: null,
    //     });
    //   }
    // },


    //old code


    bookLogistics: async (req, res, reqObj, callback) => {
      try {
        
        const { buyer_id, supplier_id, order_id, logistics_details } = reqObj
        const logisticsArray = Array.isArray(logistics_details) ? logistics_details : [logistics_details];

        const supplier = await Supplier.findOne({ supplier_id: supplier_id });
        const buyer = await Buyer.findOne({ buyer_id: buyer_id });

        const updatedOrder = await Order.findOneAndUpdate(
          { order_id : order_id },
          {
              $set: {
                logistics_details : logisticsArray,
                status            : 'Awaiting Details from Supplier'
              }
          },
          { new: true } 
      );
      if (!updatedOrder) {
          return callback({ code: 404, message: 'Order not found', result: null });
      }

      const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10);
      const newNotification = new Notification({
        notification_id : notificationId,
        event_type      : 'Logistics booking request',
        event           : 'order',
        from            : 'buyer',
        to              : 'supplier',
        from_id         : buyer_id,
        to_id           : supplier_id,
        event_id        : order_id,
        message         : `Logisctics Booking Request! A logistics booking request has been initiated for ${order_id}`,
        status          : 0
    })
    await newNotification.save()

    // const body = `Hello ${supplier.supplier_name}, <br />
    //               Logistics Booking details has been submitted by ${buyer.buyer_name} for <strong>${order_id}</strong>.<br />
    //               <br /><br />
    //               Thanks & Regards <br />
    //               MedHub Global Team`;

    // await sendMailFunc(supplier.supplier_email, 'Logistics Booking Details Submitted!', body);
     
    callback({code: 200, message: 'Logistics Details Submitted Successfully', result: updatedOrder})

      } catch (error) {
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },
    
    //new code
    // submitPickupDetails: async (req, res, reqObj, callback) => {
    //   try {
    //     const { buyer_id, supplier_id, order_id, shipment_details, supplier_logistics_data, is_registered } = reqObj;
    //     const {full_name, email, mobile_number, house_name, locality, city, state, country, pincode, type  } = reqObj.supplier_logistics_data
    //     const supplier = await Supplier.findOne({ supplier_id: supplier_id });
    //     const buyer = await Buyer.findOne({ buyer_id: buyer_id });
    //     const order = await Order.findOne({order_id: order_id})

    //     if (!supplier) {
    //       return callback({ code: 404, message: 'Supplier not found', result: null });
    //     }

    //     if (!buyer) {
    //       return callback({ code: 404, message: 'Buyer not found', result: null });
    //     }
    //     if(!is_registered) {
    //     const newAddress = new Address({
    //       user_id: supplier?._id,
    //       full_name,
    //       email,
    //       mobile_number,
    //       house_name,
    //       locality,
    //       city,
    //       state,
    //       country,
    //       pincode,
    //       type,
    //   });
    //   await newAddress.save();
    // }

    //     const updatedOrder = await Order.findOneAndUpdate(
    //       { order_id: order_id },
    //       {
    //         $set: {
    //           shipment_details: shipment_details,
    //           supplier_logistics_data: supplier_logistics_data,
    //           status: 'Shipment Details Submitted',
    //         },
    //       },
    //       { new: true } 
    //     );

    //     if (!updatedOrder) {
    //       return callback({ code: 404, message: 'Order not found', result: null });
    //     }
    //     const logisticsId = 'LGR-' + Math.random().toString(16).slice(2, 10);
    //     const newLogisticsRequest = new Logistics({
    //       logistics_id     : logisticsId,
    //       enquiry_id       : order.enquiry_id,
    //       purchaseOrder_id : order.purchaseOrder_id,
    //       orderId          : order._id,
    //       supplierId       : supplier._id,
    //       buyerId          : buyer._id,
    //       status           : 'P'
    //     });
    //     await newLogisticsRequest.save();

    //     //   (id, stageName, stageDescription, stageDate, stageReference, stageReferenceType)
    //     const updatedOrderHistory = await addStageToOrderHistory(updatedOrder?._id, 'Pick up Details Submitted', new Date(), newLogisticsRequest?._id, 'Logistics',)

    //     const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10);
    //     const newNotification = new Notification({
    //       notification_id: notificationId,
    //       event_type: 'Shipment details submitted',
    //       event: 'order',
    //       from: 'supplier',
    //       to: 'buyer',
    //       from_id: supplier_id,
    //       to_id: buyer_id,
    //       event_id: order_id,
    //       message: `Submission Confirmation: The shipment details have been successfully submitted for ${order_id}`,
    //       status: 0,
    //     });
    //     await newNotification.save();

    //     // const body = `Hello ${buyer.buyer_name}, <br />
    //     // Your logistics details for <strong>${order_id}</strong> have been submitted to our logistics partner.<br />
    //     // <br /><br />
    //     // Thanks & Regards <br />
    //     // MedHub Global Team`;
    //     // await sendMailFunc(buyer.buyer_email, 'Logistics Details Submitted!', body);

    //     callback({ code: 200, message: 'Updated', result: updatedOrder });
    //   } catch (error) {
    //     console.error(error);
    //     callback({ code: 500, message: 'Internal Server Error' });
    //   }
    // },


    //old code
    submitPickupDetails: async (req, res, reqObj, callback) => {
      try {
        
        const { buyer_id, supplier_id, order_id, shipment_details } = reqObj

         const supplier = await Supplier.findOne({ supplier_id: supplier_id });
            const buyer = await Buyer.findOne({ buyer_id: buyer_id });


        const updatedOrder = await Order.findOneAndUpdate(
          { order_id : order_id },
          {
              $set: {
                shipment_details : shipment_details,
                status           : 'Shipment Details Submitted'
              }
          },
          { new: true } 
      );
      if (!updatedOrder) {
          return callback({ code: 404, message: 'Order not found', result: null });
      }
          const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10);
          const newNotification = new Notification({
            notification_id : notificationId,
            event_type      : 'Shipment details submitted',
            event           : 'order',
            from            : 'supplier',
            to              : 'buyer',
            from_id         : supplier_id,
            to_id           : buyer_id,
            event_id        : order_id,
            message         : `Submission Confirmation: The shipment details have been successfully submitted for ${order_id}`,
            status          : 0
        })
        await newNotification.save()

//         const body = `Hello ${buyer.buyer_name}, <br />
//         Your logisctics details for <strong>${order_id}</strong> has been submitted to our logistics partner .<br />
//         <br /><br />
//         Thanks & Regards <br />
//         MedHub Global Team`;

// await sendMailFunc(buyer.buyer_email, 'Logistics Details Submitted!', body);
     
          callback({code: 200, message: 'Updated', result: updatedOrder})

      } catch (error) {
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },



    buyerOrdersList: async (req, res, reqObj, callback) => {
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
                invoice_no        : 1,
                remarks           : 1,
                order_status      : 1,
                status            : 1,
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
                invoice_no        : { $first: "$invoice_no" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                status            : { $first: "$status" },
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
                    invoice_no        : 1,
                    order_status      : 1,
                    status            : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "supplier.supplier_image" : 1,
                    "supplier.supplier_name"  : 1,
                    "supplier.supplier_type"  : 1,
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
          console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
        }
    },

    buyerOrderDetails : async (req, res, reqObj, callback) => {
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
                  $lookup: {
                    from         : "buyers",
                    localField   : "buyer_id",
                    foreignField : "buyer_id",
                    as           : "buyer"
                  }
                },
                {
                  $lookup: {
                    from         : "enquiries",
                    localField   : "enquiry_id",
                    foreignField : "enquiry_id",
                    as           : "enquiry"
                  }
                },
                {
                  $lookup: {
                      from: "invoices",
                      localField: "order_id",
                      foreignField: "order_id",
                      as: "invoices"
                  }
                },
                {
                  $addFields: {
                    invoices: {
                      $sortArray: {
                        input  : "$invoices",
                        sortBy : { created_at: -1 }
                      }
                    }
                  }
                },
                {
                  $project: {
                    order_id          : 1,
                    enquiry_id        : 1,
                    purchaseOrder_id  : 1,
                    buyer_id          : 1,
                    buyer_company     : 1,
                    supplier_id       : 1,
                    buyer_name        : 1,
                    buyer_email       : 1,
                    buyer_mobile      : 1,
                    buyer_address     : 1,
                    supplier_name     : 1,
                    supplier_email    : 1,
                    supplier_address  : 1,
                    supplier_mobile   : 1,
                    items             : 1,
                    payment_terms     : 1,
                    deposit_requested : 1,
                    // deposit_due       : 1,
                    deposit_due_date  : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    status            : 1,
                    invoice_number    : 1,
                    invoice_no        : 1,
                    invoice_date      : 1,
                    payment_due_date  : 1,
                    total_due_amount  : 1,
                    logistics_details : 1,
                    coordinators      : 1,
                    shipment_details  : 1,
                    created_at        : 1,
                    supplier          : { $arrayElemAt: ["$supplier", 0] },
                    buyer             : { $arrayElemAt: ["$buyer", 0] },
                    enquiry           : { $arrayElemAt: ["$enquiry", 0] },
                    invoices          : 1
                  }
                },
                {
                  $unwind: "$items"
                },
                {
                  $lookup: {
                    from         : "medicines",
                     localField  : "items.medicine_id",
                    foreignField : "medicine_id",
                    as           : "medicine"
                  }
                },
                {
                  $addFields: {
                    "items.medicine_image" : {$arrayElemAt : ["$medicine.medicine_image", 0] },
                    "items.drugs_name"     : {$arrayElemAt  : ["$medicine.drugs_name",0]},
                    "items.strength"       : {$arrayElemAt  : ["$medicine.strength",0]},
                    "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
                  }
                },
                {
                  $group: {
                    _id               : "$_id",
                    order_id          : { $first: "$order_id" },
                    buyer_id          : { $first: "$buyer_id" },
                    buyer_company     : { $first: "$buyer_company" },
                    buyer_name        : { $first: "$buyer_name" },
                    buyer_email       : { $first: "$buyer_email" },
                    buyer_address     : { $first: "$buyer_address" },
                    buyer_mobile      : { $first: "$buyer_mobile" },
                    supplier_name     : { $first: "$supplier_name" },
                    supplier_email    : { $first: "$supplier_email" },
                    supplier_mobile   : { $first: "$supplier_mobile" },
                    supplier_address  : { $first: "$supplier_address" },
                    supplier_type     : { $first: "$supplier_type" },
                    country_of_origin :  { $first: "$country_of_origin" },
                    supplier_id       : { $first: "$supplier_id" },
                    items             : { $push: "$items" },
                    payment_terms     : { $first: "$payment_terms" },
                    deposit_requested : { $first: "$deposit_requested" },
                    // deposit_due       : { $first: "$deposit_due" },
                    deposit_due_date       : { $first: "$deposit_due_date" },
                    est_delivery_time : { $first: "$est_delivery_time" },
                    shipping_details  : { $first: "$shipping_details" },
                    remarks           : { $first: "$remarks" },
                    order_status      : { $first: "$order_status" },
                    status            : { $first: "$status" },
                    invoice_number    : { $first: "$invoice_number" },
                    invoice_no        : { $first: "$invoice_no" },
                    invoice_date      : { $first: "$invoice_date" },
                    payment_due_date  : { $first: "$payment_due_date" },
                    logistics_details : { $first: "$logistics_details" },
                    shipment_details  : { $first: "$shipment_details" },
                    coordinators      : { $first: "$coordinators" },
                    total_due_amount: { $first: "$total_due_amount" },
                    created_at        : {$first: "$created_at"},
                    supplier          : { $first: "$supplier" },
                    buyer             : { $first: "$buyer" },
                    enquiry           : { $first: "$enquiry" },
                    invoices          : { $first: "$invoices" },
                    totalPrice        : { $sum: "$items.item_price" }
                  }
                },
                {
                    $project: {
                      order_id          : 1,
                      enquiry_id        : 1,
                      purchaseOrder_id  : 1,
                      buyer_id          : 1,
                      buyer_company     : 1,
                      supplier_id       : 1,
                      buyer_name        : 1,
                      buyer_email       : 1,
                      buyer_mobile      : 1,
                      buyer_address     : 1,
                      supplier_name     : 1,
                      supplier_email    : 1,
                      supplier_address  : 1,
                      supplier_mobile   : 1,
                      supplier_type     : 1,
                      items             : 1,
                      payment_terms     : 1,
                      deposit_requested : 1,
                      // deposit_due       : 1,
                      deposit_due_date  : 1,
                      est_delivery_time : 1,
                      shipping_details  : 1,
                      remarks           : 1,
                      order_status      : 1,
                      status            : 1,
                      invoice_number    : 1,
                      invoice_no        : 1,
                      invoice_date      : 1,
                      payment_due_date  : 1,
                      logistics_details : { $arrayElemAt: ["$logistics_details", 0] },
                      shipment_details  : 1,
                      coordinators      : 1,
                      total_due_amount  : 1,
                      created_at        : 1,
                      totalPrice        : 1,
                      invoices          : 1,
                      "supplier.supplier_image" : 1,
                      "supplier.supplier_name"  : 1,
                      "supplier.supplier_type"  : 1,
                      "enquiry.enquiry_id"      : 1,
                      "enquiry.payment_terms"   : 1,
                      "buyer.buyer_image"       : 1,
                      "buyer.buyer_name"        : 1,
                      "buyer.buyer_email"       : 1,
                      "buyer.buyer_mobile"      : 1,
                      "buyer.buyer_type"        : 1,
                      "buyer.country_of_origin" : 1,
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
          console.log("Internal Server Error:", error);
          logErrorToFile(error, req);
          return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
        }
    },

    cancelOrder : async (req, res, reqObj, callback) => {
       try {
        const {order_id, buyer_id, reason, order_type} = reqObj
        
        Order.updateOne(
          {order_id: order_id, buyer_id: buyer_id, order_status: order_type},
          {$set: {order_status: 'canceled', cancellation_reason: reason}})
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

    orderFeedback : async (req, res, reqObj, callback) => {
      try {
       const supportId    = 'SPT-' + Math.random().toString(16).slice(2, 10);

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
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    orderComplaint : async (req, res, reqObj, callback) => {
      try {
        const supportId    = 'SPT-' + Math.random().toString(16).slice(2, 10);

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
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    buyerInvoicesList: async (req, res, reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, buyer_id} = reqObj
        const pageNo   = page_no || 2
        const pageSize = limit || 2
        const offset   = (pageNo - 1) * pageSize     
        
        Invoices.aggregate([
            {
                $match: { 
                    buyer_id : buyer_id,
                    status      : filterKey
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
                invoice_id           : 1,
                order_id             : 1,
                enquiry_id           : 1,
                purchaseOrder_id     : 1,
                buyer_id             : 1,
                supplier_id          : 1,
                invoice_no           : 1,
                invoice_date         : 1,
                buyer_name           : 1,
                buyer_address        : 1,
                buyer_country        : 1,
                buyer_vat_reg_no     : 1,
                supplier_name        : 1,
                supplier_address     : 1,
                supplier_country     : 1,
                supplier_vat_reg_no  : 1,
                items                : 1,
                payment_terms        : 1,
                total_payable_amount : 1,
                total_amount_paid    : 1,
                pending_amount       : 1,
                account_number       : 1,
                sort_code            : 1,
                transaction_image    : 1,
                invoice_status       : 1,
                status               : 1,
                payment_status       : 1,
                mode_of_payment      : 1,
                created_at           : 1,
                buyer                : { $arrayElemAt : ["$buyer", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.medicine_id",
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
                _id: "$_id",
                invoice_id           : { $first: "$invoice_id" },
                order_id             : { $first: "$order_id" },
                enquiry_id           : { $first: "$enquiry_id" },
                purchaseOrder_id     : { $first: "$purchaseOrder_id" },
                buyer_id             : { $first: "$buyer_id" },
                supplier_id          : { $first: "$supplier_id" },
                invoice_no           : { $first: "$invoice_no" },
                invoice_date         : { $first: "$invoice_date" },
                buyer_name           : { $first: "$buyer_name" },
                buyer_address        : { $first: "$buyer_address" },
                buyer_country        : { $first: "$buyer_country" },
                buyer_vat_reg_no     : { $first: "$buyer_vat_reg_no" },
                supplier_name        : { $first: "$supplier_name" },
                supplier_address     : { $first: "$supplier_address" },
                supplier_country     : { $first: "$supplier_country" },
                supplier_vat_reg_no  : { $first: "$supplier_vat_reg_no" },
                items                : { $push: "$items" },
                payment_terms        : { $first: "$payment_terms" },
                total_payable_amount : { $first: "$total_payable_amount" },
                total_amount_paid    : { $first: "$total_amount_paid" },
                pending_amount       : { $first: "$pending_amount" },
                account_number       : { $first: "$account_number" },
                sort_code            : { $first: "$sort_code" },
                transaction_image    : { $first: "$transaction_image" },
                invoice_status       : { $first: "$invoice_status" },
                status               : { $first: "$status" },
                payment_status       : { $first: "$payment_status" },
                mode_of_payment      : { $first: "$mode_of_payment" },
                created_at           : { $first: "$created_at" },
                buyer                : { $first: "$buyer" },
                totalPrice           : { $sum: "$items.item_price" }
              }
            },
            {
              $project: {
                invoice_id           : 1,
                order_id             : 1,
                enquiry_id           : 1,
                purchaseOrder_id     : 1,
                buyer_id             : 1,
                supplier_id          : 1,
                invoice_no           : 1,
                invoice_date         : 1,
                buyer_name           : 1,
                buyer_address        : 1,
                buyer_country        : 1,
                buyer_vat_reg_no     : 1,
                supplier_name        : 1,
                supplier_address     : 1,
                supplier_country     : 1,
                supplier_vat_reg_no  : 1,
                items                : 1,
                payment_terms        : 1,
                total_payable_amount : 1,
                total_amount_paid    : 1,
                pending_amount       : 1,
                account_number       : 1,
                sort_code            : 1,
                transaction_image    : 1,
                invoice_status       : 1,
                status               : 1,
                payment_status       : 1,
                mode_of_payment      : 1,
                created_at           : 1,
                totalPrice           : 1,
                "buyer.buyer_image"       : 1,
                "buyer.buyer_name"        : 1,
                "buyer.buyer_address"     : 1,
                "buyer.buyer_type"        : 1,
                "buyer.country_of_origin" : 1,
              }
            },
            { $sort  : { created_at: -1 } },
            { $skip  : offset },
            { $limit : pageSize },
        ])
        .then((data) => {
            Invoices.countDocuments({status : filterKey, buyer_id: buyer_id})
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
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    buyerInvoiceDetails : async (req, res, reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, buyer_id} = reqObj
        const pageNo   = page_no || 2
        const pageSize = limit || 2
        const offset   = (pageNo - 1) * pageSize     
        
        Invoices.aggregate([
            {
                $match: { 
                    buyer_id : buyer_id,
                    status   : filterKey
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
                invoice_id           : 1,
                order_id             : 1,
                enquiry_id           : 1,
                purchaseOrder_id     : 1,
                buyer_id             : 1,
                supplier_id          : 1,
                invoice_no           : 1,
                invoice_date         : 1,
                buyer_name           : 1,
                buyer_address        : 1,
                buyer_country        : 1,
                buyer_vat_reg_no     : 1,
                supplier_name        : 1,
                supplier_address     : 1,
                supplier_country     : 1,
                supplier_vat_reg_no  : 1,
                items                : 1,
                payment_terms        : 1,
                total_payable_amount : 1,
                total_amount_paid    : 1,
                pending_amount       : 1,
                account_number       : 1,
                sort_code            : 1,
                transaction_image    : 1,
                invoice_status       : 1,
                status               : 1,
                payment_status       : 1,
                created_at           : 1,
                buyer                : { $arrayElemAt : ["$buyer", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.medicine_id",
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
                _id                 : "$_id",
                invoice_id           : { $first: "$invoice_id" },
                order_id             : { $first: "$order_id" },
                enquiry_id           : { $first: "$enquiry_id" },
                purchaseOrder_id     : { $first: "$purchaseOrder_id" },
                buyer_id             : { $first: "$buyer_id" },
                supplier_id          : { $first: "$supplier_id" },
                invoice_no           : { $first: "$invoice_no" },
                invoice_date         : { $first: "$invoice_date" },
                buyer_name           : { $first: "$buyer_name" },
                buyer_address        : { $first: "$buyer_address" },
                buyer_country        : { $first: "$buyer_country" },
                buyer_vat_reg_no     : { $first: "$buyer_vat_reg_no" },
                supplier_name        : { $first: "$supplier_name" },
                supplier_address     : { $first: "$supplier_address" },
                supplier_country     : { $first: "$supplier_country" },
                supplier_vat_reg_no  : { $first: "$supplier_vat_reg_no" },
                items                : { $push: "$items" },
                payment_terms        : { $first: "$payment_terms" },
                total_payable_amount : { $first: "$total_payable_amount" },
                total_amount_paid    : { $first: "$total_amount_paid" },
                pending_amount       : { $first: "$pending_amount" },
                account_number       : { $first: "$account_number" },
                sort_code            : { $first: "$sort_code" },
                transaction_image    : { $first: "$transaction_image" },
                invoice_status       : { $first: "$invoice_status" },
                status               : { $first: "$status" },
                payment_status       : { $first: "$payment_status" },
                created_at           : { $first: "$created_at" },
                buyer                : { $first: "$buyer" },
                totalPrice           : { $sum: "$items.item_price" }
              }
            },
            {
              $project: {
                invoice_id           : 1,
                order_id             : 1,
                enquiry_id           : 1,
                purchaseOrder_id     : 1,
                buyer_id             : 1,
                supplier_id          : 1,
                invoice_no           : 1,
                invoice_date         : 1,
                buyer_name           : 1,
                buyer_address        : 1,
                buyer_country        : 1,
                buyer_vat_reg_no     : 1,
                supplier_name        : 1,
                supplier_address     : 1,
                supplier_country     : 1,
                supplier_vat_reg_no  : 1,
                items                : 1,
                payment_terms        : 1,
                total_payable_amount : 1,
                total_amount_paid    : 1,
                pending_amount       : 1,
                account_number       : 1,
                sort_code            : 1,
                transaction_image    : 1,
                invoice_status       : 1,
                status               : 1,
                payment_status       : 1,
                created_at           : 1,
                totalPrice           : 1,
                "buyer.buyer_image"   : 1,
                "buyer.buyer_name"    : 1,
                "buyer.buyer_address" : 1,
                "buyer.buyer_type"    : 1,
              }
            },
            { $sort  : { created_at: -1 } },
            { $skip  : offset },
            { $limit : pageSize },
        ])
        .then((data) => {
            Invoices.countDocuments({status : filterKey, buyer_id: buyer_id})
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
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    supplierOrdersList: async (req, res, reqObj, callback) => {
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
                buyer_name        : 1,
                buyer_id          : 1,
                items             : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                status            : 1,
                invoice_no        : 1,
                created_at        : 1,
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
                supplier_id       : { $first: "$supplier_id" },
                buyer_name        : { $first: "$buyer_name" },
                buyer_id          : { $first: "$buyer_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                status            : { $first: "$status" },
                invoice_no        : { $first: "$invoice_no" },
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
                    status            : 1,
                    invoice_no        : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "buyer.buyer_image" : 1,
                    "buyer.buyer_name"  : 1,
                }
            },
            { $sort  : { created_at: -1 } },
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
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    supplierOrderDetails : async (req, res, reqObj, callback) => {
      try {
          const {buyer_id, order_id, filterKey} = reqObj
  
          Order.aggregate([
              {
                  $match: { 
                      order_id: order_id,
                      // buyer_id: buyer_id,
                      // order_status: filterKey
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
                  $lookup: {
                      from         : "enquiries",
                      localField   : "enquiry_id",
                      foreignField : "enquiry_id",
                      as           : "enquiry"
                  }
              },
              {
                  $lookup: {
                      from         : "invoices",
                      localField   : "order_id",
                      foreignField : "order_id",
                      as           : "invoices"
                  }
              },
              {
                $addFields: {
                  invoices: {
                    $sortArray: {
                      input  : "$invoices",
                      sortBy : { created_at: -1 }
                    }
                  }
                }
              },
              {
                  $project: {
                      order_id          : 1,
                      enquiry_id        : 1,
                      purchaseOrder_id  : 1,
                      buyer_id          : 1,
                      buyer_company     : 1,
                      supplier_id       : 1,
                      buyer_name        : 1,
                      buyer_email       : 1,
                      buyer_mobile      : 1,
                      buyer_address     : 1,
                      supplier_name     : 1,
                      supplier_email    : 1,
                      supplier_address  : 1,
                      supplier_mobile   : 1,
                      items             : 1,
                      payment_terms     : 1,
                      deposit_requested : 1,
                      // deposit_due       : 1,
                      deposit_due_date  : 1,
                      est_delivery_time : 1,
                      shipping_details  : 1,
                      remarks           : 1,
                      order_status      : 1,
                      status            : 1,
                      invoice_status    : 1,
                      invoice_number    : 1,
                      invoice_no        : 1,
                      invoice_date      : 1,
                      payment_due_date  : 1,
                      total_due_amount  : 1,
                      total_amount_paid : 1,
                      pending_amount    : 1,
                      logistics_details : 1,
                      shipment_details  : 1,
                      coordinators      : 1,
                      created_at        : 1,
                      supplier          : { $arrayElemAt: ["$supplier", 0] },
                      buyer             : { $arrayElemAt: ["$buyer", 0] },
                      enquiry           : { $arrayElemAt: ["$enquiry", 0] },
                      invoices          : 1
                  }
              },
              {
                  $unwind: "$items"
              },
              {
                  $lookup: {
                      from         : "medicines",
                      localField   : "items.medicine_id",
                      foreignField : "medicine_id",
                      as           : "medicine"
                  }
              },
              {
                  $addFields: {
                      "items.medicine_image" : {$arrayElemAt: ["$medicine.medicine_image", 0]},
                      "items.drugs_name"     : {$arrayElemAt: ["$medicine.drugs_name", 0]},
                      "items.strength"       : {$arrayElemAt: ["$medicine.strength", 0]},
                      "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } }
                  }
              },
              {
                  $group: {
                      _id                : "$_id",
                      order_id           : { $first: "$order_id" },
                      enquiry_id         : { $first: "$enquiry_id" },
                      purchaseOrder_id   : { $first: "$purchaseOrder_id" },
                      buyer_id           : { $first: "$buyer_id" },
                      buyer_company      : { $first: "$buyer_company" },
                      buyer_name         : { $first: "$buyer_name" },
                      buyer_email        : { $first: "$buyer_email" },
                      buyer_address      : { $first: "$buyer_address" },
                      buyer_mobile       : { $first: "$buyer_mobile" },
                      buyer_country_code : { $first: "$buyer_country_code" },
                      supplier_name      : { $first: "$supplier_name" },
                      supplier_email     : { $first: "$supplier_email" },
                      supplier_mobile    : { $first: "$supplier_mobile" },
                      supplier_address   : { $first: "$supplier_address" },
                      country_of_origin  : { $first: "$country_of_origin" },
                      supplier_id        : { $first: "$supplier_id" },
                      items              : { $push: "$items" },
                      payment_terms      : { $first: "$payment_terms" },
                      deposit_requested  : { $first: "$deposit_requested" },
                      // deposit_due        : { $first: "$deposit_due" },
                      deposit_due_date        : { $first: "$deposit_due_date" },
                      est_delivery_time  : { $first: "$est_delivery_time" },
                      shipping_details   : { $first: "$shipping_details" },
                      remarks            : { $first: "$remarks" },
                      order_status       : { $first: "$order_status" },
                      status             : { $first: "$status" },
                      invoice_status     : { $first: "$invoice_status" },
                      invoice_number     : { $first: "$invoice_number" },
                      invoice_no         : { $first: "$invoice_no" },
                      invoice_date       : { $first: "$invoice_date" },
                      payment_due_date   : { $first: "$payment_due_date" },
                      logistics_details  : { $first: "$logistics_details" },
                      shipment_details   : { $first: "$shipment_details" },
                      coordinators       : { $first: "$coordinators" },
                      total_due_amount   : { $first: "$total_due_amount" },
                      total_amount_paid  : { $first: "$total_amount_paid" },
                      pending_amount     : { $first: "$pending_amount" },
                      created_at         : {$first: "$created_at"},
                      supplier           : { $first: "$supplier" },
                      buyer              : { $first: "$buyer" },
                      enquiry            : { $first: "$enquiry" },
                      invoices           : { $first: "$invoices" }, // Group the invoice details
                      totalPrice         : { $sum: "$items.item_price" }
                  }
              },
              {
                $project: {
                                order_id          : 1,
                                enquiry_id        : 1,
                                purchaseOrder_id  : 1,
                                buyer_id          : 1,
                                buyer_company     : 1,
                                supplier_id       : 1,
                                buyer_name        : 1,
                                buyer_email       : 1,
                                buyer_mobile      : 1,
                                buyer_country_code: 1,
                                buyer_address     : 1,
                                supplier_name     : 1,
                                supplier_email    : 1,
                                supplier_address  : 1,
                                supplier_mobile   : 1,
                                items             : 1,
                                payment_terms     : 1,
                                deposit_requested : 1,
                                // deposit_due       : 1,
                                deposit_due_date       : 1,
                                est_delivery_time : 1,
                                shipping_details  : 1,
                                remarks           : 1,
                                order_status      : 1,
                                status            : 1,
                                invoice_status    : 1,
                                invoice_number    : 1,
                                invoice_no        : 1,
                                invoice_date      : 1,
                                payment_due_date  : 1,
                                logistics_details : { $arrayElemAt: ["$logistics_details", 0] },
                                shipment_details  : 1,
                                coordinators      : 1,
                                total_due_amount  : 1,
                                total_amount_paid : 1,
                                pending_amount    : 1,
                                created_at        : 1,
                                totalPrice        : 1,
                                invoices          : 1,
                                "supplier.supplier_image"              : 1,
                                "supplier.supplier_name"               : 1,
                                "supplier.supplier_email"              : 1,
                                "supplier.supplier_mobile"             : 1,
                                "supplier.supplier_country_code"       : 1,
                                "supplier.contact_person_mobile_no"    : 1,
                                "supplier.contact_person_country_code" : 1,
                                "supplier.estimated_delivery_time"     : 1,
                                "supplier.supplier_address"            : 1,
                                "supplier.country_of_origin"           : 1,
                                "supplier.vat_reg_no"                  : 1,
                                "enquiry.enquiry_id"                   : 1,
                                "enquiry.payment_terms"                : 1,
                                "buyer.buyer_image"                    : 1,
                                "buyer.buyer_name"                     : 1,
                                "buyer.buyer_email"                    : 1,
                                "buyer.buyer_mobile"                   : 1,
                                "buyer.buyer_country_code"             : 1,
                                "buyer.contact_person_mobile"          : 1,
                                "buyer.contact_person_country_code"    : 1,
                                "buyer.buyer_address"                  : 1,
                                "buyer.buyer_type"                     : 1,
                                "buyer.country_of_origin": 1,
                                "buyer.country_of_origin"              : 1,
                                "buyer.vat_reg_no"                     : 1,
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
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },
  
    supplierInvoicesList: async (req, res, reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, supplier_id} = reqObj
        const pageNo   = page_no || 2
        const pageSize = limit || 2
        const offset   = (pageNo - 1) * pageSize     
        
        Invoices.aggregate([
            {
                $match: { 
                    supplier_id : supplier_id,
                    status      : filterKey
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
                invoice_id           : 1,
                order_id             : 1,
                enquiry_id           : 1,
                purchaseOrder_id     : 1,
                buyer_id             : 1,
                supplier_id          : 1,
                invoice_no           : 1,
                invoice_date         : 1,
                buyer_name           : 1,
                buyer_address        : 1,
                buyer_country        : 1,
                buyer_vat_reg_no     : 1,
                supplier_name        : 1,
                supplier_address     : 1,
                supplier_country     : 1,
                supplier_vat_reg_no  : 1,
                items                : 1,
                payment_terms        : 1,
                total_payable_amount : 1,
                total_amount_paid    : 1,
                pending_amount       : 1,
                account_number       : 1,
                sort_code            : 1,
                transaction_image    : 1,
                invoice_status       : 1,
                status               : 1,
                payment_status       : 1,
                mode_of_payment      : 1,
                created_at           : 1,
                supplier             : { $arrayElemAt : ["$supplier", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.medicine_id",
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
                _id                  : "$_id",
                invoice_id           : { $first: "$invoice_id" },
                order_id             : { $first: "$order_id" },
                enquiry_id           : { $first: "$enquiry_id" },
                purchaseOrder_id     : { $first: "$purchaseOrder_id" },
                buyer_id             : { $first: "$buyer_id" },
                supplier_id          : { $first: "$supplier_id" },
                invoice_no           : { $first: "$invoice_no" },
                invoice_date         : { $first: "$invoice_date" },
                buyer_name           : { $first: "$buyer_name" },
                buyer_address        : { $first: "$buyer_address" },
                buyer_country        : { $first: "$buyer_country" },
                buyer_vat_reg_no     : { $first: "$buyer_vat_reg_no" },
                supplier_name        : { $first: "$supplier_name" },
                supplier_address     : { $first: "$supplier_address" },
                supplier_country     : { $first: "$supplier_country" },
                supplier_vat_reg_no  : { $first: "$supplier_vat_reg_no" },
                items                : { $push: "$items" },
                payment_terms        : { $first: "$payment_terms" },
                total_payable_amount : { $first: "$total_payable_amount" },
                total_amount_paid    : { $first: "$total_amount_paid" },
                pending_amount       : { $first: "$pending_amount" },
                account_number       : { $first: "$account_number" },
                sort_code            : { $first: "$sort_code" },
                transaction_image    : { $first: "$transaction_image" },
                invoice_status       : { $first: "$invoice_status" },
                status               : { $first: "$status" },
                payment_status       : { $first: "$payment_status" },
                mode_of_payment      : { $first: "$mode_of_payment" },
                created_at           : { $first: "$created_at" },
                supplier             : { $first: "$supplier" },
                totalPrice           : { $sum: "$items.item_price" }
              }
            },
            {
              $project: {
                invoice_id           : 1,
                order_id             : 1,
                enquiry_id           : 1,
                purchaseOrder_id     : 1,
                buyer_id             : 1,
                supplier_id          : 1,
                invoice_no           : 1,
                invoice_date         : 1,
                buyer_name           : 1,
                buyer_address        : 1,
                buyer_country        : 1,
                buyer_vat_reg_no     : 1,
                supplier_name        : 1,
                supplier_address     : 1,
                supplier_country     : 1,
                supplier_vat_reg_no  : 1,
                items                : 1,
                payment_terms        : 1,
                total_payable_amount : 1,
                total_amount_paid    : 1,
                pending_amount       : 1,
                account_number       : 1,
                sort_code            : 1,
                transaction_image    : 1,
                invoice_status       : 1,
                status               : 1,
                payment_status       : 1,
                mode_of_payment      : 1,
                created_at           : 1,
                totalPrice           : 1,
                "supplier.supplier_image"   : 1,
                "supplier.supplier_name"    : 1,
                "supplier.supplier_address" : 1,
                "supplier.supplier_type"    : 1,
              }
            },
            { $sort  : { created_at: -1 } },
            { $skip  : offset },
            { $limit : pageSize },
        ])
        .then((data) => {
            Invoices.countDocuments({status : filterKey, supplier_id: supplier_id})
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
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    proformaInvoiceList: async (req, res, reqObj, callback) => {
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
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    orderSalesFilterList: async (req, res, reqObj, callback) => {
      try {
        const {page_no, limit, filterKey, buyer_id, supplier_id} = reqObj
  
        const pageNo   = page_no || 1
        const pageSize = limit || 1
        const offset   = (pageNo - 1) * pageSize     

        let matchCondition = {
          order_status: 'completed'
        };

        if (buyer_id) {
            matchCondition.buyer_id = buyer_id;
        } else if (supplier_id) {
            matchCondition.supplier_id = supplier_id;
        }

        Order.aggregate([
          {
            $match: matchCondition
          },
          {
              $facet: {
                  yearlyData: [
                      {
                          $group: {
                              _id: { year: { $year: "$created_at" } },
                              orderCount: { $sum: 1 }
                          }
                      },
                      {
                          $sort: { "_id.year": 1 } 
                      }
                  ],
                  monthlyData: [
                      {
                          $match: {
                              created_at: {
                                  $gte : new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of the current month
                                  $lt  : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) // First day of the next month
                              }
                          }
                      },
                      {
                          $group: {
                              _id        : { year: { $year: "$created_at" }, month: { $month: "$created_at" } },
                              orderCount : { $sum: 1 }
                          }
                      }
                  ],
                  weeklyData: [
                      {
                          $match: {
                              created_at: {
                                  $gte : new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), // First day of the current week (Sunday)
                                  $lt  : new Date(new Date().setDate(new Date().getDate() + (6 - new Date().getDay()))) // First day of the next week (Sunday)
                              }
                          }
                      },
                      {
                          $group: {
                              _id        : { year: { $year: "$created_at" }, week: { $week: "$created_at" } },
                              orderCount : { $sum: 1 }
                          }
                      }
                  ]
              }
          }
      ])
        .then((data) => {
          
            // Order.countDocuments({order_status : filterKey, buyer_id: buyer_id})
            // .then(totalItems => {
            //     const totalPages = Math.ceil(totalItems / pageSize);

            //     const responseData = {
            //         data,
            //         totalPages,
            //         totalItems
            //     }
            //     callback({ code: 200, message: "List Fetched successfully", result: responseData });
            // })
            callback({ code: 200, message: "List Fetched successfully", result: data });
        })
        .catch((err) => {
            console.log(err);
            callback({ code: 400, message: "Error in fetching order list", result: err });
        })
      } catch (error) {
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    getInvoiceListForAllUsers: async (req, res) => {
      try {
        const { user_type, buyer_id, supplier_id, admin_id } = req?.headers;
        // const { page_no, limit, filterKey, buyer_id, supplier_id, page_size } = req?.body;
        const { pageNo = undefined, filterKey = undefined, pageSize = undefined } = req?.query;
        // const pageNo = page_no || 2;
        // const pageSize = limit || page_size || 2;
        // const page_size = pageSize || 2
        const offset = (parseInt(pageNo) - 1) * parseInt(pageSize);
    
        // Match conditions based on user_type
        const buyerMatch = { buyer_id, status: filterKey };
        const adminMatch = { status: filterKey };
        const supplierMatch = { supplier_id, status: filterKey };
    
        // Projection objects based on user_type
        const buyerProjObj = { supplier: { $arrayElemAt: ["$supplier", 0] } };
        const supplierProjObj = { buyer: { $arrayElemAt: ["$buyer", 0] } };
    
        const buyerProjObj2 = {
          "buyer.buyer_image": 1,
          "buyer.buyer_name": 1,
          "buyer.buyer_address": 1,
          "buyer.buyer_type": 1,
          "buyer.country_of_origin": 1,
        };
    
        const supplierProjObj2 = {
          "supplier.supplier_image": 1,
          "supplier.supplier_name": 1,
          "supplier.supplier_address": 1,
          "supplier.supplier_type": 1,
        };
        // Determine the match condition and projection based on user_type
        const matchCondition = user_type === 'Buyer' ? buyerMatch : user_type === 'Supplier' ? supplierMatch : adminMatch;
        const lookupCollection = user_type === 'Buyer' ? 'buyers' : 'suppliers';
        const localField = user_type === 'Buyer' ? 'buyer_id' : 'supplier_id';
        const foreignField = user_type === 'Buyer' ? 'buyer_id' : 'supplier_id';
        const projObj = user_type === 'Buyer' ? buyerProjObj : supplierProjObj;
        const projObj2 = user_type === 'Buyer' ? buyerProjObj2 : supplierProjObj2;

        const commonProjObj = {  
          invoice_id           : 1,
          order_id             : 1,
          enquiry_id           : 1,
          purchaseOrder_id     : 1,
          buyer_id             : 1,
          supplier_id          : 1,
          invoice_no           : 1,
          invoice_date         : 1,
          buyer_name           : 1,
          buyer_address        : 1,
          buyer_country        : 1,
          buyer_vat_reg_no     : 1,
          supplier_name        : 1,
          supplier_address     : 1,
          supplier_country     : 1,
          supplier_vat_reg_no  : 1,
          items                : 1,
          payment_terms        : 1,
          total_payable_amount : 1,
          total_amount_paid    : 1,
          pending_amount       : 1,
          account_number       : 1,
          sort_code            : 1,
          transaction_image    : 1,
          transaction_id       : 1,
          mode_of_payment      : 1,
          invoice_status       : 1,
          status               : 1,
          payment_status       : 1,
          created_at           : 1,
        }

        const commonGroupObj = {          
          _id: "$_id",
          invoice_id: { $first: "$invoice_id" },
          order_id: { $first: "$order_id" },
          enquiry_id: { $first: "$enquiry_id" },
          purchaseOrder_id: { $first: "$purchaseOrder_id" },
          buyer_id: { $first: "$buyer_id" },
          supplier_id: { $first: "$supplier_id" },
          invoice_no: { $first: "$invoice_no" },
          invoice_date: { $first: "$invoice_date" },
          buyer_name: { $first: "$buyer_name" },
          buyer_address: { $first: "$buyer_address" },
          buyer_country: { $first: "$buyer_country" },
          buyer_vat_reg_no: { $first: "$buyer_vat_reg_no" },
          supplier_name: { $first: "$supplier_name" },
          supplier_address: { $first: "$supplier_address" },
          supplier_country: { $first: "$supplier_country" },
          supplier_vat_reg_no: { $first: "$supplier_vat_reg_no" },
          items: { $push: "$items" },
          payment_terms: { $first: "$payment_terms" },
          total_payable_amount: { $first: "$total_payable_amount" },
          total_amount_paid: { $first: "$total_amount_paid" },
          pending_amount: { $first: "$pending_amount" },
          account_number: { $first: "$account_number" },
          sort_code: { $first: "$sort_code" },
          transaction_image: { $first: "$transaction_image" },
          status: { $first: "$status" },
          payment_status: { $first: "$payment_status" },
          mode_of_payment: { $first: "$mode_of_payment" },
          created_at: { $first: "$created_at" },
          invoice_status: { $first: "$invoice_status" },
        }
  
        let data;
    
        if (user_type === 'Admin') {
          // Admin specific logic
          data = await Invoices.aggregate([
            {
              $match: matchCondition
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
              $lookup: {
                from         : "suppliers",
                localField   : "supplier_id",
                foreignField : "supplier_id",
                as           : "supplier"
              }
            },
            {
              $project: {
                ...commonProjObj,
                buyer                : { $arrayElemAt : ["$buyer", 0] },
                supplier             : { $arrayElemAt : ["$supplier", 0] }
              }
            },
            {
              $unwind : "$items" 
            },
            {
              $lookup: {
                from         : "medicines",
                localField   : "items.medicine_id",
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
                ...commonGroupObj,
                buyer                : { $first: "$buyer" },
                supplier             : { $first: "$supplier" },
                totalPrice           : { $sum: "$items.item_price" }
              }
            },
            {
              $project: {
                ...commonProjObj,
                totalPrice           : 1,
                ...buyerProjObj2,
                ...supplierProjObj2,
              }
            },
            { $sort  : { created_at: -1 } },
            { $skip  : offset },
            { $limit : parseInt(pageSize) },
        ])
        } else if (user_type === 'Buyer' || user_type === 'Supplier') {
          data = await Invoices.aggregate([
            {
              $match: matchCondition,
            },
            {
              $lookup: {
                from: lookupCollection,
                localField: localField,
                foreignField: foreignField,
                as: user_type === 'Buyer' ? 'buyer' : 'supplier',
              },
            },
            {
              $project: {
                ...commonProjObj,
                ...(projObj), // Add projection based on user type
              },
            },
            {
              $unwind: "$items",
            },
            {
              $lookup: {
                from: "medicines",
                localField: "items.medicine_id",
                foreignField: "medicine_id",
                as: "medicine",
              },
            },
            {
              $addFields: {
                "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } },
              },
            },
            {
              $group: {
                ...commonGroupObj,
                totalPrice: { $sum: "$items.item_price" },
                ...(user_type === 'Buyer' && { buyer: { $first: "$buyer" } }),
                ...(user_type === 'Supplier' && { supplier: { $first: "$supplier" } }),
              },
            },
            {
              $project: {
                ...commonProjObj,
                totalPrice: 1,
                ...(projObj2), // Additional fields based on user type
              },
            },
            { $sort: { created_at: -1 } },
            { $skip: offset },
            { $limit: parseInt(pageSize) },
          ]);
        }
    
        // if (!data || data.length === 0) {
        //   return res.status(400).send({ code: 400, message: "Error in fetching order list", result: "Error in fetching order list" });
        // }
  
        const totalItems = await Invoices.countDocuments(matchCondition); // Count based on correct match condition
        // if (!totalItems) {
        //   console.log('totalItems',totalItems);
        //   return res.status(400).send({ code: 400, message: "Error in fetching order list", result: "Error in fetching order list" });
        // }
  
        const totalPages = Math.ceil(totalItems / parseInt(pageSize));
        const responseData = {
          data,
          totalPages,
          totalItems: totalItems,
        };
  
        res.status(200).send({ code: 200, message: "List Fetched successfully", result: responseData });
      } catch (error) {
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    getOrderListAllUsers: async (req, res) => {
      try {

        console.log(`\n FUNCTION CALLED`)
        const { user_type, buyer_id, supplier_id, admin_id } = req?.headers;
        // const { page_no, limit, filterKey, buyer_id, filterValue, supplier_id, admin_id } = req?.body;
        const { pageNo, pageSize, filterKey, filterValue, } = req?.query;
    
        // const pageNo = req?.body?.pageNo || page_no || 1;
        // const pageSize = req?.body?.pageSize || limit || 2;
        const offset = (parseInt(pageNo) - 1) * parseInt(pageSize);

        const adjustedFilterKey = filterKey === 'order-request' ? 'pending' : filterKey;  
    
        let dateFilter = {};
    
        // Apply date filter based on the filterValue (today, week, month, year, all)
        const currentDate = new Date(); // Current date and time
    
        if (filterValue === 'today') {
          // Filter for today
          dateFilter = {
            created_at: {
              $gte: moment().startOf('day').toDate(),
              $lte: moment().endOf('day').toDate(),
            },
          };
        } else if (filterValue === 'week') {
          // Filter for the last 7 days
          dateFilter = {
            created_at: {
              $gte: moment().subtract(7, 'days').startOf('day').toDate(),
              $lte: moment().endOf('day').toDate(),
            },
          };
        } else if (filterValue === 'month') {
          // Filter for the last 30 days
          dateFilter = {
            created_at: {
              $gte: moment().subtract(30, 'days').startOf('day').toDate(),
              $lte: moment().endOf('day').toDate(),
            },
          };
        } else if (filterValue === 'year') {
          // Filter for the last 365 days
          dateFilter = {
            created_at: {
              $gte: moment().subtract(365, 'days').startOf('day').toDate(),
              $lte: moment().endOf('day').toDate(),
            },
          };
        } else if (filterValue === 'all') {
          // No date filter for 'all'
          dateFilter = {};
        }
    
        const adminMatch = {
          order_status: filterKey,
          ...dateFilter,
        };
    
        const otherMatch = {
          buyer_id: buyer_id,
          order_status: filterKey,
        };
    
        const matchObj = user_type === 'Admin' ? adminMatch : user_type == 'Buyer' ? otherMatch : {order_status : adjustedFilterKey, supplier_id: supplier_id};
    
        console.log("DATE FILTER", dateFilter);
        let data;
    
        if (user_type === 'Admin') {
          data = await Order.aggregate([
            {
              $match: {
                order_status: filterKey,
                ...dateFilter,
              },
            },
            {
              $lookup: {
                from: "suppliers",
                localField: "supplier_id",
                foreignField: "supplier_id",
                as: "supplier",
              },
            },
            {
              $lookup: {
                from: "buyers",
                localField: "buyer_id",
                foreignField: "buyer_id",
                as: "buyer",
              },
            },
            {
              $project: {
                order_id: 1,
                buyer_id: 1,
                buyer_name: 1,
                supplier_id: 1,
                supplier_name: 1,
                items: 1,
                payment_terms: 1,
                est_delivery_time: 1,
                shipping_details: 1,
                remarks: 1,
                order_status: 1,
                status: 1,
                invoice_no: 1,
                created_at: 1,
                supplier: { $arrayElemAt: ["$supplier", 0] },
                buyer: { $arrayElemAt: ["$buyer", 0] },
              },
            },
            {
              $unwind: "$items",
            },
            {
              $lookup: {
                from: "medicines",
                localField: "items.product_id",
                foreignField: "medicine_id",
                as: "medicine",
              },
            },
            {
              $addFields: {
                "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } },
              },
            },
            {
              $group: {
                _id: "$_id",
                order_id: { $first: "$order_id" },
                buyer_id: { $first: "$buyer_id" },
                buyer_name: { $first: "$buyer_name" },
                supplier_id: { $first: "$supplier_id" },
                supplier_name: { $first: "$supplier_name" },
                items: { $push: "$items" },
                payment_terms: { $first: "$payment_terms" },
                est_delivery_time: { $first: "$est_delivery_time" },
                shipping_details: { $first: "$shipping_details" },
                remarks: { $first: "$remarks" },
                order_status: { $first: "$order_status" },
                status: { $first: "$status" },
                invoice_no: { $first: "$invoice_no" },
                created_at: { $first: "$created_at" },
                supplier: { $first: "$supplier" },
                buyer: { $first: "$buyer" },
                totalPrice: { $sum: "$items.item_price" },
              },
            },
            {
              $project: {
                order_id: 1,
                buyer_id: 1,
                buyer_name: 1,
                supplier_id: 1,
                supplier_name: 1,
                items: 1,
                payment_terms: 1,
                est_delivery_time: 1,
                shipping_details: 1,
                remarks: 1,
                order_status: 1,
                status: 1,
                invoice_no: 1,
                created_at: 1,
                totalPrice: 1,
                "supplier.supplier_image": 1,
                "supplier.supplier_name": 1,
                "supplier.supplier_type": 1,
                "buyer.buyer_image": 1,
                "buyer.buyer_name": 1,
                "buyer.buyer_type": 1,
              },
            },
            { $sort: { created_at: -1 } },
            { $skip: offset },
            { $limit: parseInt(pageSize) },
          ]);
        } else if (user_type == 'Buyer') {
          data = await Order.aggregate([
            {
              $match: { 
                buyer_id     : buyer_id,
                order_status : filterKey
              },
            },
            {
              $lookup: {
                from: "suppliers",
                localField: "supplier_id",
                foreignField: "supplier_id",
                as: "supplier",
              },
            },
            {
              $project: {
                order_id: 1,
                buyer_id: 1,
                buyer_company: 1,
                supplier_id: 1,
                items: 1,
                payment_terms: 1,
                est_delivery_time: 1,
                shipping_details: 1,
                invoice_no: 1,
                remarks: 1,
                order_status: 1,
                status: 1,
                created_at: 1,
                supplier: { $arrayElemAt: ["$supplier", 0] },
              },
            },
            {
              $unwind: "$items",
            },
            {
              $lookup: {
                from: "medicines",
                localField: "items.product_id",
                foreignField: "medicine_id",
                as: "medicine",
              },
            },
            {
              $addFields: {
                "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } },
              },
            },
            {
              $group: {
                _id: "$_id",
                order_id: { $first: "$order_id" },
                buyer_id: { $first: "$buyer_id" },
                buyer_company: { $first: "$buyer_company" },
                supplier_id: { $first: "$supplier_id" },
                items: { $push: "$items" },
                payment_terms: { $first: "$payment_terms" },
                est_delivery_time: { $first: "$est_delivery_time" },
                shipping_details: { $first: "$shipping_details" },
                invoice_no: { $first: "$invoice_no" },
                remarks: { $first: "$remarks" },
                order_status: { $first: "$order_status" },
                status: { $first: "$status" },
                created_at: { $first: "$created_at" },
                supplier: { $first: "$supplier" },
                totalPrice: { $sum: "$items.item_price" },
              },
            },
            {
              $project: {
                order_id: 1,
                buyer_id: 1,
                buyer_company: 1,
                supplier_id: 1,
                items: 1,
                payment_terms: 1,
                est_delivery_time: 1,
                shipping_details: 1,
                remarks: 1,
                invoice_no: 1,
                order_status: 1,
                status: 1,
                created_at: 1,
                totalPrice: 1,
                "supplier.supplier_image": 1,
                "supplier.supplier_name": 1,
                "supplier.supplier_type": 1,
              },
            },
            { $sort: { created_at: -1 } },
            { $skip: offset },
            { $limit: parseInt(pageSize) },
          ]);
        } else if (user_type == 'Supplier'){
          data = await Order.aggregate([
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
                buyer_name        : 1,
                buyer_id          : 1,
                items             : 1,
                payment_terms     : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                status            : 1,
                invoice_no        : 1,
                created_at        : 1,
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
                supplier_id       : { $first: "$supplier_id" },
                buyer_name        : { $first: "$buyer_name" },
                buyer_id          : { $first: "$buyer_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                status            : { $first: "$status" },
                invoice_no        : { $first: "$invoice_no" },
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
                    status            : 1,
                    invoice_no        : 1,
                    created_at        : 1,
                    totalPrice        : 1,
                    "buyer.buyer_image" : 1,
                    "buyer.buyer_name"  : 1,
                }
            },
            { $sort  : { created_at: -1 } },
            { $skip  : offset },
            { $limit : parseInt(pageSize) },
        ])
        }
    
        if (!data) {
          return res.status(400).send({ code: 400, message: 'Error occurred fetching order list', result: {} });
        }

        console.log(`\n DATA OF ORDER FOR ADMIN : \n ${data}`)
    
        const totalItems = await Order.countDocuments(matchObj);
    
        const totalPages = Math.ceil(totalItems / parseInt(pageSize));
    
        const responseData = {
          data,
          totalPages,
          totalItems: totalItems,
        };
        res.status(200).send({ code: 200, message: "Buyer Order List Fetched successfully", result: responseData });
    
      } catch (error) {
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },
    
    getOrderListCSV: async (req, res) => {
      try {
        const { page_no, limit, filterKey, buyer_id, filterValue, supplier_id } = req?.body;   
    
        let dateFilter = {};
        
        console.log("DATE FILTER", dateFilter);
        let data = await Order.aggregate([
            {
              $match: {
                order_status: filterKey,
                ...dateFilter,
              },
            },
            {
              $lookup: {
                from: "suppliers",
                localField: "supplier_id",
                foreignField: "supplier_id",
                as: "supplier",
              },
            },
            {
              $lookup: {
                from: "buyers",
                localField: "buyer_id",
                foreignField: "buyer_id",
                as: "buyer",
              },
            },
            {
              $project: {
                order_id: 1,
                buyer_id: 1,
                buyer_name: 1,
                supplier_id: 1,
                supplier_name: 1,
                items: 1,
                payment_terms: 1,
                est_delivery_time: 1,
                shipping_details: 1,
                remarks: 1,
                order_status: 1,
                status: 1,
                invoice_no: 1,
                created_at: 1,
                supplier: { $arrayElemAt: ["$supplier", 0] },
                buyer: { $arrayElemAt: ["$buyer", 0] },
              },
            },
            {
              $unwind: "$items",
            },
            {
              $lookup: {
                from: "medicines",
                localField: "items.product_id",
                foreignField: "medicine_id",
                as: "medicine",
              },
            },
            {
              $addFields: {
                "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
                "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } },
              },
            },
            {
              $group: {
                _id: "$_id",
                order_id: { $first: "$order_id" },
                buyer_id: { $first: "$buyer_id" },
                buyer_name: { $first: "$buyer_name" },
                supplier_id: { $first: "$supplier_id" },
                supplier_name: { $first: "$supplier_name" },
                items: { $push: "$items" },
                payment_terms: { $first: "$payment_terms" },
                est_delivery_time: { $first: "$est_delivery_time" },
                shipping_details: { $first: "$shipping_details" },
                remarks: { $first: "$remarks" },
                order_status: { $first: "$order_status" },
                status: { $first: "$status" },
                invoice_no: { $first: "$invoice_no" },
                created_at: { $first: "$created_at" },
                supplier: { $first: "$supplier" },
                buyer: { $first: "$buyer" },
                totalPrice: { $sum: "$items.item_price" },
              },
            },
            {
              $project: {
                order_id: 1,
                buyer_id: 1,
                buyer_name: 1,
                supplier_id: 1,
                supplier_name: 1,
                items: 1,
                payment_terms: 1,
                est_delivery_time: 1,
                shipping_details: 1,
                remarks: 1,
                order_status: 1,
                status: 1,
                invoice_no: 1,
                created_at: 1,
                totalPrice: 1,
                "supplier.supplier_image": 1,
                "supplier.supplier_name": 1,
                "supplier.supplier_type": 1,
                "buyer.buyer_image": 1,
                "buyer.buyer_name": 1,
                "buyer.buyer_type": 1,
              },
            },
          ]);
    
        if (!data) {
          return res.status(400).send({ code: 400, message: 'Error occurred fetching order list', result: {} });
        }

        const productsArr = []
        data?.forEach(item=>{
          item?.items?.forEach(medicine=> {

            productsArr?.push({
              ...medicine,
              order_id : item?.order_id,
              buyer_name : item?.buyer_name,
              supplier_name : item?.supplier_name,
              order_id : item?.order_id,
              order_id : item?.order_id,
            })
            
          })
          
        })
        
        // Convert Mongoose document to plain object and flatten"
        const flattenedData = productsArr.map(item => flattenData(item, [], ["order_id", "buyer_name", "supplier_name", "medicine_name", "medicine_id", "quantity_required", "unit_price", "total_amount", "target_price", "counter_price"], 'order_list')); // `toObject()` removes internal Mongoose metadata

        // Convert the flattened data to CSV
        const csv = parse(flattenedData);
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

        res.status(200).send(csv);
    
      } catch (error) {
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },

    getSpecificOrderDetails: async (req, res) => {
      try {
        const {user_type} = req?.headers;
        // const {buyer_id, order_id, filterKey, admin_id, supplier_id} = req?.body;
        const order_id =req?.params?.id;
        let data;
        if(user_type == 'Admin'){
          data = await Order.aggregate([
            {
                $match: { 
                    order_id : order_id,
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
              $lookup: {
                from         : "enquiries",
                localField   : "enquiry_id",
                foreignField : "enquiry_id",
                as           : "enquiry"
              }
            },
            {
              $lookup: {
                  from: "invoices",
                  localField: "order_id",
                  foreignField: "order_id",
                  as: "invoices"
              }
          },
            {
              $addFields: {
                invoices: {
                  $sortArray: {
                    input: "$invoices",
                    sortBy: { created_at: -1 }
                  }
                }
              }
            },
            {
              $project: {
                order_id          : 1,
                enquiry_id :1,
                purchaseOrder_id : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                buyer_name : 1,
                buyer_email : 1,
                buyer_mobile:1,
                buyer_address : 1,
                supplier_name : 1,
                supplier_email: 1,
                supplier_address: 1,
                supplier_mobile: 1,
                items             : 1,
                payment_terms     : 1,
                deposit_requested: 1,
                // deposit_due : 1,
                deposit_due_date : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                status : 1,
                invoice_number    : 1,
                invoice_no        : 1,
                invoice_date : 1,
                payment_due_date: 1,
                total_due_amount: 1,
                logistics_details : 1,
                coordinators : 1,
                shipment_details : 1,
                supplier_logistics_data : 1,
                buyer_logistics_data : 1,
                created_at        : 1,
                supplier          : { $arrayElemAt: ["$supplier", 0] },
                buyer          : { $arrayElemAt: ["$buyer", 0] },
                enquiry          : { $arrayElemAt: ["$enquiry", 0] },
                invoices: 1
              }
            },
            {
              $unwind: "$items"
            },
            {
              $lookup: {
                from         : "medicines",
                 localField   : "items.medicine_id",
                foreignField : "medicine_id",
                as           : "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image" : {$arrayElemAt : ["$medicine.medicine_image", 0] },
                "items.drugs_name"     : {$arrayElemAt  : ["$medicine.drugs_name",0]},
                "items.strength"     : {$arrayElemAt  : ["$medicine.strength",0]},
                "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
              }
            },
            {
              $group: {
                _id               : "$_id",
                order_id          : { $first: "$order_id" },
                buyer_id          : { $first: "$buyer_id" },
                buyer_company     : { $first: "$buyer_company" },
                buyer_name        : { $first: "$buyer_name" },
                buyer_email        : { $first: "$buyer_email" },
                buyer_address        : { $first: "$buyer_address" },
                buyer_mobile        : { $first: "$buyer_mobile" },
                supplier_name        : { $first: "$supplier_name" },
                supplier_email        : { $first: "$supplier_email" },
                supplier_mobile        : { $first: "$supplier_mobile" },
                supplier_address  : { $first: "$supplier_address" },
                supplier_type  : { $first: "$supplier_type" },
                country_of_origin :  { $first: "$country_of_origin" },
                supplier_id       : { $first: "$supplier_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },

                deposit_requested     : { $first: "$deposit_requested" },
                // deposit_due     : { $first: "$deposit_due" },
                deposit_due_date     : { $first: "$deposit_due_date" },
                // payment_terms     : { $first: "$payment_terms" },

                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                status            : { $first: "$status" },
                invoice_number    : { $first: "$invoice_number" },
                invoice_no        : { $first: "$invoice_no" },
                invoice_date : { $first: "$invoice_date" },
                payment_due_date: { $first: "$payment_due_date" },
                logistics_details : { $first: "$logistics_details" },
                shipment_details : { $first: "$shipment_details" },
                supplier_logistics_data: {$first: "$supplier_logistics_data" },
                buyer_logistics_data : {$first: "$buyer_logistics_data"},
                coordinators : { $first: "$coordinators" },
                total_due_amount: { $first: "$total_due_amount" },
                created_at        : {$first: "$created_at"},
                supplier          : { $first: "$supplier" },
                buyer         : { $first: "$buyer" },
                enquiry         : { $first: "$enquiry" },
                invoices: { $first: "$invoices" },
                totalPrice        : { $sum: "$items.item_price" }
              }
            },
            {
              $project: {
                order_id          : 1,
                enquiry_id :1,
                purchaseOrder_id : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                buyer_name : 1,
                buyer_email : 1,
                buyer_mobile:1,
                buyer_address : 1,
                supplier_name : 1,
                supplier_email: 1,
                supplier_address: 1,
                supplier_mobile: 1,
                supplier_type: 1,
                items             : 1,
                payment_terms     : 1,
                deposit_requested: 1,
                // deposit_due : 1,
                deposit_due_date : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                status : 1,
                invoice_number    : 1,
                invoice_no        : 1,
                invoice_date : 1,
                payment_due_date: 1,
                logistics_details: { $arrayElemAt: ["$logistics_details", 0] },
                shipment_details : 1,
                supplier_logistics_data : 1,
                buyer_logistics_data : 1,
                coordinators : 1,
                total_due_amount : 1,
                created_at        : 1,
                totalPrice        : 1,
                invoices           : 1,
                "supplier.supplier_image" : 1,
                "supplier.supplier_name"  : 1,
                "supplier.supplier_type"  : 1,
                "supplier.estimated_delivery_time"  : 1,
                "enquiry.enquiry_id"  : 1,
                "enquiry.payment_terms"  : 1,
                "buyer.buyer_image" : 1,
                "buyer.buyer_name" : 1,
                "buyer.buyer_email" : 1,
                "buyer.buyer_mobile" : 1,
                "buyer.buyer_type" : 1,
                "buyer.country_of_origin" : 1,
              }
            }
          ])
        } 
        else if(user_type == 'Buyer'){
          data = await Order.aggregate([
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
              $lookup: {
                from         : "buyers",
                localField   : "buyer_id",
                foreignField : "buyer_id",
                as           : "buyer"
              }
            },
            {
              $lookup: {
                from         : "enquiries",
                localField   : "enquiry_id",
                foreignField : "enquiry_id",
                as           : "enquiry"
              }
            },
            {
              $lookup: {
                  from: "invoices",
                  localField: "order_id",
                  foreignField: "order_id",
                  as: "invoices"
              }
            },
            {
              $addFields: {
                invoices: {
                  $sortArray: {
                    input  : "$invoices",
                    sortBy : { created_at: -1 }
                  }
                }
              }
            },
            {
              $project: {
                order_id          : 1,
                enquiry_id        : 1,
                purchaseOrder_id  : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                buyer_name        : 1,
                buyer_email       : 1,
                buyer_mobile      : 1,
                buyer_address     : 1,
                supplier_name     : 1,
                supplier_email    : 1,
                supplier_address  : 1,
                supplier_mobile   : 1,
                items             : 1,
                payment_terms     : 1,
                deposit_requested : 1,
                // deposit_due       : 1,
                deposit_due_date       : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                status            : 1,
                invoice_number    : 1,
                invoice_no        : 1,
                invoice_date      : 1,
                payment_due_date  : 1,
                total_due_amount  : 1,
                logistics_details : 1,
                supplier_logistics_data: 1,
                buyer_logistics_data : 1,
                coordinators      : 1,
                shipment_details  : 1,
                created_at        : 1,
                supplier          : { $arrayElemAt: ["$supplier", 0] },
                buyer             : { $arrayElemAt: ["$buyer", 0] },
                enquiry           : { $arrayElemAt: ["$enquiry", 0] },
                invoices          : 1
              }
            },
            {
              $unwind: "$items"
            },
            {
              $lookup: {
                from         : "medicines",
                 localField  : "items.medicine_id",
                foreignField : "medicine_id",
                as           : "medicine"
              }
            },
            {
              $addFields: {
                "items.medicine_image" : {$arrayElemAt : ["$medicine.medicine_image", 0] },
                "items.drugs_name"     : {$arrayElemAt  : ["$medicine.drugs_name",0]},
                "items.strength"       : {$arrayElemAt  : ["$medicine.strength",0]},
                "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } } 
              }
            },
            {
              $group: {
                _id               : "$_id",
                order_id          : { $first: "$order_id" },
                buyer_id          : { $first: "$buyer_id" },
                buyer_company     : { $first: "$buyer_company" },
                buyer_name        : { $first: "$buyer_name" },
                buyer_email       : { $first: "$buyer_email" },
                buyer_address     : { $first: "$buyer_address" },
                buyer_mobile      : { $first: "$buyer_mobile" },
                supplier_name     : { $first: "$supplier_name" },
                supplier_email    : { $first: "$supplier_email" },
                supplier_mobile   : { $first: "$supplier_mobile" },
                supplier_address  : { $first: "$supplier_address" },
                supplier_type     : { $first: "$supplier_type" },
                country_of_origin :  { $first: "$country_of_origin" },
                supplier_id       : { $first: "$supplier_id" },
                items             : { $push: "$items" },
                payment_terms     : { $first: "$payment_terms" },
                deposit_requested : { $first: "$deposit_requested" },
                // deposit_due       : { $first: "$deposit_due" },
                deposit_due_date       : { $first: "$deposit_due_date" },
                est_delivery_time : { $first: "$est_delivery_time" },
                shipping_details  : { $first: "$shipping_details" },
                remarks           : { $first: "$remarks" },
                order_status      : { $first: "$order_status" },
                status            : { $first: "$status" },
                invoice_number    : { $first: "$invoice_number" },
                invoice_no        : { $first: "$invoice_no" },
                invoice_date      : { $first: "$invoice_date" },
                payment_due_date  : { $first: "$payment_due_date" },
                logistics_details : { $first: "$logistics_details" },
                shipment_details  : { $first: "$shipment_details" },
                supplier_logistics_data: {$first: "$supplier_logistics_data" },
                buyer_logistics_data : {$first: "$buyer_logistics_data"},
                coordinators      : { $first: "$coordinators" },
                total_due_amount: { $first: "$total_due_amount" },
                created_at        : {$first: "$created_at"},
                supplier          : { $first: "$supplier" },
                buyer             : { $first: "$buyer" },
                enquiry           : { $first: "$enquiry" },
                invoices          : { $first: "$invoices" },
                totalPrice        : { $sum: "$items.item_price" }
              }
            },
            {
              $project: {
                order_id          : 1,
                enquiry_id        : 1,
                purchaseOrder_id  : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                buyer_name        : 1,
                buyer_email       : 1,
                buyer_mobile      : 1,
                buyer_address     : 1,
                supplier_name     : 1,
                supplier_email    : 1,
                supplier_address  : 1,
                supplier_mobile   : 1,
                supplier_type     : 1,
                items             : 1,
                payment_terms     : 1,
                deposit_requested : 1,
                // deposit_due       : 1,
                deposit_due_date       : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                status            : 1,
                invoice_number    : 1,
                invoice_no        : 1,
                invoice_date      : 1,
                payment_due_date  : 1,
                logistics_details : { $arrayElemAt: ["$logistics_details", 0] },
                shipment_details  : 1,
                supplier_logistics_data: 1,
                buyer_logistics_data : 1,
                coordinators      : 1,
                total_due_amount  : 1,
                created_at        : 1,
                totalPrice        : 1,
                invoices          : 1,
                "supplier.supplier_image" : 1,
                "supplier.supplier_name"  : 1,
                "supplier.supplier_type"  : 1,
                "enquiry.enquiry_id"      : 1,
                "enquiry.payment_terms"   : 1,
                "buyer.buyer_image"       : 1,
                "buyer.buyer_name"        : 1,
                "buyer.buyer_email"       : 1,
                "buyer.buyer_mobile"      : 1,
                "buyer.buyer_type"        : 1,
                "buyer.country_of_origin" : 1,
              }
            }
          ])
        }
        else if(user_type == 'Supplier'){
          data = await Order.aggregate([
            {
                $match: { 
                    order_id: order_id,
                    // buyer_id: buyer_id,
                    // order_status: filterKey
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
                $lookup: {
                    from         : "enquiries",
                    localField   : "enquiry_id",
                    foreignField : "enquiry_id",
                    as           : "enquiry"
                }
            },
            {
                $lookup: {
                    from         : "invoices",
                    localField   : "order_id",
                    foreignField : "order_id",
                    as           : "invoices"
                }
            },
            {
              $addFields: {
                invoices: {
                  $sortArray: {
                    input  : "$invoices",
                    sortBy : { created_at: -1 }
                  }
                }
              }
            },
            {
                $project: {
                    order_id          : 1,
                    enquiry_id        : 1,
                    purchaseOrder_id  : 1,
                    buyer_id          : 1,
                    buyer_company     : 1,
                    supplier_id       : 1,
                    buyer_name        : 1,
                    buyer_email       : 1,
                    buyer_mobile      : 1,
                    buyer_address     : 1,
                    supplier_name     : 1,
                    supplier_email    : 1,
                    supplier_address  : 1,
                    supplier_mobile   : 1,
                    items             : 1,
                    payment_terms     : 1,
                    deposit_requested : 1,
                    // deposit_due       : 1,
                    deposit_due_date       : 1,
                    est_delivery_time : 1,
                    shipping_details  : 1,
                    remarks           : 1,
                    order_status      : 1,
                    status            : 1,
                    invoice_status    : 1,
                    invoice_number    : 1,
                    invoice_no        : 1,
                    invoice_date      : 1,
                    payment_due_date  : 1,
                    total_due_amount  : 1,
                    total_amount_paid : 1,
                    pending_amount    : 1,
                    logistics_details : 1,
                    shipment_details  : 1,
                    supplier_logistics_data: 1,
                    buyer_logistics_data : 1,
                    coordinators      : 1,
                    created_at        : 1,
                    supplier          : { $arrayElemAt: ["$supplier", 0] },
                    buyer             : { $arrayElemAt: ["$buyer", 0] },
                    enquiry           : { $arrayElemAt: ["$enquiry", 0] },
                    invoices          : 1
                }
            },
            {
                $unwind: "$items"
            },
            {
                $lookup: {
                    from         : "medicines",
                    localField   : "items.medicine_id",
                    foreignField : "medicine_id",
                    as           : "medicine"
                }
            },
            {
                $addFields: {
                    "items.medicine_image" : {$arrayElemAt: ["$medicine.medicine_image", 0]},
                    "items.drugs_name"     : {$arrayElemAt: ["$medicine.drugs_name", 0]},
                    "items.strength"       : {$arrayElemAt: ["$medicine.strength", 0]},
                    "items.item_price"     : { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } }
                }
            },
            {
                $group: {
                    _id                : "$_id",
                    order_id           : { $first: "$order_id" },
                    enquiry_id         : { $first: "$enquiry_id" },
                    purchaseOrder_id   : { $first: "$purchaseOrder_id" },
                    buyer_id           : { $first: "$buyer_id" },
                    buyer_company      : { $first: "$buyer_company" },
                    buyer_name         : { $first: "$buyer_name" },
                    buyer_email        : { $first: "$buyer_email" },
                    buyer_address      : { $first: "$buyer_address" },
                    buyer_mobile       : { $first: "$buyer_mobile" },
                    buyer_country_code : { $first: "$buyer_country_code" },
                    supplier_name      : { $first: "$supplier_name" },
                    supplier_email     : { $first: "$supplier_email" },
                    supplier_mobile    : { $first: "$supplier_mobile" },
                    supplier_address   : { $first: "$supplier_address" },
                    country_of_origin  : { $first: "$country_of_origin" },
                    supplier_id        : { $first: "$supplier_id" },
                    items              : { $push: "$items" },
                    payment_terms      : { $first: "$payment_terms" },
                    deposit_requested  : { $first: "$deposit_requested" },
                    // deposit_due        : { $first: "$deposit_due" },
                    deposit_due_date        : { $first: "$deposit_due_date" },
                    est_delivery_time  : { $first: "$est_delivery_time" },
                    shipping_details   : { $first: "$shipping_details" },
                    remarks            : { $first: "$remarks" },
                    order_status       : { $first: "$order_status" },
                    status             : { $first: "$status" },
                    invoice_status     : { $first: "$invoice_status" },
                    invoice_number     : { $first: "$invoice_number" },
                    invoice_no         : { $first: "$invoice_no" },
                    invoice_date       : { $first: "$invoice_date" },
                    payment_due_date   : { $first: "$payment_due_date" },
                    logistics_details  : { $first: "$logistics_details" },
                    shipment_details   : { $first: "$shipment_details" },
                    supplier_logistics_data: {$first: "$supplier_logistics_data" },
                    buyer_logistics_data : {$first: "$buyer_logistics_data"},
                    coordinators       : { $first: "$coordinators" },
                    total_due_amount   : { $first: "$total_due_amount" },
                    total_amount_paid  : { $first: "$total_amount_paid" },
                    pending_amount     : { $first: "$pending_amount" },
                    created_at         : {$first: "$created_at"},
                    supplier           : { $first: "$supplier" },
                    buyer              : { $first: "$buyer" },
                    enquiry            : { $first: "$enquiry" },
                    invoices           : { $first: "$invoices" }, // Group the invoice details
                    totalPrice         : { $sum: "$items.item_price" }
                }
            },
            {
              $project: {
                order_id          : 1,
                enquiry_id        : 1,
                purchaseOrder_id  : 1,
                buyer_id          : 1,
                buyer_company     : 1,
                supplier_id       : 1,
                buyer_name        : 1,
                buyer_email       : 1,
                buyer_mobile      : 1,
                buyer_country_code: 1,
                buyer_address     : 1,
                supplier_name     : 1,
                supplier_email    : 1,
                supplier_address  : 1,
                supplier_mobile   : 1,
                items             : 1,
                payment_terms     : 1,
                deposit_requested : 1,
                // deposit_due       : 1,
                deposit_due_date  : 1,
                est_delivery_time : 1,
                shipping_details  : 1,
                remarks           : 1,
                order_status      : 1,
                status            : 1,
                invoice_status    : 1,
                invoice_number    : 1,
                invoice_no        : 1,
                invoice_date      : 1,
                payment_due_date  : 1,
                logistics_details : { $arrayElemAt: ["$logistics_details", 0] },
                shipment_details  : 1,
                supplier_logistics_data: 1,
                buyer_logistics_data : 1,
                coordinators      : 1,
                total_due_amount  : 1,
                total_amount_paid : 1,
                pending_amount    : 1,
                created_at        : 1,
                totalPrice        : 1,
                invoices          : 1,
                "supplier.supplier_image"              : 1,
                "supplier.supplier_name"               : 1,
                "supplier.supplier_email"              : 1,
                "supplier.supplier_mobile"             : 1,
                "supplier.supplier_country_code"       : 1,
                "supplier.contact_person_mobile_no"    : 1,
                "supplier.contact_person_country_code" : 1,
                "supplier.estimated_delivery_time"     : 1,
                "supplier.supplier_address"            : 1,
                "supplier.country_of_origin"           : 1,
                "supplier.vat_reg_no"                  : 1,
                "enquiry.enquiry_id"                   : 1,
                "enquiry.payment_terms"                : 1,
                "buyer.buyer_image"                    : 1,
                "buyer.buyer_name"                     : 1,
                "buyer.buyer_email"                    : 1,
                "buyer.buyer_mobile"                   : 1,
                "buyer.buyer_country_code"             : 1,
                "buyer.contact_person_mobile"          : 1,
                "buyer.contact_person_country_code"    : 1,
                "buyer.buyer_address"                  : 1,
                "buyer.buyer_type"                     : 1,
                "buyer.country_of_origin": 1,
                "buyer.country_of_origin"              : 1,
                "buyer.vat_reg_no"                     : 1,
              }
            }
          ])
        }
        if(!data) {          
          console.log(err);
          res?.status(400)?.send({ code: 400, message: "Error in fetching order details", result: err });
        }        
        res?.status(200)?.send({ code: 200, message: "Details Fetched successfully", result: data[0] })
      } catch (error) {
        console.log("Internal Server Error:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
      }
    },
    
    

}