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
              {usingMock
                ? (lang === 'fr' ? 'Annonces de démonstration — connectez Supabase pour voir les vraies annonces' : 'Demo listings — connect Supabase to see real listings')
                : t('listings_sub')}
            </p>

            {/* Search Bar */}
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
        {/* Filter Panel */}
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
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                      <MapPin size={14} className="text-primary" /> {t('filter_neighborhood')}
                    </label>
                    <select
                      value={filterNeighborhood}
                      onChange={e => setFilterNeighborhood(e.target.value)}
                      className="w-full bg-bg-cream border-2 border-border-soft rounded-xl px-4 py-3 text-text-main font-black focus:border-primary outline-none transition-all"
                    >
                      <option value="">{t('filter_all')}</option>
                      {neighborhoods.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

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

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                      <Building2 size={14} className="text-primary" /> {t('filter_verified')}
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="filter-verified"
                        checked={filterVerified}
                        onChange={e => setFilterVerified(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-border-soft text-primary"
                      />
                      <span className="font-black text-text-main text-sm">{lang === 'fr' ? 'Annonces vérifiées' : 'Verified only'}</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-10">
          <p className="text-text-muted font-bold">
            <span className="text-primary font-black text-2xl">{dbLoading ? '…' : filtered.length}</span>{' '}
            {lang === 'fr' ? 'annonces trouvées' : 'listings found'}
            {usingMock && <span className="ml-2 text-xs text-amber-600 font-medium">(données de démo)</span>}
          </p>
        </div>

        {/* Loading skeleton */}
        {dbLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border-soft animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
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
            <div className="flex flex-col items-center justify-center py-32 text-center bg-bg-cream rounded-[3rem] border-2 border-dashed border-border-soft">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Search size={32} className="text-primary/20" />
              </div>
              <h3 className="text-2xl font-black text-text-main mb-2">
                {lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
              </h3>
              <p className="text-text-muted mb-8 max-w-sm font-medium">
                {lang === 'fr' ? 'Essayez de modifier vos critères de recherche.' : 'Try adjusting your search filters.'}
              </p>
              <button onClick={resetFilters} className="btn-primary">
                {t('filter_reset')}
              </button>
            </div>
          )
        )}
      </div>

      <Footer />
    </main>
  );
}
