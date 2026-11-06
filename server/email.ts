import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { InsertMessage } from "@shared/schema";

type SmtpConfig = {
  host?: string;
  service?: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
  requireTls: boolean;
  connectionTimeoutMs: number;
  greetingTimeoutMs: number;
  socketTimeoutMs: number;
};

function trimEnv(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }
  return fallback;
}

function parseNumberEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function loadSmtpConfig(): SmtpConfig | null {
  const service = trimEnv(process.env.SMTP_SERVICE);
  const host = trimEnv(process.env.SMTP_HOST);
  const user = trimEnv(process.env.SMTP_USER);
  const pass = trimEnv(process.env.SMTP_PASS);
  const from = trimEnv(process.env.SMTP_FROM);
  const to = trimEnv(process.env.CONTACT_TO);

  if (!user || !pass || !from || !to || (!service && !host)) {
    return null;
  }

  const port = parseNumberEnv(process.env.SMTP_PORT, service ? 587 : 587);
  const secure = parseBooleanEnv(process.env.SMTP_SECURE, port === 465);
  const requireTls = parseBooleanEnv(process.env.SMTP_REQUIRE_TLS, false);

  return {
    service,
    host,
    port,
    secure,
    user,
    pass,
    from,
    to,
    requireTls,
    connectionTimeoutMs: parseNumberEnv(
      process.env.SMTP_CONNECTION_TIMEOUT_MS,
      10000,
    ),
    greetingTimeoutMs: parseNumberEnv(
      process.env.SMTP_GREETING_TIMEOUT_MS,
      10000,
    ),
    socketTimeoutMs: parseNumberEnv(process.env.SMTP_SOCKET_TIMEOUT_MS, 20000),
  };
}

function buildTransportOptions(
  config: SmtpConfig,
  overrides?: Partial<Pick<SmtpConfig, "port" | "secure">>,
): SMTPTransport.Options {
  return {
    service: config.service,
    host: config.service ? undefined : config.host,
    port: overrides?.port ?? config.port,
    secure: overrides?.secure ?? config.secure,
    requireTLS: config.requireTls,
    connectionTimeout: config.connectionTimeoutMs,
    greetingTimeout: config.greetingTimeoutMs,
    socketTimeout: config.socketTimeoutMs,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
    auth: {
      user: config.user,
      pass: config.pass,
    },
  };
}

function isConnectionTimeout(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const code = "code" in error ? String((error as { code?: unknown }).code) : "";
  return code === "ETIMEDOUT" || code === "ECONNECTION";
}

function getAltPort(currentPort: number): { port: number; secure: boolean } | null {
  if (currentPort === 465) {
    return { port: 587, secure: false };
  }
  if (currentPort === 587 || currentPort === 2525) {
    return { port: 465, secure: true };
  }
  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const smtpConfig = loadSmtpConfig();

async function sendWithTransport(
  config: SmtpConfig,
  message: InsertMessage,
  overrides?: Partial<Pick<SmtpConfig, "port" | "secure">>,
): Promise<void> {
  const transport = nodemailer.createTransport(
    buildTransportOptions(config, overrides),
  );

  const subject = `New portfolio message from ${message.name}`;
  const text = [
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    "",
    message.message,
  ].join("\n");

  const escapedName = escapeHtml(message.name);
  const escapedEmail = escapeHtml(message.email);
  const escapedBody = escapeHtml(message.message).replace(/\n/g, "<br />");
  const html = `
    <p><strong>Name:</strong> ${escapedName}</p>
    <p><strong>Email:</strong> ${escapedEmail}</p>
    <p><strong>Message:</strong></p>
    <p>${escapedBody}</p>
  `;

  await transport.sendMail({
    from: config.from,
    to: config.to,
    replyTo: message.email,
    subject,
    text,
    html,
  });
}

export async function sendContactEmail(message: InsertMessage): Promise<void> {
  if (!smtpConfig) {
    throw new Error(
      "SMTP is not configured. Set SMTP_SERVICE or SMTP_HOST, plus SMTP_USER, SMTP_PASS, SMTP_FROM, and CONTACT_TO.",
    );
  }

  try {
    await sendWithTransport(smtpConfig, message);
  } catch (error) {
    if (!isConnectionTimeout(error)) {
      throw error;
    }

    const altPort = getAltPort(smtpConfig.port);
    if (!altPort) {
      throw error;
    }

    await sendWithTransport(smtpConfig, message, altPort);
  }
}
