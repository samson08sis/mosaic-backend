const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS, WEB_URN } = process.env;

const sendEmail = async ({ to, subject, html, replyTo }) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Or SMTP (Mailgun, SendGrid)
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Mosaic Tour Ethiopia" no-reply@${WEB_URN}`,
    to,
    subject,
    html,
  };

  if (replyTo) mailOptions.replyTo = replyTo;

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
