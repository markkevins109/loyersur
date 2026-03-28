'use client';
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Home } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLang();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0ddd7', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <Home size={18} color="#1a4d3a" />
          <span style={{ fontWeight: 700, color: '#1a4d3a', fontSize: '1rem' }}>LoyerSûr CI</span>
        </Link>
        <button id="auth-lang-toggle" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          style={{ border: '1px solid #e0ddd7', background: '#fff', padding: '5px 10px', borderRadius: 6, fontWeight: 500, fontSize: '0.82rem', color: '#555', cursor: 'pointer' }}>
          {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
        </button>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>{children}</div>
      </div>
    </div>
  );
}
