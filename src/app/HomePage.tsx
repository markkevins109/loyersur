'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { supabase, type Property as DBProperty } from '@/lib/supabase';
import { Property } from '@/lib/mockData';
import {
  Shield, Wallet, Users, MapPin, BadgeCheck, FileText,
  ArrowRight, ChevronRight, CheckCircle2, UserCheck, CreditCard, Star
} from 'lucide-react';

/* ── Scroll-reveal hook ── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function HomePage() {
  const { t, lang } = useLang();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  useReveal();

  useEffect(() => {
    async function fetchLatestProperties() {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (data) {
        const formatted = (data as DBProperty[]).map(p => ({
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
        }));
        setProperties(formatted as Property[]);
      }
      setLoading(false);
    }
    fetchLatestProperties();
  }, []);

  /* ─── Feature card data ─── */
  const features = [
    {
      icon: Shield,
      title: t('feature1_title'),
      desc: lang === 'fr' ? 'Profils vérifiés et avis authentiques pour une confiance totale.' : 'Verified profiles and authentic reviews for total trust.',
      accent: 'from-gold/20 to-gold/5',
      iconBg: 'bg-gold-soft text-gold-dark',
      border: 'border-t-gold',
    },
    {
      icon: Wallet,
      title: t('feature2_title'),
      desc: lang === 'fr' ? 'Orange Money, MTN, Wave, Moov — payez votre loyer en un clic.' : 'Orange Money, MTN, Wave, Moov — pay your rent in one tap.',
      accent: 'from-blue-50 to-transparent',
      iconBg: 'bg-blue-50 text-blue-600',
      border: 'border-t-blue-400',
    },
    {
      icon: Users,
      title: t('feature3_title'),
      desc: lang === 'fr' ? 'Propriétaires et locataires en contact direct, sans intermédiaire.' : 'Landlords and tenants connected directly, no middlemen.',
      accent: 'from-emerald-50 to-transparent',
      iconBg: 'bg-emerald-50 text-emerald-600',
      border: 'border-t-emerald-400',
    },
    {
      icon: MapPin,
      title: t('feature4_title'),
      desc: lang === 'fr' ? 'Cocody, Plateau, Marcory, Yopougon — partout en CI.' : 'Cocody, Plateau, Marcory, Yopougon — anywhere in CI.',
      accent: 'from-orange-50 to-transparent',
      iconBg: 'bg-orange-50 text-orange-500',
      border: 'border-t-orange-400',
    },
    {
      icon: BadgeCheck,
      title: t('feature5_title'),
      desc: lang === 'fr' ? 'CNI / passeport vérifié pour chaque utilisateur de la plateforme.' : 'CNI / passport verified for every user on the platform.',
      accent: 'from-purple-50 to-transparent',
      iconBg: 'bg-purple-50 text-purple-600',
      border: 'border-t-purple-400',
    },
    {
      icon: FileText,
      title: t('feature6_title'),
      desc: lang === 'fr' ? 'Quittances légales générées automatiquement à chaque paiement.' : 'Legal receipts generated automatically with every payment.',
      accent: 'from-terracotta-soft to-transparent',
      iconBg: 'bg-terracotta-soft text-terracotta',
      border: 'border-t-terracotta',
    },
  ];

  /* ─── How it works data ─── */
  const steps = [
    { num: '1', icon: UserCheck, title: lang === 'fr' ? 'Créez votre compte' : 'Create your account', desc: lang === 'fr' ? 'Inscrivez-vous et vérifiez votre identité en quelques secondes.' : 'Sign up and verify your identity in seconds.' },
    { num: '2', icon: MapPin, title: lang === 'fr' ? 'Trouvez votre logement' : 'Find your home', desc: lang === 'fr' ? 'Parcourez les annonces vérifiées et contactez le propriétaire.' : 'Browse verified listings and contact the landlord.' },
    { num: '3', icon: CreditCard, title: lang === 'fr' ? 'Emménagez !' : 'Move in!', desc: lang === 'fr' ? 'Signez et payez en toute sécurité via la plateforme.' : 'Sign and pay securely through the platform.' },
  ];

  return (
    <main className="min-h-screen bg-bg-warm">
      <Navbar />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-surface border-b border-border-soft">
        {/* Warm ambient glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/8 rounded-full blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-terracotta/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl px-6 mx-auto">
          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* ── Left: copy ── */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Label pill */}
              <div className="section-label mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-dot" />
                {lang === 'fr' ? "Plateforme N°1 en Côte d'Ivoire" : "Ivory Coast's #1 Rental Platform"}
              </div>

              <h1 className="mb-7 text-5xl lg:text-[68px] font-extrabold text-charcoal leading-[1.08]">
                {lang === 'fr' ? (
                  <>Louez votre{' '}
                    <span className="relative inline-block">
                      <span className="relative z-10 text-gold">logement</span>
                      <span className="absolute bottom-1 left-0 w-full h-[6px] bg-gold/20 rounded-full" />
                    </span>
                    {' '}en toute confiance.
                  </>
                ) : (
                  <>Rent your{' '}
                    <span className="relative inline-block">
                      <span className="relative z-10 text-gold">home</span>
                      <span className="absolute bottom-1 left-0 w-full h-[6px] bg-gold/20 rounded-full" />
                    </span>
                    {' '}with complete trust.
                  </>
                )}
              </h1>

              <p className="max-w-lg mb-10 text-lg font-light leading-[1.75] text-text-muted tracking-[0.01em]">
                {lang === 'fr'
                  ? "Annonces vérifiées, paiements Mobile Money sécurisés, quittances automatiques. La location immobilière réinventée pour l'Afrique de l'Ouest."
                  : "Verified listings, secure Mobile Money payments, automatic receipts. Real estate renting reinvented for West Africa."}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/listings" className="btn-gold group">
                  {lang === 'fr' ? 'Trouver un logement' : 'Find a home'}
                  <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link href="/auth/signup" className="btn-secondary">
                  {lang === 'fr' ? 'Créer un compte' : 'Create an account'}
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8 pt-8 border-t border-border-soft">
                {[
                  { val: '2.4k+', label: lang === 'fr' ? 'Annonces actives' : 'Active listings' },
                  { val: '15k+', label: lang === 'fr' ? 'Utilisateurs' : 'Users' },
                  { val: '98%', label: lang === 'fr' ? 'Satisfaction' : 'Satisfaction' },
                ].map(({ val, label }, i) => (
                  <React.Fragment key={label}>
                    {i > 0 && <div className="stat-divider" />}
                    <div>
                      <div className="text-[32px] font-extrabold text-charcoal tabular stat-number leading-none mb-1">{val}</div>
                      <div className="text-xs font-semibold text-text-faint uppercase tracking-wider">{label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>

            {/* ── Right: image ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* Main image */}
              <div className="relative z-10 overflow-hidden rounded-[2.5rem] aspect-[4/3] border-[6px] border-white shadow-[0_32px_80px_rgba(26,26,24,0.18)]">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85"
                  alt="Modern home in Abidjan"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                {/* Left-edge vignette for text legibility on small breakpoints */}
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/30 via-transparent to-transparent" />
              </div>

              {/* Floating badge — PAIEMENT VALIDÉ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5, type: 'spring', stiffness: 200 }}
                className="absolute -bottom-5 -left-10 z-20 flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-[0_12px_40px_rgba(26,26,24,0.16)] border border-border-soft animate-float"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-text-faint uppercase tracking-wider mb-0.5">
                    {lang === 'fr' ? 'Paiement validé' : 'Payment confirmed'}
                  </div>
                  <div className="text-lg font-extrabold text-charcoal tabular">250 000 FCFA</div>
                </div>
              </motion.div>

              {/* Top-right decorative element */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full border-[3px] border-gold/25 pointer-events-none" />
              <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-gold/10 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES — "Pourquoi Nous Choisir"
      ════════════════════════════════════════ */}
      <section className="py-28 bg-bg-warm">
        <div className="max-w-7xl px-6 mx-auto">

          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-20 reveal">
            <div className="section-label mb-6">Pourquoi nous choisir</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-charcoal leading-tight mb-5">
              {lang === 'fr' ? (
                <>La location{' '}
                  <span className="relative">
                    <span className="relative z-10">réinventée</span>
                    <span className="absolute inset-x-0 bottom-0 h-3 bg-gold/20 rounded" />
                  </span>
                  , plus simple et plus sûre.
                </>
              ) : (
                <>Renting{' '}
                  <span className="relative">
                    <span className="relative z-10">reinvented</span>
                    <span className="absolute inset-x-0 bottom-0 h-3 bg-gold/20 rounded" />
                  </span>
                  , simpler and safer.
                </>
              )}
            </h2>
            <p className="text-lg text-text-muted font-light leading-relaxed">
              {lang === 'fr'
                ? "Une plateforme pensée pour les Ivoiriens. Plus de sécurité, plus de transparence, moins de stress."
                : "A platform designed for Ivoirians. More security, more transparency, less stress."}
            </p>
          </div>

          {/* 3-column feature cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc, iconBg, border }, idx) => (
              <div
                key={idx}
                className={`feature-card border-t-4 ${border} reveal`}
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className={`w-16 h-16 mb-6 flex items-center justify-center rounded-2xl ${iconBg}`}>
                  <Icon size={30} strokeWidth={1.75} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-charcoal">{title}</h3>
                <p className="text-text-muted font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS — Dark Navy section
      ════════════════════════════════════════ */}
      <section
        className="py-28 text-white relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 0%, #1a2d44 0%, #0D1B2A 60%, #0a0f16 100%)' }}
      >
        {/* Dot texture */}
        <div className="absolute inset-0 dot-pattern opacity-100 pointer-events-none" />
        {/* Gold glow top-right */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl px-6 mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-widest text-gold mb-6">
              {lang === 'fr' ? 'Comment ça marche' : 'How it works'}
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
              {lang === 'fr' ? 'Trois étapes, zéro stress.' : 'Three steps, zero stress.'}
            </h2>
            <p className="text-xl text-white/70 font-light max-w-2xl mx-auto">
              {lang === 'fr'
                ? "De l'inscription à l'emménagement, tout est simple et sécurisé."
                : "From sign-up to move-in, everything is simple and secure."}
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-12 lg:grid-cols-3 max-w-5xl mx-auto relative">
            {/* Animated dashed connector */}
            <div className="hidden lg:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] pointer-events-none">
              <svg width="100%" height="2" className="overflow-visible">
                <line
                  x1="0" y1="1" x2="100%" y2="1"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  style={{ animation: 'dash-flow 1.5s linear infinite' }}
                />
              </svg>
            </div>

            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center relative z-10 reveal" style={{ transitionDelay: `${idx * 100}ms` }}>
                  {/* Circle */}
                  <div className="relative mb-7">
                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-charcoal-mid border-2 border-gold/60 shadow-[0_0_0_6px_rgba(201,168,76,0.12)] text-white text-3xl font-black">
                      {step.num}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full bg-gold text-white shadow-md">
                      <Icon size={14} />
                    </div>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">{step.title}</h3>
                  <p className="text-white/65 font-light leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURED LISTINGS
      ════════════════════════════════════════ */}
      <section className="py-28 bg-bg-section">
        <div className="max-w-7xl px-6 mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14 reveal">
            <div>
              <div className="section-label mb-4">
                {lang === 'fr' ? 'Propriétés à la une' : 'Featured Properties'}
              </div>
              <h2 className="text-4xl font-extrabold text-charcoal">
                {lang === 'fr' ? 'Logements disponibles maintenant' : 'Homes available right now'}
              </h2>
            </div>
            <Link
              href="/listings"
              className="flex items-center gap-2 text-sm font-bold text-gold hover:text-gold-dark transition-colors group"
            >
              {lang === 'fr' ? 'Voir toutes les annonces' : 'View all listings'}
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Grid */}
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4 min-h-[300px]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-3xl overflow-hidden border border-border-soft animate-pulse">
                  <div className="h-[200px] bg-bg-section" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-bg-section rounded-lg w-3/4" />
                    <div className="h-3 bg-bg-section rounded-lg w-1/2" />
                    <div className="h-px bg-border-soft my-3" />
                    <div className="h-8 bg-bg-section rounded-xl" />
                  </div>
                </div>
              ))
            ) : properties.length > 0 ? (
              properties.map((p, i) => (
                <PropertyCard key={p.id} property={p} featured={i === 0} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-surface rounded-3xl border border-border-soft">
                <span className="text-5xl mb-4">🏡</span>
                <p className="text-text-muted font-bold text-xl">
                  {lang === 'fr' ? 'Aucune annonce disponible pour le moment.' : 'No listings available at the moment.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST STRIP
      ════════════════════════════════════════ */}
      <section className="py-16 bg-surface border-y border-border-soft">
        <div className="max-w-7xl px-6 mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-70">
            {[
              { icon: Shield, label: lang === 'fr' ? 'Paiements sécurisés' : 'Secure payments' },
              { icon: BadgeCheck, label: lang === 'fr' ? 'Profils vérifiés' : 'Verified profiles' },
              { icon: FileText, label: lang === 'fr' ? 'Quittances légales' : 'Legal receipts' },
              { icon: Star, label: lang === 'fr' ? 'Noté 4.9/5' : 'Rated 4.9/5' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-text-muted">
                <Icon size={20} className="text-gold" strokeWidth={2} />
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════ */}
      <section className="py-28 bg-bg-warm">
        <div className="max-w-7xl px-6 mx-auto">
          <div
            className="relative rounded-[2.5rem] overflow-hidden px-10 py-20 text-center shadow-[0_24px_80px_rgba(26,26,24,0.14)] reveal"
            style={{ background: 'linear-gradient(135deg, #1A1A18 0%, #2a2010 50%, #C9A84C22 100%)' }}
          >
            {/* Dot texture */}
            <div className="absolute inset-0 dot-pattern opacity-50" />
            {/* Gold glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-xs font-bold uppercase tracking-widest text-gold mb-8">
                {lang === 'fr' ? 'Commencez maintenant' : 'Get started now'}
              </div>
              <h2 className="mb-6 text-4xl lg:text-[52px] font-extrabold text-white leading-tight">
                {lang === 'fr' ? 'Prêt à trouver votre nouveau foyer ?' : 'Ready to find your new home?'}
              </h2>
              <p className="mb-12 text-xl text-white/70 font-light max-w-xl mx-auto leading-relaxed">
                {lang === 'fr'
                  ? "Rejoignez 15 000+ Ivoiriens qui font confiance à LoyerSûr pour leurs locations."
                  : "Join 15,000+ Ivoirians who trust LoyerSûr for their rentals."}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth/signup" className="btn-gold py-4 px-10 text-base">
                  {lang === 'fr' ? "S'inscrire gratuitement" : 'Sign up for free'}
                </Link>
                <Link href="/listings" className="btn-outline-white py-4 px-10 text-base">
                  {lang === 'fr' ? 'Explorer les annonces' : 'Explore listings'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
