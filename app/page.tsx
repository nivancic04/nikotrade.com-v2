"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleDot, Shirt, Wine, Instagram, ArrowRight, Menu, X } from "lucide-react";
import { motion, useScroll, useTransform, Variants, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const yHeroText = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHeroText = useTransform(scrollY, [0, 300], [1, 0]);

  // Handle header glassmorphism effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#F9FAFB] text-gray-900 selection:bg-[#4a6bfe] selection:text-white">
      {/* Header - Glassmorphism */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out bg-[#0a0a0a]/85 backdrop-blur-2xl border-b border-white/10 shadow-lg ${isScrolled ? "py-4" : "py-6"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-shrink-0 flex items-center z-50"
            >
              <Link
                href="/"
                className="font-black text-2xl tracking-tighter text-white hover:text-gray-200 transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                NIKO<span className="text-[#4a6bfe]">TRADE</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden md:flex space-x-10 text-gray-200 font-medium tracking-tight"
            >
              <Link href="/" className="text-[#4a6bfe] transition-colors relative group">
                Početna
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#4a6bfe]"></span>
              </Link>
              <Link href="/proizvodi" className="hover:text-white transition-colors relative group">
                Proizvodi
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/kontakt" className="hover:text-white transition-colors relative group">
                Kontakt
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all group-hover:w-full"></span>
              </Link>
            </motion.nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center z-50">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md focus:outline-none transition-colors text-white hover:text-gray-300"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl overflow-hidden pointer-events-auto"
            >
              <nav className="flex flex-col px-4 pt-4 pb-8 space-y-4">
                <Link
                  href="/"
                  className="text-lg font-bold text-[#4a6bfe] border-b border-gray-100 pb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Početna stranica
                </Link>
                <Link
                  href="/proizvodi"
                  className="text-lg font-medium text-gray-700 hover:text-[#4a6bfe] border-b border-gray-100 pb-2 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Svi Proizvodi
                </Link>
                <Link
                  href="/kontakt"
                  className="text-lg font-medium text-gray-700 hover:text-[#4a6bfe] border-b border-gray-100 pb-2 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kontakt
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-[100svh] min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image with Parallax & Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/hero-bg.png"
            alt="Hero Background"
            fill
            className="object-cover object-center scale-105"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/90 via-[#4a6bfe]/80 to-blue-500/50 mix-blend-multiply"></div>
          {/* Subtle animated glow overlay */}
          <div className="absolute inset-0 bg-radial-gradient from-blue-600/20 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Hero Content */}
        <motion.div
          style={{ y: yHeroText, opacity: opacityHeroText }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.h1
              variants={fadeUp}
              className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-8 drop-shadow-[0_0_30px_rgba(74,107,254,0.4)]"
            >
              Mirisi <br />u bojama <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white drop-shadow-[0_0_40px_rgba(147,197,253,0.5)]">
                vaših najdražih.
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-2xl text-blue-50 font-medium mb-10 max-w-xl leading-relaxed drop-shadow-[0_0_15px_rgba(147,197,253,0.3)]"
            >
              Jedina destinacija za personalizirane automirise u obliku Vašeg omiljenog dresa.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/proizvodi"
                className="group flex items-center justify-center gap-2 bg-white text-[#4a6bfe] font-bold text-lg py-4 px-8 rounded-full shadow-[0_0_40px_rgba(74,107,254,0.3),0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_0_60px_rgba(74,107,254,0.6),0_12px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.05] hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-[#4a6bfe]/30"
              >
                Istraži ponudu
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-all duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <motion.span
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/80 text-xs font-semibold tracking-widest uppercase drop-shadow-[0_0_10px_rgba(147,197,253,0.4)]"
          >
            Skrolaj
          </motion.span>
          <motion.div
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-12 bg-gradient-to-b from-blue-300/80 to-transparent drop-shadow-[0_0_8px_rgba(147,197,253,0.4)]"
          ></motion.div>
        </motion.div>
      </section>

      {/* Offerings Section */}
      <section className="relative w-full py-32 px-4 bg-white" id="ponuda">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 mb-6">
              Što nudimo?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Spoj vrhunskog dizajna i kvalitete koja traje. Odaberite proizvod koji vam najviše odgovara.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            {/* Left Card: Sportska Oprema */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl p-10 flex flex-col border border-gray-100 relative group overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(74,107,254,0.15)] hover:border-blue-300/60 hover:z-10"
            >
              {/* Glowy gradient overlay on hover */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-100/40 via-blue-200/30 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-500"></div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 text-[#4a6bfe] p-5 rounded-2xl mb-8 w-fit shadow-inner group-hover:bg-blue-200/60 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Shirt size={40} className="stroke-[1.5] group-hover:text-blue-500 group-hover:drop-shadow-[0_0_8px_rgba(74,107,254,0.4)] transition-all duration-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-[#4a6bfe] transition-colors duration-300">Sportska Oprema</h3>
              <p className="text-gray-500 text-base leading-relaxed mb-6 flex-grow group-hover:text-gray-700 transition-colors duration-300">
                Od obuće do rekvizita - pronađite najkvalitetniju opremu za Vaše iduće sportske uspjehe na terenu.
              </p>
              <Link href="/proizvodi" className="font-bold text-[#4a6bfe] flex items-center gap-2 group-hover:gap-4 transition-all duration-300 group-hover:text-blue-700 group-hover:underline group-hover:underline-offset-4">
                Saznaj više <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-blue-700 transition-all duration-300" />
              </Link>
            </motion.div>

            {/* Center Card - Featured: Automirisi */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -10 }}
              className="bg-gray-900 rounded-3xl p-10 flex flex-col shadow-2xl transition-all duration-300 relative group overflow-hidden md:-mt-8 md:mb-8 border border-gray-800 hover:scale-[1.04] hover:shadow-[0_8px_50px_rgba(74,107,254,0.25)] hover:border-[#4a6bfe]/60 hover:z-10"
            >
              {/* Glowy gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#4a6bfe]/30 via-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              {/* Special highlight badge */}
              <div className="absolute top-6 right-6 bg-[#4a6bfe] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full shadow-lg group-hover:scale-110 group-hover:bg-blue-700 transition-all duration-300">
                Najprodavanije
              </div>

              <div className="bg-[#4a6bfe]/20 text-[#4a6bfe] p-5 rounded-2xl mb-8 w-fit backdrop-blur-sm border border-[#4a6bfe]/30 shadow-[0_0_30px_rgba(74,107,254,0.3)] group-hover:bg-[#4a6bfe]/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <CircleDot size={40} className="stroke-[1.5] text-blue-400 group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(74,107,254,0.6)] transition-all duration-300" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-[#4a6bfe] transition-colors duration-300">Automirisi - Dresovi</h3>
              <p className="text-gray-300 text-base leading-relaxed mb-6 flex-grow group-hover:text-blue-100 transition-colors duration-300">
                Apsolutni hit! Personalizirani mirisi za auto u obliku dresa Vašeg kluba. Dizajn i dugotrajnost mirisa zagarantirani.
              </p>
              <Link href="/proizvodi" className="font-bold text-white flex items-center gap-2 group-hover:gap-4 transition-all duration-300 group-hover:text-[#4a6bfe] group-hover:underline group-hover:underline-offset-4">
                Naruči odmah <ArrowRight className="w-4 h-4 text-[#4a6bfe] group-hover:translate-x-1 group-hover:text-white transition-all duration-300" />
              </Link>
            </motion.div>

            {/* Right Card: Gravirane čaše */}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl p-10 flex flex-col border border-gray-100 relative group overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(168,85,247,0.15)] hover:border-purple-300/60 hover:z-10"
            >
              {/* Glowy gradient overlay on hover */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-100/40 via-purple-200/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-50 rounded-tr-full -z-10 transition-transform group-hover:scale-150 duration-500"></div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 text-purple-600 p-5 rounded-2xl mb-8 w-fit shadow-inner group-hover:bg-purple-200/60 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <Wine size={40} className="stroke-[1.5] group-hover:text-purple-700 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-all duration-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-purple-700 transition-colors duration-300">Gravirane čaše</h3>
              <p className="text-gray-500 text-base leading-relaxed mb-6 flex-grow group-hover:text-gray-700 transition-colors duration-300">
                Unikatne i personalizirane čaše visoke kvalitete. Savršen poklon za sve Vaše posebne prigode i proslave.
              </p>
              <Link href="/proizvodi" className="font-bold text-purple-600 flex items-center gap-2 group-hover:gap-4 transition-all duration-300 group-hover:text-purple-900 group-hover:underline group-hover:underline-offset-4">
                Saznaj više <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-purple-900 transition-all duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Partners Section - Balanced Logos */}
      <section className="py-24 px-4 bg-[#F9FAFB] border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Ponosni Partneri
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Službeni mirisi hrvatskih prvoligaša
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-32">
            {/* Dinamo Zagreb */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 mb-8 transition-transform duration-500 ease-out group-hover:-translate-y-4 group-hover:scale-105">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>

                {/* Visual size adjustment for Dinamo crest using scale-75 */}
                <div className="relative w-full h-full scale-75">
                  <Image
                    src="/img/dinamozagreb.png"
                    alt="GNK Dinamo Zagreb Logo"
                    fill
                    className="object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-in-out drop-shadow-sm group-hover:drop-shadow-xl"
                  />
                </div>
              </div>
              <h4 className="font-black text-gray-900 text-xl tracking-tight">GNK Dinamo Zagreb</h4>
              <p className="text-gray-500 text-sm mt-2">Službeni partner</p>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              whileInView={{ height: "160px", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"
            ></motion.div>

            {/* Slaven Belupo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 mb-8 transition-transform duration-500 ease-out group-hover:-translate-y-4 group-hover:scale-105">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>

                {/* Slaven is naturally wider, no scale reduction needed here relative to Dinamo's scale-75 */}
                <div className="relative w-full h-full">
                  <Image
                    src="/img/SlavenBelupo.png"
                    alt="NK Slaven Belupo Logo"
                    fill
                    className="object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-in-out drop-shadow-sm group-hover:drop-shadow-xl"
                  />
                </div>
              </div>
              <h4 className="font-black text-gray-900 text-xl tracking-tight">NK Slaven Belupo</h4>
              <p className="text-gray-500 text-sm mt-2">Službeni partner</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Banner - Sleek Inline Redesign */}
      <section className="w-full py-16 px-4 bg-white relative z-10 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-3xl p-8 md:p-12 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-center justify-between gap-8"
          >
            {/* Decorative background glows */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-6 text-center md:text-left">
              <div className="hidden md:flex w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl items-center justify-center shrink-0">
                <Instagram size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight flex items-center justify-center md:justify-start gap-3">
                  <span className="md:hidden"><Instagram size={24} className="text-white" /></span>
                  Pratite nas na Instagramu
                </h2>
                <p className="text-gray-400 font-medium max-w-md">
                  Zavirite iza kulisa i ne propustite najnovije proizvode i sportske akcije.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="relative z-10 shrink-0">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-white text-gray-900 font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                <span>Zaprati profil</span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#0A0A0A] border-t border-white/10 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="font-black text-white text-3xl tracking-tighter mb-6 block">
                NIKO<span className="text-[#4a6bfe]">TRADE</span>
              </Link>
              <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
                Jedina destinacija za premium automirise u bojama i dizajnu omiljenih sportskih klubova. Inovacija i kvaliteta bez kompromisa.
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6 tracking-tight">Navigacija</h5>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Početna stranica</Link></li>
                <li><Link href="/proizvodi" className="hover:text-white transition-colors">Svi proizvodi</Link></li>
                <li><Link href="/o-nama" className="hover:text-white transition-colors">O nama</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6 tracking-tight">Podrška</h5>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link></li>
                <li><Link href="/dostava" className="hover:text-white transition-colors">Dostava i povrat</Link></li>
                <li><Link href="/politika-privatnosti" className="hover:text-white transition-colors">Politika privatnosti</Link></li>
              </ul>
            </div>
          </div>

          <div className="w-full h-px bg-white/10 mb-8"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-500">
            <p>© 2026 Nikotrade WebShop. Sva prava pridržana.</p>
            <div className="flex gap-4">
              <span>Made with passion in Croatia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
