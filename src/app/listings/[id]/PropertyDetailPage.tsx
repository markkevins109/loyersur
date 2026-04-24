'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileMoneyModal from '@/components/MobileMoneyModal';
import { mockProperties, mockLandlords, mockReviews, formatPrice } from '@/lib/mockData';
import { MapPin, Star, Bed, Bath, Maximize2, CheckCircle2, Phone, Calendar, CreditCard, ArrowLeft, ChevronLeft, ChevronRight, Shield, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <main className="min-h-screen bg-bg-cream/20">
      <Navbar />

      <div className="pt-28 pb-20 container px-6 mx-auto">
        {/* Breadcrumb + Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/listings" className="flex items-center gap-2 font-bold text-primary hover:text-primary-dark transition-colors">
              <ArrowLeft size={16} /> {t('nav_listings')}
            </Link>
            <ChevronRight size={14} className="text-text-muted" />
            <span className="text-text-muted font-medium truncate max-w-[200px]">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl border border-border-soft bg-white hover:bg-bg-cream transition-colors">
              <Share2 size={18} className="text-text-main" />
            </button>
            <button className="p-2.5 rounded-xl border border-border-soft bg-white hover:bg-bg-cream transition-colors">
              <Heart size={18} className="text-text-main" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Gallery */}
            <section className="bg-white rounded-[2.5rem] overflow-hidden border border-border-soft shadow-sm">
              <div className="relative aspect-video group">
                <Image 
                  src={property.images[imgIdx]} 
                  alt={title} 
                  fill 
                  className="object-cover transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {property.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setImgIdx(i => (i - 1 + property.images.length) % property.images.length)}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-xl text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={() => setImgIdx(i => (i + 1) % property.images.length)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-xl text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-black">
                  {imgIdx + 1} / {property.images.length}
                </div>
              </div>
              
              <div className="p-4 flex gap-3 overflow-x-auto">
                {property.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setImgIdx(i)}
                    className={`relative flex-shrink-0 w-24 aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                      i === imgIdx ? 'border-primary shadow-lg scale-95' : 'border-transparent opacity-60'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </section>

            {/* Core Info */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-border-soft shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-black text-text-main leading-tight">{title}</h1>
                {property.verified && (
                  <div className="premium-badge px-4 py-2">
                    <CheckCircle2 size={16} />
                    {t('verified')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-text-muted font-medium mb-8">
                <MapPin size={18} className="text-accent" />
                {property.neighborhood}, {property.city}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-border-soft mb-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-bg-cream text-primary">
                    <Bed size={22} />
                  </div>
                  <span className="text-sm font-black text-text-main">{property.rooms} {t('detail_bedrooms')}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-bg-cream text-primary">
                    <Bath size={22} />
                  </div>
                  <span className="text-sm font-black text-text-main">{property.bathrooms} {t('detail_bathrooms')}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-bg-cream text-primary">
                    <Maximize2 size={22} />
                  </div>
                  <span className="text-sm font-black text-text-main">{property.area}m²</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-bg-cream text-accent">
                    <Star size={22} className="fill-accent" />
                  </div>
                  <span className="text-sm font-black text-text-main">{property.rating} ({property.reviewCount})</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-text-main mb-4">{t('detail_description')}</h3>
                  <p className="text-text-muted leading-relaxed text-lg">{description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-black text-text-main mb-4">{t('detail_features')}</h3>
                  <div className="flex flex-wrap gap-3">
                    {features.map(f => (
                      <span key={f} className="px-5 py-2.5 bg-emerald-50 text-primary rounded-xl text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 size={14} /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Map Placeholder */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-border-soft shadow-sm overflow-hidden">
              <h3 className="text-xl font-black text-text-main mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-primary" /> {t('detail_location')}
              </h3>
              <div className="relative h-[300px] rounded-3xl bg-bg-cream overflow-hidden">
                <div className="absolute inset-0 mesh-bg opacity-30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl animate-float">
                    <MapPin size={32} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="font-black text-primary text-xl">{property.neighborhood}</div>
                    <div className="text-text-muted text-sm font-bold">{property.city}, CI</div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-8">
            {/* Booking Card */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-border-soft shadow-2xl lg:sticky lg:top-28">
              <div className="flex items-baseline justify-between mb-8">
                <div>
                  <div className="text-4xl font-black text-text-main">{formatPrice(property.price)}</div>
                  <div className="text-text-muted font-bold">{t('per_month')}</div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setPayModalOpen(true)}
                  className="w-full btn-primary py-4 text-lg"
                >
                  <CreditCard size={20} /> {t('detail_pay')}
                </button>
                
                {booked ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full bg-emerald-50 text-primary py-4 rounded-2xl text-center font-black flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    {lang === 'fr' ? 'Visite confirmée !' : 'Viewing confirmed!'}
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setBooked(true)} 
                    className="w-full btn-secondary py-4 text-lg"
                  >
                    <Calendar size={20} /> {t('detail_book')}
                  </button>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-border-soft flex items-center justify-center gap-3 text-xs font-bold text-text-muted">
                <Shield size={16} className="text-primary" />
                {lang === 'fr' ? 'PAIEMENT 100% SÉCURISÉ' : '100% SECURE PAYMENT'}
              </div>
            </div>

            {/* Landlord Info */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-border-soft shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-text-muted mb-6">{t('detail_landlord')}</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-bg-cream">
                  <Image src={landlord.avatar} alt={landlord.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-text-main">{landlord.name}</span>
                    {landlord.verified && <CheckCircle2 size={16} className="text-primary" />}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star size={14} className="fill-accent text-accent" />
                    <span className="font-bold text-text-main text-sm">{landlord.trustScore}</span>
                    <span className="text-text-muted text-sm">({landlord.reviewCount})</span>
                  </div>
                </div>
              </div>
              <p className="text-text-muted text-sm leading-relaxed mb-8">
                {lang === 'fr' ? landlord.bio : landlord.bioEn}
              </p>
              <button className="w-full py-4 rounded-2xl border-2 border-border-soft font-black text-text-main hover:bg-bg-cream transition-colors flex items-center justify-center gap-2">
                <Phone size={18} /> {t('detail_contact')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileMoneyModal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} amount={property.price} propertyTitle={title} />
      <Footer />
    </main>
  );
}
