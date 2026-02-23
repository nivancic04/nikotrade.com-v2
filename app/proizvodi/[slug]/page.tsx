import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, Package, Shirt, Sparkles, SprayCan, Wine } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ProductInquiryModal } from "@/components/product-inquiry-modal";
import {
  getPrimaryProductImage,
  type ProductCategory,
} from "@/lib/products-db";
import { getAllProductsFromStore, getProductBySlugFromStore } from "@/lib/products-store";

export const dynamic = "force-dynamic";

function CategoryIcon({ category }: { category: ProductCategory }) {
  if (category === "Automirisi") return <SprayCan size={22} className="text-blue-500" />;
  if (category === "Sportska oprema") return <Shirt size={22} className="text-blue-500" />;
  return <Wine size={22} className="text-blue-500" />;
}

function getCategoryLabel(category: ProductCategory) {
  if (category === "Case") return "Case";
  return category;
}

function getAvailability(stock: number) {
  if (stock > 5) {
    return {
      label: "Dostupno na lageru",
      dotClassName: "bg-emerald-500",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (stock > 0) {
    return {
      label: "Ogranicena kolicina na lageru",
      dotClassName: "bg-amber-500",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Trenutno nije dostupno",
    dotClassName: "bg-red-500",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  };
}

function hasMeaningfulValue(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 && normalized.toUpperCase() !== "N/A";
}

type DetailCardProps = {
  label: string;
  value: string;
  emphasized?: boolean;
};

function DetailCard({ label, value, emphasized = false }: DetailCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className={`mt-1.5 leading-tight text-gray-900 ${emphasized ? "text-2xl font-black" : "text-base font-bold"}`}>
        {value}
      </p>
    </div>
  );
}

type ProductDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;
  const product = await getProductBySlugFromStore(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getAllProductsFromStore())
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 3);

  const availability = getAvailability(product.stock);
  const showScent = hasMeaningfulValue(product.scent);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FD] text-gray-900 selection:bg-[#4a6bfe] selection:text-white">
      <SiteHeader active="products" />

      <main className="relative flex-1 overflow-hidden pb-16 pt-24 sm:pb-20">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl"></div>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/proizvodi"
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:text-gray-900"
          >
            <ArrowLeft size={15} />
            Nazad na proizvode
          </Link>

          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6 lg:p-8">
            <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-gradient-to-b from-blue-100/60 to-transparent blur-3xl"></div>

            <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-8">
              <article className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-4 lg:sticky lg:top-28 lg:self-start">
                <ProductImageGallery productName={product.name} images={product.images} />
              </article>

              <aside className="flex h-full flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
                    <CategoryIcon category={product.category} />
                    {getCategoryLabel(product.category)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${availability.badgeClassName}`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${availability.dotClassName}`}></span>
                    {availability.label}
                  </span>
                </div>

                <div>
                  <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-[3.1rem] lg:leading-[1.02]">
                    {product.name}
                  </h1>
                  <p className="mt-2 text-base font-semibold text-gray-600 sm:text-lg">{product.shortDescription}</p>
                </div>

                <div className="rounded-3xl border border-gray-200/80 bg-gradient-to-b from-white to-slate-50/70 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">Opis proizvoda</p>
                  <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-gray-700 sm:text-base">{product.description}</p>
                </div>

                <div className={`grid gap-2.5 ${showScent ? "sm:grid-cols-2" : ""}`}>
                  <DetailCard label="Cijena" value={`${product.priceEur.toFixed(2)} EUR`} emphasized />
                  {showScent ? <DetailCard label="Miris" value={product.scent.trim()} /> : null}
                </div>

                <div className="mt-auto rounded-2xl border border-gray-200/80 bg-white/90 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
                  <ProductInquiryModal
                    productSlug={product.slug}
                    productName={product.name}
                    triggerLabel="Posalji upit za ovaj proizvod"
                    triggerClassName="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a6bfe] px-6 py-3 font-bold text-white shadow-[0_8px_22px_rgba(74,107,254,0.24)] transition-colors duration-300 hover:bg-[#3b5af0]"
                  />

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-gray-200/70 bg-slate-50 p-2 text-center">
                      <Sparkles size={16} className="mx-auto text-[#4a6bfe]" />
                      <p className="mt-1 text-xs font-semibold text-gray-600">Premium</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/70 bg-slate-50 p-2 text-center">
                      <Clock3 size={16} className="mx-auto text-[#4a6bfe]" />
                      <p className="mt-1 text-xs font-semibold text-gray-600">Brza obrada</p>
                    </div>
                    <div className="rounded-xl border border-gray-200/70 bg-slate-50 p-2 text-center">
                      <Package size={16} className="mx-auto text-[#4a6bfe]" />
                      <p className="mt-1 text-xs font-semibold text-gray-600">Sigurna dostava</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">Slicni proizvodi</h3>
              <Link href="/proizvodi" className="font-semibold text-[#4a6bfe] hover:text-[#2d4ed8]">
                Pogledaj sve
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((item) => (
                <article
                  key={item.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white/90 p-4 text-gray-900 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_16px_44px_rgba(15,23,42,0.14)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                  <div className="relative -mx-4 -mt-4 mb-4 overflow-hidden border-b border-gray-100">
                    <Image
                      src={getPrimaryProductImage(item)}
                      alt={item.name}
                      width={1200}
                      height={900}
                      className="h-52 w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/80 via-white/10 to-transparent"></div>
                  </div>

                  <div className="relative mb-3 flex items-center justify-between">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-105">
                      <CategoryIcon category={item.category} />
                    </div>
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  <div className="relative flex-1">
                    <h4 className="text-xl font-black tracking-tight sm:text-2xl">{item.name}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.shortDescription}</p>
                  </div>

                  <div className="relative mt-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                        Cijena proizvoda
                      </p>
                      <p className="mt-1 text-2xl font-black tracking-tight">{item.priceEur.toFixed(2)} EUR</p>
                    </div>

                    <div className="mt-3">
                      <Link
                        href={`/proizvodi/${item.slug}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#4a6bfe]/20 bg-[#4a6bfe]/10 px-4 py-3 text-sm font-bold text-[#2d4ed8] transition-all duration-300 hover:border-[#4a6bfe]/40 hover:bg-[#4a6bfe]/15"
                      >
                        Pogledaj detalje
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter active="products" />
    </div>
  );
}
