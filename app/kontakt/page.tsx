"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Instagram,
  MapPin,
  Clock,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { getProductBySlug } from "@/lib/products-db";

function KontaktPageContent() {
  const searchParams = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedProductSlug, setSelectedProductSlug] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");
  const [prefilledProductSlug, setPrefilledProductSlug] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isContactModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isContactModalOpen]);

  useEffect(() => {
    const productSlugFromUrl = searchParams.get("product");
    if (!productSlugFromUrl || productSlugFromUrl === prefilledProductSlug) return;

    const productFromTable = getProductBySlug(productSlugFromUrl);
    const productName = productFromTable?.name ?? productSlugFromUrl.replace(/-/g, " ");
    const shouldOpenModal = searchParams.get("open") !== "0";

    setPrefilledProductSlug(productSlugFromUrl);
    setSelectedProductSlug(productSlugFromUrl);
    setSelectedProductName(productName);
    setTitle((current) =>
      current.trim().length > 0 ? current : `Upit za proizvod: ${productName}`
    );
    setDescription((current) =>
      current.trim().length > 0
        ? current
        : `Pozdrav, zanima me proizvod "${productName}". Molim vise informacija o dostupnosti, personalizaciji i roku isporuke.`
    );

    if (shouldOpenModal) {
      setFormError("");
      setFormSuccess("");
      setIsContactModalOpen(true);
    }
  }, [prefilledProductSlug, searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    const normalizedTitle = title.trim();
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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedReplyEmail)) {
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
          website,
          productSlug: selectedProductSlug || undefined,
          productName: selectedProductName || undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setFormError(payload?.error ?? "Dogodila se greška pri slanju upita.");
        return;
      }

      setFormSuccess("Upit je uspješno poslan. Odgovorit ćemo vam uskoro.");
      setTitle("");
      setDescription("");
      setReplyEmail("");
      setWebsite("");
      setConsent(false);
    } catch {
      setFormError("Slanje trenutno nije dostupno. Pokušajte ponovno.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openContactModal = () => {
    setFormError("");
    setFormSuccess("");
    setWebsite("");
    setIsContactModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] text-gray-900 selection:bg-[#4a6bfe] selection:text-white">
      <header
        className={`fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/85 shadow-lg backdrop-blur-2xl transition-all duration-300 ease-in-out ${isScrolled ? "py-4" : "py-6"}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="z-50 flex shrink-0 items-center"
            >
              <Link
                href="/"
                className="text-2xl font-black tracking-tighter text-white transition-colors duration-300 hover:text-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                NIKO<span className="text-[#4a6bfe]">TRADE</span>
              </Link>
            </motion.div>

            <motion.nav
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="hidden space-x-10 font-medium tracking-tight text-gray-200 md:flex"
            >
              <Link href="/" className="relative transition-colors hover:text-white group">
                Početna
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-white transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/proizvodi" className="relative transition-colors hover:text-white group">
                Proizvodi
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-white transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/kontakt" className="relative text-[#4a6bfe] transition-colors group">
                Kontakt
                <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#4a6bfe]"></span>
              </Link>
            </motion.nav>

            <div className="z-50 flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-md p-2 text-white transition-colors hover:text-gray-300 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute left-0 top-full w-full overflow-hidden border-b border-gray-200 bg-white shadow-xl md:hidden"
            >
              <nav className="flex flex-col space-y-4 px-4 pb-8 pt-4">
                <Link
                  href="/"
                  className="border-b border-gray-100 pb-2 text-lg font-medium text-gray-700 transition-colors hover:text-[#4a6bfe]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pocetna
                </Link>
                <Link
                  href="/proizvodi"
                  className="border-b border-gray-100 pb-2 text-lg font-medium text-gray-700 transition-colors hover:text-[#4a6bfe]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Proizvodi
                </Link>
                <Link
                  href="/kontakt"
                  className="border-b border-gray-100 pb-2 text-lg font-bold text-[#4a6bfe]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kontakt
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative flex-1 overflow-hidden pt-36 pb-24">
        <div className="pointer-events-none absolute -left-16 top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"></div>

        <div className="mx-auto mb-12 max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-5xl font-black tracking-tighter text-gray-900 sm:text-6xl"
          >
            Kontakt
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-gray-500"
          >
            Javi nam se za pitanja, personalizirane narudžbe i poslovnu saradnju.
          </motion.p>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 sm:p-10 shadow-[0_10px_35px_rgba(15,23,42,0.08)]"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-50"></div>
            <p className="relative mb-5 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#4a6bfe]">
              Kontakt
            </p>
            <h2 className="relative text-4xl font-black leading-tight tracking-tighter text-gray-900 sm:text-5xl">
              Tu smo za svako pitanje i svaku personalizaciju.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Treba vam posebna narudžba, timski dizajn ili pomoć oko izbora proizvoda?
              Javite se direktno, odgovaramo brzo i precizno.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Email</p>
                <span className="mt-2 block text-lg font-bold text-[#4a6bfe]">xxx@xxxx.xx</span>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Telefon</p>
                <span className="mt-2 block text-lg font-bold text-[#4a6bfe]">xxx xxxx xxx</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={openContactModal}
                className="group inline-flex items-center gap-2 rounded-xl bg-[#4a6bfe] px-6 py-3 font-bold text-white shadow-[0_10px_25px_rgba(74,107,254,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b5af0]"
              >
                {selectedProductName ? "Otvori upit za proizvod" : "Otvori upit formu"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 transition-all duration-300 hover:border-[#4a6bfe]/40 hover:text-[#4a6bfe]"
              >
                <Instagram size={16} />
                Instagram
              </a>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
            className="relative flex flex-col overflow-hidden rounded-3xl border border-gray-800 bg-gray-900 p-8 sm:p-10 shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4a6bfe]/20 via-blue-900/10 to-transparent"></div>

            <div className="relative mb-8 flex items-center justify-between">
              <div className="rounded-2xl border border-[#4a6bfe]/30 bg-[#4a6bfe]/20 p-4 shadow-[0_0_24px_rgba(74,107,254,0.2)]">
                <MapPin size={28} className="text-blue-300" />
              </div>
              <span className="rounded-full bg-[#4a6bfe] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                Kontakt info
              </span>
            </div>

            <div className="relative space-y-5">
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Niko Trade d.o.o.</h2>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-300" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100/60">Adresa</p>
                    <p className="mt-1 text-base font-semibold leading-relaxed text-blue-50">
                      Vatroslava Lisinskog 17, 42233 Sveti Đurđ, Hrvatska
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-blue-300" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100/60">Radno vrijeme</p>
                    <p className="mt-1 text-base text-blue-50">
                      Pon - Pet: <span className="font-bold">08:00 - 16:00</span>
                    </p>
                    <p className="mt-1 text-base text-blue-50">
                      Subota: <span className="font-bold">08:00 - 12:00</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100/60">Email</p>
                  <span className="mt-2 block text-base font-bold text-blue-100">xxx@xxxx.xx</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100/60">Telefon</p>
                  <span className="mt-2 block text-base font-bold text-blue-100">xxx xxxx xxx</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100/60">Proces upita</p>
                <div className="mt-3 space-y-2 text-sm text-blue-100/90">
                  <p>1. Pošaljete upit kroz popup formu.</p>
                  <p>2. Pregledamo detalje i javimo se na vas email.</p>
                  <p>3. Potvrđujemo narudžbu i rok isporuke.</p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <AnimatePresence>
        {isContactModalOpen && (
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
                    Kontakt forma
                  </p>
                  <h3 className="mt-3 text-3xl font-black tracking-tighter text-gray-900">Pošaljite upit</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Unesite osnovne informacije i odgovor ćete dobiti na email koji navedete.
                  </p>
                  {selectedProductName ? (
                    <p className="mt-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#4a6bfe]">
                      Proizvod: {selectedProductName}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                  aria-label="Zatvori kontakt formu"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-title" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Naslov upita
                  </label>
                  <input
                    id="contact-title"
                    name="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-gray-900 outline-none transition-all focus:border-[#4a6bfe] focus:ring-2 focus:ring-[#4a6bfe]/20"
                    placeholder={
                      selectedProductName
                        ? `Upit za ${selectedProductName}`
                        : "Npr. Upit za personalizirani automiris"
                    }
                  />
                </div>

                <div>
                  <label htmlFor="contact-description" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Opis upita
                  </label>
                  <textarea
                    id="contact-description"
                    name="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-gray-900 outline-none transition-all focus:border-[#4a6bfe] focus:ring-2 focus:ring-[#4a6bfe]/20"
                    placeholder={
                      selectedProductName
                        ? `Zanima me ${selectedProductName}. Molim detalje o dostupnosti i isporuci.`
                        : "Napisite detalje upita..."
                    }
                  />
                </div>

                <div>
                  <label htmlFor="contact-website" className="sr-only">
                    Website
                  </label>
                  <input
                    id="contact-website"
                    name="website"
                    type="text"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <label htmlFor="contact-reply-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Email za odgovor
                  </label>
                  <input
                    id="contact-reply-email"
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
                      id="contact-consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#4a6bfe] focus:ring-[#4a6bfe]/30"
                    />
                    <label htmlFor="contact-consent" className="text-sm leading-relaxed text-gray-600">
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
                    onClick={() => setIsContactModalOpen(false)}
                    className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                  >
                    Zatvori
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full border-t border-white/10 bg-[#0A0A0A] px-4 pb-10 pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="mb-5 block text-3xl font-black tracking-tighter text-white">
                NIKO<span className="text-[#4a6bfe]">TRADE</span>
              </Link>
              <p className="max-w-sm text-sm leading-relaxed text-gray-400">
                Premium automirisi u dizajnu omiljenih sportskih klubova. Kvaliteta,
                personalizacija i prepoznatljiv stil.
              </p>
            </div>
            <div>
              <h5 className="mb-5 font-bold tracking-tight text-white">Navigacija</h5>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Početna stranica
                  </Link>
                </li>
                <li>
                  <Link href="/proizvodi" className="transition-colors hover:text-white">
                    Svi proizvodi
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className="text-[#4a6bfe] transition-colors hover:text-[#6f88ff]">
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-5 font-bold tracking-tight text-white">Podrška</h5>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/kontakt" className="transition-colors hover:text-white">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="/moji-upiti" className="transition-colors hover:text-white">
                    Moji upiti
                  </Link>
                </li>
                <li>
                  <Link href="/politika-privatnosti" className="transition-colors hover:text-white">
                    Politika privatnosti
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-8 h-px w-full bg-white/10"></div>

          <div className="flex flex-col items-center justify-between gap-4 text-xs font-medium text-gray-500 md:flex-row">
            <p>© 2004 Nikotrade WebShop. Sva prava pridržana.</p>
            <span>Made with passion in Croatia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function KontaktPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9FAFB]" />}>
      <KontaktPageContent />
    </Suspense>
  );
}
