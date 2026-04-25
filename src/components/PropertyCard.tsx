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
    <div className="bg-white border-2 border-border-soft rounded-2xl overflow-hidden group hover:border-primary transition-all shadow-sm hover:shadow-xl" id={`property-card-${property.id}`}>
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-100 to-gray-200">
            <span style={{ fontSize: '2.5rem' }}>🏠</span>
            <span style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 600 }}>
              {lang === 'fr' ? 'Aucune photo' : 'No photo'}
            </span>
          </div>
        )}
        
        {/* Verified Badge - Solid */}
        {property.verified && (
          <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-white text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border-2 border-primary/10 shadow-sm">
            <CheckCircle size={12} className="text-emerald-500" />
            {t('verified')}
          </div>
        )}

        {/* Price - Solid */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-primary text-white px-3 py-1.5 rounded-lg font-black text-sm shadow-lg">
            {formatPrice(property.price)}
            <span className="text-[10px] font-medium opacity-80 ml-1">/ {t('per_month')}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-black text-lg text-text-main group-hover:text-primary transition-colors line-clamp-1 mb-2">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-text-muted text-xs font-bold mb-4">
          <MapPin size={14} className="text-accent" />
          {property.neighborhood}, {property.city}
        </div>

        {/* Specs - High Contrast */}
        <div className="grid grid-cols-3 gap-2 py-4 mb-5 border-y-2 border-border-soft">
          <div className="flex flex-col items-center gap-1">
            <Bed size={16} className="text-primary" />
            <span className="text-[10px] font-black text-text-main uppercase tracking-wider">{property.rooms} {t('rooms')}</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x-2 border-border-soft">
            <Bath size={16} className="text-primary" />
            <span className="text-[10px] font-black text-text-main uppercase tracking-wider">{property.bathrooms} {t('bath')}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Maximize2 size={16} className="text-primary" />
            <span className="text-[10px] font-black text-text-main uppercase tracking-wider">{property.area}m²</span>
          </div>
        </div>

        {/* Action */}
        <Link
          href={`/listings/${property.id}`}
          className="w-full flex items-center justify-center gap-2 py-3 bg-bg-cream text-primary font-black text-sm rounded-xl border-2 border-primary/5 hover:bg-primary hover:text-white transition-all"
        >
          {t('see_details')}
        </Link>
      </div>
    </div>
  );
}
