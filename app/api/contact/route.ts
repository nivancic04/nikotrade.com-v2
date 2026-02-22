import { NextResponse } from "next/server";
import { createInquiryRecord } from "@/lib/inquiries-store";
import { applyRateLimit, resolveClientIp } from "@/lib/rate-limit";
import { createSmtpTransporter, getContactReceiverEmail } from "@/lib/smtp";

export const runtime = "nodejs";

type ContactPayload = {
  title?: unknown;
  description?: unknown;
  replyEmail?: unknown;
  consent?: unknown;
  productSlug?: unknown;
  productName?: unknown;
  website?: unknown;
};

const CONTACT_RECEIVER = getContactReceiverEmail();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: Request) {
  try {
    const clientIp = resolveClientIp(request);
    const limitByIp = applyRateLimit({
      key: `contact:ip:${clientIp}`,
      maxRequests: 10,
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

    const body = (await request.json()) as ContactPayload;
    const inputTitle = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const replyEmail = typeof body.replyEmail === "string" ? body.replyEmail.trim() : "";
    const consent = body.consent === true;
    const productSlug = typeof body.productSlug === "string" ? body.productSlug.trim() : "";
    const productName = typeof body.productName === "string" ? body.productName.trim() : "";
    const website = typeof body.website === "string" ? body.website.trim() : "";
    const title = productName ? `Upit za proizvod: ${productName}` : inputTitle;

    // Honeypot polje: legitimni korisnici ga nikad ne popunjavaju.
    if (website.length > 0) {
      return NextResponse.json({ ok: true });
    }

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

    const limitByEmail = applyRateLimit({
      key: `contact:email:${replyEmail.toLowerCase()}`,
      maxRequests: 6,
      windowMs: 10 * 60 * 1000,
    });

    if (!limitByEmail.allowed) {
      return NextResponse.json(
        { error: "Previse zahtjeva za ovu email adresu. Pokusajte ponovno kasnije." },
        {
          status: 429,
          headers: { "Retry-After": String(limitByEmail.retryAfterSeconds) },
        }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Potrebna je privola za obradu podataka." },
        { status: 400 }
      );
    }

    let inquiryId: string | null = null;
    let inquiryStored = false;

    try {
      const inquiry = await createInquiryRecord({
        title,
        description,
        replyEmail,
        consent,
        productSlug,
        productName,
      });
      inquiryId = inquiry.id;
      inquiryStored = true;
    } catch (error) {
      console.error("Spremanje upita u local store nije uspjelo:", error);
    }

    const smtpClient = createSmtpTransporter();
    let mailSent = false;

    if (smtpClient) {
      try {
        await smtpClient.transporter.sendMail({
          from: `"NikoTrade Kontakt Forma" <${smtpClient.smtpUser}>`,
          to: CONTACT_RECEIVER,
          replyTo: replyEmail,
          subject: `[NikoTrade upit] ${productName ? `${productName} | ` : ""}${title}`,
          text: [
            `Novi upit sa kontakt forme`,
            ``,
            `ID upita: ${inquiryId ?? "N/A"}`,
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
            <p><strong>ID upita:</strong> ${escapeHtml(inquiryId ?? "N/A")}</p>
            <p><strong>Naslov:</strong> ${escapeHtml(title)}</p>
            ${productName ? `<p><strong>Proizvod:</strong> ${escapeHtml(productName)}</p>` : ""}
            ${productSlug ? `<p><strong>Slug proizvoda:</strong> ${escapeHtml(productSlug)}</p>` : ""}
            <p><strong>Email za odgovor:</strong> ${escapeHtml(replyEmail)}</p>
            <p><strong>Privola:</strong> DA</p>
            <hr />
            <p><strong>Opis upita:</strong></p>
            <p>${escapeHtml(description).replace(/\n/g, "<br />")}</p>
          `,
        });

        mailSent = true;
      } catch (error) {
        console.error("Slanje notifikacijskog emaila nije uspjelo:", error);
      }
    }

    if (!mailSent && !inquiryStored) {
      return NextResponse.json(
        { error: "Upit nije moguce obraditi. Pokusajte ponovno malo kasnije." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      inquiryId,
      inquiryStored,
      mailSent,
    });
  } catch {
    return NextResponse.json(
      { error: "Doslo je do greske pri slanju upita." },
      { status: 500 }
    );
  }
}
