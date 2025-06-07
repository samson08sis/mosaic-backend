const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Or SMTP (Mailgun, SendGrid)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Mosaic Tour Ethiopia" <no-reply@yourapp.com>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
