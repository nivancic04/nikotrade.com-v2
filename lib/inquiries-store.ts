import crypto from "crypto";
import { sql } from "@/lib/db";

export type InquiryStatus = "novo" | "u-obradi" | "odgovoreno" | "zatvoreno";

export type InquiryRecord = {
  id: string;
  title: string;
  description: string;
  replyEmail: string;
  productSlug: string | null;
  productName: string | null;
  status: InquiryStatus;
  consentAt: string;
  createdAt: string;
};

type CreateInquiryInput = {
  title: string;
  description: string;
  replyEmail: string;
  consent: boolean;
  productSlug?: string;
  productName?: string;
};

type CreatedAccessToken = {
  token: string;
  expiresAt: string;
};

const DEFAULT_INQUIRY_RETENTION_DAYS = 730;
const DEFAULT_ACCESS_TOKEN_TTL_MINUTES = 30;
const USED_TOKEN_RETENTION_HOURS = 24;

const inquiryRetentionDays = toPositiveNumber(
  Number(process.env.INQUIRY_RETENTION_DAYS ?? DEFAULT_INQUIRY_RETENTION_DAYS),
  DEFAULT_INQUIRY_RETENTION_DAYS
);
const accessTokenTtlMinutes = toPositiveNumber(
  Number(process.env.INQUIRY_ACCESS_TOKEN_TTL_MINUTES ?? DEFAULT_ACCESS_TOKEN_TTL_MINUTES),
  DEFAULT_ACCESS_TOKEN_TTL_MINUTES
);

const inquiryRetentionMs = inquiryRetentionDays * 24 * 60 * 60 * 1000;
const accessTokenTtlMs = accessTokenTtlMinutes * 60 * 1000;
const usedTokenRetentionMs = USED_TOKEN_RETENTION_HOURS * 60 * 60 * 1000;

function toPositiveNumber(value: number, fallback: number) {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.floor(value);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toIso(date: Date) {
  return date.toISOString();
}

function hashAccessToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

const allowedStatuses: InquiryStatus[] = ["novo", "u-obradi", "odgovoreno", "zatvoreno"];

function normalizeStatus(value: string): InquiryStatus {
  return allowedStatuses.includes(value as InquiryStatus) ? (value as InquiryStatus) : "novo";
}

type InquiryRow = {
  id: string;
  title: string;
  description: string;
  replyEmail: string;
  productSlug: string | null;
  productName: string | null;
  status: string;
  consentAt: Date;
  createdAt: Date;
};

function mapInquiryRow(row: InquiryRow): InquiryRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    replyEmail: row.replyEmail,
    productSlug: row.productSlug,
    productName: row.productName,
    status: normalizeStatus(row.status),
    consentAt: toIso(row.consentAt),
    createdAt: toIso(row.createdAt),
  };
}

async function cleanupStore(now = Date.now()) {
  const inquiryCutoff = new Date(now - inquiryRetentionMs);
  const usedTokenCutoff = new Date(now - usedTokenRetentionMs);

  await sql`
    delete from inquiries
    where created_at < ${inquiryCutoff}
  `;

  await sql`
    delete from inquiry_access_tokens
    where expires_at < now()
       or (used_at is not null and used_at < ${usedTokenCutoff})
  `;
}

export async function createInquiryRecord(input: CreateInquiryInput): Promise<InquiryRecord> {
  const now = new Date();
  const normalizedEmail = normalizeEmail(input.replyEmail);

  if (!input.consent) {
    throw new Error("Cannot persist inquiry without consent.");
  }

  await cleanupStore(now.getTime());

  const rows = await sql<InquiryRow[]>`
    insert into inquiries (
      title,
      description,
      reply_email,
      product_slug,
      product_name,
      status,
      consent_at,
      created_at
    )
    values (
      ${input.title.trim()},
      ${input.description.trim()},
      ${normalizedEmail},
      ${input.productSlug?.trim() || null},
      ${input.productName?.trim() || null},
      ${"novo"},
      ${now},
      ${now}
    )
    returning
      id,
      title,
      description,
      reply_email as "replyEmail",
      product_slug as "productSlug",
      product_name as "productName",
      status,
      consent_at as "consentAt",
      created_at as "createdAt"
  `;

  return mapInquiryRow(rows[0]);
}

export async function listInquiriesByEmail(email: string): Promise<InquiryRecord[]> {
  const normalizedEmail = normalizeEmail(email);
  await cleanupStore();

  const rows = await sql<InquiryRow[]>`
    select
      id,
      title,
      description,
      reply_email as "replyEmail",
      product_slug as "productSlug",
      product_name as "productName",
      status,
      consent_at as "consentAt",
      created_at as "createdAt"
    from inquiries
    where reply_email = ${normalizedEmail}
    order by created_at desc
  `;

  return rows.map(mapInquiryRow);
}

export async function createInquiryAccessToken(email: string): Promise<CreatedAccessToken> {
  const now = new Date();
  const normalizedEmail = normalizeEmail(email);
  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + accessTokenTtlMs);

  await cleanupStore(now.getTime());

  await sql`
    insert into inquiry_access_tokens (
      email,
      token_hash,
      created_at,
      expires_at,
      used_at
    )
    values (
      ${normalizedEmail},
      ${hashAccessToken(rawToken)},
      ${now},
      ${expiresAt},
      ${null}
    )
  `;

  return {
    token: rawToken,
    expiresAt: toIso(expiresAt),
  };
}

export async function consumeInquiryAccessToken(rawToken: string): Promise<string | null> {
  const tokenToUse = rawToken.trim();
  if (tokenToUse.length < 32) return null;
  const now = new Date();
  const tokenHash = hashAccessToken(tokenToUse);

  await cleanupStore(now.getTime());

  const consumed = await sql<{ email: string }[]>`
    update inquiry_access_tokens
    set used_at = ${now}
    where token_hash = ${tokenHash}
      and used_at is null
      and expires_at >= ${now}
    returning email
  `;

  if (consumed.length === 0) return null;
  return normalizeEmail(consumed[0].email);
}
