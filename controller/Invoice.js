const Order    = require('../schema/orderSchema')
const Support  = require('../schema/supportSchema')
const Invoice  = require('../schema/invoiceSchema')
const Enquiry  = require('../schema/enquiryListSchema')
const Notification = require('../schema/notificationSchema')

const initializeInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  if (count === 0) {
      const initialInvoiceNumber = new Invoice({ last_invoice_number: 18000 });
      await initialInvoiceNumber.save();
  }
};

module.exports = {

    createInvoice : async(reqObj, callback) => {
       try {
        const invoiceId = 'INV-' + Math.random().toString(16).slice(2);
      
        const newInvoice = new Invoice({
            invoice_id           : invoiceId,
            order_id             : reqObj.orderId,
            enquiry_id           : reqObj.enquiryId,
            purchaseOrder_id     : reqObj.purchaseOrderId,
            buyer_id             : reqObj.buyerId,
            supplier_id          : reqObj.supplierId,
            invoice_no           : (reqObj.data && reqObj.data.invoiceNo) || reqObj.invoiceNo,
            invoice_date         : (reqObj.data && reqObj.data.invoiceDate) || reqObj.invoiceDate,
            buyer_name           : (reqObj.data && reqObj.data.buyerName) || reqObj.buyerName,
            buyer_email          : (reqObj.data && reqObj.data.buyerEmail )|| reqObj.buyerEmail,
            buyer_mobile         : (reqObj.data && reqObj.data.buyerMobile )|| reqObj.buyerMobile,
            buyer_address        : (reqObj.data && reqObj.data.buyerAddress) || reqObj.buyerAddress,
            buyer_vat_reg_no     : (reqObj.data && reqObj.data.buyerVatRegNo) || reqObj.buyerVatRegNo,
            buyer_country        : (reqObj.data && reqObj.data.buyerCountry?.label) || reqObj.buyerCountry?.label,
            supplier_name        : (reqObj.data && reqObj.data.supplierName )|| reqObj.supplierName,
            supplier_email       : (reqObj.data && reqObj.data.supplierEmail )|| reqObj.supplierEmail,
            supplier_mobile      : (reqObj.data && reqObj.data.supplierMobile )|| reqObj.supplierMobile,
            supplier_address     : (reqObj.data && reqObj.data.supplierAddress) || reqObj.supplierAddress,  
            supplier_country     : (reqObj.data && reqObj.data.supplierCountry?.label) || reqObj.supplierCountry?.label,  
            supplier_vat_reg_no  : (reqObj.data && reqObj.data.supplierVatRegNo) || reqObj.supplierVatRegNo,     
            items                : (reqObj.data && reqObj.orderItems) || reqObj.orderItems,
            // vat                  : (reqObj.data && reqObj.data.vat )|| reqObj.vat,
            total_payable_amount : (reqObj.data && reqObj.data.totalPayableAmount) || reqObj.totalPayableAmount,
            total_amount_paid    : 0,
            payment_terms        : (reqObj.data && reqObj.data.paymentTerms) || reqObj.paymentTerms,
            pending_amount       : (reqObj.data && reqObj.data.totalPayableAmount) || reqObj.totalPayableAmount,
            account_number       : (reqObj.data && reqObj.data.accountNo) || reqObj.accountNo,
            sort_code            : (reqObj.data && reqObj.data.sortCode) || reqObj.sortCode,
            invoice_status       : 'pending', 
        })

        newInvoice.save().then(async() => {
          const updatedEnquiry = await Order.findOneAndUpdate(
            { order_id : reqObj.orderId },
            {
                $set: {
                    invoice_status  : 'Invoice Created'
                }
            },
            { new: true } 
        );
        if (!updatedEnquiry) {
            return callback({ code: 404, message: 'Order not found', result: null });
        }
          const notificationId = 'NOT-' + Math.random().toString(16).slice(2);
          const newNotification = new Notification({
            notification_id : notificationId,
            event_type      : 'Invoice created',
            event           : 'invoice',
            from            : 'supplier',
            to              : 'buyer',
            from_id         : reqObj.supplierId,
            to_id           : reqObj.buyerId,
            event_id        : invoiceId,
            connected_id    : reqObj.orderId,
            message         : 'Invoice created',
            status          : 0
        })
        await newNotification.save()
            return callback({code: 200, message: "Invoice Created Successfully"});
        })
        .catch((err) => {
            console.log('err in invoice creation',err);
            return callback({code: 400, message: 'Error while creating the invoice'})
        })
       } catch (error) {
        console.log('Internal Server Error',error);
        callback({code: 500, message: 'Internal Server Error'})
       }
    },

    // updatePaymentStatus : async(reqObj, callback) => {
    //   try {
        
    //     const { invoice_id, buyer_id, supplier_id, order_id, mode_of_payment, amount_paid, transaction_id, payment_date, transaction_image } = reqObj

    //     const updateInvoice  = await Invoice.findOneAndUpdate(
    //       {  invoice_id : invoice_id ,
    //          order_id : order_id

    //       },
    //       {
    //         $set: {
    //           mode_of_payment   : mode_of_payment,
    //           amount_paid       : amount_paid,
    //           transaction_id    : transaction_id,
    //           payment_date      : payment_date,
    //           transaction_image : transaction_image,
    //           total_amount_paid : total_amount_paid + amount_paid,
    //           pending_amount    : total_amount_paid - amount_paid
    //         }
    //       }
    //     )
      
    
     
    //       callback({code: 200, message: 'Updated', result: updatedOrder})

    //   } catch (error) {
    //     console.log(error)
    //    callback({code: 500, message: 'Internal Server Error'})
    //   }
    // },


    updatePaymentStatus: async (reqObj, callback) => {
      try {
          const { invoice_id, buyer_id, supplier_id, order_id, mode_of_payment, amount_paid, transaction_id, payment_date, transaction_image } = reqObj;
  
          // Fetch the existing invoice and order to calculate the new amounts
          const invoice = await Invoice.findOne({ invoice_id, order_id });
          const order = await Order.findOne({ order_id });
  
          if (!invoice || !order) {
              return callback({ code: 404, message: 'Invoice or Order not found' });
          }
  
          // Calculate the new amounts
          const newTotalAmountPaid = parseFloat(invoice.total_amount_paid) + parseFloat(amount_paid);
          const newPendingAmount = parseFloat(invoice.total_payable_amount) - newTotalAmountPaid;
  
          console.log('newTotalAmountPaid',newTotalAmountPaid);
          console.log('newPendingAmount',newPendingAmount);
          // Determine the new status based on the payment
          const invoiceStatus = newPendingAmount === 0 ? 'completed' : invoice.status;
          const orderStatus = newTotalAmountPaid === parseFloat(order.total_due_amount) ? 'completed' : order.order_status;
          const newOrderStatus = newTotalAmountPaid === parseFloat(order.total_due_amount) ? 'completed' : order.status;
  console.log('invoiceStatus',invoiceStatus);
  console.log('orderStatus',orderStatus);
  console.log('newOrderStatus',newOrderStatus);
          // Update the invoice
          const updatedInvoice = await Invoice.findOneAndUpdate(
              { invoice_id, order_id },
              {
                  $set: {
                      mode_of_payment,
                      amount_paid,
                      transaction_id,
                      payment_date,
                      transaction_image,
                      total_amount_paid : newTotalAmountPaid.toFixed(2),
                      pending_amount    : newPendingAmount.toFixed(2),
                      status            : invoiceStatus
                  }
              },
              { new: true }
          );
  
          // // Update the order
          const updatedOrder = await Order.findOneAndUpdate(
              { order_id },
              {
                  $set: {
                      total_amount_paid : newTotalAmountPaid.toFixed(2),
                      pending_amount    : newPendingAmount.toFixed(2),
                      status            : orderStatus
                  }
              },
              { new: true }
          );
  
          const response = {
            updatedInvoice,
            updatedOrder
          }
          callback({ code: 200, message: 'Updated', result: response });
      } catch (error) {
          console.error(error);
          callback({ code: 500, message: 'Internal Server Error' });
      }
  },
  

    invoiceDetails: async (reqObj, callback) => {
      try {
        const { order_id, invoice_id, supplier_id } = reqObj;
    
        Invoice.aggregate([
          {
            $match: {
              // supplier_id: supplier_id,
              invoice_id: invoice_id
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
            $lookup: {
              from: "enquiries",
              localField: "enquiry_id",
              foreignField: "enquiry_id",
              as: "enquiry"
            }
          },
          {
            $project: {
              invoice_id: 1,
              order_id: 1,
              enquiry_id: 1,
              purchaseOrder_id: 1,
              buyer_id: 1,
              supplier_id: 1,
              invoice_no: 1,
              invoice_date: 1,
              buyer_name: 1,
              buyer_address: 1,
              buyer_country: 1,
              buyer_vat_reg_no: 1,
              supplier_name: 1,
              supplier_address: 1,
              supplier_country: 1,
              supplier_vat_reg_no: 1,
              items: 1,
              payment_terms: { $arrayElemAt: ["$enquiry.payment_terms", 0] },
              total_payable_amount: 1,
              total_amount_paid: 1,
              pending_amount: 1,
              account_number: 1,
              sort_code: 1,
              transaction_image: 1,
              invoice_status: 1,
              status: 1,
              payment_status: 1,
              created_at: 1,
              supplier: { $arrayElemAt: ["$supplier", 0] }
            }
          },
          {
            $unwind: "$items"
          },
          {
            $lookup: {
              from: "medicines",
              localField: "items.medicine_id",
              foreignField: "medicine_id",
              as: "medicine"
            }
          },
          {
            $addFields: {
              "items.medicine_image": { $arrayElemAt: ["$medicine.medicine_image", 0] },
              "items.strength": { $arrayElemAt: ["$medicine.strength", 0] },
              "items.item_price": { $toDouble: { $arrayElemAt: [{ $split: ["$items.price", " "] }, 0] } }
            }
          },
          {
            $group: {
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
              invoice_status: { $first: "$invoice_status" },
              status: { $first: "$status" },
              payment_status: { $first: "$payment_status" },
              created_at: { $first: "$created_at" },
              supplier: { $first: "$supplier" },
              totalPrice: { $sum: "$items.item_price" }
            }
          },
          {
            $project: {
              invoice_id: 1,
              order_id: 1,
              enquiry_id: 1,
              purchaseOrder_id: 1,
              buyer_id: 1,
              supplier_id: 1,
              invoice_no: 1,
              invoice_date: 1,
              buyer_name: 1,
              buyer_address: 1,
              buyer_country: 1,
              buyer_vat_reg_no: 1,
              supplier_name: 1,
              supplier_address: 1,
              supplier_country: 1,
              supplier_vat_reg_no: 1,
              items: 1,
              payment_terms: 1,
              total_payable_amount: 1,
              total_amount_paid: 1,
              pending_amount: 1,
              account_number: 1,
              sort_code: 1,
              transaction_image: 1,
              invoice_status: 1,
              status: 1,
              payment_status: 1,
              created_at: 1,
              totalPrice: 1,
              "supplier.supplier_image": 1,
              "supplier.supplier_name": 1,
              "supplier.supplier_address": 1,
              "supplier.supplier_type": 1
            }
          }
        ])
          .then((data) => {
            callback({ code: 200, message: "Invoice Details", result: data[0] });
          })
          .catch((err) => {
            callback({ code: 400, message: "Error while fetching details", result: err });
          });
      } catch (error) {
        console.log('server error', error);
        callback({ code: 500, message: "Internal server error", result: error });
      }
    }
    



}