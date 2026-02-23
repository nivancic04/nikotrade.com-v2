import { NextResponse } from "next/server";

function normalizeHost(value: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originHost = "";
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = normalizeHost(forwardedHost ?? request.headers.get("host"));
  if (!host) return false;

  return originHost === host;
}

function isSameSiteFetch(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!fetchSite) return true;
  return fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none";
}

export function enforcePostRequestSecurity(request: Request) {
  if (!isSameOrigin(request) || !isSameSiteFetch(request)) {
    return NextResponse.json({ error: "Nevažeći izvor zahtjeva." }, { status: 403 });
  }

  return null;
}

export function withNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

