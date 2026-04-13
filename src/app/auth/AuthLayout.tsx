'use client';
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';

const FEATURES = [
  { icon: '🛡️', text: 'Profils 100% vérifiés' },
  { icon: '📱', text: 'Paiement Mobile Money' },
  { icon: '🤝', text: 'Sans intermédiaire' },
  { icon: '📄', text: 'Quittances automatiques' },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLang();

  const FEATURES = [
    { icon: '🛡️', text: t('auth_feature1') },
    { icon: '📱', text: t('auth_feature2') },
    { icon: '🤝', text: t('auth_feature3') },
    { icon: '📄', text: t('auth_feature4') },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div style={{
        width: '45%', minHeight: '100vh',
        background: 'linear-gradient(160deg, #1a4d3a 0%, #0f2e22 60%, #0a1f17 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '2.5rem', position: 'relative', overflow: 'hidden',
      }}
        className="auth-left-panel"
      >
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

        {/* Decorative blob */}
        <div style={{
          position: 'absolute', bottom: -80, right: -80, width: 320, height: 320,
          background: 'rgba(200,80,30,0.15)', borderRadius: '50%', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', top: -60, left: -60, width: 260, height: 260,
          background: 'rgba(255,255,255,0.04)', borderRadius: '50%',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, background: 'rgba(255,255,255,0.15)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', backdropFilter: 'blur(4px)',
            }}>🏠</div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>
              LoyerSûr <span style={{ color: '#f97316', fontWeight: 900 }}>CI</span>
            </span>
          </Link>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(200,80,30,0.25)', border: '1px solid rgba(200,80,30,0.4)',
            borderRadius: 99, padding: '4px 14px', fontSize: '0.72rem', color: '#fca97a',
            fontWeight: 600, letterSpacing: 0.5, marginBottom: '1.25rem', textTransform: 'uppercase',
          }}>
            {t('auth_tag')}
          </div>
          <h1 style={{
            color: '#fff', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
            lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.5px',
          }}>
            {t('auth_title_part1')}<br />
            <span style={{ color: '#6ee7c1' }}>{t('auth_title_accent')}</span> de<br />
            {t('auth_title_part2')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 280, marginBottom: '2rem' }}>
            {t('auth_desc')}
          </p>

          {/* Features list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {FEATURES.map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, background: 'rgba(255,255,255,0.1)',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.84rem', fontWeight: 500 }}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', gap: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '1.5rem',
        }}>
          {[
            { n: '2 400+', l: t('hero_stat1') },
            { n: '18K+', l: t('hero_stat2') },
            { n: '99%', l: t('hero_stat3') },
          ].map((s) => (
            <div key={s.l}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{s.n}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div style={{
        flex: 1, minHeight: '100vh', background: '#f8f7f4',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Top bar */}
        <div style={{
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 2rem', gap: 12,
          borderBottom: '1px solid #ede9e2',
          background: '#fff',
        }}>
          <button
            id="auth-lang-toggle"
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            style={{
              border: '1px solid #e0ddd7', background: '#fff', padding: '5px 12px',
              borderRadius: 6, fontWeight: 500, fontSize: '0.8rem', color: '#555', cursor: 'pointer',
            }}>
            {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>
        </div>

        {/* Form area */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            {children}
          </div>
        </div>

        {/* Bottom note */}
        <div style={{
          textAlign: 'center', padding: '1rem', fontSize: '0.72rem', color: '#aaa',
        }}>
          © 2026 LoyerSûr CI · <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Accueil</Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
