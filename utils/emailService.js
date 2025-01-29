const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host   : "smtp.gmail.com",
  port   : 587,
  secure : false, // true for 465, false for other ports
  type   : "oauth2",
  auth: {
    user: process.env.SMTP_USER_ID,
    pass: process.env.SMTP_USER_PASSWORD,
  },
});

/**
 * Sends an email using the configured transporter.
 * @param {string | string[]} recipients - Email addresses of the recipients.
 * @param {string} subject - Subject of the email.
 * @param {string} body - HTML content of the email.
 * @returns {Promise<void>} Resolves on successful email sending, rejects on error.
 */
const sendEmail = async (recipients, subject, body) => {
  try {
    const mailOptions = {
      // from : process.env.SMTP_USER_ID,
      from: `Medhub <${process.env.SMTP_USER_ID}>`,
      to   : Array.isArray(recipients) ? recipients.join(",") : recipients,
      subject,
      html: body,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${recipients}`);
  } catch (error) {
    console.error(`Error sending email to ${recipients}:`, error);
    throw error; // Re-throw error for further handling if needed.
  }
};

module.exports = sendEmail;
