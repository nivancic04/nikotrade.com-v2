"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogOut,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type InquiryStatus = "novo" | "u-obradi" | "odgovoreno" | "zatvoreno";

type InquiryItem = {
  id: string;
  title: string;
  description: string;
  replyEmail: string;
  productSlug: string | null;
  productName: string | null;
  status: InquiryStatus;
  consentAt: string;
  createdAt: string;
};

type MyInquiriesResponse = {
  ok: boolean;
  email: string;
  inquiries: InquiryItem[];
};

const statusStyles: Record<
  InquiryStatus,
  { label: string; className: string; dotClassName: string }
> = {
  novo: {
    label: "Novo",
    className: "border-blue-100 bg-blue-50 text-blue-700",
    dotClassName: "bg-blue-500",
  },
  "u-obradi": {
    label: "U obradi",
    className: "border-amber-100 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
  },
  odgovoreno: {
    label: "Odgovoreno",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  zatvoreno: {
    label: "Zatvoreno",
    className: "border-gray-200 bg-gray-100 text-gray-700",
    dotClassName: "bg-gray-500",
  },
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MyInquiriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [isRequestingLink, setIsRequestingLink] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewerEmail, setViewerEmail] = useState("");
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [authError, setAuthError] = useState("");

  const fetchMyInquiries = useCallback(async () => {
    const response = await fetch("/api/inquiries/mine", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      setIsAuthenticated(false);
      setViewerEmail("");
      setInquiries([]);
      return;
    }

    const payload = (await response.json()) as MyInquiriesResponse;
    setIsAuthenticated(true);
    setViewerEmail(payload.email);
    setInquiries(payload.inquiries ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setIsBootstrapping(true);

      if (tokenFromUrl) {
        const exchangeResponse = await fetch(
          `/api/inquiries/session?token=${encodeURIComponent(tokenFromUrl)}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!exchangeResponse.ok) {
          const payload = (await exchangeResponse.json().catch(() => null)) as
            | { error?: string }
            | null;
          if (!cancelled) {
            setAuthError(payload?.error ?? "Pristupni link nije valjan ili je istekao.");
            setIsAuthenticated(false);
            setIsBootstrapping(false);
          }
          return;
        }

        router.replace("/moji-upiti");
        return;
      }

      await fetchMyInquiries();
      if (!cancelled) {
        setAuthError("");
        setIsBootstrapping(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [fetchMyInquiries, router, tokenFromUrl]);

  const summaryLabel = useMemo(() => {
    if (inquiries.length === 1) return "1 upit";
    if (inquiries.length >= 2 && inquiries.length <= 4) return `${inquiries.length} upita`;
    return `${inquiries.length} upita`;
  }, [inquiries.length]);

  const handleRequestLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestError("");
    setRequestSuccess("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setRequestError("Unesite ispravnu email adresu.");
      return;
    }

    setIsRequestingLink(true);
    try {
      const response = await fetch("/api/inquiries/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, website }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        setRequestError(payload?.error ?? "Neuspjesno slanje pristupnog linka.");
        return;
      }

      setRequestSuccess(
        payload?.message ??
          "Ako postoji upit za ovu adresu, poslali smo vam link za siguran pregled upita."
      );
      setEmail("");
      setWebsite("");
    } catch {
      setRequestError("Slanje trenutno nije dostupno. Pokusajte ponovno.");
    } finally {
      setIsRequestingLink(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/inquiries/logout", { method: "POST", credentials: "include" });
    setIsAuthenticated(false);
    setViewerEmail("");
    setInquiries([]);
    setRequestSuccess("Sesija je zavrsena. Za novi pristup zatrazite novi link.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-gray-900 selection:bg-[#4a6bfe] selection:text-white">
      <SiteHeader active="contact" />

      <main className="relative flex-1 overflow-hidden pb-20 pt-36">
        <div className="pointer-events-none absolute -left-16 top-16 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-16 bottom-16 h-64 w-64 rounded-full bg-cyan-100/70 blur-3xl"></div>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,0.10)] sm:p-9"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#3555f6]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Siguran pregled upita
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Moji upiti</h1>
            <p className="mt-4 max-w-3xl text-gray-600 sm:text-lg">
              Radi zaštite privatnosti, pregled upita je dostupan isključivo putem sigurnog
              magic-link pristupa. Link šaljemo na email koji je korišten kod slanja upita.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <LockKeyhole className="h-4 w-4 text-[#4a6bfe]" />
              Podaci se obrađuju sukladno{" "}
              <Link href="/politika-privatnosti" className="font-semibold text-[#3555f6] hover:text-[#2d4ed8]">
                politici privatnosti
              </Link>
              .
            </div>
            <div className="mt-4 inline-flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Podsjetnik: za stabilan produkcijski rad preporučena je implementacija prave baze
                podataka za upite.
              </span>
            </div>
          </motion.div>

          {isBootstrapping ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin text-[#4a6bfe]" />
                Učitavanje upita...
              </p>
            </div>
          ) : null}

          {!isBootstrapping && !isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:p-8"
            >
              <div className="mb-6">
                <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
                  <KeyRound className="h-3.5 w-3.5" />
                  Pristup putem emaila
                </p>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900">
                  Zatražite link za pregled svojih upita
                </h2>
                <p className="mt-2 text-gray-600">
                  Unesite istu email adresu koju ste koristili kod slanja upita.
                </p>
              </div>

              <form onSubmit={handleRequestLink} className="space-y-4">
                <div>
                  <label htmlFor="inquiry-access-website" className="sr-only">
                    Website
                  </label>
                  <input
                    id="inquiry-access-website"
                    type="text"
                    name="website"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <label
                    htmlFor="inquiry-access-email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-gray-500"
                  >
                    Email adresa
                  </label>
                  <input
                    id="inquiry-access-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-gray-900 outline-none transition-all focus:border-[#4a6bfe] focus:ring-2 focus:ring-[#4a6bfe]/20"
                    placeholder="vas@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRequestingLink}
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#4a6bfe] px-5 py-3 font-bold text-white shadow-[0_10px_25px_rgba(74,107,254,0.28)] transition-all duration-300 hover:bg-[#3b5af0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isRequestingLink ? "Slanje..." : "Posalji pristupni link"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </form>

              {authError ? (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  {authError}
                </p>
              ) : null}

              {requestError ? (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {requestError}
                </p>
              ) : null}

              {requestSuccess ? (
                <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {requestSuccess}
                </p>
              ) : null}
            </motion.div>
          ) : null}

          {!isBootstrapping && isAuthenticated ? (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:p-7"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.13em] text-gray-600">
                      <MailCheck className="h-3.5 w-3.5 text-[#4a6bfe]" />
                      {viewerEmail}
                    </p>
                    <p className="mt-3 text-sm text-gray-600">
                      Pronašli smo <span className="font-bold text-gray-900">{summaryLabel}</span>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Odjavi pristup
                  </button>
                </div>
              </motion.div>

              {inquiries.length === 0 ? (
                <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
                  <p className="text-lg font-bold text-gray-900">Nema evidentiranih upita</p>
                  <p className="mt-2 text-gray-600">
                    Ako ste upravo poslali upit, pokušajte osvježiti stranicu za nekoliko sekundi.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {inquiries.map((inquiry, index) => {
                    const style = statusStyles[inquiry.status];
                    return (
                      <motion.article
                        key={inquiry.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
                        className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_10px_25px_rgba(15,23,42,0.06)] sm:p-6"
                      >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-base font-black tracking-tight text-gray-900 sm:text-lg">
                            {inquiry.title}
                          </p>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.13em] ${style.className}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${style.dotClassName}`}></span>
                            {style.label}
                          </span>
                        </div>

                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-gray-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDateTime(inquiry.createdAt)}
                          {inquiry.productName ? (
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#3555f6]">
                              {inquiry.productName}
                            </span>
                          ) : null}
                        </div>

                        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 sm:text-base">
                          {inquiry.description}
                        </p>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </main>

      <SiteFooter active="contact" />
    </div>
  );
}

export default function MyInquiriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <MyInquiriesPageContent />
    </Suspense>
  );
}
