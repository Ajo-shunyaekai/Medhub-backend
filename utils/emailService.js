const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  type: "oauth2",
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

const sendTemplateEmail = async (
  recipients,
  subject,
  templateName = null,
  context = {},
  content = null
) => {
  try {
    let emailContent = "";

    if (templateName) {
      // If a template is provided, render it using EJS
      const templatePath = path.resolve(
        __dirname,
        "./emailTemplates",
        `${templateName}.ejs`
      );

      if (fs.existsSync(templatePath)) {
        emailContent = await ejs.renderFile(templatePath, context);
      } else {
        console.error(`Template not found: ${templatePath}`);
        throw new Error(`Email template '${templateName}' not found.`);
      }
    } else if (content) {
      // If raw HTML content is provided, use it directly
      emailContent = content;
    } else {
      throw new Error("No email template or content provided.");
    }

    const mailOptions = {
      from: `Medhub Global <${process.env.SMTP_USER_ID}>`,
      to: Array.isArray(recipients) ? recipients.join(",") : recipients,
      subject,
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email to ${recipients}:`, error);
    throw error;
  }
};

const sendEmail = async (recipients, subject, body, attachments) => {
  try {
    const mailOptions = {
      // from : process.env.SMTP_USER_ID,
      from: `Medhub Global <${process.env.SMTP_USER_ID}>`,
      to: Array.isArray(recipients) ? recipients.join(",") : recipients,
      subject,
      html: body,
      ...(attachments && { attachments }), //include attachments conditionally
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email to ${recipients}:`, error);
    throw error; // Re-throw error for further handling if needed.
  }
};

module.exports = {
  sendTemplateEmail,
  sendEmail,
};
