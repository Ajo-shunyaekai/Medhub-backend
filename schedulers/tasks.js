// const cron = require('node-cron');
// const { Medicine } = require('../schema/medicineSchema');
// const Supplier = require('../schema/supplierSchema');
// const Buyer = require('../schema/buyerSchema')
// const sendEmail = require("../utils/emailService");
// const { lowInventoryContent, 
//     licenseExpiryEmail } = require("../utils/emailContents");

// // Helper function to format date to DD-MM-YYYY
// function formatDateToDDMMYYYY(date) {
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
// }

// // low inventory email
// async function sendLowInventoryEmail(supplierName, supplierEmail, medicineName, quantity) {
//     const subject = 'Urgent: Low Inventory Warning';
//     const recipientEmails = [supplierEmail];
//     const emailContent = await lowInventoryContent(supplierName, supplierEmail, medicineName, quantity);

//     try {
//         await sendEmail(recipientEmails, subject, emailContent);
//     } catch (err) {
//         console.error('Error sending email:', err);
//     }
// }

// // Cron job 1: Send low inventory emails every Monday at 10:00 AM
// function scheduleLowInventoryCronJob() {
//     cron.schedule('0 10 * * 1', async () => { // Runs every Monday at 10:00 AM
//         try {
//             const medicines = await Medicine.find({ total_quantity: { $lte: 500 }, status: 1 });

//             for (const medicine of medicines) {
//                 const supplier = await Supplier.findOne({ supplier_id: medicine.supplier_id });

//                 if (supplier) {
//                     await sendLowInventoryEmail(supplier.contact_person_name, supplier.contact_person_email, medicine.medicine_name, medicine.total_quantity);
//                 }
//             }
//         } catch (err) {
//             console.error('Error in low inventory cron job:', err);
//         }
//     });
// }

// // Initialize all cron jobs
// function initializeCronJobs() {
//     scheduleLowInventoryCronJob(); 
//     // licenseExpiryCronJob(); 
// }

// // function to initialize and start the cron jobs
// initializeCronJobs();
