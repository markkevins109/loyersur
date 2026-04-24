'use client';
import React, { useState } from 'react';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { mockProperties } from '@/lib/mockData';
import { Search, SlidersHorizontal, X, MapPin, Building2, Wallet2, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Solid Search Header */}
      <section className="pt-32 pb-16 bg-primary">
        <div className="container px-6 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t('listings_title')}
            </h1>
            <p className="text-emerald-100 font-medium text-lg mb-10">
              {t('listings_sub')}
            </p>

            {/* Search Bar - Solid */}
            <div className="relative max-w-2xl mx-auto flex gap-3 p-3 bg-white rounded-2xl shadow-xl">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="listings-search"
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={lang === 'fr' ? 'Quartier, titre, mot-clé...' : 'Neighborhood, title, keyword...'}
                  className="w-full bg-bg-cream text-text-main placeholder:text-text-muted border-none rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
              </div>
              <button
                id="toggle-filters"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 rounded-xl font-black text-sm transition-all border-2 ${
                  showFilters ? 'bg-accent border-accent text-white' : 'bg-white border-primary/10 text-primary hover:border-primary'
                }`}
              >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline">{lang === 'fr' ? 'Filtres' : 'Filters'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-6 mx-auto py-12">
        {/* Filter Panel - Solid & High Contrast */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-12"
            >
              <div className="bg-white border-2 border-border-soft rounded-[2rem] p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-border-soft">
                  <h3 className="font-black text-xl flex items-center gap-2 text-text-main">
                    <SlidersHorizontal size={20} className="text-primary" />
                    {lang === 'fr' ? 'Affiner la recherche' : 'Refine search'}
                  </h3>
                  {hasFilters && (
                    <button onClick={resetFilters} className="text-accent text-sm font-black hover:underline flex items-center gap-1">
                      <X size={14} /> {t('filter_reset')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: t('filter_city'), icon: Building2, value: filterCity, setter: setFilterCity, options: cities, all: t('all_cities') },
                    { label: t('filter_neighborhood'), icon: MapPin, value: filterNeighborhood, setter: setFilterNeighborhood, options: neighborhoods, all: t('filter_all') },
                  ].map((filter, idx) => (
                    <div key={idx} className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                        <filter.icon size={14} className="text-primary" /> {filter.label}
                      </label>
                      <select 
                        value={filter.value} 
                        onChange={e => filter.setter(e.target.value)} 
                        className="w-full bg-bg-cream border-2 border-border-soft rounded-xl px-4 py-3 text-text-main font-black focus:border-primary outline-none transition-all"
                      >
                        <option value="">{filter.all}</option>
                        {filter.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                      <Wallet2 size={14} className="text-primary" /> {t('filter_price')}
                    </label>
                    <select value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} className="w-full bg-bg-cream border-2 border-border-soft rounded-xl px-4 py-3 text-text-main font-black focus:border-primary outline-none transition-all">
                      <option value="">{t('any_price')}</option>
                      <option value="100000">≤ 100 000 FCFA</option>
                      <option value="200000">≤ 200 000 FCFA</option>
                      <option value="300000">≤ 300 000 FCFA</option>
                      <option value="500000">≤ 500 000 FCFA</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                      <LayoutGrid size={14} className="text-primary" /> {t('filter_rooms')}
                    </label>
                    <select value={filterRooms} onChange={e => setFilterRooms(e.target.value)} className="w-full bg-bg-cream border-2 border-border-soft rounded-xl px-4 py-3 text-text-main font-black focus:border-primary outline-none transition-all">
                      <option value="">{t('any_rooms')}</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ {t('rooms')}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="filter-verified" 
                    checked={filterVerified} 
                    onChange={e => setFilterVerified(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-2 border-border-soft text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="filter-verified" className="text-sm font-black text-text-main cursor-pointer">
                    {t('filter_verified')}
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-10">
          <p className="text-text-muted font-bold">
            <span className="text-primary font-black text-2xl">{filtered.length}</span>{' '}
            {lang === 'fr' ? 'annonces trouvées' : 'listings found'}
          </p>
        </div>

        {/* Results Grid */}
        {filtered.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-bg-cream rounded-[3rem] border-2 border-dashed border-border-soft">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Search size={32} className="text-primary/20" />
            </div>
            <h3 className="text-2xl font-black text-text-main mb-2">
              {lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
            </h3>
            <p className="text-text-muted mb-8 max-w-sm font-medium">
              Essayez de modifier vos critères de recherche.
            </p>
            <button onClick={resetFilters} className="btn-primary">
              {t('filter_reset')}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
