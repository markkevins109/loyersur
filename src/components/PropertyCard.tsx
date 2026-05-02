'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/lib/lang';
import { Property, formatPrice } from '@/lib/mockData';
import { MapPin, Star, Bed, Bath, Maximize2, CheckCircle } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { lang, t } = useLang();
  const title = lang === 'fr' ? property.title : property.titleEn;

  return (
    <div className="bg-surface border border-border-soft rounded-[1.5rem] overflow-hidden group hover:border-accent hover:shadow-[0_15px_30px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1" id={`property-card-${property.id}`}>
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-cream">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-bg-cream to-border-soft">
            <span style={{ fontSize: '2.5rem' }}>🏠</span>
            <span style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 600 }}>
              {lang === 'fr' ? 'Aucune photo' : 'No photo'}
            </span>
          </div>
        )}
        
        {/* Verified Badge - Premium Glassmorphism */}
        {property.verified && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-surface/90 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white shadow-sm">
            <CheckCircle size={14} className="text-accent" />
            {t('verified')}
          </div>
        )}

        {/* Price - Solid Accent */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-primary text-white px-4 py-2 rounded-xl font-extrabold text-sm shadow-[0_4px_15px_rgba(15,23,42,0.3)] backdrop-blur-md">
            {formatPrice(property.price)}
            <span className="text-[10px] font-medium text-white/70 ml-1">/ {t('per_month')}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-extrabold text-lg text-primary group-hover:text-accent transition-colors line-clamp-1 mb-2">
          {title}
        </h3>

        <div className="flex items-center gap-2 text-text-muted text-xs font-medium mb-5">
          <MapPin size={14} className="text-accent" />
          {property.neighborhood}, {property.city}
        </div>

        {/* Specs - Premium Grid */}
        <div className="grid grid-cols-3 gap-2 py-4 mb-5 border-y border-border-soft">
          <div className="flex flex-col items-center gap-1.5">
            <Bed size={16} className="text-accent" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{property.rooms} {t('rooms')}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-x border-border-soft">
            <Bath size={16} className="text-accent" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{property.bathrooms} {t('detail_bathrooms')}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Maximize2 size={16} className="text-accent" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{property.area}m²</span>
          </div>
        </div>

        {/* Action */}
        <Link
          href={`/listings/${property.id}`}
          className="w-full flex items-center justify-center gap-2 py-3 bg-bg-cream text-primary font-bold text-sm rounded-xl border border-border-soft hover:bg-accent hover:text-white hover:border-accent transition-all duration-300"
        >
          {t('see_details')}
        </Link>
      </div>
    </div>
  );
}
