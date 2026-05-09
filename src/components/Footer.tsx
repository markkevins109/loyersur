'use client';
import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Home, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  const { t, lang } = useLang();

  return (
    <footer className="text-white pt-20 pb-10 relative overflow-hidden" style={{ background: '#1A1A18' }}>
      {/* Subtle gold glow top-right */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl px-6 mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 pb-16 border-b border-white/10">
          
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold text-white shadow-md shadow-gold/30 group-hover:shadow-gold/50 transition-shadow">
                <Home size={18} strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                LoyerSûr <span className="text-gold">CI</span>
              </span>
            </Link>
            <p className="text-white/55 text-sm leading-relaxed font-light max-w-xs">
              {t('footer_desc')}
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 border border-white/12 text-white/60 hover:bg-gold hover:text-white hover:border-gold transition-all duration-200"
                >
                  <Icon size={16} strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.18em] text-white/40 mb-5">
              {t('footer_company')}
            </h4>
            <ul className="space-y-3">
              {[
                { label: t('footer_about'), href: '/about' },
                { label: t('nav_listings'), href: '/listings' },
                { label: t('footer_contact'), href: '/contact' },
                { label: t('nav_tenant'), href: '/dashboard/tenant' },
                { label: t('nav_landlord'), href: '/dashboard/landlord' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-white/55 hover:text-white transition-colors text-sm font-light">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.18em] text-white/40 mb-5">
              Support
            </h4>
            <ul className="space-y-4">
              {[
                { icon: Mail, text: 'contact@loyersur.ci' },
                { icon: Phone, text: '+225 27 20 00 00 00' },
                { icon: MapPin, text: "Abidjan, Côte d'Ivoire" },
              ].map(({ icon: Icon, text }) => (
                <li key={text}>
                  <div className="flex items-center gap-3 text-white/55 text-sm font-light hover:text-white transition-colors cursor-default group">
                    <Icon size={15} className="text-gold shrink-0 group-hover:scale-110 transition-transform" />
                    {text}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.18em] text-white/40 mb-5">
              Paiements
            </h4>
            <div className="flex flex-wrap gap-2 mb-5">
              {['Orange Money', 'MTN', 'Moov', 'Wave', 'Visa'].map(n => (
                <span
                  key={n}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/8 text-white/60 border border-white/10 hover:bg-white/14 hover:text-white transition-colors cursor-default"
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="text-xs text-white/35 font-light">
              🔒 {lang === 'fr' ? 'Paiements 100% sécurisés' : '100% secure payments'}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-white/35">
          <p>{t('footer_copyright')}</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Conditions</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <span className="text-gold font-bold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
              Made in CI 🇨🇮
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
