'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase, type Profile, type Property, type Booking } from '@/lib/supabase';
import {
  Building2, PlusCircle, Users, CreditCard, Eye, Edit, Trash2,
  Star, CheckCircle2, Upload, X, LogOut, Calendar, Phone,
  Clock, MapPin, RefreshCw, Check, AlertCircle, ImageIcon,
} from 'lucide-react';

const TABS = ['listings', 'requests', 'add'] as const;
type Tab = typeof TABS[number];

const NEIGHBORHOODS = ['Cocody', 'Yopougon', 'Plateau', 'Abobo', 'Adjamé', 'Marcory', 'Treichville', 'Koumassi', 'Port-Bouët'] as const;
const PROPERTY_TYPES = [
  { value: 'apartment', labelFr: 'Appartement', labelEn: 'Apartment' },
  { value: 'villa',     labelFr: 'Villa',        labelEn: 'Villa' },
  { value: 'studio',    labelFr: 'Studio',       labelEn: 'Studio' },
  { value: 'house',     labelFr: 'Maison',       labelEn: 'House' },
  { value: 'office',    labelFr: 'Bureau',       labelEn: 'Office' },
] as const;

const AMENITIES_FR = ['Parking', 'Piscine', 'Clim centralisée', 'WiFi inclus', 'Sécurité 24h', 'Gardien', 'Groupe électrogène', 'Eau chaude', 'Balcon', 'Terrasse', 'Jardin', 'Cuisine équipée', 'Meublé'];
const AMENITIES_EN = ['Parking', 'Pool', 'Central AC', 'WiFi included', '24h security', 'Guard', 'Generator', 'Hot water', 'Balcony', 'Terrace', 'Garden', 'Equipped kitchen', 'Furnished'];

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-CI').format(n) + ' FCFA';
}

function timeAgo(dateStr: string, lang: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return lang === 'fr' ? `Il y a ${mins}min` : `${mins}min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === 'fr' ? `Il y a ${hrs}h` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return lang === 'fr' ? `Il y a ${days}j` : `${days}d ago`;
}

export default function LandlordDashboard() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingAction, setBookingAction] = useState<Record<string, 'loading' | 'done'>>({});

  // Add property form state
  const [addForm, setAddForm] = useState({
    title: '', title_en: '', description: '', description_en: '',
    price: '', neighborhood: '', property_type: 'apartment',
    bedrooms: '1', bathrooms: '1', area: '',
  });
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [addStatus, setAddStatus] = useState<'idle' | 'uploading' | 'saving' | 'success' | 'error'>('idle');
  const [addError, setAddError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Load profile + data ────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!prof || prof.role !== 'landlord') {
        router.push('/auth/login');
        return;
      }

      // Redirect unverified landlords to CNI flow
      if (!prof.verified) {
        router.push('/auth/verify-cni');
        return;
      }

      setProfile(prof as Profile);

      // Load this landlord's properties using their human-readable agent_id
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', prof.agent_id)
        .order('created_at', { ascending: false });
      setProperties((props ?? []) as Property[]);

      // Load bookings for this landlord
      // bookings.agent_id is UUID (FK to profiles.id), so use prof.id (UUID)
      // NOT prof.agent_id (which is the human-readable TEXT code like "sree0327")
      const { data: bkgs } = await supabase
        .from('bookings')
        .select(`
          *,
          tenant:profiles!tenant_id(full_name, email, phone, avatar_url, trust_score),
          properties(title, title_en, neighborhood)
        `)
        .eq('agent_id', prof.id)
        .order('created_at', { ascending: false });
      setBookings((bkgs ?? []) as Booking[]);

      setLoading(false);
    }
    load();
  }, [router]);

  // ── Handle image selection ─────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newFiles = [...images, ...files].slice(0, 8); // max 8 images
    setImages(newFiles);
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Submit new property ────────────────────────────────────
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setAddStatus('uploading');
    setAddError('');

    try {
      // Validate agent_id exists
      if (!profile.agent_id) {
        setAddError(lang === 'fr' ? 'Votre identifiant agent est manquant. Contactez le support.' : 'Agent ID missing. Please contact support.');
        setAddStatus('error');
        return;
      }

      // 1. Upload images to Supabase Storage
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const uploads = await Promise.all(images.map(async (file) => {
          const ext = file.name.split('.').pop();
          const path = `${profile.agent_id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from('property-images').upload(path, file);
          if (error) throw error;
          const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(path);
          return urlData.publicUrl;
        }));
        imageUrls = uploads;
      }

      setAddStatus('saving');

      // 2. Build amenities arrays
      const features = selectedAmenities.map(i => AMENITIES_FR[i]);
      const features_en = selectedAmenities.map(i => AMENITIES_EN[i]);

      // DEBUG: Log auth state before insert (remove after fix)
      const { data: { session: dbgSession } } = await supabase.auth.getSession();
      console.log('🔍 DEBUG — Auth role:', dbgSession ? 'authenticated' : '⚠️ ANON (no session)');
      console.log('🔍 DEBUG — auth.uid:', dbgSession?.user?.id);
      console.log('🔍 DEBUG — profile.id:', profile.id);
      console.log('🔍 DEBUG — profile.agent_id:', profile.agent_id);
      console.log('🔍 DEBUG — Inserting agent_id:', profile.agent_id);

      // 3. Insert property into DB using human-readable agent_id
      const { data: newProp, error: insertError } = await supabase
        .from('properties')
        .insert({
          agent_id: profile.agent_id,
          title: addForm.title,
          title_en: addForm.title_en || null,
          description: addForm.description,
          description_en: addForm.description_en || null,
          price: Number(addForm.price),
          city: 'Abidjan',
          neighborhood: addForm.neighborhood,
          property_type: addForm.property_type,
          bedrooms: Number(addForm.bedrooms),
          bathrooms: Number(addForm.bathrooms),
          area: Number(addForm.area),
          features,
          features_en,
          images: imageUrls,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Update local state
      setProperties(prev => [newProp as Property, ...prev]);
      setAddStatus('success');

      // Reset form
      setTimeout(() => {
        setAddForm({ title: '', title_en: '', description: '', description_en: '', price: '', neighborhood: '', property_type: 'apartment', bedrooms: '1', bathrooms: '1', area: '' });
        setSelectedAmenities([]);
        setImages([]);
        setImagePreviews([]);
        setAddStatus('idle');
        setActiveTab('listings');
      }, 2000);

    } catch (err: unknown) {
      setAddStatus('error');
      setAddError(err instanceof Error ? err.message : lang === 'fr' ? 'Erreur lors de la publication.' : 'Failed to publish listing.');
    }
  };

  // ── Handle booking actions ─────────────────────────────────
  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    setBookingAction(prev => ({ ...prev, [bookingId]: 'loading' }));
    const { error } = await supabase
      .from('bookings')
      .update({ status: action })
      .eq('id', bookingId);

    if (!error) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: action } : b));
      setBookingAction(prev => ({ ...prev, [bookingId]: 'done' }));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleAmenity = (idx: number) => {
    setSelectedAmenities(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // ── Loading skeleton ───────────────────────────────────────
  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#f9f7f4' }}>
        <Navbar />
        <div style={{ paddingTop: '5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #e0ddd7', borderTopColor: '#1a4d3a', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#888', fontSize: '0.9rem' }}>{lang === 'fr' ? 'Chargement…' : 'Loading…'}</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <main style={{ minHeight: '100vh', background: '#f9f7f4' }}>
      <Navbar />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ background: '#133829', padding: '4.5rem 1.5rem 1.75rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: 4 }}>
              {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'} · {lang === 'fr' ? 'Propriétaire vérifié' : 'Verified Landlord'}
            </p>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', display: 'flex', alignItems: 'center', gap: 10 }}>
              {profile?.full_name} 🏢
              <span style={{ background: '#1a6641', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600, color: '#86efac', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={11} /> {lang === 'fr' ? 'Vérifié' : 'Verified'}
              </span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginTop: 3 }}>{profile?.email}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)' }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                🏢
              </div>
            )}
            <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '7px 12px', color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <LogOut size={13} /> {lang === 'fr' ? 'Déconnexion' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        {/* ── Stats ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '🏢', label: lang === 'fr' ? 'Biens publiés' : 'Listed properties', val: String(properties.length) },
            { icon: '📅', label: lang === 'fr' ? 'Demandes en attente' : 'Pending requests', val: String(pendingBookings.length) },
            { icon: '⭐', label: lang === 'fr' ? 'Score de confiance' : 'Trust score', val: profile?.trust_score ? profile.trust_score.toFixed(1) : '—' },
            { icon: '💬', label: lang === 'fr' ? 'Avis reçus' : 'Reviews', val: String(profile?.review_count ?? 0) },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e0ddd7', borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{icon}</div>
              <p style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1c1c1c' }}>{val}</p>
              <p style={{ color: '#888', fontSize: '0.78rem' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e0ddd7', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e0ddd7', overflowX: 'auto' }}>
            {[
              { key: 'listings' as Tab, label: lang === 'fr' ? 'Mes annonces' : 'My listings', icon: Building2 },
              { key: 'requests' as Tab, label: lang === 'fr' ? `Demandes${pendingBookings.length ? ` (${pendingBookings.length})` : ''}` : `Requests${pendingBookings.length ? ` (${pendingBookings.length})` : ''}`, icon: Users },
              { key: 'add' as Tab,  label: lang === 'fr' ? 'Publier un bien' : 'Add property', icon: PlusCircle },
            ].map(({ key, label, icon: Icon }) => (
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

            {/* ── MY LISTINGS ──────────────────────────────── */}
            {activeTab === 'listings' && (
              <div id="my-listings">
                {properties.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                    <Building2 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>{lang === 'fr' ? 'Aucun bien publié' : 'No properties yet'}</p>
                    <button onClick={() => setActiveTab('add')} style={{ background: '#c8501e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                      {lang === 'fr' ? '+ Publier mon premier bien' : '+ Add first property'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {properties.map(p => (
                      <div key={p.id} style={{ display: 'flex', gap: 12, padding: 12, background: '#f9f7f4', borderRadius: 8, border: '1px solid #ede8e0', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: 80, height: 60, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#e8e4de' }}>
                          {p.images && p.images[0] ? (
                            <Image src={p.images[0]} alt={p.title} fill style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageIcon size={20} color="#bbb" />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1c1c1c', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                              {lang === 'fr' ? p.title : (p.title_en || p.title)}
                            </p>
                            {p.verified && <span style={{ flexShrink: 0, background: '#e8f2ee', color: '#1a4d3a', fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>✓ {lang === 'fr' ? 'Vérifié' : 'Verified'}</span>}
                          </div>
                          <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 3 }}>{p.neighborhood} · {p.bedrooms} {lang === 'fr' ? 'ch.' : 'bd.'} · {p.area}m²</p>
                          <p style={{ fontWeight: 700, color: '#1a4d3a', fontSize: '0.85rem' }}>{formatPrice(p.price)}/{lang === 'fr' ? 'mois' : 'mo'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <Link href={`/listings/${p.id}`}><Eye size={15} color="#888" /></Link>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Trash2 size={15} color="#e57373" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── BOOKING REQUESTS ─────────────────────────── */}
            {activeTab === 'requests' && (
              <div id="booking-requests" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                    <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ fontWeight: 600 }}>{lang === 'fr' ? 'Aucune demande de visite' : 'No viewing requests yet'}</p>
                  </div>
                ) : (
                  bookings.map(booking => {
                    const tenant = booking.tenant as Profile | undefined;
                    const prop = booking.properties as { title: string; title_en: string | null; neighborhood: string } | undefined;
                    const date = booking.preferred_date ? new Date(booking.preferred_date) : null;
                    const isLoading = bookingAction[booking.id] === 'loading';
                    const isDone = bookingAction[booking.id] === 'done';

                    return (
                      <div key={booking.id} style={{ padding: 14, background: '#f9f7f4', borderRadius: 8, border: `1px solid ${booking.status === 'pending' ? '#fde68a' : booking.status === 'confirmed' ? '#86efac' : '#e0ddd7'}` }}>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                            {tenant?.avatar_url ? <img src={tenant.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : '👤'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1c1c' }}>{tenant?.full_name ?? '—'}</p>
                              {tenant?.trust_score ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', color: '#555' }}>
                                  <Star size={11} color="#c8501e" fill="#c8501e" /> {tenant.trust_score.toFixed(1)}
                                </span>
                              ) : null}
                              <span style={{
                                fontSize: '0.68rem', fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                                background: booking.status === 'pending' ? '#fffbeb' : booking.status === 'confirmed' ? '#f0fdf4' : '#f5f5f5',
                                color: booking.status === 'pending' ? '#d97706' : booking.status === 'confirmed' ? '#166534' : '#888',
                                border: `1px solid ${booking.status === 'pending' ? '#fde68a' : booking.status === 'confirmed' ? '#86efac' : '#e0e0e0'}`,
                              }}>
                                {booking.status === 'pending' ? (lang === 'fr' ? '⏳ En attente' : '⏳ Pending') :
                                 booking.status === 'confirmed' ? (lang === 'fr' ? '✅ Confirmé' : '✅ Confirmed') :
                                 booking.status === 'cancelled' ? (lang === 'fr' ? '❌ Annulé' : '❌ Cancelled') : booking.status}
                              </span>
                            </div>
                            {prop && (
                              <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: 3 }}>
                                <MapPin size={10} style={{ display: 'inline' }} /> {lang === 'fr' ? prop.title : (prop.title_en ?? prop.title)}
                              </p>
                            )}
                            {date && (
                              <p style={{ color: '#555', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={11} />
                                {date.toLocaleDateString(lang === 'fr' ? 'fr-CI' : 'en-CI', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                {' '}{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                            {booking.message && (
                              <p style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic', marginTop: 5, background: '#fff', borderRadius: 6, padding: '5px 8px', border: '1px solid #ede8e0' }}>
                                &ldquo;{booking.message}&rdquo;
                              </p>
                            )}
                            {tenant?.phone && (
                              <a href={`tel:${tenant.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: '0.78rem', color: '#1a4d3a', fontWeight: 600, textDecoration: 'none' }}>
                                <Phone size={11} /> {tenant.phone}
                              </a>
                            )}
                            <p style={{ color: '#bbb', fontSize: '0.7rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={9} /> {timeAgo(booking.created_at, lang)}
                            </p>
                          </div>
                        </div>

                        {booking.status === 'pending' && !isDone && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'confirmed')}
                              disabled={isLoading}
                              style={{ flex: 1, padding: '8px', background: '#1a4d3a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                              {isLoading ? <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.6s linear infinite' }} /> : <Check size={13} />}
                              {lang === 'fr' ? 'Confirmer' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'cancelled')}
                              disabled={isLoading}
                              style={{ flex: 1, padding: '8px', background: '#f0ede7', border: '1px solid #e0ddd7', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                              <X size={13} /> {lang === 'fr' ? 'Refuser' : 'Decline'}
                            </button>
                            {tenant?.email && (
                              <a href={`mailto:${tenant.email}`}
                                style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e0ddd7', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, color: '#1a4d3a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                                <Phone size={12} />
                              </a>
                            )}
                          </div>
                        )}

                        {(booking.status === 'confirmed' || isDone) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', borderRadius: 6, padding: '8px 12px', fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                            <CheckCircle2 size={14} /> {lang === 'fr' ? 'Visite confirmée' : 'Visit confirmed'}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── ADD PROPERTY FORM ────────────────────────── */}
            {activeTab === 'add' && (
              <div id="add-property-form">
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c1c1c', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PlusCircle size={16} color="#c8501e" /> {lang === 'fr' ? 'Publier un nouveau bien' : 'Publish a new property'}
                </h2>

                {addStatus === 'success' ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle2 size={30} color="#166534" />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#166534', marginBottom: 6 }}>{lang === 'fr' ? 'Annonce publiée !' : 'Listing published!'}</p>
                    <p style={{ color: '#888', fontSize: '0.85rem' }}>{lang === 'fr' ? 'Votre bien est maintenant visible sur la plateforme.' : 'Your property is now visible on the platform.'}</p>
                  </div>
                ) : (
                  <form onSubmit={handleAddProperty} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {addStatus === 'error' && (
                      <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', color: '#b91c1c', fontSize: '0.83rem' }}>
                        <AlertCircle size={14} /> {addError}
                      </div>
                    )}

                    {/* Property Type */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 8 }}>{lang === 'fr' ? 'Type de bien' : 'Property type'}</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {PROPERTY_TYPES.map(pt => (
                          <button key={pt.value} type="button" onClick={() => setAddForm(f => ({ ...f, property_type: pt.value }))}
                            style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${addForm.property_type === pt.value ? '#c8501e' : '#e0ddd7'}`, background: addForm.property_type === pt.value ? '#fdf3ee' : '#fff', color: addForm.property_type === pt.value ? '#c8501e' : '#555', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                            {lang === 'fr' ? pt.labelFr : pt.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Titles */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>{lang === 'fr' ? 'Titre (Français) *' : 'Title (French) *'}</label>
                        <input id="add-title" type="text" required placeholder={lang === 'fr' ? 'Ex: Appartement 3 pièces Cocody' : 'e.g. 3-room apartment Cocody'} className="input-field" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>{lang === 'fr' ? 'Titre (Anglais)' : 'Title (English)'}</label>
                        <input id="add-title-en" type="text" placeholder="e.g. 3-room apartment Cocody" className="input-field" value={addForm.title_en} onChange={e => setAddForm(f => ({ ...f, title_en: e.target.value }))} />
                      </div>
                    </div>

                    {/* Location & Price */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>{lang === 'fr' ? 'Quartier *' : 'Neighborhood *'}</label>
                        <select id="add-neighborhood" className="input-field" required value={addForm.neighborhood} onChange={e => setAddForm(f => ({ ...f, neighborhood: e.target.value }))}>
                          <option value="">{lang === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                          {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>{lang === 'fr' ? 'Loyer mensuel (FCFA) *' : 'Monthly rent (FCFA) *'}</label>
                        <input id="add-price" type="number" required min="10000" placeholder="250000" className="input-field" value={addForm.price} onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>{lang === 'fr' ? 'Chambres *' : 'Bedrooms *'}</label>
                        <select id="add-bedrooms" className="input-field" value={addForm.bedrooms} onChange={e => setAddForm(f => ({ ...f, bedrooms: e.target.value }))}>
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>{lang === 'fr' ? 'Salles de bain *' : 'Bathrooms *'}</label>
                        <select id="add-bathrooms" className="input-field" value={addForm.bathrooms} onChange={e => setAddForm(f => ({ ...f, bathrooms: e.target.value }))}>
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>Surface (m²) *</label>
                        <input id="add-area" type="number" required min="10" placeholder="75" className="input-field" value={addForm.area} onChange={e => setAddForm(f => ({ ...f, area: e.target.value }))} />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>{lang === 'fr' ? 'Description (Français)' : 'Description (French)'}</label>
                        <textarea id="add-desc" rows={3} placeholder={lang === 'fr' ? 'Décrivez votre bien...' : 'Describe your property...'} className="input-field" style={{ resize: 'vertical' }} value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 5 }}>{lang === 'fr' ? 'Description (Anglais)' : 'Description (English)'}</label>
                        <textarea id="add-desc-en" rows={3} placeholder="Describe your property in English..." className="input-field" style={{ resize: 'vertical' }} value={addForm.description_en} onChange={e => setAddForm(f => ({ ...f, description_en: e.target.value }))} />
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 8 }}>{lang === 'fr' ? 'Équipements & Services' : 'Amenities & Features'}</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {AMENITIES_FR.map((a, idx) => (
                          <button key={a} type="button" onClick={() => toggleAmenity(idx)}
                            style={{ padding: '5px 12px', borderRadius: 99, border: `1.5px solid ${selectedAmenities.includes(idx) ? '#1a4d3a' : '#e0ddd7'}`, background: selectedAmenities.includes(idx) ? '#e8f2ee' : '#fff', color: selectedAmenities.includes(idx) ? '#1a4d3a' : '#666', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                            {selectedAmenities.includes(idx) ? '✓ ' : ''}{lang === 'fr' ? a : AMENITIES_EN[idx]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 8 }}>
                        {lang === 'fr' ? `Photos (${images.length}/8)` : `Photos (${images.length}/8)`}
                      </label>
                      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageSelect} />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', border: '1px solid #e0ddd7' }}>
                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={11} color="#fff" />
                            </button>
                          </div>
                        ))}
                        {images.length < 8 && (
                          <button type="button" onClick={() => fileRef.current?.click()}
                            style={{ aspectRatio: '4/3', border: '2px dashed #d1cfc9', borderRadius: 8, background: '#f9f7f4', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#aaa' }}>
                            <Upload size={20} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{lang === 'fr' ? 'Ajouter' : 'Add'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <button id="add-submit" type="submit"
                      disabled={addStatus === 'uploading' || addStatus === 'saving'}
                      style={{ padding: '0.9rem', background: (addStatus === 'uploading' || addStatus === 'saving') ? '#888' : '#c8501e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {addStatus === 'uploading' ? (
                        <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.6s linear infinite' }} /> {lang === 'fr' ? 'Upload des photos…' : 'Uploading photos…'}</>
                      ) : addStatus === 'saving' ? (
                        <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.6s linear infinite' }} /> {lang === 'fr' ? 'Publication…' : 'Publishing…'}</>
                      ) : (
                        <><PlusCircle size={16} /> {lang === 'fr' ? "Publier l'annonce" : 'Publish listing'}</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
