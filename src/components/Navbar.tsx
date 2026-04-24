'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Home, Menu, X, Globe, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/listings', label: t('nav_listings') },
    { href: '/about', label: t('nav_about') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all border-b ${
        scrolled ? 'bg-white/95 backdrop-blur-md border-border-soft py-3 shadow-sm' : 'bg-white border-transparent py-5'
      }`}
    >
      <div className="container px-6 mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          id="navbar-logo" 
          className="flex items-center gap-2 group transition-transform active:scale-95"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            <Home size={22} strokeWidth={2.5} />
          </div>
          <span className="font-display font-black text-xl tracking-tight text-primary">
            LoyerSûr <span className="text-accent">CI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-black text-text-main hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="h-6 w-px bg-border-soft" />

          <div className="flex items-center gap-4">
            {/* Language toggle */}
            <button
              id="lang-toggle"
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-border-soft text-xs font-black text-text-main hover:bg-white hover:border-primary hover:text-primary transition-all"
            >
              <Globe size={14} />
              {lang === 'fr' ? 'FR' : 'EN'}
            </button>

            <Link 
              href="/auth/login" 
              className="flex items-center gap-2 text-sm font-black text-text-main hover:text-primary transition-colors"
            >
              <LogIn size={16} />
              {t('nav_login')}
            </Link>

            <Link href="/auth/signup" className="btn-primary py-2 px-5 text-sm">
              {t('nav_signup')}
            </Link>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-border-soft bg-white/50"
          >
            {lang === 'fr' ? '🇫🇷' : '🇬🇧'}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-border-soft overflow-hidden"
          >
            <div className="container px-6 py-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-black text-text-main p-2 hover:bg-bg-cream rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border-soft my-2" />
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-lg font-black text-text-main p-2"
              >
                <LogIn size={20} />
                {t('nav_login')}
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMenuOpen(false)}
                className="btn-primary w-full py-4 text-lg mt-2"
              >
                {t('nav_signup')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
