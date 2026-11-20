import nodemailer from 'nodemailer';

// Email sending is optional. Fill in the SMTP_* values in server/.env to switch it on.
// Without them the dashboard still lets staff reply by opening their own email app, WhatsApp or SMS.
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

export const mailerEnabled = () => !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transport;
function getTransport() {
  if (!transport) {
    const port = Number(SMTP_PORT) || 587;
    transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transport;
}

export async function sendMail({ to, subject, text, replyTo }) {
  return getTransport().sendMail({
    from: MAIL_FROM || SMTP_USER,
    to,
    subject,
    text,
    replyTo,
  });
}
