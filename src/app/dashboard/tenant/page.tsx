'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase, Profile, Booking, SavedProperty } from '@/lib/supabase';
import { formatPrice } from '@/lib/mockData';
import {
  Heart, Calendar, MessageSquare, ExternalLink,
  LogOut, Loader2, Home, CheckCircle2,
} from 'lucide-react';

/* ─── Types ───────────────────────────────────────────────────────────── */

type Tab = 'bookings' | 'saved' | 'messages';

interface BookingWithJoins extends Booking {
  properties: {
    id: string;
    title: string;
    title_en: string | null;
    neighborhood: string;
    city: string;
    price: number;
    images: string[] | null;
  };
  agent: {
    full_name: string;
    avatar_url: string | null;
    verified: boolean;
  };
}

/* ─── Status badge helper ─────────────────────────────────────────────── */

function statusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'confirmed':   return { bg: '#e8f2ee', text: '#1a4d3a' };
    case 'pending':     return { bg: '#fef3c7', text: '#92400e' };
    case 'rescheduled': return { bg: '#dbeafe', text: '#1e40af' };
    case 'cancelled':   return { bg: '#fee2e2', text: '#991b1b' };
    case 'completed':   return { bg: '#f3e8ff', text: '#6b21a8' };
    default:            return { bg: '#f3f4f6', text: '#6b7280' };
  }
}

/* ─── Main Component ──────────────────────────────────────────────────── */

function TenantDashboard() {
  const { t, lang } = useLang();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<BookingWithJoins[]>([]);
  const [savedProps, setSavedProps] = useState<SavedProperty[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // ─── Auth guard + data fetch ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Check auth
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        router.replace('/auth/login');
        return;
      }

      // 2. Fetch profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!prof) {
        router.replace('/auth/login');
        return;
      }

      // 3. Redirect landlords to their dashboard
      if (prof.role === 'landlord') {
        router.replace('/dashboard/landlord');
        return;
      }

      if (cancelled) return;
      setProfile(prof as Profile);

      // 4. Fetch bookings with property + agent joins
      const { data: bookingData } = await supabase
        .from('bookings')
        .select(`
          *,
          properties!property_id ( id, title, title_en, neighborhood, city, price, images ),
          agent:profiles!agent_id ( full_name, avatar_url, verified )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (!cancelled && bookingData) {
        setBookings(bookingData as unknown as BookingWithJoins[]);
      }

      // 5. Fetch saved properties
      const { data: savedData } = await supabase
        .from('saved_properties')
        .select(`
          *,
          properties!property_id ( id, title, title_en, neighborhood, city, price, images )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (!cancelled && savedData) {
        setSavedProps(savedData as unknown as SavedProperty[]);
      }

      if (!cancelled) setLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, [router]);

  // ─── Sign out handler ────────────────────────────────────────────────
  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace('/');
  };

  // ─── Booking status translation key ──────────────────────────────────
  const statusLabel = (s: string) => {
    const key = `dash_booking_status_${s}` as Parameters<typeof t>[0];
    return t(key);
  };

  // ─── Tab config ──────────────────────────────────────────────────────
  const tabConfig: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'bookings', label: t('dash_bookings'),  icon: Calendar },
    { key: 'saved',    label: t('dash_saved'),      icon: Heart },
    { key: 'messages', label: t('dash_messages'),   icon: MessageSquare },
  ];

  const sectionStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid #e0ddd7', borderRadius: 10, overflow: 'hidden',
  };

  // ─── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f9f7f4' }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
          <Loader2 size={32} color="#1a4d3a" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#888', fontWeight: 600, fontSize: '0.9rem' }}>{t('dash_loading')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main style={{ minHeight: '100vh', background: '#f9f7f4' }}>
      <Navbar />

      {/* Header */}
      <div style={{ paddingTop: '4rem', background: '#1a4d3a', padding: '4rem 1.5rem 1.75rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginBottom: 4 }}>{t('dash_welcome')},</p>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)' }}>
              {profile.full_name} 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: 2 }}>{t('dash_tenant_title')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name}
                style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', background: '#e8f2ee', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', background: '#e8f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#1a4d3a' }}>
                {profile.full_name.charAt(0)}
              </div>
            )}
            <button onClick={handleSignOut} disabled={signingOut}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '0.5rem 1rem', borderRadius: 10,
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                opacity: signingOut ? 0.6 : 1, transition: 'all 0.15s',
              }}>
              <LogOut size={14} />
              {signingOut ? t('dash_signing_out') : t('dash_sign_out')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '📅', label: t('dash_bookings'), val: String(bookings.length) },
            { icon: '❤️', label: t('dash_saved'), val: String(savedProps.length) },
            { icon: '✅', label: lang === 'fr' ? 'Confirmées' : 'Confirmed', val: String(bookings.filter(b => b.status === 'confirmed').length) },
            { icon: '⭐', label: lang === 'fr' ? 'Score de confiance' : 'Trust score', val: String(profile.trust_score || '—') },
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
              <button key={key} onClick={() => setActiveTab(key)}
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
            {/* ─── Bookings Tab ─── */}
            {activeTab === 'bookings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <Calendar size={40} color="#ccc" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>{t('dash_no_bookings')}</p>
                    <Link href="/listings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1a4d3a', fontWeight: 700, fontSize: '0.85rem', marginTop: 12, textDecoration: 'none' }}>
                      <Home size={14} /> {t('nav_listings')}
                    </Link>
                  </div>
                ) : (
                  bookings.map(bk => {
                    const prop = bk.properties;
                    const agent = bk.agent;
                    const propTitle = lang === 'fr' ? prop.title : (prop.title_en || prop.title);
                    const displayDate = bk.status === 'rescheduled' && bk.rescheduled_to
                      ? new Date(bk.rescheduled_to)
                      : new Date(bk.preferred_date);
                    const dateStr = displayDate.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    });
                    const timeStr = displayDate.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                      hour: '2-digit', minute: '2-digit',
                    });
                    const sc = statusColor(bk.status);

                    return (
                      <div key={bk.id} style={{ display: 'flex', gap: 12, padding: 14, background: '#f9f7f4', borderRadius: 10, border: '1px solid #ede8e0', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Property thumbnail */}
                        {prop.images && prop.images.length > 0 && (
                          <div style={{ position: 'relative', width: 80, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                            <Image src={prop.images[0]} alt={propTitle} fill style={{ objectFit: 'cover' }} />
                          </div>
                        )}

                        {/* Booking details */}
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c1c1c' }}>{propTitle}</p>
                            <span style={{
                              display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                              fontSize: '0.7rem', fontWeight: 700,
                              background: sc.bg, color: sc.text,
                            }}>
                              {statusLabel(bk.status)}
                            </span>
                          </div>

                          <p style={{ color: '#888', fontSize: '0.78rem', marginBottom: 2 }}>
                            {prop.neighborhood}, {prop.city} · {formatPrice(prop.price)}/mois
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', fontSize: '0.8rem', marginBottom: 2 }}>
                            <Calendar size={12} /> {dateStr} · {timeStr}
                          </div>

                          {/* Show rescheduled date if applicable */}
                          {bk.status === 'rescheduled' && bk.rescheduled_to && (
                            <p style={{ color: '#1e40af', fontSize: '0.75rem', fontWeight: 600, marginTop: 2 }}>
                              {t('dash_new_date')} {new Date(bk.rescheduled_to).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </p>
                          )}

                          {/* Agent info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            {agent.avatar_url ? (
                              <img src={agent.avatar_url} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e8f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#1a4d3a' }}>
                                {agent.full_name.charAt(0)}
                              </div>
                            )}
                            <span style={{ fontSize: '0.78rem', color: '#555' }}>
                              {agent.full_name}
                              {agent.verified && <CheckCircle2 size={10} color="#1a4d3a" style={{ marginLeft: 3, verticalAlign: 'middle' }} />}
                            </span>
                          </div>
                        </div>

                        {/* Action link */}
                        <Link href={`/listings/${prop.id}`}
                          style={{ flexShrink: 0, color: '#1a4d3a', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, alignSelf: 'center' }}>
                          <ExternalLink size={11} /> {t('see_details')}
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ─── Saved Properties Tab ─── */}
            {activeTab === 'saved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {savedProps.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <Heart size={40} color="#ccc" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>{t('dash_no_saved')}</p>
                    <Link href="/listings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1a4d3a', fontWeight: 700, fontSize: '0.85rem', marginTop: 12, textDecoration: 'none' }}>
                      <Home size={14} /> {t('nav_listings')}
                    </Link>
                  </div>
                ) : (
                  savedProps.map(sp => {
                    const p = sp.properties;
                    if (!p) return null;
                    const propTitle = lang === 'fr' ? p.title : (p.title_en || p.title);
                    return (
                      <div key={sp.id} style={{ display: 'flex', gap: 12, padding: 12, background: '#f9f7f4', borderRadius: 8, border: '1px solid #ede8e0', alignItems: 'center' }}>
                        {p.images && p.images.length > 0 && (
                          <div style={{ position: 'relative', width: 80, height: 60, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                            <Image src={p.images[0]} alt={propTitle} fill style={{ objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c1c1c', marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {propTitle}
                          </p>
                          <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 4 }}>{p.neighborhood}, {p.city}</p>
                          <p style={{ fontWeight: 700, color: '#1a4d3a', fontSize: '0.85rem' }}>
                            {formatPrice(p.price)}<span style={{ fontWeight: 400, color: '#aaa', fontSize: '0.75rem' }}>/mois</span>
                          </p>
                        </div>
                        <Link href={`/listings/${p.id}`} style={{ flexShrink: 0, color: '#1a4d3a', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <ExternalLink size={11} /> {t('see_details')}
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ─── Messages Tab (placeholder) ─── */}
            {activeTab === 'messages' && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <MessageSquare size={40} color="#ccc" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#888', fontSize: '0.9rem' }}>{t('dash_no_messages')}</p>
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
  return <TenantDashboard />;
}
