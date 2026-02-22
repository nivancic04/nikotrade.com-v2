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

function CategoryIcon({ category }: { category: ProductCategory }) {
  if (category === "Automirisi") return <SprayCan size={24} className="text-blue-400" />;
  if (category === "Sportska oprema") return <Shirt size={24} className="text-blue-400" />;
  return <Wine size={24} className="text-blue-400" />;
}

function getCategoryLabel(category: ProductCategory) {
  if (category === "Case") return "Čaše";
  return category;
}

function getAvailability(stock: number) {
  if (stock > 5) {
    return {
      label: "Imamo trenutno",
      dotClassName: "bg-emerald-500",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (stock > 0) {
    return {
      label: "Po potrebi",
      dotClassName: "bg-amber-500",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Trenutno nemamo",
    dotClassName: "bg-red-500",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  };
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

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] text-gray-900 selection:bg-[#4a6bfe] selection:text-white">
      <SiteHeader active="products" />

      <main className="relative flex-1 overflow-hidden pb-16 pt-24">
        <div className="pointer-events-none absolute -left-16 top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"></div>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/proizvodi"
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:text-gray-900 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
          >
            <ArrowLeft size={15} />
            Nazad na proizvode
          </Link>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:items-stretch lg:gap-6">
            <article className="relative h-full overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:p-5">
              <ProductImageGallery productName={product.name} images={product.images} />
            </article>

            <aside className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                  <CategoryIcon category={product.category} />
                </div>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                  {getCategoryLabel(product.category)}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-4xl xl:text-5xl">
                  {product.name}
                </h1>
                <p className="mt-2.5 text-base leading-relaxed text-gray-600 sm:text-lg">{product.description}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-3 transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/40">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Cijena</p>
                  <p className="mt-1.5 text-2xl font-black text-gray-900">{product.priceEur.toFixed(2)} EUR</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-3 transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/40">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Stanje</p>
                  <p className="mt-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${availability.badgeClassName}`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${availability.dotClassName}`}></span>
                      {availability.label}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 lg:text-[2rem]">Specifikacije</h2>
              </div>
              <div className="mt-4 space-y-2.5">
                <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-3.5 transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Materijal
                  </p>
                  <p className="mt-1.5 text-lg font-bold text-gray-900">{product.material}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-3.5 transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Trajanje
                  </p>
                  <p className="mt-1.5 text-lg font-bold text-gray-900">{product.duration}</p>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <ProductInquiryModal
                  productSlug={product.slug}
                  productName={product.name}
                  triggerLabel="Posalji upit za ovaj proizvod"
                  triggerClassName="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a6bfe] px-6 py-3 font-bold text-white shadow-[0_10px_30px_rgba(74,107,254,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b5af0]"
                />

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-2.5 text-center">
                    <Sparkles size={16} className="mx-auto text-[#4a6bfe]" />
                    <p className="mt-1.5 text-xs font-semibold text-gray-600">Premium</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-2.5 text-center">
                    <Clock3 size={16} className="mx-auto text-[#4a6bfe]" />
                    <p className="mt-1.5 text-xs font-semibold text-gray-600">Brza obrada</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-2.5 text-center">
                    <Package size={16} className="mx-auto text-[#4a6bfe]" />
                    <p className="mt-1.5 text-xs font-semibold text-gray-600">Sigurna dostava</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-3xl font-black tracking-tight text-gray-900">Slični proizvodi</h3>
              <Link href="/proizvodi" className="font-semibold text-[#4a6bfe] hover:text-[#2d4ed8]">
                Pogledaj sve
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedProducts.map((item) => (
                <article
                  key={item.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 text-gray-900 shadow-[0_10px_35px_rgba(15,23,42,0.08)] transition-all duration-300 hover:border-blue-100 hover:shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:p-6"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                  <div className="relative -mx-5 -mt-5 mb-5 overflow-hidden border-b border-gray-100 sm:-mx-6 sm:-mt-6">
                    <Image
                      src={getPrimaryProductImage(item)}
                      alt={item.name}
                      width={1200}
                      height={900}
                      className="h-64 w-full object-cover sm:h-72"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/80 via-white/10 to-transparent"></div>
                  </div>

                  <div className="relative mb-4 flex items-center justify-between">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-105">
                      <CategoryIcon category={item.category} />
                    </div>
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  <div className="relative flex-1">
                    <h4 className="text-2xl font-black tracking-tight sm:text-3xl">{item.name}</h4>
                    <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-gray-600 sm:text-base">
                      {item.shortDescription}
                    </p>
                  </div>

                  <div className="relative mt-5">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                        Cijena proizvoda
                      </p>
                      <p className="mt-1 text-2xl font-black tracking-tight">
                        {item.priceEur.toFixed(2)} EUR
                      </p>
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
