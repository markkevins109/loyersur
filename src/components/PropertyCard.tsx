'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/lib/lang';
import { Property, formatPrice } from '@/lib/mockData';
import { MapPin, Bed, Bath, Maximize2, CheckCircle, Heart, Star } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  featured?: boolean;
}

export default function PropertyCard({ property, featured = false }: PropertyCardProps) {
  const { lang, t } = useLang();
  const title = lang === 'fr' ? property.title : property.titleEn;

  return (
    <div
      className="bg-surface border border-border-soft rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(26,26,24,0.12)] cursor-pointer flex flex-col"
      id={`property-card-${property.id}`}
    >
      {/* Image — fixed height, no zoom on hover */}
      <div className="relative h-52 bg-bg-section flex-shrink-0">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-bg-warm to-bg-section">
            <span style={{ fontSize: '2.5rem' }}>🏠</span>
            <span className="text-[11px] text-text-faint font-semibold">
              {lang === 'fr' ? 'Aucune photo' : 'No photo'}
            </span>
          </div>
        )}

        {/* Top overlay: badges + wishlist */}
        <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {/* Featured pill */}
            {featured && (
              <span className="badge bg-gold text-white shadow-md">
                ⭐ {lang === 'fr' ? 'À la une' : 'Featured'}
              </span>
            )}
            {/* Verified badge */}
            {property.verified && (
              <span className="badge-verified shadow-sm">
                <CheckCircle size={12} className="text-gold" strokeWidth={2.5} />
                {t('verified')}
              </span>
            )}
          </div>

          {/* Wishlist heart */}
          <button
            aria-label={lang === 'fr' ? 'Sauvegarder' : 'Save'}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all duration-200 border border-white/50"
          >
            <Heart size={14} className="text-text-muted hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Price pill — bottom left */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-baseline gap-1 px-3 py-1.5 rounded-xl bg-charcoal/80 backdrop-blur-md text-white shadow-lg">
            <span className="text-sm font-bold tabular">{formatPrice(property.price)}</span>
            <span className="text-[10px] text-white/60 font-medium">/{t('per_month')}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title + location */}
        <div className="mb-5">
          <h3 className="text-[17px] font-semibold text-charcoal group-hover:text-gold transition-colors line-clamp-1 mb-1.5 leading-snug">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-text-muted text-xs font-medium">
            <MapPin size={13} className="text-gold shrink-0" />
            <span>{property.neighborhood}, {property.city}</span>
          </div>
        </div>

        {/* Specs row */}
        <div className="flex items-center rounded-2xl bg-bg-warm border border-border-soft overflow-hidden mb-5">
          <div className="flex items-center gap-1.5 flex-1 justify-center py-3">
            <Bed size={14} className="text-gold" strokeWidth={2} />
            <span className="text-xs font-semibold text-text-muted">{property.rooms} ch.</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-1.5 flex-1 justify-center py-3">
            <Bath size={14} className="text-gold" strokeWidth={2} />
            <span className="text-xs font-semibold text-text-muted">{property.bathrooms} bain</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-1.5 flex-1 justify-center py-3">
            <Maximize2 size={14} className="text-gold" strokeWidth={2} />
            <span className="text-xs font-semibold text-text-muted">{property.area} m²</span>
          </div>
        </div>

        {/* Rating + CTA */}
        <div className="flex items-center gap-1.5 mt-auto">
          {(property.rating ?? 0) > 0 ? (
            <>
              <Star size={12} className="text-gold fill-gold" />
              <span className="text-xs font-bold text-charcoal">{property.rating?.toFixed(1)}</span>
              <span className="text-xs text-text-faint">({property.reviewCount})</span>
            </>
          ) : (
            <span className="text-[11px] text-text-faint italic">
              {lang === 'fr' ? 'Premier à évaluer' : 'No reviews yet'}
            </span>
          )}
          <Link
            href={`/listings/${property.id}`}
            className="ml-auto inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gold-soft text-gold-dark text-xs font-bold hover:bg-gold hover:text-white transition-all duration-200"
          >
            {t('see_details')}
          </Link>
        </div>
      </div>
    </div>
  );
}
