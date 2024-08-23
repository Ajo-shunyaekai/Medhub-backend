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
            order_id             : reqObj.order_id,
            enquiry_id           : reqObj.enquiry_id,
            purchaseOrder_id     : reqObj.purchaseOrder_id,
            buyer_id             : reqObj.buyer_id,
            supplier_id          : reqObj.supplier_id,
            invoice_no           : (reqObj.data && reqObj.data.invoiceNumber) || reqObj.invoiceNumber,
            invoice_date         : (reqObj.data && reqObj.data.invoiceDate) || reqObj.invoiceDate,
            buyer_name           : (reqObj.data && reqObj.data.buyerName) || reqObj.buyerName,
            buyer_address        : (reqObj.data && reqObj.data.buyerAddress) || reqObj.buyerAddress,
            buyer_vat_reg_no     : (reqObj.data && reqObj.data.buyerVatRegNo) || reqObj.buyerVatRegNo,
            buyer_country        : (reqObj.data && reqObj.data.buyerCountry) || reqObj.buyerCountry,
            supplier_name        : (reqObj.data && reqObj.data.supplierName )|| reqObj.supplierName,
            supplier_address     : (reqObj.data && reqObj.data.supplierAddress) || reqObj.supplierAddress,  
            supplier_country     : (reqObj.data && reqObj.data.supplierCountry) || reqObj.supplierCountry,  
            supplier_vat_reg_no  : (reqObj.data && reqObj.data.supplierVatRegNo) || reqObj.supplierVatRegNo,     
            items                : (reqObj.data && reqObj.orderItems) || reqObj.orderItems,
            vat                  : (reqObj.data && reqObj.data.vat )|| reqObj.vat,
            total_payable_amount : (reqObj.data && reqObj.data.totalPayableAmount) || reqObj.totalPayableAmount,
            total_amount_paid    : 0,
            payment_terms        : (reqObj.data && reqObj.data.paymentTerms) || reqObj.paymentTerms,
            pending_amount       : (reqObj.data && reqObj.data.totalPayableAmount) || reqObj.totalPayableAmount,
            account_number       : (reqObj.data && reqObj.data.accountNumber) || reqObj.accountNumber,
            sort_code            : (reqObj.data && reqObj.data.sortCode) || reqObj.sortCode,
            invoice_status       : 'pending', 
        })

        newInvoice.save().then(async() => {
        //   const updatedEnquiry = await Enquiry.findOneAndUpdate(
        //     { enquiry_id : reqObj.enquiry_id },
        //     {
        //         $set: {
        //             enquiry_status  : 'order created'
        //         }
        //     },
        //     { new: true } 
        // );
        // if (!updatedEnquiry) {
        //     return callback({ code: 404, message: 'Enquiry not found', result: null });
        // }
          const notificationId = 'NOT-' + Math.random().toString(16).slice(2);
          const newNotification = new Notification({
            notification_id : notificationId,
            event_type      : 'Invoice created',
            event           : 'invoice',
            from            : 'supplier',
            to              : 'buyer',
            from_id         : reqObj.supplier_id,
            to_id           : reqObj.buyer_id,
            event_id        : invoiceId,
            connected_id    : reqObj.order_id,
            message         : 'Invoice created',
            status          : 0
        })
        await newNotification.save()
            return callback({code: 200, message: "Invoice created successfully"});
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

    updatePaymentStatus : async(reqObj, callback) => {
      try {
        
        const { invoice_id, buyer_id, supplier_id, order_id, mode_of_payment, amount_paid, transaction_id, payment_date, transaction_image } = reqObj
        const logisticsArray = Array.isArray(logistics_details) ? logistics_details : [logistics_details];

        const updatedOrder = await Order.findOneAndUpdate(
          { order_id : order_id },
          {
              $set: {
                logistics_details : logisticsArray,
                status            : 'Awaiting details from supplier'
              }
          },
          { new: true } 
      );
      if (!updatedOrder) {
          return callback({ code: 404, message: 'Order not found', result: null });
      }
      const notificationId = 'NOT-' + Math.random().toString(16).slice(2);
      const newNotification = new Notification({
        notification_id         : notificationId,
        event_type   : 'Logistics booking request',
        event : 'order',
        from : 'buyer',
        to : 'supplier',
        from_id : buyer_id,
        to_id : supplier_id,
        event_id : order_id,
        message : 'Request for logisctics booking',
        status : 0
    })
    await newNotification.save()
     
          callback({code: 200, message: 'Updated', result: updatedOrder})

      } catch (error) {
        console.log(error)
       callback({code: 500, message: 'Internal Server Error'})
      }
    },

    submitPickupDetails : async(reqObj, callback) => {
      try {
        
        const { buyer_id, supplier_id, order_id, shipment_details } = reqObj

        const updatedOrder = await Order.findOneAndUpdate(
          { order_id : order_id },
          {
              $set: {
                shipment_details : shipment_details,
                status           : 'Shipment details submitted'
              }
          },
          { new: true } 
      );
      if (!updatedOrder) {
          return callback({ code: 404, message: 'Order not found', result: null });
      }
          const notificationId = 'NOT-' + Math.random().toString(16).slice(2);
          const newNotification = new Notification({
            notification_id  : notificationId,
            event_type   : 'Shipment details submitted',
            event : 'order',
            from : 'supplier',
            to : 'buyer',
            from_id : supplier_id,
            to_id : buyer_id,
            event_id : order_id,
            message  : 'Shipment details submitted',
            status : 0
        })
        await newNotification.save()
     
          callback({code: 200, message: 'Updated', result: updatedOrder})

      } catch (error) {
        console.log(error)
       callback({code: 500, message: 'Internal Server Error'})
      }
    },


}