import nodemailer from "nodemailer";
import type { InsertMessage } from "@shared/schema";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
};

function loadSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 0;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const to = process.env.CONTACT_TO;

  if (!host || !port || !user || !pass || !from || !to) {
    return null;
  }

  return { host, port, user, pass, from, to };
}

const smtpConfig = loadSmtpConfig();
const transporter = smtpConfig
  ? nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    })
  : null;

export async function sendContactEmail(
  message: InsertMessage,
): Promise<void> {
  if (!smtpConfig || !transporter) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, and CONTACT_TO.",
    );
  }

  const subject = `New portfolio message from ${message.name}`;
  const text = [
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    "",
    message.message,
  ].join("\n");

  const html = `
    <p><strong>Name:</strong> ${message.name}</p>
    <p><strong>Email:</strong> ${message.email}</p>
    <p><strong>Message:</strong></p>
    <p>${message.message.replace(/\n/g, "<br />")}</p>
  `;

  await transporter.sendMail({
    from: smtpConfig.from,
    to: smtpConfig.to,
    replyTo: message.email,
    subject,
    text,
    html,
  });
}
