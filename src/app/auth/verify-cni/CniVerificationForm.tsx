'use client';
import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/lang';
import {
  ShieldCheck, Upload, AlertCircle, CheckCircle2,
  RefreshCw, ChevronRight, Lock, Eye, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase =
  | 'consent'       // Step 1 — Consent notice
  | 'upload'        // Step 2 — Upload front + back
  | 'quality'       // Step 5 — Quality pre-check (client-side)
  | 'mrz-input'     // Step 3 — Enter / parse MRZ lines
  | 'checking'      // Spinner while API runs
  | 'pass'          // Verification passed
  | 'fail'          // Verification failed (attempt 1)
  | 'fail-final'    // Verification failed (attempt 2 → manual review)
  | 'retry';        // Image quality too low

type VerifyStatus = 'PASS' | 'FAIL' | 'RETRY';

interface VerifyResult {
  status: VerifyStatus;
  errorCode?: string;
  message?: string;
}

interface ImageState {
  file: File | null;
  preview: string | null;
  width: number;
  height: number;
}

const EMPTY_IMG: ImageState = { file: null, preview: null, width: 0, height: 0 };

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = { green: '#1a4d3a', orange: '#c8501e', bg: '#f9f7f4', card: '#ffffff' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function checkImageQuality(img: ImageState, minW = 600, minH = 400): boolean {
  if (!img.file) return false;
  return img.width >= minW && img.height >= minH;
}

function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => { resolve({ width: 0, height: 0 }); };
    image.src = url;
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
interface UploadBoxProps {
  side: 'front' | 'back';
  label: string;
  img: ImageState;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClear: (side: 'front' | 'back') => void;
  onSelect: (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => void;
  hint: string;
}

const UploadBox = ({ side, label, img, inputRef, onClear, onSelect, hint }: UploadBoxProps) => (
  <div style={{ flex: 1 }}>
    <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 8 }}>{label}</p>
    {img.preview ? (
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '2px solid #86efac', background: '#f0fdf4' }}>
        <img src={img.preview} alt={label} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
        <button
          type="button"
          onClick={() => onClear(side)}
          style={{
            position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.55)',
            border: 'none', borderRadius: '50%', width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <X size={13} color="#fff" />
        </button>
        <div style={{ position: 'absolute', bottom: 6, left: 6, background: '#16a34a', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <CheckCircle2 size={11} /> {img.width}×{img.height}px
        </div>
      </div>
    ) : (
      <label
        htmlFor={`cni-${side}`}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: 140, border: '2px dashed #d1cfc9', borderRadius: 10,
          background: COLORS.bg, cursor: 'pointer', gap: 8, transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.green; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1cfc9'; }}
      >
        <Upload size={22} color="#999" />
        <span style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', lineHeight: 1.4, padding: '0 8px' }}>
          {hint}
        </span>
        <input
          ref={inputRef}
          id={`cni-${side}`}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={e => onSelect(side, e)}
        />
      </label>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CniVerificationForm() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [phase, setPhase] = useState<Phase>('consent');
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Images
  const [frontImg, setFrontImg] = useState<ImageState>(EMPTY_IMG);
  const [backImg, setBackImg] = useState<ImageState>(EMPTY_IMG);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  // MRZ lines
  const [mrzLine1, setMrzLine1] = useState('');
  const [mrzLine2, setMrzLine2] = useState('');
  const [mrzLine3, setMrzLine3] = useState('');

  const handleImageSelect = useCallback(async (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    const { width, height } = await loadImageDimensions(file);
    const state: ImageState = { file, preview, width, height };
    if (side === 'front') setFrontImg(state);
    else setBackImg(state);
  }, []);

  const clearImage = useCallback((side: 'front' | 'back') => {
    if (side === 'front') {
      if (frontImg.preview) URL.revokeObjectURL(frontImg.preview);
      setFrontImg(EMPTY_IMG);
      if (frontRef.current) frontRef.current.value = '';
    } else {
      if (backImg.preview) URL.revokeObjectURL(backImg.preview);
      setBackImg(EMPTY_IMG);
      if (backRef.current) backRef.current.value = '';
    }
  }, [frontImg.preview, backImg.preview]);

  const runQualityCheck = () => {
    if (!checkImageQuality(frontImg) || !checkImageQuality(backImg)) {
      setPhase('retry');
      return;
    }
    setPhase('mrz-input');
  };

  const submitVerification = async () => {
    const lines = [mrzLine1.trim(), mrzLine2.trim(), mrzLine3.trim()];
    if (lines.some(l => l.length !== 30)) {
       setErrorMsg(lang === 'fr' ? 'Chaque ligne doit avoir 30 caractères.' : 'Each line must be 30 characters.');
       return;
    }
    setErrorMsg('');
    setPhase('checking');

    try {
      const res = await fetch('/api/verify-cni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mrzLines: lines, skipOcrCrossCheck: true }),
      });

      const data: VerifyResult = await res.json();
      if (data.status === 'PASS') {
        setPhase('pass');
        setSuccessMsg(t('verify_pass_sub'));
        URL.revokeObjectURL(frontImg.preview || '');
        URL.revokeObjectURL(backImg.preview || '');
        setTimeout(() => router.push('/dashboard/landlord'), 2500);
        return;
      }

      if (data.status === 'RETRY') { setPhase('retry'); return; }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setErrorMsg(data.message ?? t('verify_fail_title'));
      setPhase(newAttempts >= 2 ? 'fail-final' : 'fail');
    } catch {
      setErrorMsg(t('generic_error'));
      setPhase('fail');
    }
  };

  const resetForRetry = () => {
    setFrontImg(p => { if (p.preview) URL.revokeObjectURL(p.preview); return EMPTY_IMG; });
    setBackImg(p => { if (p.preview) URL.revokeObjectURL(p.preview); return EMPTY_IMG; });
    setMrzLine1(''); setMrzLine2(''); setMrzLine3('');
    setErrorMsg(''); setPhase('upload');
  };

  return (
    <div key={phase}>
      {/* ── CONSENT ───────────────── */}
      {phase === 'consent' && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #1a4d3a, #2d7a5a)', marginBottom: 14 }}>
              <ShieldCheck size={30} color="#fff" />
            </div>
            <h1 style={{ fontWeight: 800, fontSize: '1.45rem', color: '#1c1c1c', letterSpacing: '-0.5px', marginBottom: 6 }}>{t('verify_title')}</h1>
            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.55 }}>{t('verify_sub')}</p>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #e8f2ee)', border: '1.5px solid #86efac', borderRadius: 14, padding: '1.25rem 1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <Lock size={17} color={COLORS.green} />
              <p style={{ fontWeight: 700, fontSize: '0.87rem', color: COLORS.green }}>{t('verify_consent_title')}</p>
            </div>
            <p style={{ fontSize: '0.83rem', color: '#2d5a44', lineHeight: 1.7 }}>{t('verify_consent_desc')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🪪', text: t('verify_step_front') },
              { icon: '🔍', text: t('verify_step_back') },
              { icon: '🔒', text: t('verify_step_privacy') },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #e8e5e0', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <p style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.4 }}>{item.text}</p>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setPhase('upload')} style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #1a4d3a, #2d7a5a)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {t('verify_accept')} <ChevronRight size={17} />
          </button>
        </div>
      )}

      {/* ── UPLOAD ────────────────── */}
      {phase === 'upload' && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1c1c1c', marginBottom: 4 }}>{t('verify_upload_title')}</h1>
            <p style={{ color: '#888', fontSize: '0.82rem' }}>{t('verify_upload_sub')}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <UploadBox side="front" label={t('verify_front_label')} hint={t('verify_front_hint')} img={frontImg} inputRef={frontRef} onClear={clearImage} onSelect={handleImageSelect} />
            <UploadBox side="back"  label={t('verify_back_label')} hint={t('verify_back_hint')} img={backImg} inputRef={backRef} onClear={clearImage} onSelect={handleImageSelect} />
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Eye size={15} color="#d97706" />
            <p style={{ fontSize: '0.77rem', color: '#92400e', lineHeight: 1.5 }}>
              <strong>{t('verify_tip_title')}</strong> {t('verify_tip_desc')}
            </p>
          </div>
          <button type="button" disabled={!frontImg.file || !backImg.file} onClick={runQualityCheck} style={{ width: '100%', padding: '0.88rem', background: (frontImg.file && backImg.file) ? 'linear-gradient(135deg,#1a4d3a,#2d7a5a)' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: (frontImg.file && backImg.file) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {t('signup_continue')} <ChevronRight size={17} />
          </button>
        </div>
      )}

      {/* ── RETRY ─────────────────── */}
      {phase === 'retry' && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={30} color="#d97706" /></div>
          <h1 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1c1c1c' }}>{t('verify_check_quality')}</h1>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem 1.2rem', width: '100%', textAlign: 'left' }}>
            <p style={{ color: '#92400e', fontSize: '0.85rem', lineHeight: 1.6 }}>{t('verify_check_quality_desc')}</p>
          </div>
          <button type="button" onClick={resetForRetry} style={{ width: '100%', padding: '0.88rem', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={16} /> {t('verify_retry_photos')}
          </button>
        </div>
      )}

      {/* ── MRZ INPUT ─────────────── */}
      {phase === 'mrz-input' && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1c1c1c', marginBottom: 4 }}>{t('verify_mrz_title')}</h1>
            <p style={{ color: '#888', fontSize: '0.81rem' }}>{t('verify_mrz_sub')}</p>
          </div>
          {backImg.preview && <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e0ddd7' }}><img src={backImg.preview} alt="Verso" style={{ width: '100%', height: 130, objectFit: 'cover' }} /></div>}
          {errorMsg && <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8 }}><AlertCircle size={15} color="#b91c1c" /><p style={{ color: '#b91c1c', fontSize: '0.82rem' }}>{errorMsg}</p></div>}
          {[
            { label: `${t('verify_mrz_line')} 1`, value: mrzLine1, set: setMrzLine1 },
            { label: `${t('verify_mrz_line')} 2`, value: mrzLine2, set: setMrzLine2 },
            { label: `${t('verify_mrz_line')} 3`, value: mrzLine3, set: setMrzLine3 },
          ].map(item => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ fontWeight: 600, fontSize: '0.8rem', color: '#444' }}>{item.label}</label>
                <span style={{ fontSize: '0.7rem', color: item.value.length === 30 ? '#16a34a' : '#999' }}>{item.value.length}/30</span>
              </div>
              <input type="text" value={item.value} maxLength={30} onChange={e => item.set(e.target.value.toUpperCase().replace(/[^A-Z0-9<]/g, ''))} style={{ width: '100%', padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.82rem', background: '#f9f7f4', border: `1.5px solid ${item.value.length === 30 ? '#16a34a' : '#e0ddd7'}`, borderRadius: 8 }} />
            </div>
          ))}
          <button type="button" onClick={submitVerification} style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #1a4d3a, #2d7a5a)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ShieldCheck size={17} /> {t('verify_btn')}
          </button>
        </div>
      )}

      {/* ── CHECKING ──────────────── */}
      {phase === 'checking' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, minHeight: 260, textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 72, height: 72 }}><div style={{ width: 72, height: 72, borderRadius: '50%', border: '4px solid #e8f2ee', borderTopColor: COLORS.green, animation: 'spin 0.8s linear infinite' }} /></div>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1c1c1c' }}>{t('verify_checking')}</p>
        </div>
      )}

      {/* ── PASS ──────────────────── */}
      {phase === 'pass' && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={36} color="#fff" /></div>
          <h1 style={{ fontWeight: 800, fontSize: '1.35rem', color: '#166534' }}>{t('verify_pass_title')}</h1>
          <p style={{ color: '#166534', fontSize: '0.85rem' }}>{successMsg}</p>
        </div>
      )}

      {/* ── FAIL ──────────────────── */}
      {phase === 'fail' && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff5f5', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={30} color="#b91c1c" /></div>
          <h1 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#b91c1c' }}>{t('verify_fail_title')}</h1>
          <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem 1.2rem', width: '100%', textAlign: 'left' }}>
            <p style={{ color: '#b91c1c', fontSize: '0.85rem' }}>⚠️ {errorMsg}</p>
            <p style={{ color: '#999', fontSize: '0.77rem', marginTop: 8 }}>{t('verify_fail_attempts')}</p>
          </div>
          <button type="button" onClick={resetForRetry} style={{ width: '100%', padding: '0.88rem', background: COLORS.orange, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={16} /> {t('verify_retry_btn')}
          </button>
        </div>
      )}

      {/* ── FAIL FINAL ────────────── */}
      {phase === 'fail-final' && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff5f5', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={28} color="#b91c1c" /></div>
          <h1 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#b91c1c' }}>{t('verify_final_title')}</h1>
          <p style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{t('verify_final_sub')}</p>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
