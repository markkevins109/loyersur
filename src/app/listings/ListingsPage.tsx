'use client';
import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { supabase, type Property as DBProperty } from '@/lib/supabase';
import { mockProperties } from '@/lib/mockData';
import { Search, SlidersHorizontal, X, MapPin, Building2, Wallet2, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Adapter: converts a DB property to the shape PropertyCard expects
function toCardShape(p: DBProperty) {
  return {
    id: p.id,
    title: p.title,
    titleEn: p.title_en ?? p.title,
    description: p.description ?? '',
    descriptionEn: p.description_en ?? p.description ?? '',
    price: p.price,
    city: p.city,
    neighborhood: p.neighborhood,
    rooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    images: p.images ?? [],
    landlordId: p.agent_id,
    verified: p.verified,
    rating: p.rating,
    reviewCount: p.review_count,
    features: p.features ?? [],
    featuresEn: p.features_en ?? p.features ?? [],
    coordinates: p.coordinates ?? { lat: 5.3559, lng: -4.007 },
  };
}

export default function ListingsPage() {
  const { t, lang } = useLang();
  const [search, setSearch] = useState('');
  const [filterNeighborhood, setFilterNeighborhood] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterRooms, setFilterRooms] = useState('');
  const [filterVerified, setFilterVerified] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // DB properties — will be loaded from Supabase
  const [dbProperties, setDbProperties] = useState<ReturnType<typeof toCardShape>[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    async function loadProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Fall back to mock data if DB isn't set up yet
        setUsingMock(true);
        setDbProperties(mockProperties as ReturnType<typeof toCardShape>[]);
      } else {
        setDbProperties(data.map(p => toCardShape(p as DBProperty)));
      }
      setDbLoading(false);
    }
    loadProperties();
  }, []);

  const neighborhoods = [...new Set(dbProperties.map(p => p.neighborhood))];

  const filtered = dbProperties.filter(p => {
    const title = lang === 'fr' ? p.title : p.titleEn;
    if (search && !title.toLowerCase().includes(search.toLowerCase()) &&
      !p.neighborhood.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterNeighborhood && p.neighborhood !== filterNeighborhood) return false;
    if (filterMaxPrice && p.price > Number(filterMaxPrice)) return false;
    if (filterRooms && p.rooms < Number(filterRooms)) return false;
    if (filterVerified && !p.verified) return false;
    return true;
  });

  const resetFilters = () => {
    setSearch(''); setFilterNeighborhood('');
    setFilterMaxPrice(''); setFilterRooms(''); setFilterVerified(false);
  };

  const hasFilters = search || filterNeighborhood || filterMaxPrice || filterRooms || filterVerified;

  return (
    <main className="min-h-screen bg-bg-cream selection:bg-accent selection:text-white">
      <Navbar />

      {/* Premium Search Header */}
      <section className="relative pt-36 pb-20 bg-primary border-b border-white/10 overflow-hidden">
        {/* Background glow elements */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container relative z-10 px-6 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              {t('listings_title')}
            </h1>
            <p className="text-white/70 font-medium text-lg mb-12">
              {usingMock
                ? (lang === 'fr' ? 'Annonces de démonstration — connectez Supabase pour voir les vraies annonces' : 'Demo listings — connect Supabase to see real listings')
                : t('listings_sub')}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto flex gap-3 p-3 bg-surface/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
              <div className="relative flex-1">
                <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  id="listings-search"
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={lang === 'fr' ? 'Quartier, titre, mot-clé...' : 'Neighborhood, title, keyword...'}
                  className="w-full bg-surface text-text-main placeholder:text-text-muted border-none rounded-2xl py-4 pl-14 pr-4 outline-none focus:ring-4 focus:ring-accent/20 transition-all font-bold shadow-inner"
                />
              </div>
              <button
                id="toggle-filters"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 rounded-2xl font-bold text-sm transition-all duration-300 border ${
                  showFilters ? 'bg-accent border-accent text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-surface border-transparent text-primary hover:bg-bg-cream shadow-md'
                }`}
              >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline">{lang === 'fr' ? 'Filtres' : 'Filters'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-6 mx-auto py-16">
        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-14 overflow-hidden"
            >
              <div className="bg-surface border border-border-soft rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(15,23,42,0.05)] relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full pointer-events-none"></div>

                <div className="flex items-center justify-between mb-8 pb-5 border-b border-border-soft">
                  <h3 className="font-extrabold text-xl flex items-center gap-2 text-text-main">
                    <SlidersHorizontal size={20} className="text-accent" />
                    {lang === 'fr' ? 'Affiner la recherche' : 'Refine search'}
                  </h3>
                  {hasFilters && (
                    <button onClick={resetFilters} className="text-accent text-sm font-bold hover:underline flex items-center gap-1.5 transition-colors">
                      <X size={16} /> {t('filter_reset')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted flex items-center gap-2">
                      <MapPin size={16} className="text-accent" /> {t('filter_neighborhood')}
                    </label>
                    <select
                      value={filterNeighborhood}
                      onChange={e => setFilterNeighborhood(e.target.value)}
                      className="premium-input"
                    >
                      <option value="">{t('filter_all')}</option>
                      {neighborhoods.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted flex items-center gap-2">
                      <Wallet2 size={16} className="text-accent" /> {t('filter_price')}
                    </label>
                    <select value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} className="premium-input">
                      <option value="">{t('any_price')}</option>
                      <option value="100000">≤ 100 000 FCFA</option>
                      <option value="200000">≤ 200 000 FCFA</option>
                      <option value="300000">≤ 300 000 FCFA</option>
                      <option value="500000">≤ 500 000 FCFA</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted flex items-center gap-2">
                      <LayoutGrid size={16} className="text-accent" /> {t('filter_rooms')}
                    </label>
                    <select value={filterRooms} onChange={e => setFilterRooms(e.target.value)} className="premium-input">
                      <option value="">{t('any_rooms')}</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ {t('rooms')}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3 flex flex-col justify-end">
                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted flex items-center gap-2 mb-3">
                      <Building2 size={16} className="text-accent" /> {t('filter_verified')}
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl border border-border-soft bg-surface/50 hover:bg-surface hover:border-accent transition-all duration-300">
                      <input
                        type="checkbox"
                        id="filter-verified"
                        checked={filterVerified}
                        onChange={e => setFilterVerified(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-border-soft text-accent focus:ring-accent/20"
                      />
                      <span className="font-bold text-text-main text-sm">{lang === 'fr' ? 'Annonces vérifiées' : 'Verified only'}</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-12">
          <p className="text-text-muted font-bold text-lg">
            <span className="text-primary font-extrabold text-3xl">{dbLoading ? '…' : filtered.length}</span>{' '}
            <span className="opacity-80">{lang === 'fr' ? 'annonces trouvées' : 'listings found'}</span>
            {usingMock && <span className="ml-3 px-2.5 py-1 text-[10px] uppercase tracking-widest text-amber-600 bg-amber-100 rounded-full font-bold border border-amber-200">Demo</span>}
          </p>
        </div>

        {/* Loading skeleton */}
        {dbLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-surface rounded-3xl overflow-hidden border border-border-soft animate-pulse">
                <div className="h-[220px] bg-bg-cream" />
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-bg-cream rounded-md w-3/4" />
                  <div className="h-3 bg-bg-cream rounded-md w-1/2" />
                  <div className="h-px bg-border-soft/50 my-4" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-bg-cream rounded-lg w-1/3" />
                    <div className="h-8 bg-bg-cream rounded-lg w-1/3" />
                    <div className="h-8 bg-bg-cream rounded-lg w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!dbLoading && (
          filtered.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtered.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center bg-surface rounded-[3rem] border border-dashed border-border-soft shadow-sm"
            >
              <div className="w-24 h-24 bg-bg-cream rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Search size={36} className="text-primary/20" />
              </div>
              <h3 className="text-2xl font-extrabold text-text-main mb-3">
                {lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
              </h3>
              <p className="text-text-muted mb-8 max-w-md font-medium text-lg leading-relaxed">
                {lang === 'fr' ? 'Essayez de modifier vos critères de recherche ou de retirer certains filtres.' : 'Try adjusting your search filters or removing some constraints.'}
              </p>
              <button onClick={resetFilters} className="btn-secondary py-3 px-8 text-sm">
                {t('filter_reset')}
              </button>
            </motion.div>
          )
        )}
      </div>

      <Footer />
    </main>
  );
}
