import { NextResponse } from "next/server";
import { createInquiryAccessToken, listInquiriesByEmail } from "@/lib/inquiries-store";
import { applyRateLimit, resolveClientIp } from "@/lib/rate-limit";
import { enforcePostRequestSecurity, withNoStore } from "@/lib/request-security";
import { createSmtpTransporter, resolveAppBaseUrl, sendMailWithRetry } from "@/lib/smtp";

export const runtime = "nodejs";

type RequestPayload = {
  email?: unknown;
  website?: unknown;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const blockedRequest = enforcePostRequestSecurity(request);
    if (blockedRequest) return withNoStore(blockedRequest);

    const clientIp = resolveClientIp(request);
    const requestLimitByIp = applyRateLimit({
      key: `request-link:ip:${clientIp}`,
      maxRequests: 8,
      windowMs: 10 * 60 * 1000,
    });

    if (!requestLimitByIp.allowed) {
      return withNoStore(NextResponse.json(
        { error: "Previse zahtjeva. Pokusajte ponovno malo kasnije." },
        {
          status: 429,
          headers: { "Retry-After": String(requestLimitByIp.retryAfterSeconds) },
        }
      ));
    }

    const body = (await request.json()) as RequestPayload;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const website = typeof body.website === "string" ? body.website.trim() : "";

    // Honeypot polje: ako je popunjeno, ignoriramo zahtjev.
    if (website.length > 0) {
      return withNoStore(NextResponse.json({
        ok: true,
        message:
          "Ako postoji upit vezan uz ovu email adresu, poslan je link za siguran pregled upita.",
      }));
    }

    if (!isValidEmail(email)) {
      return withNoStore(NextResponse.json(
        { error: "Unesite ispravnu email adresu." },
        { status: 400 }
      ));
    }

    const requestLimitByEmail = applyRateLimit({
      key: `request-link:email:${email}`,
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!requestLimitByEmail.allowed) {
      return withNoStore(NextResponse.json(
        { error: "Previse zahtjeva za ovu email adresu. Pokusajte ponovno kasnije." },
        {
          status: 429,
          headers: { "Retry-After": String(requestLimitByEmail.retryAfterSeconds) },
        }
      ));
    }

    let userInquiriesCount = 0;
    try {
      const userInquiries = await listInquiriesByEmail(email);
      userInquiriesCount = userInquiries.length;
    } catch (error) {
      console.error("Dohvat upita za request-link nije uspio:", error);
      return withNoStore(NextResponse.json({
        ok: true,
        message:
          "Pregled upita je trenutno privremeno nedostupan. Pokusajte ponovno malo kasnije.",
      }));
    }

    if (userInquiriesCount === 0) {
      return withNoStore(NextResponse.json({
        ok: true,
        message:
          "Ako postoji upit vezan uz ovu email adresu, poslan je link za siguran pregled upita.",
      }));
    }

    const smtpClient = createSmtpTransporter();
    if (!smtpClient) {
      return NextResponse.json({
        ok: true,
        message:
          "Ako postoji upit vezan uz ovu email adresu, poslan je link za siguran pregled upita.",
      });
    }

    let tokenPayload: { token: string; expiresAt: string };
    try {
      tokenPayload = await createInquiryAccessToken(email);
    } catch (error) {
      console.error("Kreiranje access tokena nije uspjelo:", error);
      return withNoStore(NextResponse.json({
        ok: true,
        message:
          "Pregled upita je trenutno privremeno nedostupan. Pokusajte ponovno malo kasnije.",
      }));
    }

    const baseUrl = resolveAppBaseUrl(request);
    const magicLink = `${baseUrl}/moji-upiti?token=${encodeURIComponent(tokenPayload.token)}`;

    await sendMailWithRetry(smtpClient, {
      from: `"NikoTrade Podrska" <${smtpClient.smtpUser}>`,
      to: email,
      subject: "Siguran pristup: pregled vasih upita",
      text: [
        `Pozdrav,`,
        ``,
        `zatrazili ste siguran pristup stranici "Moji upiti".`,
        `Otvorite ovaj link:`,
        magicLink,
        ``,
        `Link vrijedi do: ${new Date(tokenPayload.expiresAt).toLocaleString("hr-HR")}`,
        `Ako vi niste zatrazili pristup, slobodno ignorirajte ovu poruku.`,
      ].join("\n"),
      html: `
        <h2>Pregled vasih upita</h2>
        <p>Zatrazili ste siguran pristup stranici <strong>Moji upiti</strong>.</p>
        <p>
          <a href="${magicLink}" target="_blank" rel="noopener noreferrer">
            Otvori siguran pregled upita
          </a>
        </p>
        <p>Link vrijedi do: <strong>${new Date(tokenPayload.expiresAt).toLocaleString("hr-HR")}</strong>.</p>
        <p>Ako vi niste zatrazili pristup, slobodno ignorirajte ovu poruku.</p>
      `,
    });

    return withNoStore(NextResponse.json({
      ok: true,
      message:
        "Ako postoji upit vezan uz ovu email adresu, poslan je link za siguran pregled upita.",
    }));
  } catch {
    return withNoStore(NextResponse.json(
      { error: "Doslo je do greske pri slanju pristupnog linka." },
      { status: 500 }
    ));
  }
}
