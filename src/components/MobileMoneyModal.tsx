'use client';
import React, { useState } from 'react';
import { useLang } from '@/lib/lang';
import { X, CheckCircle2, Download, Smartphone } from 'lucide-react';
import { formatPrice } from '@/lib/mockData';

interface MobileMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  propertyTitle: string;
}

const operators = [
  { id: 'orange', name: 'Orange Money', emoji: '🟠', color: '#FF6600', bg: '#fff8f4', border: '#ffd0b5' },
  { id: 'mtn',    name: 'MTN Money',    emoji: '🟡', color: '#e6a800', bg: '#fffdf0', border: '#ffe680' },
  { id: 'moov',   name: 'Moov Money',   emoji: '🔵', color: '#0057b8', bg: '#f0f4ff', border: '#b3c9f5' },
  { id: 'wave',   name: 'Wave',         emoji: '🌊', color: '#009ab5', bg: '#f0fafc', border: '#99dce8' },
];

export default function MobileMoneyModal({ isOpen, onClose, amount, propertyTitle }: MobileMoneyModalProps) {
  const { t, lang } = useLang();
  const [step, setStep] = useState<'choose' | 'enter' | 'success'>('choose');
  const [selected, setSelected] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  const op = operators.find(o => o.id === selected);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('success'); }, 2000);
  };

  const handleClose = () => {
    setStep('choose'); setSelected(null); setPhone(''); setLoading(false); onClose();
  };

  return (
    <div id="mobile-money-modal" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} />

      {/* Panel */}
      <div className="animate-fade-in-up" style={{
        position: 'relative', background: '#fff', borderRadius: 12,
        width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: '#1a4d3a', padding: '1.25rem 1.5rem', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>{t('pay_title')}</h2>
            <button onClick={handleClose} id="modal-close" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} />
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{propertyTitle}</p>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{t('pay_amount')}</p>
            <p style={{ fontWeight: 800, fontSize: '1.4rem' }}>{formatPrice(amount)}</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {step === 'choose' && (
            <>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#555', marginBottom: '1rem' }}>{t('pay_choose')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {operators.map(o => (
                  <button key={o.id} id={`pay-${o.id}`}
                    onClick={() => { setSelected(o.id); setStep('enter'); }}
                    style={{
                      padding: '1rem', borderRadius: 8,
                      border: `1.5px solid ${o.border}`, background: o.bg,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{o.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1c1c1c' }}>{o.name}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'enter' && op && (
            <>
              <button onClick={() => setStep('choose')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}>
                ← {t('back')}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: op.bg, border: `1px solid ${op.border}`, marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{op.emoji}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1c1c' }}>{op.name}</p>
                  <p style={{ color: '#888', fontSize: '0.78rem' }}>{formatPrice(amount)}</p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#555', marginBottom: 6 }}>{t('pay_phone')}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f9f7f4', border: '1px solid #e0ddd7', borderRadius: 6, padding: '10px 12px', fontSize: '0.85rem', color: '#666', flexShrink: 0 }}>
                    🇨🇮 +225
                  </div>
                  <input id="pay-phone-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="07 12 34 56 78" className="input-field" style={{ flex: 1 }} />
                </div>
              </div>

              <button id="pay-confirm-btn" onClick={handleConfirm} disabled={!phone || loading}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: 8, border: 'none',
                  background: op.color, color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  cursor: phone && !loading ? 'pointer' : 'not-allowed', opacity: !phone || loading ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.2s',
                }}>
                {loading ? (
                  <>
                    <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                    {lang === 'fr' ? 'Traitement...' : 'Processing...'}
                  </>
                ) : (
                  <><Smartphone size={15} /> {t('pay_confirm')}</>
                )}
              </button>
            </>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div className="animate-pulse-glow" style={{
                width: 64, height: 64, borderRadius: '50%', background: '#e8f2ee',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
              }}>
                <CheckCircle2 size={30} color="#1a4d3a" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1c1c1c', marginBottom: '0.5rem' }}>{t('pay_success')}</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {lang === 'fr' ? 'Paiement traité avec succès. Votre quittance a été générée.' : 'Payment processed successfully. Your receipt has been generated.'}
              </p>
              <button id="download-receipt" className="btn-green" style={{ width: '100%', marginBottom: 8, justifyContent: 'center' }}>
                <Download size={14} /> {t('pay_receipt')}
              </button>
              <button id="modal-close-success" onClick={handleClose}
                style={{ width: '100%', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '0.875rem' }}>
                {t('pay_close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
