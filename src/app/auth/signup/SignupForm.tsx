'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupForm() {
  const { t, lang } = useLang();
  const [showPw, setShowPw] = useState(false);
  const [accountType, setAccountType] = useState<'tenant' | 'landlord'>('tenant');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 12, border: '1px solid #e0ddd7',
    padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  };

  return (
    <div style={cardStyle} className="animate-fade-in-up">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1c1c1c', marginBottom: '0.25rem' }}>{t('signup_title')}</h1>
        <p style={{ color: '#888', fontSize: '0.85rem' }}>{t('signup_sub')}</p>
      </div>

      {/* Account type */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#555', marginBottom: 8 }}>{t('signup_type')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button id="type-tenant" type="button" onClick={() => setAccountType('tenant')}
            style={{
              padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', border: '1.5px solid',
              borderColor: accountType === 'tenant' ? '#1a4d3a' : '#e0ddd7',
              background: accountType === 'tenant' ? '#e8f2ee' : '#fff',
              color: accountType === 'tenant' ? '#1a4d3a' : '#888',
              transition: 'all 0.15s',
            }}>
            🏠 {t('signup_tenant')}
          </button>
          <button id="type-landlord" type="button" onClick={() => setAccountType('landlord')}
            style={{
              padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', border: '1.5px solid',
              borderColor: accountType === 'landlord' ? '#c8501e' : '#e0ddd7',
              background: accountType === 'landlord' ? '#fdf3ee' : '#fff',
              color: accountType === 'landlord' ? '#c8501e' : '#888',
              transition: 'all 0.15s',
            }}>
            🏢 {t('signup_landlord')}
          </button>
        </div>
      </div>

      <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#555', marginBottom: 5 }}>{t('signup_name')}</label>
          <input id="signup-name" type="text" value={form.name} onChange={update('name')} placeholder="Kouamé Adjoumani" className="input-field" required />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#555', marginBottom: 5 }}>{t('signup_email')}</label>
          <input id="signup-email" type="email" value={form.email} onChange={update('email')} placeholder="vous@email.ci" className="input-field" required />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#555', marginBottom: 5 }}>{t('signup_phone')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: '#f9f7f4', border: '1px solid #e0ddd7', borderRadius: 6, padding: '10px 12px', fontSize: '0.85rem', color: '#666', flexShrink: 0 }}>🇨🇮 +225</div>
            <input id="signup-phone" type="tel" value={form.phone} onChange={update('phone')} placeholder="07 12 34 56 78" className="input-field" style={{ flex: 1 }} required />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#555', marginBottom: 5 }}>{t('signup_password')}</label>
          <div style={{ position: 'relative' }}>
            <input id="signup-password" type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')}
              placeholder="••••••••" className="input-field" style={{ paddingRight: 44 }} required />
            <button type="button" id="signup-show-pw" onClick={() => setShowPw(s => !s)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button id="signup-submit" type="submit" className="btn-green" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: 4 }}>
          {t('signup_btn')}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#888', marginTop: '1.25rem' }}>
        {t('signup_has_account')}{' '}
        <Link href="/auth/login" id="goto-login" style={{ color: '#1a4d3a', fontWeight: 600, textDecoration: 'none' }}>
          {t('nav_login')}
        </Link>
      </p>
    </div>
  );
}
