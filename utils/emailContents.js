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
                    <p><strong>MedHub Global Team</strong></p>
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

            <p>Best regards,<br/>MedHub Global Team</p>
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
            <p>Best regards,<br/>MedHub Global Team</p>
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
        <p>You recently requested to reset your password for your MedHub Global account. Please use the following One-Time Password (OTP) to proceed with resetting your password.</p>
        
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
        <p><strong>MedHub Global Team</strong></p>
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
                <p>Best regards,<br/>MedHub Global Team</p>
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
            <p>Thanks & Regards,<br/>MedHub Global Team</p>
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
            <p>Thanks & Regards,<br/>MedHub Global Team</p>
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
                <p>This email is to inform you about the status of your profile edit request submitted on <strong>${requestDate}</strong>.</p>

                <p class="status">Action Taken: <strong>${status}</strong></p>

                <h2>Details:</h2>
                <ul>
                    <li><strong>Company Type:</strong> ${userType}</li>
                    <li><strong>Request Date:</strong> ${requestDate}</li>
                    <li><strong>Status:</strong> ${status}</li>
                </ul>

                <p>
                    <strong>If Accepted:</strong> We are pleased to inform you that your profile edit request has been accepted. Your changes have been successfully updated. If you have any further modifications or inquiries, please feel free to reach out at <a href="mailto:connect@medhub.global">connect@medhub.global</a> .
                </p>
                <p>
                    <strong>If Rejected:</strong> Unfortunately, your profile edit request has been rejected. If you would like to know more about the reasons for this decision or if you would like to submit a revised request, please contact us at <a href="mailto:connect@medhub.global">connect@medhub.global</a> .
                </p>

                <p>Thank you for your understanding and for being a valued member of our community!</p>

                <div class="footer">
                    <p>Best regards,</p>
                    <p>MedHub Global Team</p>
                </div>
            </div>
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
};
