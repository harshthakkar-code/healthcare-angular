const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMail({ to, subject, text, html }) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL, // Must be verified sender
    subject,
    text,
    html,
  };
  await sgMail.send(msg);
}

module.exports = sendMail; 