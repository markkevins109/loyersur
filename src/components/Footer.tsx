'use client';
import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Home } from 'lucide-react';

export default function Footer() {
  const { t, lang } = useLang();

  return (
    <footer style={{ background: '#1c1c1c', color: '#fff', padding: '3.5rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Top */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <Home size={18} color="#c8501e" />
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>LoyerSûr CI</span>
            </div>
            <p style={{ color: '#999', fontSize: '0.84rem', lineHeight: 1.7 }}>
              {t('footer_desc')}
            </p>
            {/* Mobile money */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: '1rem' }}>
              {['Orange Money', 'MTN', 'Moov', 'Wave'].map(n => (
                <span key={n} style={{
                  background: 'rgba(255,255,255,0.08)',
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: 4,
                  color: '#aaa',
                }}>{n}</span>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', marginBottom: '1rem' }}>
              {t('footer_company')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: t('footer_about'), href: '/about' },
                { label: t('footer_blog'), href: '/blog' },
                { label: t('nav_listings'), href: '/listings' },
                { label: t('footer_contact'), href: '/contact' },
                { label: t('nav_tenant'), href: '/dashboard/tenant' },
                { label: t('nav_landlord'), href: '/dashboard/landlord' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} style={{ color: '#999', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa', marginBottom: '1rem' }}>
              Contact
            </h4>
            <p style={{ color: '#999', fontSize: '0.875rem', lineHeight: 1.7 }}>
              contact@loyersur.ci<br />
              +225 27 20 00 00 00<br />
              Abidjan, Côte d&apos;Ivoire 🇨🇮
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ color: '#666', fontSize: '0.82rem' }}>{t('footer_copyright')}</p>
          <p style={{ color: '#666', fontSize: '0.82rem' }}>Made with ♥ in Côte d&apos;Ivoire</p>
        </div>
      </div>
    </footer>
  );
}
