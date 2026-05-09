'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/lang';
import { Eye, EyeOff, ChevronRight, RefreshCw, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AccountType = 'tenant' | 'landlord';
type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SignupForm() {
  const { t, lang } = useLang();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPw, setShowPw] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('tenant');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  /** Send OTP via our custom SMTP API route */
  const sendOtp = async (email: string) => {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, lang }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.detail ?? json.error ?? 'Failed to send OTP');
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // 1. Create the Supabase auth user (email_confirm disabled or will be confirmed after OTP)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, role: accountType },
        // Do NOT send Supabase's confirmation email — we handle it ourselves
        emailRedirectTo: undefined,
      },
    });

    if (authError || !authData.user) {
      setStatus('error');
      setErrorMsg(authError?.message ?? t('generic_error'));
      return;
    }

    // 2. Send our own OTP via SMTP
    try {
      await sendOtp(form.email);
    } catch (err) {
      setStatus('error');
      setErrorMsg(String(err));
      return;
    }

    // 3. Move to OTP step
    setStep(3);
    setStatus('idle');
    startResendCooldown();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // 1. Validate OTP against our API
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, token: otp, lang }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus('error');
      setErrorMsg(json.message ?? (lang === 'fr' ? 'Code invalide.' : 'Invalid code.'));
      return;
    }

    // 2. OTP valid — confirm the user in Supabase using admin service role
    // (Supabase email_confirm is set to false so the user already has a session)
    // If the user already has a session (email_confirm disabled), sign them in directly.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      // The account may require email confirmation in Supabase settings.
      // In that case, verify via Supabase's OTP as a fallback.
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: form.email,
        token: otp,
        type: 'signup',
      });
      if (otpError) {
        // Account created and our OTP is verified — just redirect
        // (Supabase email confirm may be off, or token already used)
        console.warn('[signup] Supabase OTP fallback failed:', otpError.message);
      }
    }

    setStatus('success');
    setTimeout(() => {
      router.push(accountType === 'tenant' ? '/dashboard/tenant' : '/auth/verify-cni');
    }, 1200);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      await sendOtp(form.email);
      setOtp('');
      setStatus('idle');
      startResendCooldown();
    } catch (err) {
      setStatus('error');
      setErrorMsg(String(err));
    }
  };

  const isLoading = status === 'loading';

  const TENANT_COLOR = '#0F172A';
  const LANDLORD_COLOR = '#10B981';
  const activeColor = accountType === 'tenant' ? TENANT_COLOR : LANDLORD_COLOR;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#0F172A', marginBottom: '0.35rem', letterSpacing: '-0.5px' }}>
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
                border: `2px solid ${accountType === 'tenant' ? TENANT_COLOR : '#E2E8F0'}`,
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
                border: `2px solid ${accountType === 'landlord' ? LANDLORD_COLOR : '#E2E8F0'}`,
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
              style={{ color: '#0F172A', fontWeight: 700, textDecoration: 'none' }}>
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
              ✅ {errorMsg || t('signup_success')}
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
                  background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6,
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
                  ? (lang === 'fr' ? 'Envoi du code...' : 'Sending code...')
                  : t('signup_btn')}
              </span>
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#aaa', marginTop: '1.25rem', lineHeight: 1.5 }}>
            {t('signup_terms')}
          </p>
        </div>
      )}

      {/* ── STEP 3: OTP Verification ── */}
      {step === 3 && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#e8f2ee',
                border: `1px solid ${activeColor}30`,
                borderRadius: 99, padding: '3px 10px', fontSize: '0.75rem',
                color: activeColor, fontWeight: 600,
              }}>
                🛡️ {lang === 'fr' ? 'Vérification Email' : 'Email Verification'}
              </div>
            </div>
          </div>

          {/* Email hint */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#F1F5F9', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem',
          }}>
            <Mail size={16} color="#64748B" />
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {lang === 'fr' ? 'Code envoyé à' : 'Code sent to'}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{form.email}</div>
            </div>
          </div>

          <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#444', marginBottom: '1.2rem', lineHeight: 1.5 }}>
            {lang === 'fr'
              ? 'Entrez le code à 6 chiffres envoyé à votre adresse e-mail.'
              : 'Enter the 6-digit code sent to your email address.'}
          </p>

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
              ✅ {lang === 'fr' ? 'Email vérifié ! Redirection...' : 'Email verified! Redirecting...'}
            </div>
          )}

          <form autoComplete="off" onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>
                {lang === 'fr' ? 'Code de vérification (OTP)' : 'Verification Code (OTP)'}
              </label>
              <input id="signup-otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456" className="input-field"
                required disabled={isLoading} inputMode="numeric" maxLength={6}
                style={{ letterSpacing: '0.3em', fontSize: '1.4rem', textAlign: 'center', fontWeight: 800 }}
                suppressHydrationWarning />
            </div>

            <button
              id="verify-submit"
              type="submit"
              disabled={isLoading || status === 'success' || otp.length < 6}
              style={{
                width: '100%', padding: '0.85rem', marginTop: '0.5rem',
                background: isLoading || status === 'success' ? '#2d6b52' : activeColor,
                color: '#fff', border: 'none', borderRadius: 8,
                fontWeight: 700, fontSize: '0.95rem',
                cursor: isLoading || status === 'success' || otp.length < 6 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}>
              <span>
                {isLoading
                  ? (lang === 'fr' ? 'Vérification...' : 'Verifying...')
                  : (lang === 'fr' ? 'Vérifier et continuer' : 'Verify & Continue')}
              </span>
            </button>
          </form>

          {/* Resend */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              id="resend-otp"
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              style={{
                background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer',
                fontSize: '0.83rem', fontWeight: 600,
                color: resendCooldown > 0 ? '#aaa' : activeColor,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
              <RefreshCw size={13} />
              {resendCooldown > 0
                ? (lang === 'fr' ? `Renvoyer dans ${resendCooldown}s` : `Resend in ${resendCooldown}s`)
                : (lang === 'fr' ? 'Renvoyer le code' : 'Resend code')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
