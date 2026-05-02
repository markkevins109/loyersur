'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileMoneyModal from '@/components/MobileMoneyModal';
import { supabase, Property, Profile } from '@/lib/supabase';
import { formatPrice } from '@/lib/mockData';
import {
  MapPin, Star, Bed, Bath, Maximize2, CheckCircle2, Phone,
  Calendar, CreditCard, ArrowLeft, ChevronLeft, ChevronRight,
  Shield, Share2, Heart, Clock, X, Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Booking Calendar Component ──────────────────────────────────────── */

interface BookingCalendarProps {
  propertyId: string;
  onClose: () => void;
  lang: 'fr' | 'en';
  t: (key: string) => string;
}

const TIME_SLOTS = ['09:00', '11:00', '14:00', '16:00', '18:00'];

function BookingCalendar({ propertyId, onClose, lang, t }: BookingCalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<'date' | 'time' | 'confirming' | 'success' | 'error' | 'login'>('date');
  const [errorMsg, setErrorMsg] = useState('');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calendar grid computation
  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Monday-first

    const days: { day: number; inMonth: boolean; date: Date }[] = [];

    // Padding from previous month
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startPad - 1; i >= 0; i--) {
      const d = prevLastDay - i;
      days.push({ day: d, inMonth: false, date: new Date(year, month - 1, d) });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ day: d, inMonth: true, date: new Date(year, month, d) });
    }

    // Padding to fill last row
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        days.push({ day: d, inMonth: false, date: new Date(year, month + 1, d) });
      }
    }

    return days;
  }, [currentMonth]);

  const monthLabel = useMemo(() => {
    const d = new Date(currentMonth.year, currentMonth.month, 1);
    return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth, lang]);

  const canGoPrev = currentMonth.year > today.getFullYear() ||
    (currentMonth.year === today.getFullYear() && currentMonth.month > today.getMonth());

  const navigateMonth = (dir: -1 | 1) => {
    setCurrentMonth(prev => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setPhase('time');
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    setPhase('confirming');

    // Build ISO datetime
    const [hours, mins] = selectedTime.split(':');
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(parseInt(hours), parseInt(mins), 0, 0);

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPhase('login');
        return;
      }

      const res = await fetch('/api/book-viewing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          property_id: propertyId,
          preferred_date: bookingDate.toISOString(),
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPhase('success');
      } else if (res.status === 401) {
        setPhase('login');
      } else {
        setErrorMsg(data.error || t('booking_error'));
        setPhase('error');
      }
    } catch {
      setErrorMsg(t('booking_error'));
      setPhase('error');
    }
  };

  const dayNames = lang === 'fr'
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const formatSelectedDate = (d: Date) =>
    d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div style={{ background: '#F8FAFC', borderRadius: 20, padding: '1.25rem', marginTop: '1rem', border: '1px solid #E2E8F0' }}>
        {/* ─── Success state ─── */}
        {phase === 'success' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={32} color="#10B981" />
            </div>
            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', marginBottom: 6 }}>
              {t('booking_success_title')}
            </h4>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, maxWidth: 300, margin: '0 auto 1.5rem' }}>
              {t('booking_success_desc')}
            </p>
            <button onClick={() => { setPhase('date'); setSelectedDate(null); setSelectedTime(null); setMessage(''); }}
              style={{ background: 'none', border: '2px solid #0F172A', color: '#0F172A', padding: '0.6rem 1.25rem', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              {t('booking_book_another')}
            </button>
          </motion.div>
        )}

        {/* ─── Login required ─── */}
        {phase === 'login' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>{t('booking_login_required')}</p>
            <button onClick={() => router.push('/auth/login')}
              className="btn-primary" style={{ padding: '0.7rem 2rem' }}>
              {t('nav_login')}
            </button>
          </div>
        )}

        {/* ─── Error state ─── */}
        {phase === 'error' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: '#10B981', fontSize: '0.9rem', marginBottom: '1rem' }}>{errorMsg}</p>
            <button onClick={() => setPhase('date')}
              style={{ background: 'none', border: '2px solid #0F172A', color: '#0F172A', padding: '0.6rem 1.25rem', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              {t('booking_back')}
            </button>
          </div>
        )}

        {/* ─── Confirming spinner ─── */}
        {phase === 'confirming' && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#0F172A', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>{t('booking_confirming')}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ─── Date picker ─── */}
        {phase === 'date' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} color="#0F172A" /> {t('booking_select_date')}
              </h4>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color="#888" />
              </button>
            </div>

            {/* Month navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <button onClick={() => canGoPrev && navigateMonth(-1)}
                style={{ background: 'none', border: 'none', cursor: canGoPrev ? 'pointer' : 'default', opacity: canGoPrev ? 1 : 0.3, padding: 4 }}>
                <ChevronLeft size={20} color="#0F172A" />
              </button>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', textTransform: 'capitalize' }}>{monthLabel}</span>
              <button onClick={() => navigateMonth(1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <ChevronRight size={20} color="#0F172A" />
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
              {dayNames.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#aaa', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {calendarDays.map(({ day, inMonth, date }, i) => {
                const isPast = date < today;
                const disabled = !inMonth || isPast;
                const isToday = date.getTime() === today.getTime();
                return (
                  <button
                    key={i}
                    onClick={() => !disabled && handleDateSelect(date)}
                    disabled={disabled}
                    style={{
                      aspectRatio: '1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 10,
                      border: isToday ? '2px solid #0F172A' : '1px solid transparent',
                      background: disabled ? 'transparent' : '#fff',
                      color: disabled ? '#ccc' : '#0F172A',
                      fontWeight: isToday ? 800 : 600,
                      fontSize: '0.8rem',
                      cursor: disabled ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!disabled) (e.target as HTMLElement).style.background = '#e8f2ee'; }}
                    onMouseLeave={e => { if (!disabled) (e.target as HTMLElement).style.background = '#fff'; }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ─── Time picker + message ─── */}
        {phase === 'time' && selectedDate && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <button onClick={() => { setPhase('date'); setSelectedTime(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#0F172A', fontWeight: 700, fontSize: '0.8rem' }}>
                <ChevronLeft size={16} /> {t('booking_back')}
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color="#888" />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="#0F172A" /> {formatSelectedDate(selectedDate)}
            </p>

            <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', marginBottom: '0.75rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color="#0F172A" /> {t('booking_select_time')}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1rem' }}>
              {TIME_SLOTS.map(slot => (
                <button key={slot} onClick={() => setSelectedTime(slot)}
                  style={{
                    padding: '0.65rem 0',
                    borderRadius: 12,
                    border: selectedTime === slot ? '2px solid #0F172A' : '1px solid #E2E8F0',
                    background: selectedTime === slot ? '#e8f2ee' : '#fff',
                    color: selectedTime === slot ? '#0F172A' : '#0F172A',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  {slot}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t('booking_message_placeholder')}
              rows={3}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 12,
                border: '1px solid #E2E8F0', fontSize: '0.85rem',
                resize: 'vertical', fontFamily: 'inherit', background: '#fff',
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = '#0F172A')}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />

            <button
              onClick={handleConfirmBooking}
              disabled={!selectedTime}
              style={{
                width: '100%', marginTop: '1rem', padding: '0.85rem',
                borderRadius: 14, border: 'none',
                background: selectedTime ? '#0F172A' : '#ccc',
                color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                cursor: selectedTime ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s',
              }}>
              <Send size={16} /> {t('booking_confirm')}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Property Detail Page ───────────────────────────────────────── */

export default function PropertyDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { lang, t } = useLang();
  const [imgIdx, setImgIdx] = useState(0);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [landlord, setLandlord] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);

      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles!agent_id(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        const { profiles: agentProfile, ...propData } = data;
        setProperty(propData as Property);
        setLandlord(agentProfile as Profile);
      }

      setLoading(false);
    }
    fetchProperty();
  }, [id]);

  const handleProtectedAction = (action: () => void) => {
    if (!session) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    action();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-cream">
        <Navbar />
        <div className="pt-28 pb-20 flex items-center justify-center">
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#0F172A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-bg-cream">
        <Navbar />
        <div className="pt-28 pb-20 text-center">
          <p className="text-text-muted text-lg">{lang === 'fr' ? 'Propriété introuvable.' : 'Property not found.'}</p>
          <Link href="/listings" className="text-primary font-bold mt-4 inline-block">{t('nav_listings')}</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const features = lang === 'fr' ? (property.features || []) : (property.features_en || property.features || []);
  const title = lang === 'fr' ? property.title : (property.title_en || property.title);
  const description = lang === 'fr' ? (property.description || '') : (property.description_en || property.description || '');
  // Filter out any empty/null image URLs, fallback to placeholder
  const rawImages = (property.images ?? []).filter((img): img is string => !!img && img.trim() !== '');
  const hasImages = rawImages.length > 0;
  const images = hasImages ? rawImages : ['/property-exterior-1.png'];


  return (
    <main className="min-h-screen bg-bg-cream selection:bg-accent selection:text-white">
      <Navbar />

      <div className="pt-32 pb-20 container px-6 mx-auto">
        {/* Breadcrumb + Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/listings" className="flex items-center gap-2 font-bold text-primary hover:text-accent transition-colors">
              <ArrowLeft size={16} /> {t('nav_listings')}
            </Link>
            <ChevronRight size={14} className="text-text-muted" />
            <span className="text-text-muted font-medium truncate max-w-[200px]">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-2xl border border-border-soft bg-surface hover:border-accent hover:text-accent transition-all duration-300 shadow-sm">
              <Share2 size={18} className="text-current" />
            </button>
            <button className="p-3 rounded-2xl border border-border-soft bg-surface hover:border-red-400 hover:text-red-500 transition-all duration-300 shadow-sm">
              <Heart size={18} className="text-current" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Gallery */}
            <section className="bg-surface rounded-[2.5rem] overflow-hidden border border-border-soft shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
              <div className="relative aspect-video group bg-bg-cream">
                <Image
                  src={images[imgIdx]}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-surface/90 backdrop-blur-md shadow-xl text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:text-accent"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => setImgIdx(i => (i + 1) % images.length)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-surface/90 backdrop-blur-md shadow-xl text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:text-accent"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-6 right-6 px-4 py-2 bg-surface/80 backdrop-blur-md rounded-full text-primary text-xs font-extrabold shadow-lg">
                  {imgIdx + 1} / {images.length}
                </div>
              </div>

              <div className="p-5 flex gap-4 overflow-x-auto custom-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`relative flex-shrink-0 w-28 aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-300 ${
                      i === imgIdx ? 'ring-2 ring-accent ring-offset-2 scale-95 opacity-100' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </section>

            {/* Core Info */}
            <section className="bg-surface rounded-[2.5rem] p-8 md:p-12 border border-border-soft shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight">{title}</h1>
                {property.verified && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold border border-accent/20">
                    <CheckCircle2 size={16} />
                    {t('verified')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-text-muted font-medium mb-10 text-lg">
                <MapPin size={20} className="text-accent" />
                {property.neighborhood}, {property.city}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-border-soft mb-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-bg-cream text-accent border border-border-soft">
                    <Bed size={24} />
                  </div>
                  <span className="text-sm font-extrabold text-primary">{property.bedrooms} {t('detail_bedrooms')}</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-bg-cream text-accent border border-border-soft">
                    <Bath size={24} />
                  </div>
                  <span className="text-sm font-extrabold text-primary">{property.bathrooms} {t('detail_bathrooms')}</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-bg-cream text-accent border border-border-soft">
                    <Maximize2 size={24} />
                  </div>
                  <span className="text-sm font-extrabold text-primary">{property.area}m²</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-accent/10 text-accent border border-accent/20">
                    <Star size={24} className="fill-accent" />
                  </div>
                  <span className="text-sm font-extrabold text-primary">{property.rating} ({property.review_count})</span>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-extrabold text-primary mb-5">{t('detail_description')}</h3>
                  <p className="text-text-muted leading-relaxed text-lg font-medium">{description}</p>
                </div>

                {features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-primary mb-5">{t('detail_features')}</h3>
                    <div className="flex flex-wrap gap-3">
                      {features.map(f => (
                        <span key={f} className="px-5 py-3 bg-bg-cream text-primary rounded-xl text-sm font-bold flex items-center gap-2 border border-border-soft hover:border-accent hover:bg-surface transition-all duration-300">
                          <CheckCircle2 size={16} className="text-accent" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Map Placeholder */}
            <section className="bg-surface rounded-[2.5rem] p-8 border border-border-soft shadow-[0_20px_50px_rgba(15,23,42,0.05)] overflow-hidden">
              <h3 className="text-xl font-extrabold text-primary mb-6 flex items-center gap-2">
                <MapPin size={22} className="text-accent" /> {t('detail_location')}
              </h3>
              <div className="relative h-[300px] rounded-3xl bg-bg-cream overflow-hidden border border-border-soft">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center shadow-lg animate-bounce border border-border-soft">
                    <MapPin size={32} className="text-accent" />
                  </div>
                  <div className="text-center px-6 py-3 bg-surface/80 backdrop-blur-md rounded-2xl border border-white shadow-sm">
                    <div className="font-extrabold text-primary text-xl mb-1">{property.neighborhood}</div>
                    <div className="text-text-muted text-sm font-bold uppercase tracking-widest">{property.city}, CI</div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-32 h-fit">
            {/* Booking Card */}
            <div className="bg-surface rounded-[2.5rem] p-10 border border-border-soft shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
              <div className="flex items-baseline justify-between mb-10 pb-8 border-b border-border-soft">
                <div>
                  <div className="text-4xl font-extrabold text-primary mb-2">{formatPrice(property.price)}</div>
                  <div className="text-text-muted font-bold uppercase tracking-widest text-xs">{t('per_month')}</div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleProtectedAction(() => setPayModalOpen(true))}
                  className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(15,23,42,0.2)]"
                >
                  <CreditCard size={20} /> {t('detail_pay')}
                </button>

                <button
                  onClick={() => handleProtectedAction(() => setCalendarOpen(o => !o))}
                  className="w-full btn-secondary py-4 text-base flex items-center justify-center gap-2"
                >
                  <Calendar size={20} /> {t('detail_book')}
                </button>
              </div>

              {/* Inline Booking Calendar */}
              <AnimatePresence>
                {calendarOpen && (
                  <BookingCalendar
                    propertyId={property.id}
                    onClose={() => setCalendarOpen(false)}
                    lang={lang}
                    t={t as (key: string) => string}
                  />
                )}
              </AnimatePresence>

              <div className="mt-8 pt-6 flex items-center justify-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-text-muted">
                <Shield size={14} className="text-accent" />
                {lang === 'fr' ? 'PAIEMENT 100% SÉCURISÉ' : '100% SECURE PAYMENT'}
              </div>
            </div>

            {/* Landlord Info */}
            {landlord && (
              <div className="bg-surface rounded-[2.5rem] border border-border-soft shadow-[0_20px_50px_rgba(15,23,42,0.05)] relative overflow-hidden">
                {!session && (
                  <div className="absolute inset-0 z-10 backdrop-blur-[6px] bg-white/40 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-surface p-6 rounded-3xl border border-border-soft shadow-xl flex flex-col items-center max-w-[280px]">
                      <div className="w-12 h-12 bg-bg-cream rounded-full flex items-center justify-center text-primary mb-4 border border-border-soft">
                        <Shield size={20} />
                      </div>
                      <h4 className="font-extrabold text-primary text-base mb-2">
                        {lang === 'fr' ? 'Accès protégé' : 'Protected access'}
                      </h4>
                      <p className="text-text-muted text-xs font-medium mb-5 leading-relaxed">
                        {lang === 'fr' 
                          ? 'Connectez-vous pour voir les détails du propriétaire et le contacter.' 
                          : 'Log in to view the landlord details and contact them.'}
                      </p>
                      <button 
                        onClick={() => handleProtectedAction(() => {})}
                        className="w-full btn-primary py-3 text-sm flex justify-center items-center gap-2"
                      >
                        {t('nav_login')}
                      </button>
                    </div>
                  </div>
                )}

                <div className={`p-8 transition-all duration-300 ${!session ? 'blur-[8px] opacity-40 select-none pointer-events-none' : ''}`}>
                  <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-text-muted mb-8">{t('detail_landlord')}</h3>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative w-20 h-20 rounded-[1.25rem] overflow-hidden bg-bg-cream border-2 border-border-soft">
                      {landlord.avatar_url ? (
                        <Image src={landlord.avatar_url} alt={landlord.full_name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-primary bg-bg-cream">
                          {landlord.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-xl text-primary">{landlord.full_name}</span>
                        {landlord.verified && <CheckCircle2 size={18} className="text-accent" />}
                      </div>
                      <div className="flex items-center gap-1.5 bg-bg-cream inline-flex px-3 py-1 rounded-lg border border-border-soft">
                        <Star size={14} className="fill-accent text-accent" />
                        <span className="font-bold text-primary text-sm">{landlord.trust_score}</span>
                        <span className="text-text-muted text-xs">({landlord.review_count})</span>
                      </div>
                    </div>
                  </div>
                  {landlord.bio && (
                    <p className="text-text-muted text-sm leading-relaxed mb-8 font-medium bg-bg-cream p-4 rounded-2xl border border-border-soft">{landlord.bio}</p>
                  )}
                  <button 
                    onClick={() => handleProtectedAction(() => setShowContact(true))}
                    className="w-full py-4 rounded-2xl border border-border-soft font-bold text-primary hover:bg-bg-cream hover:border-primary/20 transition-all duration-300 flex items-center justify-center gap-2">
                    <Phone size={18} className="text-accent" /> 
                    {showContact ? (landlord.phone || (lang === 'fr' ? 'Non renseigné' : 'Not provided')) : t('detail_contact')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileMoneyModal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} amount={property.price} propertyTitle={title} />
      <Footer />
    </main>
  );
}
