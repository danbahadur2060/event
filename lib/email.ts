import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

if (!smtpHost || !smtpUser || !smtpPass) {
  // Do not throw at import time to allow building without envs; throw lazily.
}

let cachedTransport: nodemailer.Transporter | null = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP credentials missing: set SMTP_HOST, SMTP_USER, SMTP_PASS");
  }
  cachedTransport = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: { user: smtpUser, pass: smtpPass },
  });
  return cachedTransport;
}

export type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendMail({ to, subject, html, text }: SendMailInput) {
  const transporter = getTransport();
  const info = await transporter.sendMail({
    from: smtpFrom,
    to: Array.isArray(to) ? to.join(",") : to,
    subject,
    text,
    html,
  });
  return info;
}
