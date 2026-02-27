"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpDown, ChevronDown, Filter } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrimaryProductImage, type ProductCategory, type ProductRecord } from "@/lib/products-db";

type CatalogCategory = Exclude<ProductCategory, "Automirisi">;

const categoryOptions: Array<"Sve" | CatalogCategory> = [
  "Sve",
  "Sportska oprema",
  "Case",
];

type SortOption = "nameAsc" | "priceAsc" | "priceDesc";

const sortLabels: Record<SortOption, string> = {
  nameAsc: "Naziv: A-Z",
  priceAsc: "Cijena: niže",
  priceDesc: "Cijena: više",
};

function getCategoryLabel(category: "Sve" | ProductCategory) {
  if (category === "Case") return "Čaše";
  return category;
}


type MobileDropdownOption<T extends string> = {
  value: T;
  label: string;
};

type MobileDropdownProps<T extends string> = {
  ariaLabel: string;
  value: T;
  options: MobileDropdownOption<T>[];
  onChange: (value: T) => void;
};

function MobileDropdown<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: MobileDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const activeOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-gray-700 outline-none ring-[#4a6bfe]/25 transition focus:border-[#4a6bfe] focus:ring-2"
      >
        <span>{activeOption.label}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
          <ul role="listbox" className="max-h-64 overflow-auto py-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-50 font-semibold text-[#2d4ed8]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeCategory, setActiveCategory] = useState<"Sve" | CatalogCategory>("Sve");
  const [activeSubcategory, setActiveSubcategory] = useState("Sve");
  const [isSubcategoryMenuOpen, setIsSubcategoryMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("nameAsc");
  const subcategoryMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as
          | { products?: ProductRecord[]; error?: string }
          | null;

        if (!response.ok) {
          if (!cancelled) {
            setLoadError(payload?.error ?? "Neuspješno učitavanje proizvoda.");
            setProducts([]);
          }
          return;
        }

        if (!cancelled) {
          setProducts(payload?.products ?? []);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Učitavanje proizvoda trenutno nije dostupno.");
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const catalogProducts = useMemo(
    () => products.filter((product) => product.category !== "Automirisi"),
    [products]
  );

  const subcategoryOptions = useMemo(() => {
    const inCategory =
      activeCategory === "Sve"
        ? catalogProducts
        : catalogProducts.filter((product) => product.category === activeCategory);

    const values = Array.from(
      new Set(
        inCategory
          .map((product) => product.subcategory?.trim() ?? "")
          .filter((subcategory) => subcategory.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, "hr"));

    return ["Sve", ...values];
  }, [activeCategory, catalogProducts]);

  useEffect(() => {
    if (!subcategoryOptions.includes(activeSubcategory)) {
      setActiveSubcategory("Sve");
    }
  }, [activeSubcategory, subcategoryOptions]);

  useEffect(() => {
    if (!isSubcategoryMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!subcategoryMenuRef.current?.contains(target)) {
        setIsSubcategoryMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSubcategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSubcategoryMenuOpen]);

  const filteredProducts = useMemo(() => {
    const byCategory =
      activeCategory === "Sve"
        ? [...catalogProducts]
        : catalogProducts.filter((product) => product.category === activeCategory);

    const bySubcategory =
      activeSubcategory === "Sve"
        ? byCategory
        : byCategory.filter((product) => (product.subcategory?.trim() ?? "") === activeSubcategory);

    if (sortBy === "priceAsc") {
      bySubcategory.sort((a, b) => a.priceEur - b.priceEur);
    } else if (sortBy === "priceDesc") {
      bySubcategory.sort((a, b) => b.priceEur - a.priceEur);
    } else {
      bySubcategory.sort((a, b) => a.name.localeCompare(b.name, "hr"));
    }

    return bySubcategory;
  }, [activeCategory, activeSubcategory, catalogProducts, sortBy]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] text-gray-900 selection:bg-[#4a6bfe] selection:text-white">
      <SiteHeader active="products" />

      <main className="relative flex-1 overflow-hidden pb-24 pt-36">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Katalog proizvoda
            </span>
            <h1 className="mt-4 text-5xl font-black tracking-tighter text-gray-900 sm:text-6xl">
              Svi proizvodi
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-500">
              Pregledajte kompletnu ponudu proizvoda i otvorite detaljnu stranicu za
              svaki artikl.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="relative z-30 mb-10 rounded-[2rem] border border-[#dbe6ff] bg-white/90 p-4 shadow-[0_18px_46px_rgba(15,23,42,0.10)] backdrop-blur sm:p-5 lg:p-6"
          >
            <div className="pointer-events-none absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#4a6bfe]/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-14 -top-10 h-40 w-40 rounded-full bg-[#14b8a6]/10 blur-3xl" />
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start lg:gap-8">
              <div className="relative z-10 rounded-2xl border border-gray-200/80 bg-white/85 p-4 lg:h-[124px]">
                <div className="mb-3 flex items-center gap-2">
                  <Filter size={15} className="text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Kategorija
                  </span>
                </div>
                <div className="sm:hidden">
                  <MobileDropdown
                    ariaLabel="Odaberi kategoriju"
                    value={activeCategory}
                    onChange={(nextCategory) => setActiveCategory(nextCategory)}
                    options={categoryOptions.map((category) => ({
                      value: category,
                      label: getCategoryLabel(category),
                    }))}
                  />
                </div>
                <div className="hidden items-center gap-2 sm:flex sm:flex-nowrap sm:overflow-x-auto">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                        activeCategory === category
                          ? "border-transparent bg-[#4a6bfe] text-white shadow-[0_10px_18px_rgba(74,107,254,0.28)]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#4a6bfe]/40 hover:bg-[#f8fbff] hover:text-[#2d4ed8]"
                      }`}
                    >
                      {getCategoryLabel(category)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative z-10 rounded-2xl border border-gray-200/80 bg-white/85 p-4 lg:h-[124px]">
                <div className="mb-3 flex items-center gap-2">
                  <Filter size={15} className="text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Tip proizvoda
                  </span>
                </div>
                <div className="sm:hidden">
                  <MobileDropdown
                    ariaLabel="Odaberi tip proizvoda"
                    value={activeSubcategory}
                    onChange={(nextSubcategory) => setActiveSubcategory(nextSubcategory)}
                    options={subcategoryOptions.map((subcategory) => ({
                      value: subcategory,
                      label: subcategory,
                    }))}
                  />
                </div>
                <div className="hidden sm:block">
                  <div ref={subcategoryMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSubcategoryMenuOpen((previous) => !previous)}
                      aria-haspopup="dialog"
                      aria-expanded={isSubcategoryMenuOpen}
                      className="inline-flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-[#4a6bfe]/40 hover:text-[#2d4ed8]"
                    >
                      <span>
                        {activeSubcategory === "Sve"
                          ? "Odaberi podkategoriju"
                          : `Podkategorija: ${activeSubcategory}`}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isSubcategoryMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isSubcategoryMenuOpen ? (
                      <div className="absolute left-0 top-[calc(100%+0.6rem)] z-[95] w-[min(640px,calc(100vw-3rem))] rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,0.22)]">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                            Odaberi podkategoriju
                          </p>
                          {activeSubcategory !== "Sve" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSubcategory("Sve");
                                setIsSubcategoryMenuOpen(false);
                              }}
                              className="rounded-lg border border-[#c9d8ff] bg-[#f3f7ff] px-3 py-1.5 text-sm font-bold text-[#2d4ed8] transition-all duration-200 hover:border-[#9db6ff] hover:bg-[#eaf1ff]"
                            >
                              Očisti
                            </button>
                          ) : null}
                        </div>

                        <div className="max-h-[320px] overflow-y-auto py-1 pr-1">
                          <div className="flex flex-wrap justify-center gap-2">
                            {subcategoryOptions.map((subcategory) => (
                              <button
                                key={subcategory}
                                type="button"
                                onClick={() => {
                                  setActiveSubcategory(subcategory);
                                  setIsSubcategoryMenuOpen(false);
                                }}
                                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                  activeSubcategory === subcategory
                                    ? "border-transparent bg-[#4a6bfe] text-white shadow-[0_10px_18px_rgba(74,107,254,0.28)]"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-[#4a6bfe]/40 hover:bg-[#f8fbff] hover:text-[#2d4ed8]"
                                }`}
                              >
                                {subcategory}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white/85 p-4 lg:h-[124px] lg:text-right">
                <div className="mb-3 flex items-center gap-2 lg:justify-end">
                  <ArrowUpDown size={15} className="text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Sortiranje
                  </span>
                </div>
                <div className="sm:hidden">
                  <MobileDropdown
                    ariaLabel="Odaberi sortiranje"
                    value={sortBy}
                    onChange={(nextSort) => setSortBy(nextSort)}
                    options={(Object.keys(sortLabels) as SortOption[]).map((sortOption) => ({
                      value: sortOption,
                      label: sortLabels[sortOption],
                    }))}
                  />
                </div>
                <div className="hidden items-center gap-2 sm:flex sm:flex-nowrap sm:overflow-x-auto lg:justify-end">
                  {(Object.keys(sortLabels) as SortOption[]).map((sortOption) => (
                    <button
                      key={sortOption}
                      onClick={() => setSortBy(sortOption)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                        sortBy === sortOption
                          ? "border-transparent bg-[#4a6bfe] text-white shadow-[0_10px_18px_rgba(74,107,254,0.28)]"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#4a6bfe]/40 hover:bg-[#f8fbff] hover:text-[#2d4ed8]"
                      }`}
                    >
                      {sortLabels[sortOption]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>


          <div className="relative z-10">
            {isLoading ? (
              <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-bold text-gray-900">Učitavanje proizvoda...</p>
              </div>
            ) : loadError ? (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-bold text-red-700">{loadError}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-bold text-gray-900">Nema proizvoda za odabrani filter.</p>
                <p className="mt-2 text-sm text-gray-600">Odaberite drugu kategoriju ili sortiranje.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  return (
                    <article
                      key={product.id}
                      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-4 text-gray-900 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cfdcff] hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)] sm:p-5"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#edf3ff] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                      <div
                        className="relative mb-5 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-[#f8fbff] to-white"
                      >
                        <Image
                          src={getPrimaryProductImage(product)}
                          alt={product.name}
                          width={1200}
                          height={900}
                          className="h-60 w-full object-contain p-4 transition-transform duration-700 group-hover:scale-[1.03] sm:h-64"
                        />
                      </div>
                      <div className="relative flex-1">
                        <h3 className="text-[2rem] font-black leading-[1.05] tracking-tight text-[#111a34]">{product.name}</h3>
                        <p className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                            {getCategoryLabel(product.category)}
                          </span>
                          {product.subcategory?.trim() ? (
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#2d4ed8]">
                              {product.subcategory}
                            </span>
                          ) : null}
                        </p>
                        <p
                          className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base"
                        >
                          {product.shortDescription}
                        </p>
                      </div>

                      <div className="relative mt-5">
                        <div className="rounded-2xl border border-[#dce6ff] bg-gradient-to-br from-[#f7faff] to-[#eef4ff] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                            Cijena proizvoda
                          </p>
                          <p className="mt-1 text-2xl font-black tracking-tight">
                            {product.priceEur.toFixed(2)} EUR
                          </p>
                        </div>

                        <div className="mt-3">
                          <Link
                            href={`/proizvodi/${product.slug}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#c9d8ff] bg-white px-4 py-3 text-sm font-bold text-[#2d4ed8] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9db6ff] hover:bg-[#f3f7ff]"
                          >
                            Pogledaj detalje
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {!isLoading && !loadError ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-14 overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-br from-white via-blue-50/50 to-white p-7 shadow-[0_14px_40px_rgba(15,23,42,0.10)] sm:p-9"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#4a6bfe]">
                    Prošireni katalog
                  </p>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                    U ponudi imamo još puno više proizvoda brendova JOMA i GIVOVA.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
                    Uz artikle prikazane na webu, dostupni su i dodatni modeli iz službenih
                    kataloga. Za klubove, škole i tvrtke nudimo i uslugu tiska, odnosno
                    štampanja na odabranu robu.
                  </p>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Za kompletan katalog i personaliziranu ponudu, pošaljite upit.
                  </p>
                </div>

                <div className="flex shrink-0 items-center">
                  <Link
                    href="/kontakt"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#4a6bfe] px-6 py-3 font-bold text-white shadow-[0_10px_25px_rgba(74,107,254,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b5af0]"
                  >
                    Pošalji upit
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.section>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

