import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

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

type InquiryAccessTokenRecord = {
  id: string;
  email: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
};

type InquiriesStoreSchema = {
  inquiries: InquiryRecord[];
  accessTokens: InquiryAccessTokenRecord[];
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

const configuredStoreDirectory = process.env.INQUIRIES_STORE_DIR?.trim();
const STORE_DIRECTORY = configuredStoreDirectory
  ? path.resolve(configuredStoreDirectory)
  : path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIRECTORY, "inquiries-store.json");

const DEFAULT_SCHEMA: InquiriesStoreSchema = {
  inquiries: [],
  accessTokens: [],
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

let writeQueue: Promise<unknown> = Promise.resolve();

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

function parseDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function hashAccessToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

async function ensureStoreFile() {
  await fs.mkdir(STORE_DIRECTORY, { recursive: true });

  try {
    await fs.access(STORE_FILE);
  } catch {
    await fs.writeFile(STORE_FILE, JSON.stringify(DEFAULT_SCHEMA, null, 2), "utf8");
  }
}

function sanitizeSchema(parsed: unknown): InquiriesStoreSchema {
  if (!parsed || typeof parsed !== "object") {
    return structuredClone(DEFAULT_SCHEMA);
  }

  const objectCandidate = parsed as Partial<InquiriesStoreSchema>;

  return {
    inquiries: Array.isArray(objectCandidate.inquiries) ? objectCandidate.inquiries : [],
    accessTokens: Array.isArray(objectCandidate.accessTokens) ? objectCandidate.accessTokens : [],
  };
}

async function readStore(): Promise<InquiriesStoreSchema> {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_FILE, "utf8");

  try {
    return sanitizeSchema(JSON.parse(raw));
  } catch {
    return structuredClone(DEFAULT_SCHEMA);
  }
}

async function writeStore(store: InquiriesStoreSchema) {
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function cleanupStore(store: InquiriesStoreSchema, now = Date.now()) {
  const inquiriesBefore = store.inquiries.length;
  const tokensBefore = store.accessTokens.length;

  const inquiryCutoff = now - inquiryRetentionMs;
  const usedTokenCutoff = now - usedTokenRetentionMs;

  store.inquiries = store.inquiries.filter((inquiry) => {
    const createdAtMs = parseDate(inquiry.createdAt);
    return createdAtMs !== null && createdAtMs >= inquiryCutoff;
  });

  store.accessTokens = store.accessTokens.filter((token) => {
    const createdAtMs = parseDate(token.createdAt);
    const expiresAtMs = parseDate(token.expiresAt);
    const usedAtMs = token.usedAt ? parseDate(token.usedAt) : null;

    if (createdAtMs === null || expiresAtMs === null) return false;
    if (expiresAtMs < now) return false;
    if (usedAtMs !== null && usedAtMs < usedTokenCutoff) return false;

    return true;
  });

  return inquiriesBefore !== store.inquiries.length || tokensBefore !== store.accessTokens.length;
}

function withStoreWriteLock<T>(operation: () => Promise<T>): Promise<T> {
  const nextRun = writeQueue.then(operation, operation);
  writeQueue = nextRun.then(
    () => undefined,
    () => undefined
  );
  return nextRun;
}

export async function createInquiryRecord(input: CreateInquiryInput): Promise<InquiryRecord> {
  const now = new Date();
  const normalizedEmail = normalizeEmail(input.replyEmail);

  if (!input.consent) {
    throw new Error("Cannot persist inquiry without consent.");
  }

  return withStoreWriteLock(async () => {
    const store = await readStore();
    cleanupStore(store, now.getTime());

    const inquiryRecord: InquiryRecord = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      description: input.description.trim(),
      replyEmail: normalizedEmail,
      productSlug: input.productSlug?.trim() || null,
      productName: input.productName?.trim() || null,
      status: "novo",
      consentAt: toIso(now),
      createdAt: toIso(now),
    };

    store.inquiries.unshift(inquiryRecord);
    await writeStore(store);

    return inquiryRecord;
  });
}

export async function listInquiriesByEmail(email: string): Promise<InquiryRecord[]> {
  const normalizedEmail = normalizeEmail(email);

  return withStoreWriteLock(async () => {
    const store = await readStore();
    const changed = cleanupStore(store);

    if (changed) {
      await writeStore(store);
    }

    return store.inquiries
      .filter((inquiry) => normalizeEmail(inquiry.replyEmail) === normalizedEmail)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  });
}

export async function createInquiryAccessToken(email: string): Promise<CreatedAccessToken> {
  const now = new Date();
  const normalizedEmail = normalizeEmail(email);
  const rawToken = crypto.randomBytes(32).toString("hex");

  return withStoreWriteLock(async () => {
    const store = await readStore();
    cleanupStore(store, now.getTime());

    store.accessTokens.push({
      id: crypto.randomUUID(),
      email: normalizedEmail,
      tokenHash: hashAccessToken(rawToken),
      createdAt: toIso(now),
      expiresAt: toIso(new Date(now.getTime() + accessTokenTtlMs)),
      usedAt: null,
    });

    await writeStore(store);

    return {
      token: rawToken,
      expiresAt: toIso(new Date(now.getTime() + accessTokenTtlMs)),
    };
  });
}

export async function consumeInquiryAccessToken(rawToken: string): Promise<string | null> {
  const tokenToUse = rawToken.trim();
  if (tokenToUse.length < 32) return null;

  return withStoreWriteLock(async () => {
    const now = new Date();
    const store = await readStore();
    cleanupStore(store, now.getTime());

    const tokenHash = hashAccessToken(tokenToUse);
    const tokenRecord = store.accessTokens.find((token) => token.tokenHash === tokenHash);

    if (!tokenRecord) {
      await writeStore(store);
      return null;
    }

    const expiresAtMs = parseDate(tokenRecord.expiresAt);
    if (tokenRecord.usedAt || expiresAtMs === null || expiresAtMs < now.getTime()) {
      await writeStore(store);
      return null;
    }

    tokenRecord.usedAt = toIso(now);
    await writeStore(store);

    return normalizeEmail(tokenRecord.email);
  });
}
