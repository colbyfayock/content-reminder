const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * sendMail
 */

async function sendMail({ subject, message }) {
  const errorBase = 'Failed to send mail';

  const msg = {
    to: process.env.MAIL_TO,
    from: process.env.MAIL_FROM,
    subject,
    text: message,
    html: message.replace(/\r\n/g, '<br>'),
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(`${errorBase}: ${error.message}`);
  }
}

module.exports.sendMail = sendMail;