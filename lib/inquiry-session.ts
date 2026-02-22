import crypto from "crypto";

const DEFAULT_SESSION_TTL_HOURS = 24;
const SESSION_COOKIE_NAME = "nikotrade_inquiry_session";

const sessionTtlHours = toPositiveNumber(
  Number(process.env.INQUIRY_SESSION_TTL_HOURS ?? DEFAULT_SESSION_TTL_HOURS),
  DEFAULT_SESSION_TTL_HOURS
);

const sessionMaxAgeSeconds = sessionTtlHours * 60 * 60;

type SessionPayload = {
  email: string;
  exp: number;
  iat: number;
};

function toPositiveNumber(value: number, fallback: number) {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.floor(value);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getSessionSecret() {
  const explicitSecret = process.env.INQUIRY_SESSION_SECRET;
  if (explicitSecret && explicitSecret.trim().length >= 16) return explicitSecret.trim();

  if (process.env.NODE_ENV === "production") {
    throw new Error("INQUIRY_SESSION_SECRET mora biti postavljen u produkciji.");
  }

  return "local-dev-inquiry-session-secret-change-me";
}

function sign(payloadEncoded: string) {
  const secret = getSessionSecret();
  return crypto.createHmac("sha256", secret).update(payloadEncoded).digest("base64url");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function createInquirySessionToken(email: string) {
  const now = Date.now();
  const payload: SessionPayload = {
    email: normalizeEmail(email),
    iat: now,
    exp: now + sessionMaxAgeSeconds * 1000,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyInquirySessionToken(token: string): SessionPayload | null {
  const tokenValue = token.trim();
  const parts = tokenValue.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expectedSignature = sign(encodedPayload);

  if (!safeCompare(signature, expectedSignature)) return null;

  try {
    const decodedPayload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(decodedPayload) as Partial<SessionPayload>;

    if (typeof payload.email !== "string") return null;
    if (typeof payload.exp !== "number") return null;
    if (typeof payload.iat !== "number") return null;
    if (payload.exp < Date.now()) return null;

    return {
      email: normalizeEmail(payload.email),
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch {
    return null;
  }
}

export const inquirySessionCookieName = SESSION_COOKIE_NAME;
export const inquirySessionCookieMaxAgeSeconds = sessionMaxAgeSeconds;

