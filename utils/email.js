const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: 'Restaurant <restaurant@restaurant.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };
  await transporter.sendMail(mailOptions, (error, info) => {});
};

module.exports = sendEmail;
