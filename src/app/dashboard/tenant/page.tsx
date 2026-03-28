'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LangProvider, useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { mockProperties, mockPayments, formatPrice } from '@/lib/mockData';
import { Heart, CreditCard, FileText, MessageSquare, Star, CheckCircle2, Download, ExternalLink, Clock, BarChart2 } from 'lucide-react';

const tabs = ['saved', 'payments', 'receipts', 'messages'] as const;
type Tab = typeof tabs[number];

function TenantDashboard() {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>('saved');

  const tabConfig = [
    { key: 'saved' as Tab,    label: t('dash_saved'),    icon: Heart },
    { key: 'payments' as Tab, label: t('dash_payments'), icon: CreditCard },
    { key: 'receipts' as Tab, label: t('dash_receipts'), icon: FileText },
    { key: 'messages' as Tab, label: t('dash_messages'), icon: MessageSquare },
  ];

  const savedProps = mockProperties.slice(0, 3);

  const sectionStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e0ddd7', borderRadius: 10, overflow: 'hidden' };

  return (
    <main style={{ minHeight: '100vh', background: '#f9f7f4' }}>
      <Navbar />

      {/* Header */}
      <div style={{ paddingTop: '4rem', background: '#1a4d3a', padding: '4rem 1.5rem 1.75rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginBottom: 4 }}>{t('dash_welcome')},</p>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)' }}>Fatou Diallo 👋</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: 2 }}>{t('dash_tenant_title')}</p>
          </div>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou" alt="Fatou" style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', background: '#e8f2ee' }} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '🏠', label: lang === 'fr' ? 'Propriétés sauvegardées' : 'Saved', val: '3' },
            { icon: '💳', label: lang === 'fr' ? 'Paiements ce mois' : 'Payments', val: '1' },
            { icon: '📄', label: lang === 'fr' ? 'Quittances' : 'Receipts', val: '12' },
            { icon: '⭐', label: lang === 'fr' ? 'Score de confiance' : 'Trust score', val: '4.8' },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e0ddd7', borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{icon}</div>
              <p style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1c1c1c' }}>{val}</p>
              <p style={{ color: '#888', fontSize: '0.78rem' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={sectionStyle}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e0ddd7', overflowX: 'auto' }}>
            {tabConfig.map(({ key, label, icon: Icon }) => (
              <button key={key} id={`tab-${key}`} onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '1rem 1.25rem', whiteSpace: 'nowrap',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  border: 'none', background: 'none',
                  borderBottom: `2px solid ${activeTab === key ? '#1a4d3a' : 'transparent'}`,
                  color: activeTab === key ? '#1a4d3a' : '#888',
                  transition: 'all 0.15s',
                }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div style={{ padding: '1.25rem' }}>
            {activeTab === 'saved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} id="saved-properties">
                {savedProps.map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: 12, padding: 12, background: '#f9f7f4', borderRadius: 8, border: '1px solid #ede8e0', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 80, height: 60, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                      <Image src={p.images[0]} alt={p.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c1c1c', marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {lang === 'fr' ? p.title : p.titleEn}
                      </p>
                      <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 4 }}>{p.neighborhood}, {p.city}</p>
                      <p style={{ fontWeight: 700, color: '#1a4d3a', fontSize: '0.85rem' }}>{formatPrice(p.price)}<span style={{ fontWeight: 400, color: '#aaa', fontSize: '0.75rem' }}>/mois</span></p>
                    </div>
                    <Link href={`/listings/${p.id}`} style={{ flexShrink: 0, color: '#1a4d3a', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <ExternalLink size={11} /> {t('see_details')}
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'payments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} id="payments-history">
                {mockPayments.map(pay => {
                  const prop = mockProperties.find(p => p.id === pay.propertyId);
                  const emoji: Record<string, string> = { orange: '🟠', mtn: '🟡', moov: '🔵', wave: '🌊' };
                  return (
                    <div key={pay.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f9f7f4', borderRadius: 8, border: '1px solid #ede8e0' }}>
                      <span style={{ fontSize: '1.4rem' }}>{emoji[pay.method]}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1c1c' }}>{prop ? (lang === 'fr' ? prop.title : prop.titleEn) : ''}</p>
                        <p style={{ color: '#aaa', fontSize: '0.75rem' }}>{pay.date} · {pay.method.toUpperCase()}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1c1c' }}>{formatPrice(pay.amount)}</p>
                        <p style={{ color: '#1a4d3a', fontSize: '0.72rem', fontWeight: 600 }}>✓ {lang === 'fr' ? 'Complété' : 'Done'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'receipts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} id="receipts-list">
                {mockPayments.map(pay => (
                  <div key={pay.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f9f7f4', borderRadius: 8, border: '1px solid #ede8e0' }}>
                    <div style={{ width: 36, height: 36, background: '#e8f2ee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={16} color="#1a4d3a" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1c1c' }}>{lang === 'fr' ? 'Quittance de loyer' : 'Rent receipt'} — {pay.date}</p>
                      <p style={{ color: '#aaa', fontSize: '0.75rem' }}>{formatPrice(pay.amount)}</p>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1a4d3a', fontWeight: 600, fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Download size={12} /> {lang === 'fr' ? 'Télécharger' : 'Download'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'messages' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} id="messages-list">
                {[0, 1].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: 12, background: '#f9f7f4', borderRadius: 8, border: '1px solid #ede8e0', cursor: 'pointer' }}>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kouame" alt="" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1c1c' }}>Kouamé Adjoumani</p>
                        <p style={{ color: '#aaa', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {i === 0 ? '10:30' : 'Hier'}</p>
                      </div>
                      <p style={{ color: '#888', fontSize: '0.8rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {i === 0 ? (lang === 'fr' ? 'Bonjour, votre dossier est complet.' : 'Hello, your application is complete.') : (lang === 'fr' ? 'La visite est confirmée pour demain.' : 'The viewing is confirmed for tomorrow.')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function Page() {
  return <LangProvider><TenantDashboard /></LangProvider>;
}
