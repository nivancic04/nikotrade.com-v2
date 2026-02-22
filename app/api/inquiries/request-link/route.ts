import { NextResponse } from "next/server";
import { createInquiryAccessToken, listInquiriesByEmail } from "@/lib/inquiries-store";
import { createSmtpTransporter, resolveAppBaseUrl } from "@/lib/smtp";

export const runtime = "nodejs";

type RequestPayload = {
  email?: unknown;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestPayload;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Unesite ispravnu email adresu." },
        { status: 400 }
      );
    }

    const userInquiries = await listInquiriesByEmail(email);
    if (userInquiries.length === 0) {
      return NextResponse.json({
        ok: true,
        message:
          "Ako postoji upit vezan uz ovu email adresu, poslan je link za siguran pregled upita.",
      });
    }

    const smtpClient = createSmtpTransporter();
    if (!smtpClient) {
      return NextResponse.json(
        { error: "Mail servis nije konfiguriran. Provjerite SMTP varijable." },
        { status: 500 }
      );
    }

    const tokenPayload = await createInquiryAccessToken(email);
    const baseUrl = resolveAppBaseUrl(request);
    const magicLink = `${baseUrl}/moji-upiti?token=${encodeURIComponent(tokenPayload.token)}`;

    await smtpClient.transporter.sendMail({
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

    return NextResponse.json({
      ok: true,
      message:
        "Ako postoji upit vezan uz ovu email adresu, poslan je link za siguran pregled upita.",
    });
  } catch {
    return NextResponse.json(
      { error: "Doslo je do greske pri slanju pristupnog linka." },
      { status: 500 }
    );
  }
}

