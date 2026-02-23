import { NextResponse } from "next/server";
import { inquirySessionCookieName } from "@/lib/inquiry-session";
import { enforcePostRequestSecurity, withNoStore } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blockedRequest = enforcePostRequestSecurity(request);
  if (blockedRequest) return withNoStore(blockedRequest);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: inquirySessionCookieName,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return withNoStore(response);
}
