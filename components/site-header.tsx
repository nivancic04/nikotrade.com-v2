"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export type NavKey = "home" | "products" | "contact";

type SiteHeaderProps = {
  active: NavKey;
};

const navItems: Array<{ key: NavKey; href: string; label: string }> = [
  { key: "home", href: "/", label: "Pocetna" },
  { key: "products", href: "/proizvodi", label: "Proizvodi" },
  { key: "contact", href: "/kontakt", label: "Kontakt" },
];

export function SiteHeader({ active }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/85 shadow-lg backdrop-blur-2xl transition-all duration-300 ease-in-out ${isScrolled ? "py-4" : "py-6"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="z-50 flex shrink-0 items-center"
          >
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter text-white transition-colors duration-300 hover:text-gray-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              NIKO<span className="text-[#4a6bfe]">TRADE</span>
            </Link>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="hidden space-x-10 font-medium tracking-tight text-gray-200 md:flex"
          >
            {navItems.map((item) => {
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative transition-colors group ${isActive ? "text-[#4a6bfe]" : "hover:text-white"}`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] transition-all ${isActive ? "w-full bg-[#4a6bfe]" : "w-0 bg-white group-hover:w-full"}`}
                  ></span>
                </Link>
              );
            })}
          </motion.nav>

          <div className="z-50 flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((previous) => !previous)}
              className="rounded-md p-2 text-white transition-colors hover:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 top-full w-full overflow-hidden border-b border-gray-200 bg-white shadow-xl md:hidden"
          >
            <nav className="flex flex-col space-y-4 px-4 pb-8 pt-4">
              {navItems.map((item) => {
                const isActive = item.key === active;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`border-b border-gray-100 pb-2 text-lg transition-colors ${isActive ? "font-bold text-[#4a6bfe]" : "font-medium text-gray-700 hover:text-[#4a6bfe]"}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
