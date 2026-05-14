const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: `"AuthApp" <${process.env.EMAIL_USER}>`, to, subject, html });
};

const verificationEmailHTML = (name, url) => `
  <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
    <h2 style="color:#4f46e5">Verify your email, ${name}!</h2>
    <p>Click the button below to verify your email address.</p>
    <a href="${url}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
    <p style="color:#6b7280;margin-top:24px;font-size:14px">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
  </div>`;

const resetEmailHTML = (name, url) => `
  <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
    <h2 style="color:#4f46e5">Reset your password, ${name}</h2>
    <p>Click the button below to reset your password.</p>
    <a href="${url}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
    <p style="color:#6b7280;margin-top:24px;font-size:14px">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
  </div>`;

module.exports = { sendEmail, verificationEmailHTML, resetEmailHTML };
