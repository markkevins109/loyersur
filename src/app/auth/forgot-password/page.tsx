'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { LangProvider, useLang } from '@/lib/lang';
import AuthLayout from '../AuthLayout';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function ForgotForm() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {!sent ? (
        <>
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{
              width: 46, height: 46, background: '#e8f2ee', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Mail size={20} color="#1a4d3a" />
            </div>
            <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#1c1c1c', marginBottom: '0.35rem', letterSpacing: '-0.5px' }}>
              {t('forgot_title')}
            </h1>
            <p style={{ color: '#888', fontSize: '0.88rem' }}>{t('forgot_sub')}</p>
          </div>

          {errorMsg && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10,
              padding: '11px 14px', marginBottom: '1.25rem', fontSize: '0.83rem', color: '#b91c1c',
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 6 }}>
                {t('login_email')}
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@email.ci"
                className="input-field"
                required
                disabled={loading}
                suppressHydrationWarning
              />
            </div>

            <button
              id="forgot-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.85rem',
                background: loading ? '#2d6b52' : '#1a4d3a',
                color: '#fff', border: 'none', borderRadius: 8,
                fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}>
              <Mail size={16} />
              <span>{loading ? (lang === 'fr' ? 'Envoi…' : 'Sending…') : t('forgot_btn')}</span>
            </button>
          </form>
        </>
      ) : (
        /* Success state */
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: 64, height: 64, background: '#e8f2ee', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <CheckCircle2 size={30} color="#1a4d3a" />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1c1c1c', marginBottom: '0.5rem' }}>
            {lang === 'fr' ? 'Email envoyé !' : 'Email sent!'}
          </h2>
          <p style={{ color: '#888', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {lang === 'fr'
              ? `Un lien de réinitialisation a été envoyé à `
              : `A reset link has been sent to `}
            <strong style={{ color: '#1c1c1c' }}>{email}</strong>
          </p>
          <div style={{
            background: '#f8f7f4', border: '1px solid #ede9e2', borderRadius: 10,
            padding: '0.9rem', fontSize: '0.8rem', color: '#888', marginBottom: '1.5rem',
          }}>
            💡 {lang === 'fr' ? 'Vérifiez vos spams si vous ne trouvez pas l'email.' : "Check your spam folder if you don't find the email."}
          </div>
        </div>
      )}

      <Link href="/auth/login" id="back-to-login"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          marginTop: '1.25rem', fontSize: '0.84rem', color: '#666', textDecoration: 'none',
          fontWeight: 500,
        }}>
        <ArrowLeft size={14} />
        {lang === 'fr' ? 'Retour à la connexion' : 'Back to login'}
      </Link>
    </div>
  );
}

export default function Page() {
  return (
    <LangProvider>
      <AuthLayout>
        <ForgotForm />
      </AuthLayout>
    </LangProvider>
  );
}
