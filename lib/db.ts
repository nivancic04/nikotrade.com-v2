import postgres from "postgres";

declare global {
  var __neonSql__: ReturnType<typeof postgres> | undefined;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return url;
}

export const sql =
  global.__neonSql__ ??
  postgres(getDatabaseUrl(), {
    ssl: "require",
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  global.__neonSql__ = sql;
}
