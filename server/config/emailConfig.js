const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'cloudemail.be',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;