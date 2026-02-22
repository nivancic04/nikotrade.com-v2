"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageSquareText, X } from "lucide-react";

type ProductInquiryModalProps = {
  productSlug: string;
  productName: string;
  triggerLabel?: string;
  triggerClassName?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ProductInquiryModal({
  productSlug,
  productName,
  triggerLabel = "Posalji upit",
  triggerClassName,
}: ProductInquiryModalProps) {
  const fixedTitle = useMemo(() => `Upit za proizvod: ${productName}`, [productName]);
  const defaultDescription = useMemo(
    () =>
      `Pozdrav, zanima me proizvod "${productName}". Molim vise informacija o dostupnosti, personalizaciji i roku isporuke.`,
    [productName]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState(defaultDescription);
  const [replyEmail, setReplyEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDescription(defaultDescription);
  }, [defaultDescription]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const openModal = () => {
    setFormError("");
    setFormSuccess("");
    setDescription(defaultDescription);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    const normalizedTitle = fixedTitle.trim();
    const normalizedDescription = description.trim();
    const normalizedReplyEmail = replyEmail.trim();

    if (normalizedTitle.length < 3) {
      setFormError("Naslov mora imati barem 3 znaka.");
      return;
    }

    if (normalizedDescription.length < 10) {
      setFormError("Opis mora imati barem 10 znakova.");
      return;
    }

    if (!isValidEmail(normalizedReplyEmail)) {
      setFormError("Unesite ispravnu email adresu za odgovor.");
      return;
    }

    if (!consent) {
      setFormError("Potrebno je prihvatiti obradu podataka.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: normalizedTitle,
          description: normalizedDescription,
          replyEmail: normalizedReplyEmail,
          consent,
          productSlug,
          productName,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setFormError(payload?.error ?? "Dogodila se greska pri slanju upita.");
        return;
      }

      setFormSuccess("Upit je uspjesno poslan. Odgovorit cemo vam uskoro.");
      setReplyEmail("");
      setConsent(false);
    } catch {
      setFormError("Slanje trenutno nije dostupno. Pokusajte ponovno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" onClick={openModal} className={triggerClassName}>
        <MessageSquareText className="h-4 w-4" />
        {triggerLabel}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#4a6bfe]">
                    Upit za proizvod
                  </p>
                  <h3 className="mt-3 text-3xl font-black tracking-tighter text-gray-900">
                    Posaljite upit
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Unesite osnovne informacije i odgovor cete dobiti na email koji navedete.
                  </p>
                  <p className="mt-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#4a6bfe]">
                    Proizvod: {productName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                  aria-label="Zatvori kontakt formu"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor={`product-inquiry-title-${productSlug}`}
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
                  >
                    Naslov upita
                  </label>
                  <input
                    id={`product-inquiry-title-${productSlug}`}
                    name="title"
                    value={fixedTitle}
                    readOnly
                    aria-readonly="true"
                    maxLength={120}
                    required
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`product-inquiry-description-${productSlug}`}
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
                  >
                    Opis upita
                  </label>
                  <textarea
                    id={`product-inquiry-description-${productSlug}`}
                    name="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-gray-900 outline-none transition-all focus:border-[#4a6bfe] focus:ring-2 focus:ring-[#4a6bfe]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`product-inquiry-email-${productSlug}`}
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
                  >
                    Email za odgovor
                  </label>
                  <input
                    id={`product-inquiry-email-${productSlug}`}
                    name="replyEmail"
                    type="email"
                    value={replyEmail}
                    onChange={(event) => setReplyEmail(event.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-gray-900 outline-none transition-all focus:border-[#4a6bfe] focus:ring-2 focus:ring-[#4a6bfe]/20"
                    placeholder="vas@email.com"
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <input
                      id={`product-inquiry-consent-${productSlug}`}
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#4a6bfe] focus:ring-[#4a6bfe]/30"
                    />
                    <label
                      htmlFor={`product-inquiry-consent-${productSlug}`}
                      className="text-sm leading-relaxed text-gray-600"
                    >
                      Pristajem na obradu i prikupljanje mojih podataka radi odgovora na upit,
                      sukladno{" "}
                      <Link
                        href="/politika-privatnosti"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#3555f6] underline decoration-[#3555f6]/40 underline-offset-4 hover:text-[#2d4ed8]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        politici privatnosti
                      </Link>
                      .
                    </label>
                  </div>
                </div>

                {formError ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {formError}
                  </p>
                ) : null}

                {formSuccess ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {formSuccess}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#4a6bfe] px-6 py-3 font-bold text-white shadow-[0_10px_25px_rgba(74,107,254,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b5af0] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Slanje..." : "Posalji upit"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                  >
                    Zatvori
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
