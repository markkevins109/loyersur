'use client';
import React, { useState } from 'react';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { mockProperties } from '@/lib/mockData';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function ListingsPage() {
  const { t, lang } = useLang();
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterNeighborhood, setFilterNeighborhood] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterRooms, setFilterRooms] = useState('');
  const [filterVerified, setFilterVerified] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const neighborhoods = [...new Set(mockProperties.map(p => p.neighborhood))];
  const cities = [...new Set(mockProperties.map(p => p.city))];

  const filtered = mockProperties.filter(p => {
    const title = lang === 'fr' ? p.title : p.titleEn;
    if (search && !title.toLowerCase().includes(search.toLowerCase()) &&
      !p.neighborhood.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCity && p.city !== filterCity) return false;
    if (filterNeighborhood && p.neighborhood !== filterNeighborhood) return false;
    if (filterMaxPrice && p.price > Number(filterMaxPrice)) return false;
    if (filterRooms && p.rooms < Number(filterRooms)) return false;
    if (filterVerified && !p.verified) return false;
    return true;
  });

  const resetFilters = () => {
    setSearch(''); setFilterCity(''); setFilterNeighborhood('');
    setFilterMaxPrice(''); setFilterRooms(''); setFilterVerified(false);
  };

  const hasFilters = search || filterCity || filterNeighborhood || filterMaxPrice || filterRooms || filterVerified;

  return (
    <main style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />

      {/* Page header */}
      <div style={{
        paddingTop: '4rem',
        background: '#1a4d3a',
        paddingBottom: '2rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            {t('listings_title')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {t('listings_sub')}
          </p>

          {/* Search */}
          <div style={{ maxWidth: 620, margin: '0 auto', display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} color="#aaa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="listings-search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'fr' ? 'Rechercher par quartier, titre...' : 'Search by neighborhood, title...'}
                style={{
                  width: '100%', paddingLeft: 38, paddingRight: 12, paddingTop: 12, paddingBottom: 12,
                  borderRadius: 6, border: 'none', fontSize: '0.9rem',
                  color: '#1c1c1c', outline: 'none',
                }}
              />
            </div>
            <button
              id="toggle-filters"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#fff', color: '#1a4d3a',
                border: 'none', borderRadius: 6,
                padding: '0 1.1rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={15} />
              {lang === 'fr' ? 'Filtres' : 'Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Filters */}
        {showFilters && (
          <div style={{
            background: '#fff', border: '1px solid #e0ddd7', borderRadius: 10,
            padding: '1.25rem', marginBottom: '1.5rem',
          }} id="filter-panel" className="animate-fade-in-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1c1c', display: 'flex', alignItems: 'center', gap: 6 }}>
                <SlidersHorizontal size={14} color="#1a4d3a" /> Filtres
              </span>
              {hasFilters && (
                <button onClick={resetFilters} id="reset-filters"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#c8501e', fontSize: '0.8rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={12} /> {t('filter_reset')}
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {/* City */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#555', marginBottom: 5 }}>{t('filter_city')}</label>
                <select id="filter-city" value={filterCity} onChange={e => setFilterCity(e.target.value)} className="input-field" style={{ fontSize: '0.85rem', padding: '8px 10px' }}>
                  <option value="">{t('all_cities')}</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Neighborhood */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#555', marginBottom: 5 }}>{t('filter_neighborhood')}</label>
                <select id="filter-neighborhood" value={filterNeighborhood} onChange={e => setFilterNeighborhood(e.target.value)} className="input-field" style={{ fontSize: '0.85rem', padding: '8px 10px' }}>
                  <option value="">{t('filter_all')}</option>
                  {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {/* Price */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#555', marginBottom: 5 }}>{t('filter_price')}</label>
                <select id="filter-price" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} className="input-field" style={{ fontSize: '0.85rem', padding: '8px 10px' }}>
                  <option value="">{t('any_price')}</option>
                  <option value="100000">≤ 100 000 FCFA</option>
                  <option value="200000">≤ 200 000 FCFA</option>
                  <option value="300000">≤ 300 000 FCFA</option>
                  <option value="500000">≤ 500 000 FCFA</option>
                </select>
              </div>
              {/* Rooms */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#555', marginBottom: 5 }}>{t('filter_rooms')}</label>
                <select id="filter-rooms" value={filterRooms} onChange={e => setFilterRooms(e.target.value)} className="input-field" style={{ fontSize: '0.85rem', padding: '8px 10px' }}>
                  <option value="">{t('any_rooms')}</option>
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}+</option>)}
                </select>
              </div>
            </div>
            {/* Verified toggle */}
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="filter-verified" checked={filterVerified} onChange={e => setFilterVerified(e.target.checked)}
                style={{ accentColor: '#1a4d3a', width: 15, height: 15 }} />
              <label htmlFor="filter-verified" style={{ fontSize: '0.85rem', color: '#555', cursor: 'pointer' }}>
                {t('filter_verified')}
              </label>
            </div>
          </div>
        )}

        {/* Count */}
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          <strong style={{ color: '#1c1c1c' }}>{filtered.length}</strong>{' '}
          {lang === 'fr' ? 'annonce(s) trouvée(s)' : 'listing(s) found'}
        </p>

        {/* Grid */}
        {filtered.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem' }}>
            {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏠</p>
            <p style={{ fontWeight: 600, color: '#555', marginBottom: '0.5rem' }}>
              {lang === 'fr' ? 'Aucune annonce trouvée' : 'No listings found'}
            </p>
            <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {lang === 'fr' ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters'}
            </p>
            <button onClick={resetFilters} className="btn-green" style={{ fontSize: '0.875rem' }}>{t('filter_reset')}</button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
