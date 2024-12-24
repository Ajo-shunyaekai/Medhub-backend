const {getTodayFormattedDate}  = require('./utilities')
// function formatDate(date) {
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
// }

// const today = new Date();
// const formattedDate = formatDate(today);

const buyerRegistrationContent = (buyer)=>{
    return (
        `
            <p>Dear Admin,</p>
            <p>We hope this message finds you well.</p>
            <p>We are pleased to inform you that a new buyer has registered on Deliver. Below are the details of the new account:</p>
            <ul>
            <li>Type of Account: ${buyer?.buyer_type}</li>
            <li>Company Name: ${buyer?.buyer_name}</li>
            <li>Contact Person: ${buyer?.contact_person_name}</li>
            <li>Email Address: ${buyer?.contact_person_email}</li>
            <li>Phone Number: ${buyer?.contact_person_country_code} ${buyer?.contact_person_mobile}</li>
            <li>Registration Date: ${getTodayFormattedDate()}</li>
            </ul>
            <p>Please review the registration details and take any necessary actions to verify and approve the new account.</p>
            <p>Best regards,<br/>Deliver.com Team</p>
        `
    )
}

const supplierRegistrationContent = (seller)=>{
    return (
        `
            <p>Dear Admin,</p>
            <p>We hope this message finds you well.</p>
            <p>We are pleased to inform you that a new supplier has registered on Deliver. Below are the details of the new account:</p>
            <ul>
            <li>Type of Account: ${seller.supplier_type}</li>
            <li>Company Name: ${seller.supplier_name}</li>
            <li>Contact Person: ${seller.contact_person_name}</li>
            <li>Email Address: ${seller.contact_person_email}</li>
            <li>Phone Number: ${seller.contact_person_country_code} ${seller.contact_person_mobile_no}</li>
            <li>Registration Date: ${getTodayFormattedDate()}</li>
            </ul>
            <p>Please review the registration details and take any necessary actions to verify and approve the new account.</p>
            <p>Best regards,<br/>Deliver.com Team</p>
        `
    )
}

module.exports = {buyerRegistrationContent, supplierRegistrationContent}