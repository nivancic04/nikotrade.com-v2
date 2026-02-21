"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowRight, CircleDot, Database, Filter, Shirt, Wine } from "lucide-react";
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
  if (category === "Automirisi") return <CircleDot size={22} className="text-blue-400" />;
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
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                      activeCategory === category
                        ? "bg-[#4a6bfe] text-white shadow-[0_10px_20px_rgba(74,107,254,0.25)]"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-[#4a6bfe]/40 hover:text-[#4a6bfe]"
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
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                    sortBy === sortOption
                      ? "bg-gray-900 text-white"
                      : "border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  {sortLabels[sortOption]}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => {
              const featuredCard = product.featured;
              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 transition-all duration-300 ${
                    featuredCard
                      ? "border-gray-800 bg-gray-900 text-white shadow-2xl hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(15,23,42,0.35)]"
                      : "border-gray-100 bg-white text-gray-900 shadow-[0_10px_35px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(15,23,42,0.16)]"
                  }`}
                >
                  {featuredCard ? (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4a6bfe]/20 via-blue-900/10 to-transparent opacity-80"></div>
                  ) : null}
                  <div className="relative mb-6 flex items-center justify-between">
                    <div
                      className={`rounded-2xl p-4 ${
                        featuredCard
                          ? "border border-[#4a6bfe]/30 bg-[#4a6bfe]/20"
                          : "border border-blue-100 bg-blue-50"
                      }`}
                    >
                      <CategoryIcon category={product.category} />
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                        featuredCard
                          ? "bg-[#4a6bfe] text-white"
                          : "border border-gray-200 bg-white text-gray-500"
                      }`}
                    >
                      {product.category}
                    </span>
                  </div>

                  <div className="relative flex-1">
                    <h3 className="text-3xl font-black tracking-tight">{product.name}</h3>
                    <p
                      className={`mt-4 leading-relaxed ${
                        featuredCard ? "text-blue-100/85" : "text-gray-600"
                      }`}
                    >
                      {product.shortDescription}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                      <div
                        className={`rounded-xl border px-3 py-2 ${
                          featuredCard
                            ? "border-white/10 bg-white/5 text-blue-100"
                            : "border-gray-100 bg-[#F9FAFB] text-gray-700"
                        }`}
                      >
                        Cijena: <span className="font-bold">{product.priceEur.toFixed(2)} EUR</span>
                      </div>
                      <div
                        className={`rounded-xl border px-3 py-2 ${
                          featuredCard
                            ? "border-white/10 bg-white/5 text-blue-100"
                            : "border-gray-100 bg-[#F9FAFB] text-gray-700"
                        }`}
                      >
                        Stanje: <span className="font-bold">{product.stock}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/proizvodi/${product.slug}`}
                    className={`relative mt-7 inline-flex items-center gap-2 font-bold transition-all ${
                      featuredCard ? "text-white hover:text-blue-200" : "text-[#4a6bfe] hover:text-[#2c49d8]"
                    }`}
                  >
                    Pogledaj detalje
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter active="products" />
    </div>
  );
}
