'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/lang';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AccountType = 'tenant' | 'landlord';
type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SignupForm() {
  const { t, lang } = useLang();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPw, setShowPw] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('tenant');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, role: accountType },
      },
    });

    if (authError || !authData.user) {
      setStatus('error');
      setErrorMsg(authError?.message ?? t('generic_error'));
      return;
    }

    // Profile row is auto-created by the handle_new_user DB trigger.
    // Just wait briefly so the trigger completes before redirecting.
    await new Promise(r => setTimeout(r, 300));

    setStatus('success');
    setTimeout(() => {
      // Landlords must complete CNI identity verification before accessing dashboard
      router.push(accountType === 'tenant' ? '/dashboard/tenant' : '/auth/verify-cni');
    }, 1200);
  };

  const isLoading = status === 'loading';

  const TENANT_COLOR = '#1a4d3a';
  const LANDLORD_COLOR = '#c8501e';
  const activeColor = accountType === 'tenant' ? TENANT_COLOR : LANDLORD_COLOR;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#1c1c1c', marginBottom: '0.35rem', letterSpacing: '-0.5px' }}>
          {t('signup_title')} ✨
        </h1>
        <p style={{ color: '#888', fontSize: '0.88rem' }}>{t('signup_sub')}</p>
      </div>

      {/* ── STEP 1: Choose account type ── */}
      {step === 1 && (
        <div className="animate-fade-in">
          <p style={{ fontWeight: 600, fontSize: '0.83rem', color: '#444', marginBottom: '0.75rem' }}>
            {t('signup_i_am')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
            {/* Tenant card */}
            <button
              id="type-tenant"
              type="button"
              onClick={() => setAccountType('tenant')}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '1rem 1.1rem', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${accountType === 'tenant' ? TENANT_COLOR : '#e0ddd7'}`,
                background: accountType === 'tenant' ? '#e8f2ee' : '#fff',
                transition: 'all 0.15s', textAlign: 'left',
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: accountType === 'tenant' ? TENANT_COLOR : '#f0ede8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
              }}>🏠</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: accountType === 'tenant' ? TENANT_COLOR : '#333' }}>
                  {t('signup_tenant')}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>
                  {t('signup_tenant_sub')}
                </div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${accountType === 'tenant' ? TENANT_COLOR : '#ddd'}`,
                background: accountType === 'tenant' ? TENANT_COLOR : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {accountType === 'tenant' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </button>

            {/* Landlord card */}
            <button
              id="type-landlord"
              type="button"
              onClick={() => setAccountType('landlord')}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '1rem 1.1rem', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${accountType === 'landlord' ? LANDLORD_COLOR : '#e0ddd7'}`,
                background: accountType === 'landlord' ? '#fdf3ee' : '#fff',
                transition: 'all 0.15s', textAlign: 'left',
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: accountType === 'landlord' ? LANDLORD_COLOR : '#f0ede8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
              }}>🏢</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: accountType === 'landlord' ? LANDLORD_COLOR : '#333' }}>
                  {t('signup_landlord')}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>
                  {t('signup_landlord_sub')}
                </div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${accountType === 'landlord' ? LANDLORD_COLOR : '#ddd'}`,
                background: accountType === 'landlord' ? LANDLORD_COLOR : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {accountType === 'landlord' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </button>
          </div>

          <button
            id="step1-next"
            type="button"
            onClick={() => setStep(2)}
            style={{
              width: '100%', padding: '0.85rem',
              background: activeColor, color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s',
            }}>
            <span>{t('signup_continue')}</span>
            <ChevronRight size={17} />
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.84rem', color: '#888' }}>
            {t('signup_has_account')}{' '}
            <Link href="/auth/login" id="goto-login"
              style={{ color: '#1a4d3a', fontWeight: 700, textDecoration: 'none' }}>
              {t('nav_login')} →
            </Link>
          </div>
        </div>
      )}

      {/* ── STEP 2: Fill in details ── */}
      {step === 2 && (
        <div className="animate-fade-in">
          {/* Step indicator + back */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => { setStep(1); setStatus('idle'); setErrorMsg(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '0.82rem', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
               ← {t('back')}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: accountType === 'tenant' ? '#e8f2ee' : '#fdf3ee',
                border: `1px solid ${activeColor}30`,
                borderRadius: 99, padding: '3px 10px', fontSize: '0.75rem',
                color: activeColor, fontWeight: 600,
              }}>
                {accountType === 'tenant' ? '🏠' : '🏢'}
                {accountType === 'tenant' ? t('signup_tenant') : t('signup_landlord')}
              </div>
            </div>
          </div>

          {/* Error */}
          {status === 'error' && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10,
              padding: '11px 14px', marginBottom: '1rem', fontSize: '0.83rem', color: '#b91c1c',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10,
              padding: '11px 14px', marginBottom: '1rem', fontSize: '0.83rem', color: '#166534',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ✅ {t('signup_success')}
            </div>
          )}

          <form autoComplete="off" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>
                {t('signup_name')}
              </label>
              <input id="signup-name" type="text" value={form.name} onChange={update('name')}
                placeholder="Kouamé Adjoumani" className="input-field"
                autoComplete="name" required disabled={isLoading} suppressHydrationWarning />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>
                {t('signup_email')}
              </label>
              <input id="signup-email" type="email" value={form.email} onChange={update('email')}
                placeholder="vous@email.ci" className="input-field"
                autoComplete="email" required disabled={isLoading} suppressHydrationWarning />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>
                {t('signup_phone')}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  background: '#f9f7f4', border: '1px solid #e0ddd7', borderRadius: 6,
                  padding: '10px 12px', fontSize: '0.85rem', color: '#666', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>🇨🇮 +225</div>
                <input id="signup-phone" type="tel" value={form.phone} onChange={update('phone')}
                  placeholder="07 12 34 56 78" className="input-field" style={{ flex: 1 }}
                  autoComplete="tel" required disabled={isLoading} suppressHydrationWarning />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>
                {t('signup_password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input id="signup-password" type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')}
                  placeholder="••••••••" className="input-field" style={{ paddingRight: 44 }}
                  autoComplete="new-password" required disabled={isLoading} minLength={6} suppressHydrationWarning />
                <button type="button" id="signup-show-pw" onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#aaa', marginTop: 5 }}>
                {t('signup_min_chars')}
              </p>
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={isLoading || status === 'success'}
              style={{
                width: '100%', padding: '0.85rem', marginTop: '0.1rem',
                background: isLoading || status === 'success' ? '#2d6b52' : activeColor,
                color: '#fff', border: 'none', borderRadius: 8,
                fontWeight: 700, fontSize: '0.95rem',
                cursor: isLoading || status === 'success' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}>
              <span>
                {isLoading
                  ? t('signup_creating')
                  : t('signup_btn')}
              </span>
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#aaa', marginTop: '1.25rem', lineHeight: 1.5 }}>
            {t('signup_terms')}
          </p>
        </div>
      )}
    </div>
  );
}
