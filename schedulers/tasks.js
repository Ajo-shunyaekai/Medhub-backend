// const cron = require('node-cron');
// const { Medicine } = require('../schema/medicineSchema');
// const Supplier = require('../schema/supplierSchema');
// const Buyer = require('../schema/buyerSchema')
// const {sendEmail} = require("../utils/emailService");
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

// function scheduleCertificateExpiryCronJob() {
//     console.log('tasks running')
//     cron.schedule('*/10 * * * *', async () => { // Runs every day at 9:00 AM
//         try {
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             const expiryThresholds = [1, 2, 3].map(monthOffset => {
//                 const date = new Date(today);
//                 date.setMonth(date.getMonth() + monthOffset);
//                 return date.getTime();
//             });

//             // Helper function to check certificates and send emails
//             const checkAndNotify = async (entityList, entityType) => {
//                 console.log('checkAndNotify')
//                 for (const entity of entityList) {
//                     const certs = entity.certificateFileNDate;
//                     console.log('certs',certs)
//                     if (!certs || !Array.isArray(certs)) continue;

//                     for (const cert of certs) {
//                         if (!cert.date) continue;

//                         const certDate = new Date(cert.date);
//                         certDate.setHours(0, 0, 0, 0);
//                         const certTimestamp = certDate.getTime();

//                         const matchIndex = expiryThresholds.indexOf(certTimestamp);
//                         if (matchIndex !== -1) {
//                             console.log('matchIndex',matchIndex)
//                             const monthsLeft = 3 - matchIndex;
//                             const formattedDate = formatDateToDDMMYYYY(certDate);

//                             const subject = `Reminder: Certificate Expiry in ${monthsLeft} Month(s)`;
//                             const emailContent = await licenseExpiryEmail(
//                                 entity.contact_person_name,
//                                 cert.file, // You can also pass cert type if available
//                                 formattedDate,
//                                 entityType // Optional: pass type to email template if you want different templates
//                             );
//                             console.log(entity.contact_person_name)
//                             await sendEmail([entity.contact_person_email], subject, emailContent);
//                             break; // avoid sending multiple emails for same person in one run
//                         } else {
//                             console.log(' else matchIndex',matchIndex)
//                         }
//                     }
//                 }
//             };

//             // Fetch and process both buyers and suppliers
//             const buyers = await Buyer.find({});
//             console.log(' buyers',buyers)
//             const suppliers = await Supplier.find({});
//             console.log(' suppliers',suppliers)

//             await checkAndNotify(buyers, 'buyer');
//             await checkAndNotify(suppliers, 'supplier');

//         } catch (err) {
//             console.error('Error in certificate expiry cron job:', err);
//         }
//     });
// }


// // Initialize all cron jobs
// function initializeCronJobs() {
//     scheduleLowInventoryCronJob(); 
//     // licenseExpiryCronJob(); 
//     scheduleCertificateExpiryCronJob(); 
// }

// // function to initialize and start the cron jobs
// initializeCronJobs();
