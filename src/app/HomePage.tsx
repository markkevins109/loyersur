'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/lib/lang';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { mockProperties } from '@/lib/mockData';
import { Shield, Wallet, Users, MapPin, BadgeCheck, FileText, ArrowRight, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { t, lang } = useLang();

  const features = [
    {
      icon: Shield,
      title: t('feature1_title'),
      desc: lang === 'fr'
        ? 'Identifiez les bons locataires et propriétaires grâce à notre système de notation bidirectionnel. Plus de mauvaises surprises.'
        : 'Identify good tenants and landlords through our bidirectional rating system. No more bad surprises.',
    },
    {
      icon: Wallet,
      title: t('feature2_title'),
      desc: lang === 'fr'
        ? 'Payez votre loyer avec Orange Money, MTN, Moov ou Wave. Recevez votre quittance automatiquement.'
        : 'Pay your rent with Orange Money, MTN, Moov or Wave. Receive your receipt automatically.',
    },
    {
      icon: Users,
      title: t('feature3_title'),
      desc: lang === 'fr'
        ? 'Contact direct entre propriétaires et locataires. Fini les "frais de visite" et les démarcheurs malhonnêtes.'
        : 'Direct contact between landlords and tenants. No more "visit fees" and dishonest brokers.',
    },
    {
      icon: MapPin,
      title: t('feature4_title'),
      desc: lang === 'fr'
        ? 'Trouvez facilement des logements dans votre quartier préféré : Cocody, Yopougon, Abobo...'
        : 'Easily find housing in your favorite neighborhood: Cocody, Yopougon, Abobo...',
    },
    {
      icon: BadgeCheck,
      title: t('feature5_title'),
      desc: lang === 'fr'
        ? 'Vérification d\'identité CNI pour tous les utilisateurs. Transigez en toute confiance.'
        : 'CNI identity verification for all users. Do business with complete confidence.',
    },
    {
      icon: FileText,
      title: t('feature6_title'),
      desc: lang === 'fr'
        ? 'Chaque paiement génère une quittance numérique légale. Gardez un historique complet de vos loyers.'
        : 'Each payment generates a legal digital receipt. Keep a complete history of your rents.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: lang === 'fr' ? 'Créez votre profil' : 'Create your profile',
      desc: lang === 'fr' ? 'Inscrivez-vous et vérifiez votre identité avec votre CNI en quelques minutes.' : 'Sign up and verify your identity with your CNI in minutes.',
    },
    {
      num: '02',
      title: lang === 'fr' ? 'Trouvez ou publiez' : 'Find or publish',
      desc: lang === 'fr' ? 'Parcourez des annonces vérifiées ou publiez votre bien avec photos et géolocalisation.' : 'Browse verified listings or publish your property with photos and geolocation.',
    },
    {
      num: '03',
      title: lang === 'fr' ? 'Payez en sécurité' : 'Pay securely',
      desc: lang === 'fr' ? 'Effectuez vos paiements via Mobile Money et recevez vos quittances automatiquement.' : 'Make payments via Mobile Money and receive your receipts automatically.',
    },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />

      {/* ══════════ HERO ══════════ */}
      <section
        id="hero-section"
        style={{
          background: '#f5f0e8',
          paddingTop: '5rem',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem 3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          {/* Text */}
          <div className="animate-fade-in-up">
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1c1c1c', marginBottom: '1rem' }}>
              {lang === 'fr' ? (
                <>
                  Dormez tranquille,{' '}
                  <span style={{ color: '#c8501e' }}>votre loyer tombe à l&apos;heure</span>
                </>
              ) : (
                <>
                  Sleep peacefully,{' '}
                  <span style={{ color: '#c8501e' }}>your rent arrives on time</span>
                </>
              )}
            </h1>

            <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              {t('hero_sub')}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <Link href="/auth/signup" id="hero-cta-primary" className="btn-green">
                {t('hero_cta1')}
              </Link>
              <Link href="/listings" id="hero-cta-secondary" className="btn-outline-green">
                {t('hero_cta2')}
              </Link>
            </div>

            {/* Trust indicators */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { val: '2 400+', label: lang === 'fr' ? 'Propriétés' : 'Properties' },
                { val: '15 000+', label: lang === 'fr' ? 'Utilisateurs' : 'Users' },
                { val: '98%', label: lang === 'fr' ? 'Satisfaction' : 'Satisfaction' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a4d3a' }}>{val}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="animate-fade-in" style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
              position: 'relative',
              height: 420,
            }}>
              <Image
                src="/hero-couple.png"
                alt="Happy couple receiving house keys"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            {/* Floating badge */}
            <div style={{
              position: 'absolute', bottom: -16, left: -16,
              background: '#fff',
              borderRadius: 10,
              padding: '12px 16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: 10,
              border: '1px solid #e8f2ee',
            }}>
              <div style={{ width: 36, height: 36, background: '#e8f2ee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>✓</span>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: 1 }}>
                  {lang === 'fr' ? 'Paiement confirmé' : 'Payment confirmed'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c1c1c' }}>250 000 FCFA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive override */}
        <style>{`
          @media (max-width: 768px) {
            #hero-section > div {
              grid-template-columns: 1fr !important;
              padding-top: 2rem !important;
            }
            #hero-section > div > div:last-child { display: none; }
          }
        `}</style>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section id="features-section" style={{ padding: '5rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1c1c1c', marginBottom: '0.75rem' }}>
              {lang === 'fr' ? 'Pourquoi choisir LoyerSûr CI ?' : 'Why choose LoyerSûr CI?'}
            </h2>
            <p style={{ color: '#777', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto' }}>
              {lang === 'fr'
                ? 'Une plateforme complète pour gérer vos locations en toute sécurité'
                : 'A complete platform to manage your rentals in complete safety'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: '#e8f2ee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Icon size={22} color="#1a4d3a" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c1c1c', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-section" style={{ padding: '4rem 1.5rem', background: '#f9f7f4' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1c1c1c', marginBottom: '0.75rem' }}>
              {lang === 'fr' ? 'Comment ça marche' : 'How it works'}
            </h2>
            <p style={{ color: '#777', fontSize: '0.95rem' }}>
              {lang === 'fr' ? '3 étapes simples pour commencer' : '3 simple steps to get started'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {steps.map(({ num, title, desc }) => (
              <div key={num} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, background: '#1a4d3a', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>{num}</span>
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1c1c1c', marginBottom: '0.4rem' }}>{title}</h3>
                  <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ LISTINGS PREVIEW ══════════ */}
      <section id="listings-preview" style={{ padding: '5rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, color: '#1c1c1c', marginBottom: '0.25rem' }}>
                {lang === 'fr' ? 'Annonces récentes' : 'Recent listings'}
              </h2>
              <p style={{ color: '#777', fontSize: '0.875rem' }}>
                {lang === 'fr' ? 'Découvrez nos meilleures offres en Côte d\'Ivoire' : "Discover our best offers in Côte d'Ivoire"}
              </p>
            </div>
            <Link href="/listings" id="see-all-listings"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1a4d3a', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
              {lang === 'fr' ? 'Voir toutes les annonces' : 'See all listings'}
              <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {mockProperties.slice(0, 4).map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section id="cta-section" style={{ padding: '5rem 1.5rem', background: '#1a4d3a' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            {lang === 'fr' ? 'Prêt à louer en toute sécurité ?' : 'Ready to rent securely?'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            {lang === 'fr'
              ? 'Rejoignez des centaines de propriétaires et locataires qui font confiance à LoyerSûr CI'
              : 'Join hundreds of landlords and tenants who trust LoyerSûr CI'}
          </p>
          <Link href="/auth/signup" id="cta-signup" className="btn-outline-white">
            {lang === 'fr' ? 'Rejoindre LoyerSûr CI' : 'Join LoyerSûr CI'} <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
