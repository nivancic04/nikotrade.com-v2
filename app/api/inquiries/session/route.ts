import { NextResponse } from "next/server";
import { consumeInquiryAccessToken } from "@/lib/inquiries-store";
import {
  createInquirySessionToken,
  inquirySessionCookieMaxAgeSeconds,
  inquirySessionCookieName,
} from "@/lib/inquiry-session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
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

