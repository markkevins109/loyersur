'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileMoneyModal from '@/components/MobileMoneyModal';
import { mockProperties, mockLandlords, mockReviews, formatPrice } from '@/lib/mockData';
import { MapPin, Star, Bed, Bath, Maximize2, CheckCircle2, Phone, Calendar, CreditCard, ArrowLeft, ChevronLeft, ChevronRight, Shield } from 'lucide-react';

export default function PropertyDetailPage({ id }: { id: string }) {
  const { lang, t } = useLang();
  const [imgIdx, setImgIdx] = useState(0);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [booked, setBooked] = useState(false);

  const property = mockProperties.find(p => p.id === id) || mockProperties[0];
  const landlord = mockLandlords.find(l => l.id === property.landlordId) || mockLandlords[0];
  const reviews = mockReviews.filter(r => r.targetId === property.landlordId);
  const features = lang === 'fr' ? property.features : property.featuresEn;
  const title = lang === 'fr' ? property.title : property.titleEn;
  const description = lang === 'fr' ? property.description : property.descriptionEn;

  const labelStyle: React.CSSProperties = { fontWeight: 700, fontSize: '1rem', color: '#1c1c1c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 };
  const sectionStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e0ddd7', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' };

  return (
    <main style={{ minHeight: '100vh', background: '#f9f7f4' }}>
      <Navbar />

      <div style={{ paddingTop: '4.5rem', maxWidth: 1100, margin: '0 auto', padding: '4.5rem 1.5rem 3rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#888', marginBottom: '1.5rem' }}>
          <Link href="/listings" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1a4d3a', textDecoration: 'none', fontWeight: 500 }}>
            <ArrowLeft size={13} /> {t('nav_listings')}
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: '#555' }} className="truncate">{title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          {/* LEFT */}
          <div>
            {/* Gallery */}
            <div style={{ ...sectionStyle, padding: 0, overflow: 'hidden' }} id="image-gallery">
              <div style={{ position: 'relative', height: 340 }}>
                <Image src={property.images[imgIdx]} alt={title} fill style={{ objectFit: 'cover' }} />
                {property.images.length > 1 && (
                  <>
                    <button id="gallery-prev" onClick={() => setImgIdx(i => (i - 1 + property.images.length) % property.images.length)}
                      style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 6, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronLeft size={18} />
                    </button>
                    <button id="gallery-next" onClick={() => setImgIdx(i => (i + 1) % property.images.length)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 6, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.75rem', padding: '3px 8px', borderRadius: 4 }}>
                  {imgIdx + 1}/{property.images.length}
                </span>
              </div>
              {/* Thumbs */}
              <div style={{ display: 'flex', gap: 6, padding: '8px 10px', overflowX: 'auto' }}>
                {property.images.map((img, i) => (
                  <button key={i} id={`thumb-${i}`} onClick={() => setImgIdx(i)}
                    style={{ flexShrink: 0, position: 'relative', width: 64, height: 44, borderRadius: 5, overflow: 'hidden', border: `2px solid ${i === imgIdx ? '#1a4d3a' : 'transparent'}`, cursor: 'pointer' }}>
                    <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1c1c1c', flex: 1 }}>{title}</h1>
                {property.verified && <span className="badge-verified">✓ {t('verified')}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <MapPin size={13} color="#c8501e" /> {property.neighborhood}, {property.city}, Côte d&apos;Ivoire
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '0.75rem 0', borderTop: '1px solid #f0ede7', borderBottom: '1px solid #f0ede7', marginBottom: '1rem', color: '#555', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Bed size={15} color="#1a4d3a" /> {property.rooms} {t('detail_bedrooms')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Bath size={15} color="#1a4d3a" /> {property.bathrooms} {t('detail_bathrooms')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Maximize2 size={15} color="#1a4d3a" /> {property.area}m²</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Star size={15} color="#c8501e" fill="#c8501e" /> {property.rating} ({property.reviewCount})</span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ ...labelStyle, fontSize: '0.95rem' }}>{t('detail_description')}</p>
                <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.7 }}>{description}</p>
              </div>

              <div>
                <p style={{ ...labelStyle, fontSize: '0.95rem' }}>{t('detail_features')}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {features.map(f => (
                    <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#e8f2ee', color: '#1a4d3a', fontSize: '0.8rem', fontWeight: 500, padding: '5px 10px', borderRadius: 6 }}>
                      <CheckCircle2 size={12} /> {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Map */}
            <div style={sectionStyle} id="map-section">
              <p style={labelStyle}><MapPin size={15} color="#1a4d3a" /> {t('detail_location')}</p>
              <div style={{ height: 180, background: 'linear-gradient(135deg, #e8f2ee, #d4e8df)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <MapPin size={28} color="#1a4d3a" />
                <p style={{ fontWeight: 600, color: '#1a4d3a', fontSize: '0.95rem' }}>{property.neighborhood}, {property.city}</p>
                <p style={{ color: '#888', fontSize: '0.8rem' }}>Côte d&apos;Ivoire 🇨🇮 · {property.coordinates.lat.toFixed(4)}°N</p>
              </div>
            </div>

            {/* Reviews */}
            <div style={sectionStyle} id="reviews-section">
              <p style={labelStyle}><Star size={15} color="#c8501e" fill="#c8501e" /> {t('detail_reviews')} ({reviews.length})</p>
              {reviews.length ? reviews.map(r => (
                <div key={r.id} style={{ padding: '0.875rem', background: '#f9f7f4', borderRadius: 8, marginBottom: 8, border: '1px solid #ede8e0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <img src={r.authorAvatar} alt={r.authorName} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1c1c' }}>{r.authorName}</p>
                      <p style={{ color: '#aaa', fontSize: '0.75rem' }}>{r.date}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array(r.rating).fill(0).map((_, i) => <Star key={i} size={12} color="#c8501e" fill="#c8501e" />)}
                    </div>
                  </div>
                  <p style={{ color: '#666', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                    &ldquo;{lang === 'fr' ? r.comment : r.commentEn}&rdquo;
                  </p>
                </div>
              )) : <p style={{ color: '#aaa', fontSize: '0.875rem' }}>{lang === 'fr' ? 'Aucun avis.' : 'No reviews yet.'}</p>}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div>
            {/* Price + Booking */}
            <div style={{ ...sectionStyle, position: 'sticky', top: 80 }} id="booking-card">
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1c1c1c' }}>{formatPrice(property.price)}</span>
                <span style={{ color: '#888', fontSize: '0.85rem' }}> {t('per_month')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button id="pay-rent-btn" onClick={() => setPayModalOpen(true)}
                  className="btn-green" style={{ width: '100%', justifyContent: 'center' }}>
                  <CreditCard size={15} /> {t('detail_pay')}
                </button>
                {booked ? (
                  <div style={{ textAlign: 'center', padding: '10px', background: '#e8f2ee', borderRadius: 6, color: '#1a4d3a', fontSize: '0.85rem', fontWeight: 600 }}>
                    ✓ {lang === 'fr' ? 'Visite confirmée !' : 'Viewing confirmed!'}
                  </div>
                ) : (
                  <button id="book-viewing-btn" onClick={() => setBooked(true)} className="btn-outline-green" style={{ width: '100%', justifyContent: 'center' }}>
                    <Calendar size={15} /> {t('detail_book')}
                  </button>
                )}
              </div>
              <p style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#aaa', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                <Shield size={12} color="#1a4d3a" />
                {lang === 'fr' ? 'Paiement 100% sécurisé' : '100% secure payment'}
              </p>
            </div>

            {/* Landlord */}
            <div style={sectionStyle} id="landlord-card">
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1c1c', marginBottom: '0.875rem' }}>{t('detail_landlord')}</p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '0.875rem' }}>
                <img src={landlord.avatar} alt={landlord.name} style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f2ee' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1c1c' }}>{landlord.name}</p>
                    {landlord.verified && <CheckCircle2 size={14} color="#1a4d3a" />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#888' }}>
                    <Star size={11} color="#c8501e" fill="#c8501e" />
                    <span style={{ fontWeight: 600, color: '#1c1c1c' }}>{landlord.trustScore}</span>
                    <span>({landlord.reviewCount})</span>
                  </div>
                </div>
              </div>
              <p style={{ color: '#666', fontSize: '0.82rem', lineHeight: 1.65, marginBottom: '0.875rem' }}>
                {lang === 'fr' ? landlord.bio : landlord.bioEn}
              </p>
              <button id="contact-landlord-btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', border: '1px solid #e0ddd7', borderRadius: 6, background: '#fafaf8', color: '#555', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                <Phone size={13} /> {t('detail_contact')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileMoneyModal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} amount={property.price} propertyTitle={title} />

      <style>{`
        @media (max-width: 768px) {
          #image-gallery { width: 100%; }
        }
        @media (max-width: 900px) {
          .property-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Footer />
    </main>
  );
}
