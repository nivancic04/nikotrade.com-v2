"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, ChevronRight, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { AirFreshenerPageData } from "@/lib/air-fresheners-store";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const initialData: AirFreshenerPageData = {
  clubs: [],
  showcases: [],
};

const primaryInquiryButtonClassName =
  "group inline-flex items-center justify-center gap-2 rounded-xl bg-[#4a6bfe] px-6 py-3 font-bold text-white shadow-[0_10px_25px_rgba(74,107,254,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b5af0]";

type ShowcaseScrollState = {
  hasOverflow: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

export default function AirFreshenersPage() {
  const [data, setData] = useState<AirFreshenerPageData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeImage, setActiveImage] = useState<{ src: string; alt: string } | null>(null);
  const showcaseTrackRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [showcaseScrollState, setShowcaseScrollState] = useState<Record<number, ShowcaseScrollState>>({});

  const updateShowcaseScrollState = useCallback((showcaseId: number) => {
    const track = showcaseTrackRefs.current[showcaseId];
    if (!track) return;

    const threshold = 2;
    const nextState = {
      hasOverflow: track.scrollWidth > track.clientWidth + threshold,
      canScrollLeft: track.scrollLeft > threshold,
      canScrollRight: track.scrollLeft + track.clientWidth < track.scrollWidth - threshold,
    };

    setShowcaseScrollState((previousState) => {
      const currentState = previousState[showcaseId];
      if (
        currentState &&
        currentState.hasOverflow === nextState.hasOverflow &&
        currentState.canScrollLeft === nextState.canScrollLeft &&
        currentState.canScrollRight === nextState.canScrollRight
      ) {
        return previousState;
      }

      return {
        ...previousState,
        [showcaseId]: nextState,
      };
    });
  }, []);

  const scrollShowcaseTrack = useCallback(
    (showcaseId: number, direction: "left" | "right") => {
      const track = showcaseTrackRefs.current[showcaseId];
      if (!track) return;

      const step = Math.max(Math.round(track.clientWidth * 0.78), 220);
      track.scrollBy({
        left: direction === "left" ? -step : step,
        behavior: "smooth",
      });

      window.setTimeout(() => updateShowcaseScrollState(showcaseId), 260);
    },
    [updateShowcaseScrollState],
  );

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/automirisi", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as
          | (Partial<AirFreshenerPageData> & { error?: string })
          | null;

        if (!response.ok) {
          if (!cancelled) {
            setLoadError(payload?.error ?? "Učitavanje izložbe trenutno nije dostupno.");
            setData(initialData);
          }
          return;
        }

        if (!cancelled) {
          setData({
            clubs: Array.isArray(payload?.clubs) ? payload.clubs : [],
            showcases: Array.isArray(payload?.showcases) ? payload.showcases : [],
          });
        }
      } catch {
        if (!cancelled) {
          setLoadError("Učitavanje izložbe trenutno nije dostupno.");
          setData(initialData);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (data.showcases.length === 0) {
      setShowcaseScrollState({});
      return;
    }

    const showcaseIds = data.showcases.map((showcase) => showcase.id);

    const syncScrollState = () => {
      showcaseIds.forEach((showcaseId) => updateShowcaseScrollState(showcaseId));
    };

    syncScrollState();
    window.addEventListener("resize", syncScrollState);

    return () => {
      window.removeEventListener("resize", syncScrollState);
    };
  }, [data.showcases, updateShowcaseScrollState]);

  useEffect(() => {
    if (!activeImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeImage]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc] text-gray-900 selection:bg-[#0ea5a8] selection:text-white">
      <SiteHeader active="air-fresheners" />

      <main className="relative flex-1 overflow-hidden pb-24 pt-32">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="rounded-[30px] border border-cyan-100/80 bg-white px-6 py-8 shadow-[0_18px_48px_rgba(15,23,42,0.11)] sm:px-9 sm:py-10"
          >
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-800"
            >
              <Sparkles size={14} />
              Klupski automirisi
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
            >
              Službena kolekcija klubskih mirisa
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg"
            >
              Pregledajte klubove koji već imaju razvijen vlastiti miris u suradnji s nama, istražite izložbe po klubovima
              i na kraju pogledajte prazni model automirisa koij služi kao polazište za personalizirano rješenje.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/kontakt" className={primaryInquiryButtonClassName}>
                Pošalji upit
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="#klubovi"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-bold text-gray-700 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4a6bfe]/35 hover:text-[#2d4ed8] hover:shadow-[0_12px_24px_rgba(74,107,254,0.16)]"
              >
                Otvori izložbu
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <section id="klubovi" className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.14 }}
            variants={fadeUp}
            className="overflow-hidden rounded-3xl border border-cyan-100/80 bg-white p-6 shadow-[0_14px_38px_rgba(15,23,42,0.09)] sm:p-8"
          >
            <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
              Po klubovima
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Izložba klubskih mirisa
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
              Broj horizontalnih sekcija ovdje je direktno vezan uz broj redaka u tablici izložbe.
            </p>

            {isLoading ? (
              <div className="mt-7 rounded-3xl border border-gray-200 bg-white p-7 text-sm font-semibold text-gray-600 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                Učitavanje izložbe klubskih mirisa...
              </div>
            ) : loadError ? (
              <div className="mt-7 rounded-3xl border border-red-100 bg-red-50 p-7 text-sm font-semibold text-red-700 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                {loadError}
              </div>
            ) : data.showcases.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-gray-200 bg-white p-7 text-sm font-semibold text-gray-600 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                Trenutno nema aktivnih klupskih izložbi.
              </div>
            ) : (
              <div className="mt-7 space-y-7">
                {data.showcases.map((showcase, showcaseIndex) => (
                  <motion.article
                    key={showcase.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{ duration: 0.55, delay: showcaseIndex * 0.05 }}
                    className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.09)] sm:p-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
                          <Image
                            src={showcase.club.logoImageUrl}
                            alt={`${showcase.club.name} logo`}
                            width={64}
                            height={64}
                            className="h-8 w-8 object-contain"
                            style={{ transform: `scale(${showcase.club.logoScale})` }}
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">Klub</p>
                          <h3 className="text-xl font-black tracking-tight text-cyan-800">{showcase.club.shortLabel}</h3>
                        </div>
                      </div>

                      <Link
                        href={showcase.club.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 rounded-full border border-[#4a6bfe]/25 bg-white px-4 py-2 text-sm font-bold text-[#2d4ed8] shadow-[0_6px_16px_rgba(74,107,254,0.14)] transition-all duration-300 hover:border-[#4a6bfe]/35 hover:bg-[#f6f9ff] hover:text-[#2340be]"
                      >
                        Pogledaj na webshopu
                        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </Link>
                    </div>

                    <div className="relative mt-5">
                      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 hidden w-20 bg-gradient-to-l from-white via-white/90 to-transparent sm:block"></div>
                      {showcaseScrollState[showcase.id]?.hasOverflow ? (
                        <>
                          <button
                            type="button"
                            onClick={() => scrollShowcaseTrack(showcase.id, "left")}
                            disabled={!showcaseScrollState[showcase.id]?.canScrollLeft}
                            className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#4a6bfe]/35 bg-white/95 text-[#3a56ce] shadow-[0_10px_24px_rgba(74,107,254,0.22)] backdrop-blur-sm transition-all duration-200 hover:border-[#4a6bfe] hover:bg-[#4a6bfe] hover:text-white hover:shadow-[0_14px_30px_rgba(74,107,254,0.34)] disabled:cursor-default disabled:opacity-40"
                            aria-label={`Pomakni izlozbu ${showcase.club.name} ulijevo`}
                          >
                            <ChevronRight className="h-5 w-5 rotate-180" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollShowcaseTrack(showcase.id, "right")}
                            disabled={!showcaseScrollState[showcase.id]?.canScrollRight}
                            className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#4a6bfe]/35 bg-white/95 text-[#3a56ce] shadow-[0_10px_24px_rgba(74,107,254,0.22)] backdrop-blur-sm transition-all duration-200 hover:border-[#4a6bfe] hover:bg-[#4a6bfe] hover:text-white hover:shadow-[0_14px_30px_rgba(74,107,254,0.34)] disabled:cursor-default disabled:opacity-40"
                            aria-label={`Pomakni izlozbu ${showcase.club.name} udesno`}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      ) : null}
                      <div
                        ref={(node) => {
                          showcaseTrackRefs.current[showcase.id] = node;
                          if (!node) return;
                          window.requestAnimationFrame(() => updateShowcaseScrollState(showcase.id));
                        }}
                        onScroll={() => updateShowcaseScrollState(showcase.id)}
                        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scroll-smooth"
                      >
                        {showcase.images.map((image, imageIndex) => (
                          <article
                            key={`${showcase.id}-${image.imageUrl}-${imageIndex}`}
                            className="group min-w-[250px] snap-start overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition-[background-color,box-shadow,border-color] duration-200 hover:bg-[#fcfdff] hover:border-gray-200/80 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)] sm:min-w-[300px]"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setActiveImage({
                                  src: image.imageUrl,
                                  alt: `${showcase.club.name} izložba ${imageIndex + 1}`,
                                })
                              }
                              className="block w-full text-left"
                              aria-label={`Otvori sliku ${imageIndex + 1} za ${showcase.club.name}`}
                            >
                              <div className="relative h-52 bg-white">
                                <Image
                                  src={image.imageUrl}
                                  alt={`${showcase.club.name} izložba ${imageIndex + 1}`}
                                  fill
                                  sizes="(min-width: 640px) 300px, 250px"
                                  className="object-contain p-5"
                                />
                              </div>
                            </button>
                          </article>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.14 }}
            variants={fadeUp}
            className="overflow-hidden rounded-3xl border border-cyan-100/80 bg-white p-6 shadow-[0_14px_38px_rgba(15,23,42,0.09)] sm:p-8"
          >
            <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
              Klubovi partneri
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Klubovi s našim mirisima
            </h2>

            {isLoading ? (
              <div className="mt-7 rounded-3xl border border-gray-200 bg-white p-7 text-sm font-semibold text-gray-600 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                Učitavanje logotipova...
              </div>
            ) : loadError ? (
              <div className="mt-7 rounded-3xl border border-red-100 bg-red-50 p-7 text-sm font-semibold text-red-700 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                {loadError}
              </div>
            ) : data.clubs.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-gray-200 bg-white p-7 text-sm font-semibold text-gray-600 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                Trenutno nema aktivnih klubova za prikaz.
              </div>
            ) : (
              <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
                {data.clubs.map((club) => (
                  <article
                    key={club.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.11)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/70 via-transparent to-sky-50/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="relative flex h-20 items-center justify-center">
                      <Image
                        src={club.logoImageUrl}
                        alt={`${club.name} logo`}
                        width={120}
                        height={120}
                        className="max-h-16 w-auto object-contain"
                        style={{ transform: `scale(${club.logoScale})` }}
                      />
                    </div>
                    <p className="relative mt-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-gray-600">
                      {club.name}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.16 }}
            transition={{ duration: 0.58 }}
            className="overflow-hidden rounded-3xl border border-cyan-100/80 bg-white p-6 shadow-[0_14px_38px_rgba(15,23,42,0.09)] sm:p-8"
          >
            <div className="grid grid-cols-1 items-center gap-7 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="overflow-hidden rounded-2xl border border-white/80 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                <Image
                  src="/img/automirisi/showcase/showcase-model.png"
                  alt="Showcase model automirisa"
                  width={980}
                  height={980}
                  className="h-[290px] w-full object-contain"
                />
              </div>

              <div>
                <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">
                  Showcase model
                </p>
                <h3 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  Tvoj klub može imati svoj jedinstveni automiris
                </h3>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
                  Nakon klupske izložbe ovo je neutralni model od kojeg kreće personalizacija. Pripremamo vizual po tvom identitetu i
                  proizvodnju po narudžbi.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/kontakt" className={primaryInquiryButtonClassName}>
                    Pošalji upit
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/proizvodi"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-bold text-gray-700 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4a6bfe]/35 hover:text-[#2d4ed8] hover:shadow-[0_12px_24px_rgba(74,107,254,0.16)]"
                  >
                    Pogledaj ostale proizvode
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {activeImage ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Prikaz slike"
        >
          <button
            type="button"
            aria-label="Zatvori prikaz slike"
            onClick={() => setActiveImage(null)}
            className="absolute right-5 top-5 rounded-full border border-white/25 bg-black/35 p-2 text-white transition-colors hover:bg-black/55"
          >
            <X size={20} />
          </button>

          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-white/95"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[72vh] w-full">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                sizes="100vw"
                className="object-contain p-4 sm:p-6"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  );
}
