const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'cloudemail.be',
  port: 587, // Common port for TLS
  secure: false, // Set to false because port 587 is used for STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // This is optional, but can help with self-signed certificates
  },
});

module.exports = transporter;