const Order = require("../schema/orderSchema");
const Support = require("../schema/supportSchema");
const Buyer = require("../schema/buyerSchema");
const Supplier = require("../schema/supplierSchema");
const Invoice = require("../schema/invoiceSchema");
const Enquiry = require("../schema/enquiryListSchema");
const Notification = require("../schema/notificationSchema");
const nodemailer = require("nodemailer");
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const {
  createInvoiceContent,
  updatePaymentStatusContent,
} = require("../utils/emailContents");
const { sendEmail } = require("../utils/emailService");

const initializeInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  if (count === 0) {
    const initialInvoiceNumber = new Invoice({ last_invoice_number: 18000 });
    await initialInvoiceNumber.save();
  }
};

module.exports = {
  createInvoice: async (req, res, reqObj, callback) => {
    try {
      const invoiceId = "INV-" + Math.random().toString(16).slice(2, 10);

      const supplier = await Supplier.findOne({
        supplier_id: reqObj.supplierId,
      });
      const buyer = await Buyer.findOne({ buyer_id: reqObj.buyerId });

      const newInvoice = new Invoice({
        invoice_id: invoiceId,
        order_id: reqObj.orderId,
        enquiry_id: reqObj.enquiryId,
        purchaseOrder_id: reqObj.purchaseOrderId,
        buyer_id: reqObj.buyerId,
        supplier_id: reqObj.supplierId,
        invoice_no: (reqObj.data && reqObj.data.invoiceNo) || reqObj.invoiceNo,
        invoice_date:
          (reqObj.data && reqObj.data.invoiceDate) || reqObj.invoiceDate,
        buyer_name: (reqObj.data && reqObj.data.buyerName) || reqObj.buyerName,
        buyer_email:
          (reqObj.data && reqObj.data.buyerEmail) || reqObj.buyerEmail,
        buyer_mobile:
          (reqObj.data && reqObj.data.buyerMobile) || reqObj.buyerMobile,
        buyer_address:
          (reqObj.data && reqObj.data.buyerAddress) || reqObj.buyerAddress,
        buyer_vat_reg_no:
          (reqObj.data && reqObj.data.buyerVatRegNo) || reqObj.buyerVatRegNo,
        buyer_country:
          (reqObj.data && reqObj.data.buyerCountry?.label) ||
          reqObj.buyerCountry?.label,
        supplier_name:
          (reqObj.data && reqObj.data.supplierName) || reqObj.supplierName,
        supplier_email:
          (reqObj.data && reqObj.data.supplierEmail) || reqObj.supplierEmail,
        supplier_mobile:
          (reqObj.data && reqObj.data.supplierMobile) || reqObj.supplierMobile,
        supplier_address:
          (reqObj.data && reqObj.data.supplierAddress) ||
          reqObj.supplierAddress,
        supplier_country:
          (reqObj.data && reqObj.data.supplierCountry?.label) ||
          reqObj.supplierCountry?.label,
        supplier_vat_reg_no:
          (reqObj.data && reqObj.data.supplierVatRegNo) ||
          reqObj.supplierVatRegNo,
        items: (reqObj.data && reqObj.orderItems) || reqObj.orderItems,
        // vat                  : (reqObj.data && reqObj.data.vat )|| reqObj.vat,
        grand_total:
          (reqObj.data && reqObj.data.grandTotal) || reqObj.grandTotal,
        total_payable_amount:
          (reqObj.data && reqObj.data.totalPayableAmount) ||
          reqObj.totalPayableAmount,
        total_amount_paid: 0,
        payment_terms:
          (reqObj.data && reqObj.data.paymentTerms) || reqObj.paymentTerms,
        pending_amount:
          (reqObj.data && reqObj.data.totalPayableAmount) ||
          reqObj.totalPayableAmount,
        bank_name: (reqObj.data && reqObj.data.bankName) || reqObj.bankName,
        account_number:
          (reqObj.data && reqObj.data.accountNo) || reqObj.accountNo,
        sort_code: (reqObj.data && reqObj.data.sortCode) || reqObj.sortCode,
        invoice_status: "pending",
      });

      newInvoice
        .save()
        .then(async () => {
          const updatedEnquiry = await Order.findOneAndUpdate(
            { order_id: reqObj.orderId },
            {
              $set: {
                invoice_status: "Invoice Created",
              },
            },
            { new: true }
          );
          if (!updatedEnquiry) {
            return callback({
              code: 404,
              message: "Order not found",
              result: null,
            });
          }
          const notificationId =
            "NOT-" + Math.random().toString(16).slice(2, 10);
          const newNotification = new Notification({
            notification_id: notificationId,
            event_type: "Invoice created",
            event: "invoice",
            from: "supplier",
            to: "buyer",
            from_id: reqObj.supplierId,
            to_id: reqObj.buyerId,
            event_id: invoiceId,
            connected_id: reqObj.orderId,
            message: `Invoice created for order ${reqObj.orderId}`,
            status: 0,
          });
          await newNotification.save();
          const recipientEmails = [buyer.contact_person_email];
          const subject = `Invoice Created for Order  ${reqObj.orderId}`;
          const emailContent = await createInvoiceContent(buyer, reqObj);
          await sendEmail(recipientEmails, subject, emailContent);
          return callback({
            code: 200,
            message: "Invoice Created Successfully",
          });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          return callback({
            code: 400,
            message: "Error while creating the invoice",
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  updatePaymentStatus: async (req, res, reqObj, callback) => {
    try {
      const {
        invoice_id,
        buyer_id,
        supplier_id,
        order_id,
        mode_of_payment,
        amount_paid,
        transaction_id,
        payment_date,
        transaction_image,
      } = reqObj;

      const supplier = await Supplier.findOne({ supplier_id: supplier_id });
      const buyer = await Buyer.findOne({ buyer_id: buyer_id });

      const invoice = await Invoice.findOne({ invoice_id, order_id });
      const order = await Order.findOne({ order_id });

      if (!invoice || !order) {
        return callback({ code: 404, message: "Invoice or Order not found" });
      }
      // Calculate the new amounts
      const newTotalAmountPaid = parseFloat(
        (parseFloat(order.total_amount_paid) + parseFloat(amount_paid)).toFixed(
          2
        )
      );
      const newPendingAmount = parseFloat(
        (parseFloat(order.grand_total) - newTotalAmountPaid).toFixed(2)
      );

      const orderStatus =
        parseFloat(newTotalAmountPaid).toFixed(2) ===
        parseFloat(order.total_due_amount).toFixed(2)
          ? "completed"
          : order.order_status;
      const newOrderStatus =
        parseFloat(newTotalAmountPaid).toFixed(2) ===
        parseFloat(order.total_due_amount).toFixed(2)
          ? "Completed"
          : order.status;
      // return false
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
            total_amount_paid: newTotalAmountPaid,
            pending_amount: newPendingAmount,
            status: "paid",
            invoice_status: "paid",
          },
        },
        { new: true }
      );

      // // Update the order
      const updatedOrder = await Order.findOneAndUpdate(
        { order_id },
        {
          $set: {
            total_amount_paid: newTotalAmountPaid,
            pending_amount: newPendingAmount,
            status: newOrderStatus,
            order_status: orderStatus,
          },
        },
        { new: true }
      );

      const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
      const newNotification = new Notification({
        notification_id: notificationId,
        event_type: "Payment Done",
        event: "invoice",
        from: "buyer",
        to: "supplier",
        from_id: buyer_id,
        to_id: supplier_id,
        event_id: invoice_id,
        connected_id: order_id,
        message: `Payment completed for Invoice ${invoice_id} on Order ${order_id}.`,
        status: 0,
      });
      await newNotification.save();

      const subject = `Payment Confirmation for Invoice ${invoice_id} – Order ${order_id}`;
      const recipientEmails = [
        supplier.contact_person_email,
        "ajo@shunyaekai.tech",
      ];
      const emailContent = await updatePaymentStatusContent(
        supplier,
        invoice_id,
        order_id,
        amount_paid
      );
      await sendEmail(recipientEmails, subject, emailContent);

      const response = {
        updatedInvoice,
        updatedOrder,
      };

      callback({
        code: 200,
        message: "Payment Status Updated",
        result: response,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },
};
