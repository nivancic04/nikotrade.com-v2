import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const DEFAULT_SMTP_HOST = "smtp.gmail.com";
const DEFAULT_SMTP_PORT = 465;

export function createSmtpTransporter() {
  const smtpHost = process.env.SMTP_HOST ?? DEFAULT_SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? DEFAULT_SMTP_PORT);
  const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === DEFAULT_SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpAppPassword = process.env.SMTP_APP_PASSWORD;

  if (!smtpUser || !smtpAppPassword) {
    return null;
  }

  return {
    smtpUser,
    transporter: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpAppPassword,
      },
    }),
  };
}

type SendMailOptions = SMTPTransport.Options & {
  to: string;
  from: string;
  subject: string;
};

const SMTP_SEND_TIMEOUT_MS = Number(process.env.SMTP_SEND_TIMEOUT_MS ?? 12000);
const SMTP_SEND_RETRIES = Number(process.env.SMTP_SEND_RETRIES ?? 1);

function sendWithTimeout(
  sendPromise: Promise<unknown>,
  timeoutMs: number
): Promise<unknown> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return sendPromise;

  return Promise.race([
    sendPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SMTP send timeout exceeded.")), timeoutMs)
    ),
  ]);
}

export async function sendMailWithRetry(
  transport: ReturnType<typeof createSmtpTransporter>,
  mailOptions: SendMailOptions
) {
  if (!transport) return false;

  const maxAttempts = Math.max(Math.floor(SMTP_SEND_RETRIES) + 1, 1);
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await sendWithTimeout(transport.transporter.sendMail(mailOptions), SMTP_SEND_TIMEOUT_MS);
      return true;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  throw lastError;
}

export function getContactReceiverEmail() {
  return process.env.CONTACT_RECEIVER_EMAIL ?? "nikoivancic2801@gmail.com";
}

export function resolveAppBaseUrl(request: Request) {
  const configuredBaseUrl = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configuredBaseUrl) {
    try {
      const parsedUrl = new URL(configuredBaseUrl);
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        return parsedUrl.toString().replace(/\/+$/, "");
      }
    } catch {
      // Fallback is handled below.
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_BASE_URL mora biti validno postavljen u produkciji.");
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (forwardedHost ?? request.headers.get("host") ?? "").replace(/[\r\n]/g, "");
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : host.includes("localhost")
        ? "http"
        : "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}
