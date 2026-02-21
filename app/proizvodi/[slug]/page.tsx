import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleDot, Clock3, Package, Shirt, Sparkles, Wine } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductInquiryModal } from "@/components/product-inquiry-modal";
import { getAllProducts, getProductBySlug, type ProductCategory } from "@/lib/products-db";

function CategoryIcon({ category }: { category: ProductCategory }) {
  if (category === "Automirisi") return <CircleDot size={24} className="text-blue-400" />;
  if (category === "Sportska oprema") return <Shirt size={24} className="text-blue-400" />;
  return <Wine size={24} className="text-blue-400" />;
}

type ProductDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getAllProducts()
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] text-gray-900 selection:bg-[#4a6bfe] selection:text-white">
      <SiteHeader active="products" />

      <main className="relative flex-1 overflow-hidden pb-24 pt-36">
        <div className="pointer-events-none absolute -left-16 top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"></div>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/proizvodi"
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:text-gray-900 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
          >
            <ArrowLeft size={15} />
            Nazad na proizvode
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <article className="group relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900 p-8 shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.4)] sm:p-10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4a6bfe]/20 via-blue-900/10 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-100"></div>

              <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={1200}
                  height={900}
                  className="h-[280px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[340px]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-900/75 via-gray-900/20 to-transparent"></div>
              </div>

              <div className="relative mb-6 flex items-center justify-between">
                <div className="rounded-2xl border border-[#4a6bfe]/30 bg-[#4a6bfe]/20 p-4 shadow-[0_0_24px_rgba(74,107,254,0.2)] transition-transform duration-500 group-hover:scale-105">
                  <CategoryIcon category={product.category} />
                </div>
                <span className="rounded-full bg-[#4a6bfe] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white">
                  {product.category}
                </span>
              </div>

              <div className="relative">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{product.name}</h1>
                <p className="mt-5 text-lg leading-relaxed text-blue-100/90">{product.description}</p>
              </div>

              <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100/60">Cijena</p>
                  <p className="mt-2 text-2xl font-black text-white">{product.priceEur.toFixed(2)} EUR</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100/60">Stanje</p>
                  <p className="mt-2 text-2xl font-black text-white">{product.stock} kom</p>
                </div>
              </div>

            </article>

            <aside className="rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:p-10">
              <h2 className="text-3xl font-black tracking-tight text-gray-900">Specifikacije</h2>
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Miris / aroma
                  </p>
                  <p className="mt-2 text-lg font-bold text-gray-900">{product.scent}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Materijal
                  </p>
                  <p className="mt-2 text-lg font-bold text-gray-900">{product.material}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Trajanje
                  </p>
                  <p className="mt-2 text-lg font-bold text-gray-900">{product.duration}</p>
                </div>
              </div>

              <ProductInquiryModal
                productSlug={product.slug}
                productName={product.name}
                triggerLabel="Posalji upit za ovaj proizvod"
                triggerClassName="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a6bfe] px-6 py-3 font-bold text-white shadow-[0_10px_30px_rgba(74,107,254,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b5af0]"
              />

              <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Napomena</p>
                <p className="mt-1">
                  Ovo je testni katalog povezan na lokalnu listu podataka. Zamjena sa pravom bazom je
                  moguca bez izmjene UI izgleda.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-3 text-center">
                  <Sparkles size={16} className="mx-auto text-[#4a6bfe]" />
                  <p className="mt-2 text-xs font-semibold text-gray-600">Premium</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-3 text-center">
                  <Clock3 size={16} className="mx-auto text-[#4a6bfe]" />
                  <p className="mt-2 text-xs font-semibold text-gray-600">Brza obrada</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-3 text-center">
                  <Package size={16} className="mx-auto text-[#4a6bfe]" />
                  <p className="mt-2 text-xs font-semibold text-gray-600">Sigurna dostava</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-3xl font-black tracking-tight text-gray-900">Slicni proizvodi</h3>
              <Link href="/proizvodi" className="font-semibold text-[#4a6bfe] hover:text-[#2d4ed8]">
                Pogledaj sve
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/proizvodi/${item.slug}`}
                  className="group rounded-3xl border border-gray-100 bg-white p-0 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_45px_rgba(15,23,42,0.16)]"
                >
                  <div className="relative overflow-hidden rounded-t-3xl border-b border-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={1200}
                      height={900}
                      className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-transparent"></div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 inline-flex rounded-xl border border-blue-100 bg-blue-50 p-3 transition-transform duration-300 group-hover:scale-105">
                      <CategoryIcon category={item.category} />
                    </div>
                    <h4 className="text-xl font-black tracking-tight text-gray-900">{item.name}</h4>
                    <p className="mt-2 min-h-[66px] text-sm leading-relaxed text-gray-600">{item.shortDescription}</p>
                    <p className="mt-4 font-bold text-[#4a6bfe] transition-colors group-hover:text-[#2d4ed8]">
                      Detalji proizvoda
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter active="products" />
    </div>
  );
}
