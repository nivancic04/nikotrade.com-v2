import { NextRequest, NextResponse } from "next/server";
import { listInquiriesByEmail } from "@/lib/inquiries-store";
import { inquirySessionCookieName, verifyInquirySessionToken } from "@/lib/inquiry-session";
import { applyRateLimit, resolveClientIp } from "@/lib/rate-limit";
import { withNoStore } from "@/lib/request-security";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const clientIp = resolveClientIp(request);
    const limitByIp = applyRateLimit({
      key: `inquiry-mine:ip:${clientIp}`,
      maxRequests: 60,
      windowMs: 10 * 60 * 1000,
    });

    if (!limitByIp.allowed) {
      return withNoStore(NextResponse.json(
        { error: "Previse zahtjeva. Pokusajte ponovno malo kasnije." },
        {
          status: 429,
          headers: { "Retry-After": String(limitByIp.retryAfterSeconds) },
        }
      ));
    }

    const sessionCookie = request.cookies.get(inquirySessionCookieName)?.value;
    if (!sessionCookie) {
      return withNoStore(NextResponse.json({ error: "Niste prijavljeni za pregled upita." }, { status: 401 }));
    }

    const session = verifyInquirySessionToken(sessionCookie);
    if (!session) {
      return withNoStore(NextResponse.json(
        { error: "Sesija za pregled upita je istekla. Zatrazi novi link." },
        { status: 401 }
      ));
    }

    const inquiries = await listInquiriesByEmail(session.email);

    return withNoStore(NextResponse.json({
      ok: true,
      email: session.email,
      inquiries,
    }));
  } catch {
    return withNoStore(NextResponse.json(
      { error: "Doslo je do greske pri dohvatu upita." },
      { status: 500 }
    ));
  }
}
