const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter;

function getTransporter() {
  if (!transporter) {
    if (!env.emailUser || !env.emailPass) {
      return null;
    }

    transporter = nodemailer.createTransport({
      service: env.emailService || "Gmail",
      auth: {
        user: env.emailUser,
        pass: env.emailPass
      }
    });
  }

  return transporter;
}

function stripHtml(html) {
  if (!html) {
    return "";
  }

  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function sendEmail({ to, subject, text, html }) {
  const emailTransporter = getTransporter();
  if (!emailTransporter) {
    return;
  }

  await emailTransporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text: text || stripHtml(html),
    html
  });
}

module.exports = { sendEmail };
