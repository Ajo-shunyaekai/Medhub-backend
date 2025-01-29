const nodemailer         = require('nodemailer');

var transporter = nodemailer.createTransport({
  host   : "smtp.gmail.com",
  port   : 587,
  secure : false, // true for 465, false for other ports
  type   : "oauth2",
  // service : 'gmail',
  auth : {
      user : process.env.SMTP_USER_ID,
      pass : process.env.SMTP_USER_PASSWORD
  }
});

const sendMailFunc = (email, subject, body) =>{
  
  var mailOptions = {
      from: `Medhub Global <${process.env.SMTP_USER_ID}>`,
      to      : email,
      subject : subject,
      // text    : 'This is text mail, and sending for testing purpose'
      html:body
      
  };
  transporter.sendMail(mailOptions);
}

module.exports = sendMailFunc;