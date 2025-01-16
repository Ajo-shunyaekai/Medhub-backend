const { getTodayFormattedDate } = require("./utilities");
// function formatDate(date) {
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
// }

// const today = new Date();
// const formattedDate = formatDate(today);


const contactUsContent = (obj) => {
    return (
        `
            <html>
                <body>
                    <p>Hi Admin,</p>
                    <p>We have received an inquiry. Below are the details:</p>
                     <p><strong>Company Name:</strong> ${obj.companyname}</p>
                    <p><strong>Email:</strong> ${obj.email}</p>
                    <p><strong>Name:</strong> ${obj.username}</p>
                    <p><strong>Phone:</strong> ${obj.phone}</p>
                    <p><strong>Subject:</strong> ${obj.subject}</p>
                    <p><strong>Message:</strong> ${obj.message || 'N/A'}</p>
                    <br />
                    <p>Regards,</p>
                    <p><strong>MedHub Global Team</strong></p>
                </body>
            </html>
       `
    )
}

const buyerRegistrationContent = (buyer)=>{
    return (
        `
            <p>Dear Admin,</p>
            <p>We hope this message finds you well.</p>
            <p>We are pleased to inform you that a new buyer has registered on Medhub Global. Below are the details of the new account:</p>
            <ul>
            <li>Type of Account: ${buyer?.buyer_type}</li>
            <li>Company Name: ${buyer?.buyer_name}</li>
            <li>Contact Person: ${buyer?.contact_person_name}</li>
            <li>Email Address: ${buyer?.contact_person_email}</li>
            <li>Phone Number: ${buyer?.contact_person_country_code} ${buyer?.contact_person_mobile}</li>
            <li>Registration Date: ${getTodayFormattedDate()}</li>
            </ul>
            <p>Please review the registration details and take any necessary actions to verify and approve the new account.</p>
            <p>Best regards,<br/>MedHub Global Team</p>
        `
    )
}

const supplierRegistrationContent = (seller)=>{
    return (
        `
            <p>Dear Admin,</p>
            <p>We hope this message finds you well.</p>
            <p>We are pleased to inform you that a new supplier has registered on Medhub Global. Below are the details of the new account:</p>
            <ul>
            <li>Type of Account: ${seller.supplier_type}</li>
            <li>Company Name: ${seller.supplier_name}</li>
            <li>Contact Person: ${seller.contact_person_name}</li>
            <li>Email Address: ${seller.contact_person_email}</li>
            <li>Phone Number: ${seller.contact_person_country_code} ${seller.contact_person_mobile_no}</li>
            <li>Registration Date: ${getTodayFormattedDate()}</li>
            </ul>
            <p>Please review the registration details and take any necessary actions to verify and approve the new account.</p>
            <p>Best regards,<br/>MedHub Global Team</p>
        `
    )
}

const otpForResetPasswordContent = (user, otp) => {
  return `
    <html>
      <body>
        <p>Dear ${ user?.supplier_name || user?.buyer_name || user?.user_name || user?.company_name || "User" },</p>
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

const profileEditRequestContent = (user)=>{
    return (
        `
        <html>
            <body>
                <p>Dear Admin,</p>
                <p>We hope this message finds you well.</p>
                <p>We are pleased to inform you that a buyer has requested to update their profile details on Medhub Global. Below are the details of the new account:</p>
                <ul>
                <li>Type of Account: ${user?.buyer_type || user?.supplier_type}</li>
                <li>Company Name: ${user?.buyer_name || user?.supplier_name}</li>
                <li>Contact Person: ${user?.contact_person_name || user?.contact_person_name}</li>
                <li>Email Address: ${user?.contact_person_email || user?.contact_person_email}</li>
                <li>Phone Number: ${user?.contact_person_country_code  || user?.contact_person_country_code} ${user?.contact_person_mobile || user?.contact_person_mobile_no}</li>
                <li>Request Date: ${getTodayFormattedDate()}</li>
                </ul>
                <p>Please review the updated details and take any necessary actions to verify and approve the new account.</p>
                <p>Best regards,<br/>MedHub Global Team</p>
            </body>
        </html>
    `
    )
}

module.exports = { contactUsContent, buyerRegistrationContent, supplierRegistrationContent, otpForResetPasswordContent, profileEditRequestContent  };
