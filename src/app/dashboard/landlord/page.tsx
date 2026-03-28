'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LangProvider, useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { mockProperties, mockPayments, formatPrice } from '@/lib/mockData';
import { Building2, PlusCircle, Users, CreditCard, Eye, Edit, Trash2, Star, CheckCircle2 } from 'lucide-react';

const tabs = ['listings', 'requests', 'payments', 'add'] as const;
type Tab = typeof tabs[number];

function LandlordDashboard() {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [addForm, setAddForm] = useState({ title: '', price: '', neighborhood: '', rooms: '', area: '', description: '' });

  const myProps = mockProperties.filter(p => p.landlordId === 'l1');
  const myPayments = mockPayments.filter(p => p.landlordId === 'l1');
  const totalRevenue = myPayments.reduce((s, p) => s + p.amount, 0);

  const tabConfig = [
    { key: 'listings' as Tab, label: t('dash_my_listings'), icon: Building2 },
    { key: 'requests' as Tab, label: t('dash_requests'), icon: Users },
    { key: 'payments' as Tab, label: t('dash_received'), icon: CreditCard },
    { key: 'add' as Tab, label: t('dash_add_property'), icon: PlusCircle },
  ];

  const sectionStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e0ddd7', borderRadius: 10, overflow: 'hidden' };

  return (
    <main style={{ minHeight: '100vh', background: '#f9f7f4' }}>
      <Navbar />

      <div style={{ paddingTop: '4rem', background: '#133829', padding: '4rem 1.5rem 1.75rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginBottom: 4 }}>{t('dash_welcome')},</p>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)' }}>Kouamé Adjoumani 🏢</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: 2 }}>{t('dash_landlord_title')}</p>
          </div>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kouame" alt="Kouamé" style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', background: '#e8f2ee' }} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '🏢', label: t('dash_stats_active'), val: String(myProps.length) },
            { icon: '👥', label: t('dash_stats_pending'), val: '2' },
            { icon: '💰', label: t('dash_stats_revenue'), val: formatPrice(totalRevenue), small: true },
            { icon: '⭐', label: lang === 'fr' ? 'Score de confiance' : 'Trust score', val: '4.9' },
          ].map(({ icon, label, val, small }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e0ddd7', borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{icon}</div>
              <p style={{ fontWeight: 800, fontSize: small ? '1rem' : '1.4rem', color: '#1c1c1c' }}>{val}</p>
              <p style={{ color: '#888', fontSize: '0.78rem' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e0ddd7', overflowX: 'auto' }}>
            {tabConfig.map(({ key, label, icon: Icon }) => (
              <button key={key} id={`landlord-tab-${key}`} onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '1rem 1.25rem', whiteSpace: 'nowrap',
                  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  border: 'none', background: 'none',
                  borderBottom: `2px solid ${activeTab === key ? '#c8501e' : 'transparent'}`,
                  color: activeTab === key ? '#c8501e' : '#888',
                  transition: 'all 0.15s',
                }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div style={{ padding: '1.25rem' }}>
            {/* My listings */}
            {activeTab === 'listings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} id="my-listings">
                {myProps.map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: 12, padding: 12, background: '#f9f7f4', borderRadius: 8, border: '1px solid #ede8e0', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 80, height: 60, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                      <Image src={p.images[0]} alt={p.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c1c1c', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {lang === 'fr' ? p.title : p.titleEn}
                        </p>
                        {p.verified && <span style={{ flexShrink: 0, background: '#e8f2ee', color: '#1a4d3a', fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>✓ {t('verified')}</span>}
                      </div>
                      <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 3 }}>{p.neighborhood} · {p.rooms} pièces · {p.area}m²</p>
                      <p style={{ fontWeight: 700, color: '#1a4d3a', fontSize: '0.85rem' }}>{formatPrice(p.price)}/mois</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <Link href={`/listings/${p.id}`} style={{ color: '#888', transition: 'color 0.15s' }}><Eye size={15} color="#888" /></Link>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Edit size={15} color="#888" /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Trash2 size={15} color="#e57373" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Requests */}
            {activeTab === 'requests' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} id="tenant-requests">
                {[
                  { name: 'Fatou Diallo', seed: 'Fatou', score: 4.8, msg: lang === 'fr' ? 'Bonjour, je suis très intéressée par votre appartement. Disponibilités pour une visite?' : 'Hello, I am very interested in your apartment. Available for a viewing?', date: lang === 'fr' ? "Aujourd'hui" : "Today" },
                  { name: "Jean-Baptiste N'Goran", seed: 'Jean', score: 4.6, msg: lang === 'fr' ? 'Je souhaite en savoir plus sur les conditions du bail.' : 'I would like to know more about the lease conditions.', date: lang === 'fr' ? 'Hier' : 'Yesterday' },
                ].map((req, i) => (
                  <div key={i} style={{ padding: 14, background: '#f9f7f4', borderRadius: 8, border: '1px solid #ede8e0' }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.seed}`} alt={req.name} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1c1c' }}>{req.name}</p>
                          <Star size={12} color="#c8501e" fill="#c8501e" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1c1c1c' }}>{req.score}</span>
                          <CheckCircle2 size={12} color="#1a4d3a" />
                        </div>
                        <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 5 }}>→ {lang === 'fr' ? myProps[0]?.title : myProps[0]?.titleEn} · {req.date}</p>
                        <p style={{ color: '#666', fontSize: '0.82rem', fontStyle: 'italic' }}>&ldquo;{req.msg}&rdquo;</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-green" style={{ flex: 1, justifyContent: 'center', padding: '7px', fontSize: '0.8rem' }}>
                        {lang === 'fr' ? 'Accepter' : 'Accept'}
                      </button>
                      <button style={{ flex: 1, padding: '7px', background: '#f0ede7', border: '1px solid #e0ddd7', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, color: '#888', cursor: 'pointer' }}>
                        {lang === 'fr' ? 'Refuser' : 'Decline'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payments */}
            {activeTab === 'payments' && (
              <div id="received-payments">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: '#e8f2ee', border: '1px solid #c5ddd5', borderRadius: 8, marginBottom: '1rem' }}>
                  <CreditCard size={18} color="#1a4d3a" />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a4d3a' }}>{lang === 'fr' ? 'Total reçu' : 'Total received'}</p>
                    <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#133829' }}>{formatPrice(totalRevenue)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {myPayments.map(pay => (
                    <div key={pay.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f9f7f4', borderRadius: 8, border: '1px solid #ede8e0' }}>
                      <div style={{ width: 36, height: 36, background: '#e8f2ee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CreditCard size={15} color="#1a4d3a" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1c1c' }}>Fatou Diallo</p>
                        <p style={{ color: '#aaa', fontSize: '0.75rem' }}>{pay.date} · {pay.method.toUpperCase()}</p>
                      </div>
                      <p style={{ fontWeight: 800, color: '#1a4d3a', fontSize: '0.875rem' }}>+{formatPrice(pay.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add property */}
            {activeTab === 'add' && (
              <div id="add-property-form">
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c1c1c', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PlusCircle size={16} color="#c8501e" /> {t('dash_add_property')}
                </h2>
                <form onSubmit={e => e.preventDefault()} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.875rem' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#555', marginBottom: 5 }}>{lang === 'fr' ? "Titre de l'annonce" : 'Listing title'}</label>
                    <input id="add-title" type="text" placeholder={lang === 'fr' ? 'Ex: Appartement 3 pièces Cocody' : 'E.g. 3-room apartment Cocody'} className="input-field" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#555', marginBottom: 5 }}>{t('filter_neighborhood')}</label>
                    <select id="add-neighborhood" className="input-field" value={addForm.neighborhood} onChange={e => setAddForm(f => ({ ...f, neighborhood: e.target.value }))}>
                      <option value="">{lang === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                      {['Cocody', 'Yopougon', 'Plateau', 'Abobo', 'Adjamé', 'Marcory'].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#555', marginBottom: 5 }}>{lang === 'fr' ? 'Prix mensuel (FCFA)' : 'Monthly price (FCFA)'}</label>
                    <input id="add-price" type="number" placeholder="250000" className="input-field" value={addForm.price} onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#555', marginBottom: 5 }}>{t('filter_rooms')}</label>
                    <select id="add-rooms" className="input-field" value={addForm.rooms} onChange={e => setAddForm(f => ({ ...f, rooms: e.target.value }))}>
                      <option value="">{lang === 'fr' ? 'Sélectionner' : 'Select'}</option>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#555', marginBottom: 5 }}>Surface (m²)</label>
                    <input id="add-area" type="number" placeholder="75" className="input-field" value={addForm.area} onChange={e => setAddForm(f => ({ ...f, area: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#555', marginBottom: 5 }}>{t('detail_description')}</label>
                    <textarea id="add-desc" rows={3} placeholder={lang === 'fr' ? 'Décrivez votre bien...' : 'Describe your property...'} className="input-field" style={{ resize: 'none' }} value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <button id="add-submit" type="submit" className="btn-green" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                      <PlusCircle size={15} /> {lang === 'fr' ? "Publier l'annonce" : 'Publish listing'}
                    </button>
                  </div>
                </form>
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
  return <LangProvider><LandlordDashboard /></LangProvider>;
}
