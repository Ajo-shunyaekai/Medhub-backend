const { getTodayFormattedDate } = require("./utilities");

const contactUsContent = (obj) => {
  return `
            <html>
                <body>
                    <p>Hi Admin,</p>
                    <p>We have received an inquiry. Below are the details:</p>
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
                    We are pleased to inform you that your profile edit request has been approved. Your changes have been successfully updated. If you have any further modifications or inquiries, please feel free to reach out at <a href="mailto:connect@medhub.global">connect@medhub.global</a> .
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

const cancelEnquiryContent = (supplier, buyer, enquiry_id) => {
  return `Hello ${supplier.contact_person_name}, <br />
                                Inquiry request has been cancelled by ${buyer.contact_person_name} for <strong>${enquiry_id}</strong>.<br />
                                <br /><br />
                                <p>If you need further assistance, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
                                Thanks & Regards <br />
                                Medhub Global Team`;
};

const createOrderContent = (buyer, itemsTable) => {
  return `
                <p>Dear ${buyer.contact_person_name},</p>
 
                <p>We are pleased to confirm your order with the following details:</p>
 
                ${itemsTable}
 
                <p>Your order is now being processed, and we will keep you informed about its progress. If you have any questions or require further assistance, please do not hesitate to contact us.</p>
 
                <p>For any inquiries, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
 
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
  cancelEnquiryContent,
  createOrderContent,
  bookLogisticsContent,
  sendEmailConfirmationContent,
  adminMailOptionsContent,
};
