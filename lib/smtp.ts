import nodemailer from "nodemailer";

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
