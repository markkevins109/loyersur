'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Home, Menu, X, LogIn, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        supabase.from('profiles').select('role').eq('id', data.user.id).single().then(({ data: p }) => {
          if (p) setRole(p.role);
          setLoadingAuth(false);
        });
      } else {
        setLoadingAuth(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data: p }) => {
          if (p) setRole(p.role);
          setLoadingAuth(false);
        });
      } else {
        setUser(null);
        setRole(null);
        setLoadingAuth(false);
      }
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/listings', label: t('nav_listings') },
    { href: '/about', label: t('nav_about') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/80 backdrop-blur-xl border-b border-border-soft shadow-[0_2px_20px_rgba(26,26,24,0.07)] py-3'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl px-6 mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          id="navbar-logo"
          className="flex items-center gap-2.5 group transition-all active:scale-95"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold text-white shadow-md shadow-gold/30 group-hover:shadow-gold/50 transition-shadow duration-300">
            <Home size={18} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-charcoal">
            LoyerSûr <span className="text-gold">CI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-text-muted hover:text-charcoal px-4 py-2 rounded-xl hover:bg-bg-section transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            {/* List your property — key growth surface */}
            <Link
              href="/dashboard/landlord"
              className="flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-dark px-4 py-2 rounded-xl hover:bg-gold-soft transition-all duration-200"
            >
              <PlusCircle size={16} strokeWidth={2.5} />
              {lang === 'fr' ? 'Publier un bien' : 'List a property'}
            </Link>
          </div>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              id="lang-toggle"
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-bold text-text-muted hover:border-gold/60 hover:text-gold hover:bg-gold-soft transition-all duration-200 shadow-sm"
            >
              <span className="text-base leading-none">{lang === 'fr' ? '🇨🇮' : '🇬🇧'}</span>
              <span>{lang === 'fr' ? 'FR' : 'EN'}</span>
            </button>

            {loadingAuth ? (
              <div className="w-32 h-9" />
            ) : user ? (
              <>
                <Link
                  href={role === 'tenant' ? '/dashboard/tenant' : '/dashboard/landlord'}
                  className="text-sm font-semibold text-text-muted hover:text-charcoal transition-colors"
                >
                  {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-xl text-sm font-bold border border-border text-text-main hover:bg-bg-section transition-all"
                >
                  {lang === 'fr' ? 'Déconnexion' : 'Log out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-charcoal transition-colors"
                >
                  <LogIn size={15} />
                  {t('nav_login')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-gold py-2.5 px-5 text-sm"
                >
                  {t('nav_signup')}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-surface text-base"
          >
            {lang === 'fr' ? '🇨🇮' : '🇬🇧'}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-charcoal text-white"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-surface/95 backdrop-blur-2xl border-t border-border-soft overflow-hidden shadow-2xl"
          >
            <div className="max-w-7xl px-6 py-8 mx-auto flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-base font-semibold text-text-main px-4 py-3 hover:bg-bg-section rounded-2xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dashboard/landlord"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-base font-bold text-gold px-4 py-3 hover:bg-gold-soft rounded-2xl transition-colors"
              >
                <PlusCircle size={18} />
                {lang === 'fr' ? 'Publier un bien' : 'List a property'}
              </Link>

              <div className="h-px bg-border my-2" />

              {loadingAuth ? null : user ? (
                <>
                  <Link
                    href={role === 'tenant' ? '/dashboard/tenant' : '/dashboard/landlord'}
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-semibold text-text-main px-4 py-3 hover:bg-bg-section rounded-2xl transition-colors"
                  >
                    {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="mt-2 w-full py-3 rounded-2xl text-base font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                  >
                    {lang === 'fr' ? 'Déconnexion' : 'Log out'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-base font-semibold text-text-main px-4 py-3 hover:bg-bg-section rounded-2xl transition-colors"
                  >
                    <LogIn size={18} className="text-text-muted" />
                    {t('nav_login')}
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="btn-gold w-full py-4 text-base mt-2"
                  >
                    {t('nav_signup')}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
