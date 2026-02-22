import { NextResponse } from "next/server";
import { consumeInquiryAccessToken } from "@/lib/inquiries-store";
import {
  createInquirySessionToken,
  inquirySessionCookieMaxAgeSeconds,
  inquirySessionCookieName,
} from "@/lib/inquiry-session";
import { applyRateLimit, resolveClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const clientIp = resolveClientIp(request);
    const limitByIp = applyRateLimit({
      key: `inquiry-session:ip:${clientIp}`,
      maxRequests: 25,
      windowMs: 10 * 60 * 1000,
    });

    if (!limitByIp.allowed) {
      return NextResponse.json(
        { error: "Previse zahtjeva. Pokusajte ponovno malo kasnije." },
        {
          status: 429,
          headers: { "Retry-After": String(limitByIp.retryAfterSeconds) },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token")?.trim() ?? "";

    if (!token) {
      return NextResponse.json({ error: "Nedostaje pristupni token." }, { status: 400 });
    }

    const email = await consumeInquiryAccessToken(token);
    if (!email) {
      return NextResponse.json(
        { error: "Link nije valjan ili je istekao. Zatrazi novi link." },
        { status: 400 }
      );
    }

    const sessionToken = createInquirySessionToken(email);
    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: inquirySessionCookieName,
      value: sessionToken,
      maxAge: inquirySessionCookieMaxAgeSeconds,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Kreiranje sesije za pregled upita nije uspjelo:", error);
    return NextResponse.json(
      { error: "Doslo je do greske pri potvrdi pristupnog linka." },
      { status: 500 }
    );
  }
}
