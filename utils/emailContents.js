const { getTodayFormattedDate } = require("./utilities");

const contactUsContent = (obj) => {
  return `
            <html>
                <body>
                    <p>Hi Admin,</p>
                    <p>We have received an enquiry. Below are the details:</p>
                     <p><strong>Company Name:</strong> ${obj.companyname}</p>
                    <p><strong>Email:</strong> ${obj.email}</p>
                    <p><strong>Name:</strong> ${obj.username}</p>
                    <p><strong>Phone:</strong> ${obj.phone}</p>
                    <p><strong>Subject:</strong> ${obj.subject}</p>
                    <p><strong>Message:</strong> ${obj.message || "N/A"}</p>
                    <br />
                    <p>Regards,</p>
                    <p><strong>Medhub Global Team</strong></p>
                </body>
            </html>
       `;
};

const buyerRegistrationContent = (buyer) => {
  return `
            <p>Dear Admin,</p>
            <p>We hope this message finds you well.</p>
            <p>We are pleased to inform you that a new buyer has registered on Medhub Global. Below are the details of the new account:</p>
            <ul>
            <li>Type of Account: ${buyer?.buyer_type}</li>
            <li>Company Name: ${buyer?.buyer_name}</li>
            <li>Contact Person: ${buyer?.contact_person_name}</li>
            <li>Email Address: ${buyer?.contact_person_email}</li>
            <li>Phone Number: ${buyer?.contact_person_country_code} ${
    buyer?.contact_person_mobile
  }</li>
            <li>Registration Date: ${getTodayFormattedDate()}</li>
            </ul>
            <p>Please review the registration details and take any necessary actions to verify and approve the new account.</p>
 
            <p>Best regards,<br/>Medhub Global Team</p>
        `;
};

const supplierRegistrationContent = (seller) => {
  return `
            <p>Dear Admin,</p>
            <p>We hope this message finds you well.</p>
            <p>We are pleased to inform you that a new supplier has registered on Medhub Global. Below are the details of the new account:</p>
            <ul>
            <li>Type of Account: ${seller.supplier_type}</li>
            <li>Company Name: ${seller.supplier_name}</li>
            <li>Contact Person: ${seller.contact_person_name}</li>
            <li>Email Address: ${seller.contact_person_email}</li>
            <li>Phone Number: ${seller.contact_person_country_code} ${
    seller.contact_person_mobile_no
  }</li>
            <li>Registration Date: ${getTodayFormattedDate()}</li>
            </ul>
            <p>Please review the registration details and take any necessary actions to verify and approve the new account.</p>
            <p>Best regards,<br/>Medhub Global Team</p>
        `;
};

const otpForResetPasswordContent = (user, otp) => {
  return `
    <html>
      <body>
        <p>Dear ${
          user?.supplier_name ||
          user?.buyer_name ||
          user?.user_name ||
          user?.company_name ||
          "User"
        },</p>
        <p>You recently requested to reset your password for your Medhub Global account. Please use the following One-Time Password (OTP) to proceed with resetting your password.</p>
        
        <h2>Your OTP: <strong>${otp}</strong></h2>
        
        <p>This OTP is valid for the next 10 minutes. If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
        
        <p>To reset your password, please follow these steps:</p>
        <ol>
          <li>Enter the OTP on the password reset page.</li>
          <li>Set your new password.</li>
        </ol>
        
        <br/>
        <p>If you need further assistance, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
        
        <p>Best regards,</p>
        <p><strong>Medhub Global Team</strong></p>
      </body>
    </html>
    `;
};

const profileEditRequestContent = (user) => {
  return `
        <html>
            <body>
                <p>Dear Admin,</p>
                <p>We hope this message finds you well.</p>
                <p>We are pleased to inform you that a buyer has requested to update their profile details on Medhub Global. Below are the details of the new account:</p>
                <ul>
                <li>Type of Account: ${
                  user?.buyer_type || user?.supplier_type
                }</li>
                <li>Company Name: ${
                  user?.buyer_name || user?.supplier_name
                }</li>
                <li>Contact Person: ${
                  user?.contact_person_name || user?.contact_person_name
                }</li>
                <li>Email Address: ${
                  user?.contact_person_email || user?.contact_person_email
                }</li>
                <li>Phone Number: ${
                  user?.contact_person_country_code ||
                  user?.contact_person_country_code
                } ${
    user?.contact_person_mobile || user?.contact_person_mobile_no
  }</li>
                <li>Request Date: ${getTodayFormattedDate()}</li>
                </ul>
                <p>Please review the updated details and take any necessary actions to verify and approve the new account.</p>
                <p>Best regards,<br/>Medhub Global Team</p>
            </body>
        </html>
    `;
};

const userRegistrationConfirmationContent = (user, userType) => {
  return `
        <p>Dear ${user.contact_person_name},</p>
        <p>Thank you for registering on Medhub Global as a ${userType}. We are thrilled to have you onboard!</p>
        <p>We are currently reviewing the details you provided during registration. Once the review process is complete, you will receive an email confirmation from our team.</p>
        <p>If you have any questions in the meantime, please feel free to reach out to our support team at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
        <p>Thank you for choosing Medhub Global. We look forward to serving you!</p>
        <p>Best regards,<br/>Medhub Global Team</p>
        `;
};

const lowInventoryContent = (supplierName, medicineName, quantity) => {
  return `
            <p>Dear ${supplierName},</p>
            <p>We would like to inform you that the stock of the following item is running low:</p>
            <p><strong>Product:</strong> ${medicineName}</p>
            <p><strong>Remaining Quantity:</strong> ${quantity}</p>
            <p>Please restock the item at your earliest convenience to avoid any delays in fulfilling orders.</p>
            <p>If you need further assistance, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
            <p>Thanks & Regards,<br/>Medhub Global Team</p>
        `;
};

const licenseExpiryEmail = (
  name,
  email,
  expiryDate,
  reminderType,
  isSupplier = true
) => {
  return `
             <p>Dear ${name},</p>
            <p>Your product's license is set to expire on <strong>${expiryDate}</strong>. This is a reminder that your license will expire in ${reminderType}. Please ensure all necessary steps are taken for the renewal process.</p>
            <p>If you need further assistance, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
            <p>Thanks & Regards,<br/>Medhub Global Team</p>
        `;
};

const generateProfileEditRequestEmail = (userDetails, requestDetails) => {
  const { name, userType, email } = userDetails;
  const { requestDate, status } = requestDetails;

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Profile Edit Request Notification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #555;
                }
                .status {
                    font-weight: bold;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Update on Your Profile Edit Request</h1>
                <p>Dear <strong>${name}</strong>,</p>
                <p>We hope this message finds you well.</p>
                <p>This email is to inform you about the status of your profile edit request submitted.</p>
 
                <p class="status">Action Taken: <strong>${status}</strong></p>
 
                <h2>Details:</h2>
                <ul>
                    <li><strong>Company Type:</strong> ${userType}</li>
                    <li><strong>Status:</strong> ${status}</li>
                </ul>
 
                ${
                  status == "Approved"
                    ? `<p>
                    We are pleased to inform you that your profile edit request has been approved. Your changes have been successfully updated. If you have any further modifications or enquiries, please feel free to reach out at <a href="mailto:connect@medhub.global">connect@medhub.global</a> .
                </p>`
                    : `<p>
                    Unfortunately, your profile edit request has been rejected. If you would like to know more about the reasons for this decision or if you would like to submit a revised request, please contact us at <a href="mailto:connect@medhub.global">connect@medhub.global</a> .
                </p>`
                }
 
                <p>Thank you for your understanding and for being a valued member of our community!</p>
 
                <div class="footer">
                    <p>Best regards,</p>
                    <p>Medhub Global Team</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const createInvoiceContent = (buyer, reqObj) => {
  return `Dear ${buyer.contact_person_name},<br /><br />
 
                      We are pleased to inform you that the invoice for your order <strong>${reqObj.orderId}</strong> has been successfully generated.<br /><br />
                      
                      <strong>Total Payable Amount:</strong> ${reqObj.totalPayableAmount} USD<br /><br />
                      
                      You can review the invoice details by logging into your account on our platform. If you have any questions or require further assistance, please do not hesitate to contact us.<br /><br />
                      
                      <p>For support, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
                      
                      Best regards,<br />
                      <strong>Medhub Global Team</strong>`;
};

const updatePaymentStatusContent = (
  supplier,
  invoice_id,
  order_id,
  amount_paid
) => {
  return `Dear ${supplier.supplier_name},<br /><br />
 
                      We are pleased to inform you that the payment for <strong>Invoice ${invoice_id}</strong> associated with <strong>Order ${order_id}</strong> has been successfully completed.<br /><br />
 
                      <strong>Total Amount Paid:</strong> ${amount_paid} USD<br /><br />
 
                      If you require any further assistance, please do not hesitate to contact us.<br /><br />
 
                      <p>For support, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
 
                      Best regards,<br />
                      <strong>Medhub Global Team</strong>`;
};

const submitQuotationContent = (buyer, enquiry_id) => {
  return `Hello ${buyer.buyer_name}, <br />
                                You’ve received a quote from the supplier for <strong>${enquiry_id}</strong>.<br />
                                <br /><br />
                                <p>If you need further assistance, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
                                Thanks & Regards <br />
                                Medhub Global Team`;
};

const acceptRejectQuotationBuyerContent = (
  supplier,
  buyer,
  enquiry_id,
  msg
) => {
  if (msg === "Accepted") {
    return `Hello ${buyer.contact_person_name}, <br /><br />

            You have successfully <strong>ACCEPTED</strong> the quotation for enquiry ID <strong>${enquiry_id}</strong> from ${supplier.contact_person_name}.<br /><br />

            Please proceed to create the Purchase Order (PO) within the next <strong>24 hours</strong> to confirm the agreed pricing and quantity. <br />
            Note: If the PO is not created within this timeframe, the enquiry will be <strong>automatically cancelled</strong> as prices and availability are subject to change.<br /><br />

            For any assistance, feel free to reach out to us at 
            <a href="mailto:connect@medhub.global">connect@medhub.global</a>.<br /><br />

            Best Regards,<br />
            Medhub Global Team`;
  }

  if (msg === "Rejected") {
    return `Hello ${buyer.contact_person_name}, <br /><br />

            You have <strong>REJECTED</strong> the quotation for enquiry ID <strong>${enquiry_id}</strong> from ${supplier.contact_person_name}.<br /><br />

            Thank you for reviewing the quotation. This enquiry has now been marked as closed.<br /><br />

            If you need any help or would like to explore more options, please contact us at 
            <a href="mailto:connect@medhub.global">connect@medhub.global</a>.<br /><br />

            Warm Regards,<br />
            Medhub Global Team`;
  }

  return "";
};

const acceptRejectQuotationSupplierContent = (
  supplier,
  buyer,
  enquiry_id,
  msg
) => {
  if (msg === "Accepted") {
    return `Hello ${supplier.contact_person_name}, <br /><br />

            Your quotation for enquiry ID <strong>${enquiry_id}</strong> has been <strong>ACCEPTED</strong> by ${buyer.contact_person_name}.<br /><br />

            The buyer is expected to create a Purchase Order (PO) within the next <strong>24 hours</strong>. You will be notified once the PO is created.<br /><br />

            For any queries or support, feel free to contact us at 
            <a href="mailto:connect@medhub.global">connect@medhub.global</a>.<br /><br />

            Best Regards,<br />
            Medhub Global Team`;
  }

  if (msg === "Rejected") {
    return `Hello ${supplier.contact_person_name}, <br /><br />

            Unfortunately, your quotation for enquiry ID <strong>${enquiry_id}</strong> has been <strong>REJECTED</strong> by ${buyer.contact_person_name}.<br /><br />

            This enquiry has now been marked as closed.<br /><br />

            We appreciate your response. If you wish to explore more business opportunities, please reach out to us at 
            <a href="mailto:connect@medhub.global">connect@medhub.global</a>.<br /><br />

            Warm Regards,<br />
            Medhub Global Team`;
  }

  return "";
};

const cancelEnquiryContent = (supplier, buyer, enquiry_id, reason) => {
  return `Hello ${supplier.contact_person_name}, <br />
          The enquiry request with ID <strong>${enquiry_id}</strong> has been cancelled by ${buyer.contact_person_name}.<br />
          <br />
          <strong>Reason for cancellation:</strong> ${reason}<br />
          <br />
          If you need further assistance, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.<br />
          <br />
          Thanks & Regards,<br />
          Medhub Global Team`;
};

const createOrderContent = (buyer, itemsTable) => {
  return `
                <p>Dear ${buyer.contact_person_name},</p>
 
                <p>We are pleased to confirm your order with the following details:</p>
 
                ${itemsTable}
 
                <p>Your order is now being processed, and we will keep you informed about its progress. If you have any questions or require further assistance, please do not hesitate to contact us.</p>
 
                <p>For any enquiries, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
 
                <p>Best regards,<br/><strong>Medhub Global Team</strong></p>
                `;
};

const bookLogisticsContent = (supplier, buyer, order_id) => {
  return `Hello ${supplier.contact_person_name}, <br /><br />
  Logistics Drop Details have been successfully submitted by <strong>${buyer.contact_person_name}</strong> for <strong>Order ID: ${order_id}</strong>.<br /><br />
  
  Please review the details and proceed accordingly.<br /><br />
 
  Thanks & Regards, <br />
  <strong>MedHub Global Team</strong>`;
};

const sendEmailConfirmationContent = (
  userFound,
  name,
  subscriptionStartDate,
  subscriptionEndDate,
  amount
) => {
  return `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <table style="width: 100%; background-color: #ffffff; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="text-align: center; color: #333;">Thank You for Subscribing!</h2>
                    <p style="color: #555; font-size: 16px;">Dear <strong>${userFound?.contact_person_name}</strong>,</p>
                    <p style="color: #555; font-size: 16px;">Thank you for subscribing to our service! We are excited to have you onboard.</p>
      
                    <h3 style="color: #333;">Subscription Details:</h3>
                    <ul style="color: #555; font-size: 16px;">
                      <li><strong>Subscription Plan:</strong> ${name}</li>
                      <li><strong>Start Date:</strong> ${subscriptionStartDate}</li>
                      <li><strong>End Date:</strong> ${subscriptionEndDate}</li>
                    </ul>
      
                    <h3 style="color: #333;">Payment Details:</h3>
                    <ul style="color: #555; font-size: 16px;">
                      <li><strong>Amount Paid:</strong> $ ${amount}</li>
                      <li><strong>Payment Date:</strong> ${subscriptionStartDate}</li>
                    </ul>
      
                    <p style="color: #555; font-size: 16px;">If you have any questions, feel free to contact our support team at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
      
                    <p style="color: #555; font-size: 16px;">Best regards,<br>Medhub Global Team</p>
                  </td>
                </tr>
              </table>
      
              <footer style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                <p>&copy; 2025 Medhub Global. All rights reserved.</p>
                <p>If you did not subscribe to this service, please ignore this email.</p>
              </footer>
            </body>
          </html>
        `;
};

const sendSubscriptionPaymentEmailContent = (
  userFound,
  userId,
  userType,
  coupon
) => {
  const paymentLink = `${
    process.env.CLIENT_URL
  }/subscription/${userId}/${userType?.toLowerCase()}/select-plan`;

  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <table style="width: 100%; background-color: #ffffff; border-radius: 8px; padding: 20px;">
          <tr>
            <td>
              <h2 style="text-align: center; color: #333;">Subscription Payment Link</h2>
              <p style="color: #555; font-size: 16px;">Dear <strong>${
                userFound?.contact_person_name
              }</strong>,</p>
              <p style="color: #555; font-size: 16px;">We are excited to have you onboard! Please click the link below to complete your subscription payment:</p>

              <h3 style="text-align: center; color: #333;">
                <a href="${paymentLink}" style="font-size: 18px; color: #007BFF; text-decoration: none;">Complete Your Payment</a>
              </h3>

              <!-- Coupon Code Section -->
              ${
                coupon &&
                `<p style="color: #555; font-size: 16px; font-weight: bold; text-align: center; margin-top: 20px;">
                Use Coupon Code <span style="color: #28a745; font-size: 18px; font-weight: bold;">${coupon}</span> to get a special discount!
              </p>`
              }

              <p style="color: #555; font-size: 16px;">If you have any issues or questions, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
              
              <p style="color: #555; font-size: 16px;">Thank you for choosing our services. We look forward to working with you!</p>
              <p style="color: #555; font-size: 16px;">Best regards,<br>Medhub Global Team</p>
            </td>
          </tr>
        </table>

        <footer style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
          <p>&copy; 2025 Medhub Global. All rights reserved.</p>
          <p>If you did not request a subscription, please ignore this email.</p>
        </footer>
      </body>
    </html>
  `;
};

const sendSubscriptionExpiryEmailContent = (
  userType,
  user,
  subscription,
  daysLeft
) => {
  const paymentLink = `${process.env.CLIENT_URL}/subscription/${
    user._id
  }/${ut?.toLowerCase()}/select-plan`;
  return `
    <h3>Hello ${user.contact_person_name || "Supplier"},</h3>
    <p>Your subscription (<strong>${
      subscription.productName
    }</strong>) is expiring in <strong>${daysLeft} day(s)</strong>.</p>
    <p><strong>Subscription End Date:</strong> ${
      subscription.subscriptionEndDate
    }</p>
    <p>Please renew to avoid service interruption.</p>
    <h3 style="text-align: center; color: #333;">
      <a href="${paymentLink}" style="font-size: 18px; color: #007BFF; text-decoration: none;">Renew Now</a>
    </h3>
    <br/><br/>
    Regards,<br/>
    MedHub Global Team
  `;
};

const sendSupplierReminderEmailContent = (orderId, orderDate, supplierName) => {
  const orderLink = `http://localhost:3000/supplier/active-orders-details/${orderId}`;

  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <table style="width: 100%; background-color: #ffffff; border-radius: 8px; padding: 20px;">
          <tr>
            <td>
              <h2 style="text-align: center; color: #333;">Reminder: Please Proceed with the Order</h2>
              <p style="color: #555; font-size: 16px;">Dear <strong>${supplierName}</strong>,</p>
              <p style="color: #555; font-size: 16px;">This is a friendly reminder to kindly proceed with the order <strong>#${orderId}</strong> placed on <strong>${orderDate}</strong>.</p>
 
              <h3 style="color: #333;">Order Details:</h3>
              <ul style="color: #555; font-size: 16px;">
                <li><strong>Order ID:</strong> ${orderId}</li>
                <li><strong>Order Date:</strong> ${orderDate}</li>
              </ul>
 
              <p style="color: #555; font-size: 16px;">You can view and manage this order directly by clicking the link below:</p>
              <p style="color: #555; font-size: 16px;">
                <a href="${orderLink}" style="color: #0066cc; text-decoration: none; font-weight: bold;">View Order #${orderId}</a>
              </p>
 
              <p style="color: #555; font-size: 16px;">If you have any questions or need further clarification, please do not hesitate to reach out to us.</p>
 
              <p style="color: #555; font-size: 16px;">We appreciate your timely attention to this matter.</p>
 
              <p style="color: #555; font-size: 16px;">Best regards,<br>Medhub Global Team</p>
            </td>
          </tr>
        </table>
 
        <footer style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
          <p>&copy; 2025 Medhub Global. All rights reserved.</p>
          <p>If you did not place this order, please ignore this email.</p>
        </footer>
      </body>
    </html>
  `;
};

const adminMailOptionsContent = (
  userFound,
  name,
  subscriptionStartDate,
  subscriptionEndDate,
  usertype,
  amount
) => {
  return `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <table style="width: 100%; background-color: #ffffff; border-radius: 8px; padding: 20px;">
              <tr>
                <td>
                  <h2 style="text-align: center; color: #333;">New Subscription and Payment Confirmation</h2>
                  <p style="color: #555; font-size: 16px;">Dear Admin,</p>
                  <p style="color: #555; font-size: 16px;">A new subscription has been successfully created for the user <strong>${
                    userFound?.contact_person_name
                  }</strong>.</p>
 
                  <h3 style="color: #333;">Subscription Details:</h3>
                  <ul style="color: #555; font-size: 16px;">
                    <li><strong>Subscription Plan:</strong> ${name}</li>
                    <li><strong>Start Date:</strong> ${subscriptionStartDate}</li>
                    <li><strong>End Date:</strong> ${subscriptionEndDate}</li>
                    <li><strong>User Type:</strong> ${
                      usertype?.toLowerCase() == "buyer" ? "Buyer" : "Supplier"
                    }</li>
                  </ul>
 
                  <h3 style="color: #333;">Payment Details:</h3>
                  <ul style="color: #555; font-size: 16px;">
                    <li><strong>Amount Paid:</strong> $ ${amount}</li>
                    <li><strong>Payment Date:</strong> ${subscriptionStartDate}</li>
                  </ul>
 
                  <p style="color: #555; font-size: 16px;">If you need more details, please check the subscription records in the system.</p>
                  <p style="color: #555; font-size: 16px;">Best regards,<br>Medhub Global Team</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
};

const enquiryMailToBuyerContent = (
  buyer,
  supplier,
  products,
  enquiryNumber
) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <table style="width: 100%; background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td>
              <p style="color: #212121; font-size: 16px;">Dear <strong>${buyer}</strong>,</p>
              <p style="color: #212121; font-size: 16px;">Congratulations!! Your Medhub Global enquiry has been sent to ${supplier}, Enquiry Number ${enquiryNumber}</p>
 
              <h3 style="color: #212121;">Enquiry Details:</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Product Image</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Product ID</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Product Name</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Quantity Required</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Listed Price</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Target Price</th>
                </tr>
                ${products
                  .map(
                    (product) => `
                  <tr>
                    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">
                      <img src="${product.image}" alt="Product Image" style="width: 60px; height: 60px;">
                    </td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.product_id}</td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.product_name}</td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.quantity_required}</td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.unit_price}</td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.target_price}</td>
                  </tr>
                `
                  )
                  .join("")}
              </table>
 
              <h3 style="color: #212121; margin-top: 20px;">Next Steps:</h3>
              <p style="color: #212121; font-size: 16px;">Once reviewed, the supplier will update the status. This will trigger an email notification for you to log back into Medhub Global to hopefully convert your enquiry into a Purchase order.</p>
 
              <p style="color: #212121; font-size: 16px;">Contact our Customer Support team if you need any help:  <a href="mailto:connect@medhub.global" style="color: #282f86;">connect@medhub.global</a>.</p>
 
              <p style="color: #212121; font-size: 16px;">Thanking you again for your support!</p>
 
              <p style="color: #212121; font-size: 16px;">Best regards,<br>Medhub Global Team</p>
              <img src="https://medhubglobal.s3.ap-south-1.amazonaws.com/testing/1747649977234-image-medhublogo.jpg-1747649977210.jpeg" alt="Medhub Global Logo" style="width: 60px; height: 60px;">
            </td>
          </tr>
        </table>
 
        <footer style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
          <p>&copy; 2025 Medhub Global. All rights reserved.</p>
        </footer>
      </body>
    </html>
  `;
};

const enquiryMailToSupplierContent = (
  buyer,
  supplier,
  products,
  enquiryNumber
) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <table style="width: 100%; background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td>
              <p style="color: #212121; font-size: 16px;">Dear <strong>${supplier}</strong>,</p>
              <p style="color: #212121; font-size: 16px;">Congratulations!! You have received a Medhub Global enquiry from ${buyer}, Enquiry Number ${enquiryNumber}</p>
 
              <h3 style="color: #212121;">Enquiry Details:</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Product Image</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Product ID</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Product Name</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Quantity Required</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Listed Price</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Target Price</th>
                </tr>
                ${products
                  .map(
                    (product) => `
                  <tr>
                    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">
                      <img src="${product.image}" alt="Product Image" style="width: 60px; height: 60px;">
                    </td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.product_id}</td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.product_name}</td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.quantity_required}</td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.unit_price}</td>
                    <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${product.target_price}</td>
                  </tr>
                `
                  )
                  .join("")}
              </table>
 
              <h3 style="color: #212121; margin-top: 20px;">Next Steps:</h3>
              <p style="color: #212121; font-size: 16px;">Please log into Medhub Global to process the Enquiry (Accept, Reject or modify)</p>
 
              <p style="color: #212121; font-size: 16px;"><a href="https://medhub.global/supplier/login" style="color: #282f86;">https://medhub.global/supplier/login</a>.</p>
 
              <p style="color: #212121; font-size: 16px;">Contact our Customer Support team if you need any help:  <a href="mailto:connect@medhub.global" style="color: #282f86;">connect@medhub.global</a>.</p>
 
              <p style="color: #212121; font-size: 16px;">Thanking you again for your support!</p>
 
              <p style="color: #212121; font-size: 16px;">Best regards,<br>Medhub Global Team</p>
              <img src="https://medhubglobal.s3.ap-south-1.amazonaws.com/testing/1747649977234-image-medhublogo.jpg-1747649977210.jpeg" alt="Medhub Global Logo" style="width: 60px; height: 60px;">
            </td>
          </tr>
        </table>
 
        <footer style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
          <p>&copy; 2025 Medhub Global. All rights reserved.</p>
        </footer>
      </body>
    </html>
  `;
};

module.exports = {
  contactUsContent,
  buyerRegistrationContent,
  supplierRegistrationContent,
  otpForResetPasswordContent,
  profileEditRequestContent,
  userRegistrationConfirmationContent,
  lowInventoryContent,
  licenseExpiryEmail,
  generateProfileEditRequestEmail,
  createInvoiceContent,
  updatePaymentStatusContent,
  submitQuotationContent,
  acceptRejectQuotationBuyerContent,
  acceptRejectQuotationSupplierContent,
  cancelEnquiryContent,
  createOrderContent,
  bookLogisticsContent,
  sendEmailConfirmationContent,
  adminMailOptionsContent,
  sendSupplierReminderEmailContent,
  enquiryMailToBuyerContent,
  enquiryMailToSupplierContent,
  sendSubscriptionPaymentEmailContent,
  sendSubscriptionExpiryEmailContent,
};
