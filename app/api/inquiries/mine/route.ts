import { NextRequest, NextResponse } from "next/server";
import { listInquiriesByEmail } from "@/lib/inquiries-store";
import { inquirySessionCookieName, verifyInquirySessionToken } from "@/lib/inquiry-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(inquirySessionCookieName)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Niste prijavljeni za pregled upita." }, { status: 401 });
    }

    const session = verifyInquirySessionToken(sessionCookie);
    if (!session) {
      return NextResponse.json(
        { error: "Sesija za pregled upita je istekla. Zatrazi novi link." },
        { status: 401 }
      );
    }

    const inquiries = await listInquiriesByEmail(session.email);

    return NextResponse.json({
      ok: true,
      email: session.email,
      inquiries,
    });
  } catch {
    return NextResponse.json(
      { error: "Doslo je do greske pri dohvatu upita." },
      { status: 500 }
    );
  }
}

