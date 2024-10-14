const nodemailer = require('nodemailer');
require('dotenv').config();

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
  logger: true, // Enable logging to console
  debug: true, // Enable debug output
});

const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: '"Lyrikal Empire" <info@lyrikalempire.com>', // Sender address
      to: 'yentel.dh@hotmail.be', // List of recipients
      subject: 'Test Email', // Subject line
      text: 'This is a test email.', // Plain text body
      html: '<p>This is a test email.</p>', // HTML body
      headers: {
        'X-LyrikalEmpire-Test': 'true', // Custom header for testing
      },
    });
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

sendTestEmail();