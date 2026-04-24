'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { mockProperties } from '@/lib/mockData';
import { Shield, Wallet, Users, MapPin, BadgeCheck, FileText, ArrowRight, ChevronRight, Star, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { t, lang } = useLang();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - High Contrast & Bold */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-bg-cream border-b border-border-soft">
        <div className="container px-6 mx-auto">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white border border-primary/20 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black tracking-widest uppercase text-primary">Disponible en Côte d&apos;Ivoire</span>
              </div>
              
              <h1 className="mb-8 text-5xl font-black lg:text-7xl text-text-main leading-tight">
                {lang === 'fr' ? (
                  <>Dormez tranquille, votre <span className="text-accent">loyer tombe</span> à l&apos;heure.</>
                ) : (
                  <>Sleep peacefully, your <span className="text-accent">rent arrives</span> on time.</>
                )}
              </h1>

              <p className="max-w-xl mb-12 text-xl font-medium leading-relaxed text-text-muted">
                {t('hero_sub')}
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/auth/signup" className="btn-primary py-4 px-10 text-lg">
                  {t('hero_cta1')}
                  <ArrowRight size={20} />
                </Link>
                <Link href="/listings" className="btn-secondary py-4 px-10 text-lg">
                  {t('hero_cta2')}
                </Link>
              </div>

              <div className="flex items-center gap-10">
                {[
                  { val: '2.4k+', label: lang === 'fr' ? 'Biens' : 'Properties' },
                  { val: '15k+', label: lang === 'fr' ? 'Membres' : 'Members' },
                  { val: '4.9', label: lang === 'fr' ? 'Note' : 'Rating', icon: Star },
                ].map(({ val, label, icon: Icon }) => (
                  <div key={label} className="flex flex-col">
                    <div className="flex items-center gap-1 text-2xl font-black text-primary">
                      {Icon && <Icon size={20} className="fill-accent text-accent" />}
                      {val}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="relative hidden lg:block">
              <div className="relative z-10 overflow-hidden shadow-2xl rounded-[3rem] aspect-[4/5] border-[12px] border-white">
                <Image
                  src="/hero-couple.png"
                  alt="Happy couple"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Solid Floating UI */}
              <div className="absolute -bottom-8 -left-12 p-6 bg-white shadow-2xl rounded-3xl border border-border-soft min-w-[260px] z-20 animate-float">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-600 uppercase tracking-widest">Paiement Reçu</div>
                    <div className="text-2xl font-black text-text-main">250,000 FCFA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean & Solid */}
      <section className="py-24 bg-white">
        <div className="container px-6 mx-auto">
          <div className="max-w-3xl mb-20">
            <h2 className="mb-6 text-4xl font-black text-text-main md:text-5xl">
              {lang === 'fr' ? 'La location, sans les complications.' : 'Rental, without the complications.'}
            </h2>
            <p className="text-xl font-medium text-text-muted">
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
              <div key={idx} className="p-8 bg-white border border-border-soft rounded-3xl hover:border-primary transition-colors group">
                <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl bg-bg-cream text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon size={28} />
                </div>
                <h3 className="mb-3 text-xl font-black text-text-main">{title}</h3>
                <p className="text-text-muted font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Simplified */}
      <section className="py-24 bg-primary text-white overflow-hidden">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-20">
            <h2 className="mb-6 text-4xl font-black md:text-5xl">{lang === 'fr' ? 'Comment ça marche' : 'How it works'}</h2>
            <p className="max-w-2xl mx-auto text-emerald-100 font-medium">Trois étapes simples pour transformer votre expérience de location.</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {[
              { num: '01', title: 'Créez votre profil', desc: 'Inscrivez-vous et vérifiez votre identité.' },
              { num: '02', title: 'Trouvez ou publiez', desc: 'Parcourez des annonces vérifiées.' },
              { num: '03', title: 'Payez en sécurité', desc: 'Paiements sécurisés via Mobile Money.' },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-8 flex items-center justify-center rounded-full bg-accent text-white text-3xl font-black shadow-xl">
                  {step.num}
                </div>
                <h3 className="mb-4 text-2xl font-black">{step.title}</h3>
                <p className="text-emerald-100/80 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Preview */}
      <section className="py-24 bg-white">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-text-main mb-2">{lang === 'fr' ? 'Dernières opportunités' : 'Latest opportunities'}</h2>
              <p className="text-text-muted font-medium">Annonces vérifiées à Abidjan.</p>
            </div>
            <Link href="/listings" className="btn-secondary py-2 px-6 text-sm">
              {lang === 'fr' ? 'Tout voir' : 'View all'}
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {mockProperties.slice(0, 4).map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 container px-6 mx-auto">
        <div className="bg-bg-cream rounded-[3rem] p-12 lg:p-24 text-center border border-border-soft">
          <h2 className="mb-8 text-4xl font-black text-text-main md:text-6xl">
            Prêt à franchir le pas ?
          </h2>
          <p className="max-w-2xl mx-auto mb-12 text-xl font-medium text-text-muted">
            Rejoignez la première communauté de location directe en Côte d&apos;Ivoire.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary py-4 px-10 text-lg">
              Créer un compte
            </Link>
            <Link href="/listings" className="btn-secondary py-4 px-10 text-lg">
              Voir les annonces
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
