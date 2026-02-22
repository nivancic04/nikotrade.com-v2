import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactPayload = {
  title?: unknown;
  description?: unknown;
  replyEmail?: unknown;
  consent?: unknown;
  productSlug?: unknown;
  productName?: unknown;
};

const CONTACT_RECEIVER = process.env.CONTACT_RECEIVER_EMAIL ?? "nikoivancic2801@gmail.com";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const inputTitle = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const replyEmail = typeof body.replyEmail === "string" ? body.replyEmail.trim() : "";
    const consent = body.consent === true;
    const productSlug = typeof body.productSlug === "string" ? body.productSlug.trim() : "";
    const productName = typeof body.productName === "string" ? body.productName.trim() : "";
    const title = productName ? `Upit za proizvod: ${productName}` : inputTitle;

    if (title.length < 3 || title.length > 120) {
      return NextResponse.json(
        { error: "Naslov mora imati izmedu 3 i 120 znakova." },
        { status: 400 }
      );
    }

    if (description.length < 10 || description.length > 5000) {
      return NextResponse.json(
        { error: "Opis mora imati izmedu 10 i 5000 znakova." },
        { status: 400 }
      );
    }

    if (!isValidEmail(replyEmail)) {
      return NextResponse.json(
        { error: "Email za odgovor nije ispravan." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Potrebna je privola za obradu podataka." },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT ?? 465);
    const smtpSecure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : smtpPort === 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpAppPassword = process.env.SMTP_APP_PASSWORD;

    if (!smtpUser || !smtpAppPassword) {
      return NextResponse.json(
        { error: "Mail servis nije konfiguriran. Provjerite .env varijable." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpAppPassword,
      },
    });

    await transporter.sendMail({
      from: `"NikoTrade Kontakt Forma" <${smtpUser}>`,
      to: CONTACT_RECEIVER,
      replyTo: replyEmail,
      subject: `[NikoTrade upit] ${productName ? `${productName} | ` : ""}${title}`,
      text: [
        `Novi upit sa kontakt forme`,
        ``,
        `Naslov: ${title}`,
        productName ? `Proizvod: ${productName}` : null,
        productSlug ? `Slug proizvoda: ${productSlug}` : null,
        `Email za odgovor: ${replyEmail}`,
        `Privola: DA`,
        ``,
        `Opis:`,
        description,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <h2>Novi upit sa kontakt forme</h2>
        <p><strong>Naslov:</strong> ${title}</p>
        ${productName ? `<p><strong>Proizvod:</strong> ${productName}</p>` : ""}
        ${productSlug ? `<p><strong>Slug proizvoda:</strong> ${productSlug}</p>` : ""}
        <p><strong>Email za odgovor:</strong> ${replyEmail}</p>
        <p><strong>Privola:</strong> DA</p>
        <hr />
        <p><strong>Opis upita:</strong></p>
        <p>${description.replace(/\n/g, "<br />")}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Doslo je do greske pri slanju upita." },
      { status: 500 }
    );
  }
}
