'use client';
import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Home, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  const { t, lang } = useLang();

  return (
    <footer className="bg-primary text-white pt-24 pb-12 relative overflow-hidden border-t border-white/10">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container relative z-10 px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white shadow-lg shadow-accent/20 group-hover:-rotate-3 transition-transform duration-300">
                <Home size={20} strokeWidth={2.5} />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                LoyerSûr <span className="text-accent">CI</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs font-medium">
              {t('footer_desc')}
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-accent hover:border-accent hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-extrabold text-sm uppercase tracking-widest text-accent mb-6">
              {t('footer_company')}
            </h4>
            <ul className="space-y-4">
              {[
                { label: t('footer_about'), href: '/about' },
                { label: t('nav_listings'), href: '/listings' },
                { label: t('footer_contact'), href: '/contact' },
                { label: t('nav_tenant'), href: '/dashboard/tenant' },
                { label: t('nav_landlord'), href: '/dashboard/landlord' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Support */}
          <div>
            <h4 className="font-display font-extrabold text-sm uppercase tracking-widest text-accent mb-6">
              Support
            </h4>
            <ul className="space-y-5">
              <li>
                <div className="flex items-center gap-3 text-white/60 text-sm font-medium hover:text-white transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Mail size={16} className="text-accent" />
                  </div>
                  contact@loyersur.ci
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3 text-white/60 text-sm font-medium hover:text-white transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Phone size={16} className="text-accent" />
                  </div>
                  +225 27 20 00 00 00
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3 text-white/60 text-sm font-medium hover:text-white transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <MapPin size={16} className="text-accent" />
                  </div>
                  Abidjan, Côte d&apos;Ivoire
                </div>
              </li>
            </ul>
          </div>

          {/* Mobile Money */}
          <div>
            <h4 className="font-display font-extrabold text-sm uppercase tracking-widest text-accent mb-6">
              Paiements
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {['Orange Money', 'MTN', 'Moov', 'Wave', 'Visa'].map(n => (
                <span key={n} className="px-3.5 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                  {n}
                </span>
              ))}
            </div>
            <p className="mt-6 text-xs text-white/40 italic font-medium">
              * 100% sécurisé via notre passerelle certifiée.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
          <p>{t('footer_copyright')}</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Conditions</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <span className="text-accent font-extrabold px-3 py-1 bg-accent/10 rounded-full border border-accent/20">Made in CI 🇨🇮</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
