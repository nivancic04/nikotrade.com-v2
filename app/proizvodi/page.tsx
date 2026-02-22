"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowRight, Database, Filter, Shirt, SprayCan, Wine } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAllProducts, type ProductCategory } from "@/lib/products-db";

const categoryOptions: Array<"Sve" | ProductCategory> = [
  "Sve",
  "Automirisi",
  "Sportska oprema",
  "Case",
];

type SortOption = "featured" | "priceAsc" | "priceDesc";

const sortLabels: Record<SortOption, string> = {
  featured: "Istaknuti",
  priceAsc: "Cijena: niza",
  priceDesc: "Cijena: visa",
};

function CategoryIcon({ category }: { category: ProductCategory }) {
  if (category === "Automirisi") return <SprayCan size={22} className="text-blue-400" />;
  if (category === "Sportska oprema") return <Shirt size={22} className="text-blue-400" />;
  return <Wine size={22} className="text-blue-400" />;
}

export default function ProductsPage() {
  const products = getAllProducts();
  const [activeCategory, setActiveCategory] = useState<"Sve" | ProductCategory>("Sve");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-5xl font-black tracking-tighter text-gray-900 sm:text-6xl">
              Svi proizvodi
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-500">
              Testni katalog iz lokalne tablice proizvoda. Svaki proizvod ima svoju
              detaljnu stranicu i spreman je za kasniji prelazak na pravu bazu podataka.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mb-10 rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                <Database size={16} className="text-[#4a6bfe]" />
                Izvor podataka: testna products table ({products.length} zapisa)
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter size={15} className="text-gray-500" />
                <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Kategorija
                </span>
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                      activeCategory === category
                        ? "bg-[#4a6bfe] text-white shadow-[0_10px_20px_rgba(74,107,254,0.25)]"
                        : "border border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-[#4a6bfe]/40 hover:text-[#4a6bfe] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                Sortiranje
              </span>
              {(Object.keys(sortLabels) as SortOption[]).map((sortOption) => (
                <button
                  key={sortOption}
                  onClick={() => setSortBy(sortOption)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
                    sortBy === sortOption
                      ? "bg-gray-900 text-white"
                      : "border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {sortLabels[sortOption]}
                </button>
              ))}
            </div>
          </motion.div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
              <p className="text-lg font-bold text-gray-900">Nema proizvoda za odabrani filter.</p>
              <p className="mt-2 text-sm text-gray-600">Odaberite drugu kategoriju ili sortiranje.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, index) => {
                return (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: Math.min(index * 0.04, 0.2) }}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 text-gray-900 shadow-[0_10px_35px_rgba(15,23,42,0.08)] transition-all duration-300 hover:border-blue-100 hover:shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:p-6"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                    <div
                      className="relative -mx-5 -mt-5 mb-5 overflow-hidden border-b border-gray-100 sm:-mx-6 sm:-mt-6"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={1200}
                        height={900}
                        className="h-64 w-full object-cover sm:h-72"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/80 via-white/10 to-transparent"></div>
                    </div>

                    <div className="relative mb-4 flex items-center justify-between">
                      <div
                        className="rounded-2xl border border-blue-100 bg-blue-50 p-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-105"
                      >
                        <CategoryIcon category={product.category} />
                      </div>
                      <span
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-500"
                      >
                        {product.category}
                      </span>
                    </div>

                    <div className="relative flex-1">
                      <h3 className="text-2xl font-black tracking-tight sm:text-3xl">{product.name}</h3>
                      <p
                        className="mt-3 min-h-[64px] text-sm leading-relaxed text-gray-600 sm:text-base"
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
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <SiteFooter active="products" />
    </div>
  );
}
