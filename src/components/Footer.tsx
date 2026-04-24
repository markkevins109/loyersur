'use client';
import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Home, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  const { t, lang } = useLang();

  return (
    <footer className="bg-text-main text-white pt-20 pb-10">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white group-hover:rotate-6 transition-transform">
                <Home size={18} strokeWidth={2.5} />
              </div>
              <span className="font-display font-black text-xl tracking-tight">
                LoyerSûr <span className="text-accent">CI</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              {t('footer_desc')}
            </p>
            <div className="flex items-center gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-black text-sm uppercase tracking-widest text-accent mb-6">
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
                  <Link href={href} className="text-text-muted hover:text-white transition-colors text-sm font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Support */}
          <div>
            <h4 className="font-display font-black text-sm uppercase tracking-widest text-accent mb-6">
              Support
            </h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-center gap-3 text-text-muted text-sm">
                  <Mail size={16} className="text-accent" />
                  contact@loyersur.ci
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3 text-text-muted text-sm">
                  <Phone size={16} className="text-accent" />
                  +225 27 20 00 00 00
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3 text-text-muted text-sm">
                  <MapPin size={16} className="text-accent" />
                  Abidjan, Côte d&apos;Ivoire
                </div>
              </li>
            </ul>
          </div>

          {/* Mobile Money */}
          <div>
            <h4 className="font-display font-black text-sm uppercase tracking-widest text-accent mb-6">
              Paiements
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Orange Money', 'MTN', 'Moov', 'Wave', 'Visa'].map(n => (
                <span key={n} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-text-muted border border-white/5">
                  {n}
                </span>
              ))}
            </div>
            <p className="mt-6 text-xs text-text-muted italic">
              * 100% sécurisé via notre passerelle certifiée.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-text-muted uppercase tracking-widest">
          <p>{t('footer_copyright')}</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white">Conditions</Link>
            <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
            <span className="text-accent">Made in CI 🇨🇮</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
