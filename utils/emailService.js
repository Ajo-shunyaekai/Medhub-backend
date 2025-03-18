const nodemailer = require('nodemailer');
const ejs = require("ejs");
const path = require("path");

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
    //ejs template path
    // const templatePath = path.join(__dirname, "./emailTemplates", `${templateName}.ejs`);

    // const emailContent = await ejs.renderFile(templatePath, context, {
    //   root: path.join(__dirname, "../emailTemplates"),
    // });

    const mailOptions = {
      // from : process.env.SMTP_USER_ID,
      from: `Medhub <${process.env.SMTP_USER_ID}>`,
      to   : Array.isArray(recipients) ? recipients.join(",") : recipients,
      subject,
      html: body,
      // html: emailContent
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email to ${recipients}:`, error);
    throw error; // Re-throw error for further handling if needed.
  }
};

module.exports = sendEmail;
