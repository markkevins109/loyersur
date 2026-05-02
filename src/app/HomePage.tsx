'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { supabase, type Property as DBProperty } from '@/lib/supabase';
import { Property } from '@/lib/mockData';
import { Shield, Wallet, Users, MapPin, BadgeCheck, FileText, ArrowRight, ChevronRight, Star, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { t, lang } = useLang();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen bg-bg-cream selection:bg-accent selection:text-white">
      <Navbar />

      {/* Hero Section - Premium Glassmorphism & Modern Typography */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-bg-cream via-surface to-accent-soft/20 border-b border-border-soft">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="container relative z-10 px-6 mx-auto">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-surface/80 backdrop-blur-md border border-border-soft rounded-full shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
                <span className="text-[11px] font-bold tracking-widest uppercase text-text-muted">Disponible en Côte d&apos;Ivoire</span>
              </div>
              
              <h1 className="mb-8 text-5xl font-extrabold lg:text-7xl text-text-main leading-[1.1] tracking-tight">
                {lang === 'fr' ? (
                  <>Dormez tranquille, votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-dark">loyer tombe</span> à l&apos;heure.</>
                ) : (
                  <>Sleep peacefully, your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-dark">rent arrives</span> on time.</>
                )}
              </h1>

              <p className="max-w-xl mb-12 text-xl font-medium leading-relaxed text-text-muted/90">
                {t('hero_sub')}
              </p>

              <div className="flex flex-wrap gap-4 mb-14">
                <Link href="/auth/signup" className="btn-primary py-4 px-10 text-lg">
                  {t('hero_cta1')}
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/listings" className="btn-secondary py-4 px-10 text-lg">
                  {t('hero_cta2')}
                </Link>
              </div>

              <div className="flex items-center gap-12 pt-8 border-t border-border-soft">
                {[
                  { val: '2.4k+', label: lang === 'fr' ? 'Biens' : 'Properties' },
                  { val: '15k+', label: lang === 'fr' ? 'Membres' : 'Members' },
                  { val: '4.9', label: lang === 'fr' ? 'Note' : 'Rating', icon: Star },
                ].map(({ val, label, icon: Icon }) => (
                  <div key={label} className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-3xl font-extrabold text-primary">
                      {Icon && <Icon size={24} className="fill-accent text-accent" />}
                      {val}
                    </div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.1)] rounded-[2.5rem] aspect-[4/5] border-8 border-surface">
                <Image
                  src="/hero-couple.png"
                  alt="Happy couple"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              </div>
              
              {/* Glassmorphism Floating UI */}
              <div className="absolute -bottom-10 -left-16 p-6 bg-surface/90 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-[2rem] border border-white min-w-[280px] z-20 animate-float">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-soft text-accent-dark">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">Paiement Reçu</div>
                    <div className="text-2xl font-extrabold text-primary">250,000 FCFA</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean & Sophisticated */}
      <section className="py-32 bg-surface">
        <div className="container px-6 mx-auto">
          <div className="max-w-3xl mb-24">
            <h2 className="mb-6 text-4xl font-extrabold text-primary md:text-5xl leading-tight">
              {lang === 'fr' ? 'La location, sans les complications.' : 'Rental, without the complications.'}
            </h2>
            <p className="text-xl font-medium text-text-muted leading-relaxed">
              {lang === 'fr'
                ? 'Une plateforme pensée pour les Ivoiriens. Plus de sécurité, plus de transparence, moins de stress.'
                : 'A platform designed for Ivoirians. More security, more transparency, less stress.'}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, title: t('feature1_title'), desc: 'Notation bidirectionnelle.' },
              { icon: Wallet, title: t('feature2_title'), desc: 'Paiements Mobile Money.' },
              { icon: Users, title: t('feature3_title'), desc: 'Contact direct sans broker.' },
              { icon: MapPin, title: t('feature4_title'), desc: 'Tous les quartiers d\'Abidjan.' },
              { icon: BadgeCheck, title: t('feature5_title'), desc: 'Vérification CNI obligatoire.' },
              { icon: FileText, title: t('feature6_title'), desc: 'Quittances numériques légales.' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div key={idx} className="p-10 bg-bg-cream/50 border border-border-soft rounded-[2rem] hover:bg-surface hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-16 h-16 mb-8 flex items-center justify-center rounded-[1.25rem] bg-surface shadow-sm border border-border-soft text-primary group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-colors duration-300">
                  <Icon size={32} />
                </div>
                <h3 className="mb-4 text-xl font-bold text-primary">{title}</h3>
                <p className="text-text-muted font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Deep Midnight Contrast */}
      <section className="py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px]"></div>
        
        <div className="container relative z-10 px-6 mx-auto">
          <div className="text-center mb-24">
            <h2 className="mb-6 text-4xl font-extrabold md:text-5xl">{lang === 'fr' ? 'Comment ça marche' : 'How it works'}</h2>
            <p className="max-w-2xl mx-auto text-white/70 text-lg font-medium">Trois étapes simples pour transformer votre expérience de location.</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3 relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0"></div>
            
            {[
              { num: '01', title: 'Créez votre profil', desc: 'Inscrivez-vous et vérifiez votre identité en quelques clics.' },
              { num: '02', title: 'Trouvez ou publiez', desc: 'Parcourez des annonces vérifiées et sélectionnées pour vous.' },
              { num: '03', title: 'Payez en sécurité', desc: 'Paiements sécurisés et automatisés via Mobile Money.' },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 mb-10 flex items-center justify-center rounded-full bg-surface text-accent text-3xl font-extrabold shadow-[0_0_40px_rgba(16,185,129,0.2)] border-4 border-primary">
                  {step.num}
                </div>
                <h3 className="mb-4 text-2xl font-bold">{step.title}</h3>
                <p className="text-white/60 font-medium leading-relaxed max-w-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Preview */}
      <section className="py-32 bg-bg-cream">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-extrabold text-primary mb-3">{lang === 'fr' ? 'Dernières opportunités' : 'Latest opportunities'}</h2>
              <p className="text-text-muted font-medium text-lg">Annonces vérifiées à Abidjan.</p>
            </div>
            <Link href="/listings" className="btn-secondary py-3 px-8">
              {lang === 'fr' ? 'Tout voir' : 'View all'}
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 min-h-[300px]">
            {loading ? (
              <div className="col-span-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-border-soft border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : properties.length > 0 ? (
              properties.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-text-muted font-medium text-lg">
                {lang === 'fr' ? 'Aucune annonce disponible pour le moment.' : 'No listings available at the moment.'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA - Premium Banner */}
      <section className="py-24 bg-surface">
        <div className="container px-6 mx-auto">
          <div className="relative bg-primary rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px]"></div>
            
            <div className="relative z-10 p-16 lg:p-24 text-center">
              <h2 className="mb-8 text-4xl font-extrabold text-white md:text-6xl tracking-tight">
                Prêt à franchir le pas ?
              </h2>
              <p className="max-w-2xl mx-auto mb-14 text-xl font-medium text-white/70">
                Rejoignez la première communauté de location directe et sécurisée en Côte d&apos;Ivoire.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/auth/signup" className="btn-primary bg-accent hover:bg-accent-dark text-white py-4 px-12 text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  Créer un compte
                </Link>
                <Link href="/listings" className="btn-secondary bg-surface/10 border-white/20 text-white hover:bg-surface/20 py-4 px-12 text-lg">
                  Voir les annonces
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
