import Link from "next/link";
import type { NavKey } from "@/components/site-header";

type SiteFooterProps = {
  active?: NavKey;
};

export function SiteFooter({ active }: SiteFooterProps) {
  return (
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
                  Pocetna stranica
                </Link>
              </li>
              <li>
                <Link
                  href="/proizvodi"
                  className={`transition-colors hover:text-white ${active === "products" ? "text-[#4a6bfe]" : ""}`}
                >
                  Svi proizvodi
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className={`transition-colors hover:text-white ${active === "contact" ? "text-[#4a6bfe]" : ""}`}
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-5 font-bold tracking-tight text-white">Podrska</h5>
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
          <p>© 2026 Nikotrade WebShop. Sva prava pridrzana.</p>
          <span>Made with passion in Croatia</span>
        </div>
      </div>
    </footer>
  );
}
