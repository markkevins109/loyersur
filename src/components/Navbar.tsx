'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Home, Menu, X, Globe } from 'lucide-react';

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#fff',
        borderBottom: scrolled ? '1px solid #e0ddd7' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link href="/" id="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Home size={20} color="#1a4d3a" strokeWidth={2} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a4d3a' }}>LoyerSûr CI</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
          <Link href="/listings" id="nav-listings"
            style={{ color: '#555', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1a4d3a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
            {t('nav_listings')}
          </Link>
          <Link href="/about" id="nav-about"
            style={{ color: '#555', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1a4d3a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
            {t('nav_about')}
          </Link>

          {/* Language toggle */}
          <button
            id="lang-toggle"
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: '1px solid #e0ddd7',
              borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 500, color: '#555',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a4d3a'; e.currentTarget.style.color = '#1a4d3a'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0ddd7'; e.currentTarget.style.color = '#555'; }}
          >
            <Globe size={13} />
            {lang === 'fr' ? 'FR' : 'EN'}
          </button>

          <Link href="/auth/login" id="nav-login"
            style={{ color: '#555', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1a4d3a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
            {t('nav_login')}
          </Link>

          <Link href="/auth/signup" id="nav-signup" className="btn-green" style={{ fontSize: '0.88rem', padding: '0.55rem 1.2rem' }}>
            {t('nav_signup')}
          </Link>
        </div>

        {/* Mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="mobile-nav">
          <button id="lang-toggle-mobile" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            style={{ background: 'none', border: '1px solid #e0ddd7', borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer', color: '#555' }}>
            {lang === 'fr' ? '🇫🇷' : '🇬🇧'}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} id="mobile-menu-toggle"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#333' }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #e0ddd7', padding: '1rem 1.5rem' }} className="animate-fade-in">
          {[
            { href: '/listings', label: t('nav_listings') },
            { href: '/about', label: t('nav_about') },
            { href: '/auth/login', label: t('nav_login') },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 0', color: '#333', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid #f0ede7', fontSize: '0.95rem' }}>
              {label}
            </Link>
          ))}
          <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="btn-green"
            style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: '0.9rem' }}>
            {t('nav_signup')}
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
        @media (min-width: 769px) { .mobile-nav { display: none !important; } }
      `}</style>
    </nav>
  );
}
