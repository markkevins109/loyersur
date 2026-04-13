'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/lang';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function LoginForm() {
  const { t, lang } = useLang();
  const router = useRouter();

  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setStatus('error');
      setErrorMsg(
        error?.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : error?.message ?? 'Erreur de connexion. Veuillez réessayer.'
      );
      return;
    }

    // Redirect based on role stored in user_metadata
    const role = data.user.user_metadata?.role as string | undefined;
    setStatus('success');

    setTimeout(() => {
      router.push(role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant');
    }, 300);
  };

  const isLoading = status === 'loading';

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#1c1c1c', marginBottom: '0.35rem', letterSpacing: '-0.5px' }}>
          {t('login_title')} 👋
        </h1>
        <p style={{ color: '#888', fontSize: '0.88rem' }}>{t('login_sub')}</p>
      </div>

      {/* Error banner */}
      {status === 'error' && (
        <div style={{
          background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10,
          padding: '11px 14px', marginBottom: '1.25rem', fontSize: '0.84rem', color: '#b91c1c',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: '1rem' }}>⚠️</span> {errorMsg}
        </div>
      )}

      <form autoComplete="on" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {/* Email */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 6 }}>
            {t('login_email')}
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vous@email.ci"
            className="input-field"
            autoComplete="email"
            required
            disabled={isLoading}
            suppressHydrationWarning
          />
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontWeight: 600, fontSize: '0.82rem', color: '#444' }}>
              {t('login_password')}
            </label>
            <Link href="/auth/forgot-password" id="forgot-pw-link"
              style={{ fontSize: '0.78rem', color: '#1a4d3a', textDecoration: 'none', fontWeight: 500 }}>
              {t('login_forgot')}
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              style={{ paddingRight: 44 }}
              autoComplete="current-password"
              required
              disabled={isLoading}
              suppressHydrationWarning
            />
            <button type="button" id="toggle-password" onClick={() => setShowPw(s => !s)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%', padding: '0.85rem', marginTop: '0.25rem',
            background: isLoading ? '#2d6b52' : '#1a4d3a',
            color: '#fff', border: 'none', borderRadius: 8,
            fontWeight: 700, fontSize: '0.95rem', cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', letterSpacing: '-0.2px',
          }}>
          <span>{isLoading ? t('login_signing_in') : t('login_btn')}</span>
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' }}>
        <div style={{ flex: 1, height: 1, background: '#ede9e2' }} />
        <span style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 500 }}>
          {t('login_no_account_yet')}
        </span>
        <div style={{ flex: 1, height: 1, background: '#ede9e2' }} />
      </div>

      {/* Sign up CTA */}
      <Link href="/auth/signup" id="goto-signup"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: '100%', padding: '0.8rem',
          border: '1.5px solid #1a4d3a', borderRadius: 8,
          color: '#1a4d3a', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
          background: '#fff', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#e8f2ee'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
        {t('login_signup_cta')}
      </Link>

      {/* User type hint */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: 10 }}>
        <div style={{
          flex: 1, background: '#f8f7f4', border: '1px solid #ede9e2', borderRadius: 8,
          padding: '10px', textAlign: 'center', fontSize: '0.78rem', color: '#666',
        }}>
          🏠 <strong style={{ color: '#1a4d3a', display: 'block', marginTop: 2 }}>Locataire</strong>
          <span>Trouvez un logement</span>
        </div>
        <div style={{
          flex: 1, background: '#f8f7f4', border: '1px solid #ede9e2', borderRadius: 8,
          padding: '10px', textAlign: 'center', fontSize: '0.78rem', color: '#666',
        }}>
          🏢 <strong style={{ color: '#c8501e', display: 'block', marginTop: 2 }}>Propriétaire</strong>
          <span>Publiez vos biens</span>
        </div>
      </div>
    </div>
  );
}
