'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/lib/lang';
import { Property, formatPrice } from '@/lib/mockData';
import { MapPin, Star, Bed, Bath, Maximize2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { lang, t } = useLang();
  const title = lang === 'fr' ? property.title : property.titleEn;

  return (
    <div className="property-card" id={`property-card-${property.id}`}>
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f0ede7' }}>
        <Image
          src={property.images[0]}
          alt={title}
          fill
          style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
          className="prop-img"
        />
        {/* Verified */}
        {property.verified && (
          <span className="badge-verified" style={{ position: 'absolute', top: 10, left: 10 }}>
            ✓ {t('verified')}
          </span>
        )}
        {/* Price */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: '#1a4d3a', color: '#fff',
          fontSize: '0.82rem', fontWeight: 700,
          padding: '4px 10px', borderRadius: 5,
        }}>
          {formatPrice(property.price)}<span style={{ fontWeight: 400, opacity: 0.8 }}>{t('per_month')}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1c1c1c', marginBottom: '0.35rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#888', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          <MapPin size={12} color="#c8501e" />
          {property.neighborhood}, {property.city}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: '#666', marginBottom: '0.85rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f0ede7' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Bed size={12} color="#aaa" /> {property.rooms} {t('rooms')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Bath size={12} color="#aaa" /> {property.bathrooms}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Maximize2 size={12} color="#aaa" /> {property.area}m²
          </span>
        </div>

        {/* Rating + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={13} color="#c8501e" fill="#c8501e" />
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1c1c1c' }}>{property.rating}</span>
            <span style={{ color: '#aaa', fontSize: '0.78rem' }}>({property.reviewCount})</span>
          </div>
          <Link
            href={`/listings/${property.id}`}
            id={`see-details-${property.id}`}
            style={{
              background: '#1a4d3a', color: '#fff',
              fontSize: '0.78rem', fontWeight: 600,
              padding: '6px 14px', borderRadius: 5,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#133829')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1a4d3a')}
          >
            {t('see_details')}
          </Link>
        </div>
      </div>

      <style>{`
        .property-card:hover .prop-img { transform: scale(1.04); }
      `}</style>
    </div>
  );
}
