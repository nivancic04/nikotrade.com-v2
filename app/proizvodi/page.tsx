"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpDown, Filter } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrimaryProductImage, type ProductCategory, type ProductRecord } from "@/lib/products-db";

const categoryOptions: Array<"Sve" | ProductCategory> = [
  "Sve",
  "Automirisi",
  "Sportska oprema",
  "Case",
];

type SortOption = "featured" | "priceAsc" | "priceDesc";

const sortLabels: Record<SortOption, string> = {
  featured: "Istaknuti",
  priceAsc: "Cijena: niža",
  priceDesc: "Cijena: viša",
};

function getCategoryLabel(category: "Sve" | ProductCategory) {
  if (category === "Case") return "Čaše";
  return category;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeCategory, setActiveCategory] = useState<"Sve" | ProductCategory>("Sve");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

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
            setLoadError(payload?.error ?? "NeuspjeĂ„Ä…Ă‹â€ˇno uÄ‚â€žÄąÂ¤itavanje proizvoda.");
            setProducts([]);
          }
          return;
        }

        if (!cancelled) {
          setProducts(payload?.products ?? []);
        }
      } catch {
        if (!cancelled) {
          setLoadError("UÄ‚â€žÄąÂ¤itavanje proizvoda trenutno nije dostupno.");
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

  const filteredProducts = useMemo(() => {
    const byCategory =
      activeCategory === "Sve"
        ? [...products]
        : products.filter((product) => product.category === activeCategory);

    if (sortBy === "priceAsc") {
      byCategory.sort((a, b) => a.priceEur - b.priceEur);
    } else if (sortBy === "priceDesc") {
      byCategory.sort((a, b) => b.priceEur - a.priceEur);
    } else {
      byCategory.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return byCategory;
  }, [activeCategory, products, sortBy]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] text-gray-900 selection:bg-[#4a6bfe] selection:text-white">
      <SiteHeader active="products" />

      <main className="relative flex-1 overflow-hidden pb-24 pt-36">
        <div className="pointer-events-none absolute -left-16 top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"></div>

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
            className="mb-10 rounded-3xl border border-blue-100/70 bg-gradient-to-br from-white via-blue-50/30 to-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Filter size={15} className="text-gray-500" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Kategorija
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                        activeCategory === category
                          ? "border-transparent bg-[#4a6bfe] text-white shadow-[0_10px_20px_rgba(74,107,254,0.25)]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#4a6bfe]/40 hover:text-[#4a6bfe]"
                      }`}
                    >
                      {getCategoryLabel(category)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:text-right">
                <div className="mb-3 flex items-center gap-2 lg:justify-end">
                  <ArrowUpDown size={15} className="text-gray-500" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Sortiranje
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {(Object.keys(sortLabels) as SortOption[]).map((sortOption) => (
                    <button
                      key={sortOption}
                      onClick={() => setSortBy(sortOption)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                        sortBy === sortOption
                          ? "border-transparent bg-gray-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {sortLabels[sortOption]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            {isLoading ? (
              <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
                <p className="text-lg font-bold text-gray-900">UÄ‚â€žÄąÂ¤itavanje proizvoda...</p>
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
                      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 text-gray-900 shadow-[0_10px_35px_rgba(15,23,42,0.08)] transition-all duration-300 hover:border-blue-100 hover:shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:p-6"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                      <div
                        className="relative -mx-5 -mt-5 mb-5 overflow-hidden border-b border-gray-100 sm:-mx-6 sm:-mt-6"
                      >
                        <Image
                          src={getPrimaryProductImage(product)}
                          alt={product.name}
                          width={1200}
                          height={900}
                          className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] sm:h-72"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/80 via-white/10 to-transparent"></div>
                        {product.featured ? (
                          <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2d4ed8] shadow-sm">
                            Istaknuto
                          </span>
                        ) : null}
                      </div>
                      <div className="relative flex-1">
                        <h3 className="text-2xl font-black tracking-tight sm:text-3xl">{product.name}</h3>
                        <p className="mt-2">
                          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                            {getCategoryLabel(product.category)}
                          </span>
                        </p>
                        <p
                          className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base"
                        >
                          {product.shortDescription}
                        </p>
                      </div>

                      <div className="relative mt-5">
                        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
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
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#4a6bfe]/20 bg-[#4a6bfe]/10 px-4 py-3 text-sm font-bold text-[#2d4ed8] transition-all duration-300 hover:border-[#4a6bfe]/40 hover:bg-[#4a6bfe]/15"
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
        </section>
      </main>

      <SiteFooter active="products" />
    </div>
  );
}
