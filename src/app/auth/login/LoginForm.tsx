'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const { t, lang } = useLang();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 12, border: '1px solid #e0ddd7',
    padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  };

  return (
    <div style={cardStyle} className="animate-fade-in-up">
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ width: 48, height: 48, background: '#1a4d3a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.4rem' }}>
          🏠
        </div>
        <h1 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1c1c1c', marginBottom: '0.25rem' }}>{t('login_title')}</h1>
        <p style={{ color: '#888', fontSize: '0.85rem' }}>{t('login_sub')}</p>
      </div>

      <form onSubmit={e => e.preventDefault()}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#555', marginBottom: 6 }}>{t('login_email')}</label>
          <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="vous@email.ci" className="input-field" required />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#555' }}>{t('login_password')}</label>
            <Link href="/auth/forgot-password" id="forgot-pw-link" style={{ fontSize: '0.78rem', color: '#1a4d3a', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
              {t('login_forgot')}
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input id="login-password" type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="input-field" style={{ paddingRight: 44 }} required />
            <button type="button" id="toggle-password" onClick={() => setShowPw(s => !s)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button id="login-submit" type="submit" className="btn-green" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
          {t('login_btn')}
        </button>
      </form>

      {/* Demo shortcuts */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f0ede7' }}>
        <p style={{ textAlign: 'center', color: '#aaa', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
          {lang === 'fr' ? 'Accès rapide (démo)' : 'Quick access (demo)'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/dashboard/tenant" id="demo-tenant-link"
            style={{ textAlign: 'center', padding: '9px', border: '1px solid #e0ddd7', borderRadius: 6, fontSize: '0.82rem', fontWeight: 500, color: '#555', textDecoration: 'none', background: '#fafaf8' }}>
            🏠 {lang === 'fr' ? 'Dashboard Locataire' : 'Tenant Dashboard'}
          </Link>
          <Link href="/dashboard/landlord" id="demo-landlord-link"
            style={{ textAlign: 'center', padding: '9px', border: '1px solid #e0ddd7', borderRadius: 6, fontSize: '0.82rem', fontWeight: 500, color: '#555', textDecoration: 'none', background: '#fafaf8' }}>
            🏢 {lang === 'fr' ? 'Dashboard Propriétaire' : 'Landlord Dashboard'}
          </Link>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#888', marginTop: '1.25rem' }}>
        {t('login_no_account')}{' '}
        <Link href="/auth/signup" id="goto-signup" style={{ color: '#1a4d3a', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
          {t('login_signup')}
        </Link>
      </p>
    </div>
  );
}
