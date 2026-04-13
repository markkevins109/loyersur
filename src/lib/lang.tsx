'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'fr' | 'en';

const translations = {
  fr: {
    // Nav
    nav_listings: 'Annonces',
    nav_about: 'À propos',
    nav_login: 'Connexion',
    nav_signup: "S'inscrire",
    nav_dashboard: 'Tableau de bord',
    nav_landlord: 'Propriétaire',
    nav_tenant: 'Locataire',

    // Hero
    hero_headline: "Dormez tranquille, votre loyer tombe à l'heure",
    hero_sub: "La plateforme qui sécurise la relation entre propriétaires et locataires en Côte d'Ivoire. Fini les impayés, les démarcheurs malhonnêtes et les frais cachés.",
    hero_cta1: 'Commencer gratuitement',
    hero_cta2: 'Voir les annonces',
    hero_badge1: 'Profils vérifiés',
    hero_badge2: 'Paiement sécurisé',
    hero_badge3: 'Sans intermédiaire',
    hero_stat1: 'Propriétés',
    hero_stat2: 'Utilisateurs actifs',
    hero_stat3: 'Paiements traités',

    // Features
    features_title: 'Tout ce dont vous avez besoin',
    features_sub: 'Une plateforme complète pour une expérience de location sans stress',
    feature1_title: 'Score de Confiance',
    feature1_desc: 'Système de notation bidirectionnel entre locataires et propriétaires. Construisez votre réputation.',
    feature2_title: 'Paiement Mobile Money',
    feature2_desc: 'Payez votre loyer via Orange Money, MTN Money, Moov Money et Wave. Simple et sécurisé.',
    feature3_title: 'Sans Intermédiaire',
    feature3_desc: 'Contact direct entre propriétaires et locataires. Aucun courtier, aucune commission cachée.',
    feature4_title: 'Géolocalisation',
    feature4_desc: 'Trouvez des logements par quartier : Cocody, Yopougon, Abobo, Plateau et partout en CI.',
    feature5_title: 'Profils Vérifiés',
    feature5_desc: "Vérification d'identité par CNI. Louez en toute confiance avec des personnes fiables.",
    feature6_title: 'Quittances Automatiques',
    feature6_desc: 'Reçus numériques automatiques générés après chaque paiement. Vos preuves en un clic.',

    // How it works
    how_title: 'Comment ça marche',
    how_sub: 'En 3 étapes simples',
    step1_title: 'Créez votre profil',
    step1_desc: 'Inscrivez-vous en tant que propriétaire ou locataire. Vérifiez votre identité avec votre CNI.',
    step2_title: 'Trouvez ou publiez',
    step2_desc: 'Parcourez des annonces vérifiées ou publiez votre bien. Géolocalisation intégrée.',
    step3_title: 'Payez en toute sécurité',
    step3_desc: 'Effectuez vos paiements via Mobile Money. Recevez vos quittances automatiquement.',

    // Auth Layout specific
    auth_tag: "🇨🇮 Côte d'Ivoire No.1",
    auth_title_part1: "La plateforme",
    auth_title_accent: "immobilière",
    auth_title_part2: "de confiance",
    auth_desc: "Connectez propriétaires et locataires en toute sécurité. Paiements, contrats et quittances — tout en un.",
    auth_feature1: "Profils 100% vérifiés",
    auth_feature2: "Paiement Mobile Money",
    auth_feature3: "Sans intermédiaire",
    auth_feature4: "Quittances automatiques",
    auth_footer: "Accueil",

    // Listings
    listings_title: 'Annonces disponibles',
    listings_sub: 'Trouvez votre logement idéal en Côte d\'Ivoire',
    filter_city: 'Ville',
    filter_neighborhood: 'Quartier',
    filter_price: 'Budget',
    filter_rooms: 'Pièces',
    filter_verified: 'Propriétaires vérifiés',
    filter_all: 'Tous',
    filter_apply: 'Appliquer',
    filter_reset: 'Réinitialiser',
    per_month: '/mois',
    see_details: 'Voir les détails',
    verified: 'Vérifié',
    rooms: 'pièces',

    // Property detail
    detail_description: 'Description',
    detail_location: 'Localisation',
    detail_landlord: 'Propriétaire',
    detail_contact: 'Contacter le propriétaire',
    detail_book: 'Réserver une visite',
    detail_pay: 'Payer le loyer',
    detail_features: 'Caractéristiques',
    detail_reviews: 'Avis',
    detail_bedrooms: 'chambres',
    detail_bathrooms: 'salles de bain',
    detail_area: 'm²',

    // Auth
    login_title: 'Connexion',
    login_sub: 'Bienvenue sur LoyerSûr CI',
    login_email: 'Adresse email',
    login_password: 'Mot de passe',
    login_forgot: 'Mot de passe oublié?',
    login_btn: 'Se connecter',
    login_no_account: "Vous n'avez pas de compte?",
    login_signup: "S'inscrire",
    signup_title: 'Créer un compte',
    signup_sub: 'Rejoignez LoyerSûr CI',
    signup_name: 'Nom complet',
    signup_email: 'Adresse email',
    signup_phone: 'Numéro de téléphone',
    signup_password: 'Mot de passe',
    signup_type: 'Type de compte',
    signup_tenant: 'Locataire',
    signup_landlord: 'Propriétaire',
    signup_btn: 'Créer mon compte',
    signup_has_account: 'Vous avez déjà un compte?',
    forgot_title: 'Mot de passe oublié',
    forgot_sub: 'Entrez votre email pour réinitialiser',
    forgot_btn: 'Envoyer le lien',

    // Payment
    pay_title: 'Payer le loyer',
    pay_choose: 'Choisissez votre opérateur',
    pay_amount: 'Montant',
    pay_phone: 'Numéro de téléphone',
    pay_confirm: 'Confirmer le paiement',
    pay_success: 'Paiement réussi !',
    pay_receipt: 'Télécharger la quittance',
    pay_close: 'Fermer',

    // Dashboard
    dash_tenant_title: 'Tableau de bord — Locataire',
    dash_landlord_title: 'Tableau de bord — Propriétaire',
    dash_saved: 'Propriétés sauvegardées',
    dash_payments: 'Historique des paiements',
    dash_receipts: 'Mes quittances',
    dash_messages: 'Messages',
    dash_my_listings: 'Mes annonces',
    dash_add_property: 'Ajouter une propriété',
    dash_requests: 'Demandes de locataires',
    dash_received: 'Paiements reçus',
    dash_welcome: 'Bonjour',
    dash_stats_active: 'Annonces actives',
    dash_stats_pending: 'En attente',
    dash_stats_revenue: 'Revenus du mois',

    // Profile
    profile_trust: 'Score de confiance',
    profile_reviews: 'Avis',
    profile_listings: 'Annonces',
    profile_joined: 'Membre depuis',
    profile_verified: 'Identité vérifiée',

    // Extra Auth
    signup_i_am: 'Je suis un…',
    signup_tenant_sub: 'Trouvez et payez votre loyer en ligne',
    signup_landlord_sub: 'Publiez vos biens et gérez vos locataires',
    signup_continue: 'Continuer',
    signup_success: 'Compte créé ! Redirection…',
    signup_creating: 'Création en cours…',
    signup_terms: "En créant un compte, vous acceptez nos conditions d'utilisation.",
    signup_min_chars: 'Minimum 6 caractères',
    login_signing_in: 'Connexion…',
    login_no_account_yet: 'Pas encore de compte ?',
    login_signup_cta: 'Créer un compte gratuit →',
    generic_error: 'Une erreur est survenue. Veuillez réessayer.',
    back_to_home: 'Accueil',

    // CNI Verify
    verify_title: "Vérification d'identité",
    verify_sub: "Requis pour les propriétaires afin de sécuriser la plateforme",
    verify_consent_title: "Notice de consentement — Loi n°2013-450",
    verify_consent_desc: "En soumettant votre pièce d'identité, vous autorisez LoyerSûr CI à traiter temporairement vos données personnelles aux fins de vérification d'identité uniquement. Vos données ne seront pas conservées au-delà de 24 heures. Conformément à la Loi n°2013-450.",
    verify_step_front: "Recto de votre Carte Nationale d'Identité (CNI)",
    verify_step_back: "Verso de votre CNI (contenant la zone MRZ)",
    verify_step_privacy: "Images traitées en mémoire uniquement — jamais stockées",
    verify_accept: "J'accepte — Commencer la vérification",
    verify_upload_title: "📷 Téléchargez votre CNI",
    verify_upload_sub: "Photographiez votre CNI à plat, sous bonne lumière, sans reflets.",
    verify_front_label: "① Recto",
    verify_back_label: "② Verso (MRZ)",
    verify_front_hint: "Recto (nom, photo)",
    verify_back_hint: "Verso (MRZ)",
    verify_tip_title: "Conseil :",
    verify_tip_desc: "Assurez-vous que les 3 lignes du bas (code MRZ) sont nettes et entièrement visibles sur le verso.",
    verify_check_quality: "Qualité insuffisante",
    verify_check_quality_desc: "Veuillez reprendre la photo dans un bon éclairage, à plat, sans reflets.",
    verify_retry_photos: "Reprendre les photos",
    verify_mrz_title: "🔡 Code MRZ",
    verify_mrz_sub: "Saisissez les 3 lignes de caractères en bas du verso de votre CNI.",
    verify_mrz_line: "Ligne",
    verify_btn: "Vérifier mon identité",
    verify_checking: "Vérification en cours…",
    verify_pass_title: "Identité vérifiée !",
    verify_pass_sub: "Votre identité a été vérifiée avec succès. Redirection vers votre tableau de bord…",
    verify_fail_title: "Vérification échouée",
    verify_fail_attempts: "Il vous reste 1 tentative.",
    verify_retry_btn: "Réessayer",
    verify_final_title: "Compte suspendu",
    verify_final_sub: "Vérification manuelle requise.",

    // Testimonials
    testimonials_title: 'Ce que disent nos utilisateurs',
    testimonials_sub: 'Des milliers de personnes nous font confiance',

    // CTA Banner
    cta_title: 'Prêt à commencer?',
    cta_sub: 'Rejoignez des milliers de propriétaires et locataires qui font confiance à LoyerSûr CI.',
    cta_btn: 'Commencer gratuitement',

    // Footer
    footer_desc: "LoyerSûr CI — La plateforme immobilière de confiance en Côte d'Ivoire.",
    footer_about: 'À propos',
    footer_contact: 'Contact',
    footer_terms: 'Conditions d\'utilisation',
    footer_privacy: 'Confidentialité',
    footer_copyright: '© 2026 LoyerSûr CI. Tous droits réservés.',
    footer_company: 'Entreprise',
    footer_support: 'Support',
    footer_faq: 'FAQ',
    footer_blog: 'Blog',

    // General
    loading: 'Chargement...',
    back: 'Retour',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    all_cities: 'Toutes les villes',
    any_price: 'Tout budget',
    any_rooms: 'Tout',
  },
  en: {
    // Nav
    nav_listings: 'Listings',
    nav_about: 'About',
    nav_login: 'Login',
    nav_signup: 'Sign Up',
    nav_dashboard: 'Dashboard',
    nav_landlord: 'Landlord',
    nav_tenant: 'Tenant',

    // Hero
    hero_headline: 'Sleep peacefully, your rent arrives on time',
    hero_sub: "The platform that secures the relationship between landlords and tenants in Côte d'Ivoire. No more missed payments, dishonest brokers, or hidden fees.",
    hero_cta1: 'Start for free',
    hero_cta2: 'Browse listings',
    hero_badge1: 'Verified profiles',
    hero_badge2: 'Secure payments',
    hero_badge3: 'No middlemen',
    hero_stat1: 'Properties',
    hero_stat2: 'Active users',
    hero_stat3: 'Payments processed',

    // Features
    features_title: 'Everything you need',
    features_sub: 'A complete platform for a stress-free rental experience',
    feature1_title: 'Trust Score',
    feature1_desc: 'Bidirectional rating system between tenants and landlords. Build your reputation.',
    feature2_title: 'Mobile Money Payment',
    feature2_desc: 'Pay rent via Orange Money, MTN Money, Moov Money, and Wave. Simple and secure.',
    feature3_title: 'No Middlemen',
    feature3_desc: 'Direct contact between landlords and tenants. No brokers, no hidden commissions.',
    feature4_title: 'Geolocation',
    feature4_desc: 'Find housing by neighborhood: Cocody, Yopougon, Abobo, Plateau and across CI.',
    feature5_title: 'Verified Profiles',
    feature5_desc: 'Identity verification using national ID (CNI). Rent with confidence from trusted people.',
    feature6_title: 'Automatic Receipts',
    feature6_desc: 'Automatic digital receipts generated after each payment. Your proof in one click.',

    // How it works
    how_title: 'How it works',
    how_sub: 'In 3 simple steps',
    step1_title: 'Create your profile',
    step1_desc: 'Sign up as a landlord or tenant. Verify your identity with your national ID (CNI).',
    step2_title: 'Find or publish',
    step2_desc: 'Browse verified listings or publish your property. Built-in geolocation.',
    step3_title: 'Pay securely',
    step3_desc: 'Make payments via Mobile Money. Receive your receipts automatically.',

    // Auth Layout specific
    auth_tag: "🇨🇮 Côte d'Ivoire No.1",
    auth_title_part1: "The trusted",
    auth_title_accent: "real estate",
    auth_title_part2: "platform",
    auth_desc: "Connect landlords and tenants securely. Payments, contracts, and receipts — all in one.",
    auth_feature1: "100% Verified Profiles",
    auth_feature2: "Mobile Money Payments",
    auth_feature3: "No Intermediaries",
    auth_feature4: "Automatic Receipts",
    auth_footer: "Home",

    // Listings
    listings_title: 'Available listings',
    listings_sub: 'Find your ideal home in Côte d\'Ivoire',
    filter_city: 'City',
    filter_neighborhood: 'Neighborhood',
    filter_price: 'Budget',
    filter_rooms: 'Rooms',
    filter_verified: 'Verified landlords',
    filter_all: 'All',
    filter_apply: 'Apply',
    filter_reset: 'Reset',
    per_month: '/month',
    see_details: 'See details',
    verified: 'Verified',
    rooms: 'rooms',

    // Property detail
    detail_description: 'Description',
    detail_location: 'Location',
    detail_landlord: 'Landlord',
    detail_contact: 'Contact landlord',
    detail_book: 'Book a viewing',
    detail_pay: 'Pay rent',
    detail_features: 'Features',
    detail_reviews: 'Reviews',
    detail_bedrooms: 'bedrooms',
    detail_bathrooms: 'bathrooms',
    detail_area: 'm²',

    // Auth
    login_title: 'Login',
    login_sub: 'Welcome back to LoyerSûr CI',
    login_email: 'Email address',
    login_password: 'Password',
    login_forgot: 'Forgot password?',
    login_btn: 'Sign in',
    login_no_account: "Don't have an account?",
    login_signup: 'Sign up',
    signup_title: 'Create account',
    signup_sub: 'Join LoyerSûr CI',
    signup_name: 'Full name',
    signup_email: 'Email address',
    signup_phone: 'Phone number',
    signup_password: 'Password',
    signup_type: 'Account type',
    signup_tenant: 'Tenant',
    signup_landlord: 'Landlord',
    signup_btn: 'Create my account',
    signup_has_account: 'Already have an account?',
    forgot_title: 'Forgot password',
    forgot_sub: 'Enter your email to reset',
    forgot_btn: 'Send reset link',

    // Payment
    pay_title: 'Pay rent',
    pay_choose: 'Choose your operator',
    pay_amount: 'Amount',
    pay_phone: 'Phone number',
    pay_confirm: 'Confirm payment',
    pay_success: 'Payment successful!',
    pay_receipt: 'Download receipt',
    pay_close: 'Close',

    // Dashboard
    dash_tenant_title: 'Dashboard — Tenant',
    dash_landlord_title: 'Dashboard — Landlord',
    dash_saved: 'Saved properties',
    dash_payments: 'Payment history',
    dash_receipts: 'My receipts',
    dash_messages: 'Messages',
    dash_my_listings: 'My listings',
    dash_add_property: 'Add property',
    dash_requests: 'Tenant requests',
    dash_received: 'Payments received',
    dash_welcome: 'Hello',
    dash_stats_active: 'Active listings',
    dash_stats_pending: 'Pending',
    dash_stats_revenue: "This month's revenue",

    // Profile
    profile_trust: 'Trust score',
    profile_reviews: 'Reviews',
    profile_listings: 'Listings',
    profile_joined: 'Member since',
    profile_verified: 'Identity verified',

    // Extra Auth
    signup_i_am: 'I am a…',
    signup_tenant_sub: 'Find and pay rent online',
    signup_landlord_sub: 'List properties and manage tenants',
    signup_continue: 'Continue',
    signup_success: 'Account created! Redirecting...',
    signup_creating: 'Creating account...',
    signup_terms: 'By creating an account, you agree to our terms of use.',
    signup_min_chars: 'Minimum 6 characters',
    login_signing_in: 'Signing in...',
    login_no_account_yet: "Don't have an account?",
    login_signup_cta: 'Create a free account →',
    generic_error: 'An error occurred. Please try again.',
    back_to_home: 'Home',

    // CNI Verify
    verify_title: "Identity Verification",
    verify_sub: "Required for landlords to secure the platform",
    verify_consent_title: "Consent Notice — Law n°2013-450",
    verify_consent_desc: "By submitting your ID, you authorize LoyerSûr CI to temporarily process your personal data for identity verification purposes only. Your data will not be kept longer than 24 hours. In accordance with Law n°2013-450.",
    verify_step_front: "Front of your National Identity Card (CNI)",
    verify_step_back: "Back of your CNI (containing the MRZ zone)",
    verify_step_privacy: "Images processed in memory only — never stored",
    verify_accept: "I accept — Start verification",
    verify_upload_title: "📷 Upload your ID",
    verify_upload_sub: "Photograph your ID flat, in good light, without reflections.",
    verify_front_label: "① Front",
    verify_back_label: "② Back (MRZ)",
    verify_front_hint: "Front (name, photo)",
    verify_back_hint: "Back (MRZ)",
    verify_tip_title: "Tip:",
    verify_tip_desc: "Make sure the bottom 3 lines (MRZ code) are sharp and fully visible on the back.",
    verify_check_quality: "Insufficient quality",
    verify_check_quality_desc: "Please retake the photo in good lighting, flat, without reflections.",
    verify_retry_photos: "Retake photos",
    verify_mrz_title: "🔡 MRZ Code",
    verify_mrz_sub: "Enter the 3 lines of characters at the bottom of the back of your ID.",
    verify_mrz_line: "Line",
    verify_btn: "Verify my identity",
    verify_checking: "Verification in progress…",
    verify_pass_title: "Identity verified!",
    verify_pass_sub: "Your identity has been successfully verified. Redirecting to your dashboard…",
    verify_fail_title: "Verification failed",
    verify_fail_attempts: "You have 1 attempt remaining.",
    verify_retry_btn: "Retry",
    verify_final_title: "Account suspended",
    verify_final_sub: "Manual verification required.",

    // Testimonials
    testimonials_title: 'What our users say',
    testimonials_sub: 'Thousands of people trust us',

    // CTA Banner
    cta_title: 'Ready to get started?',
    cta_sub: 'Join thousands of landlords and tenants who trust LoyerSûr CI.',
    cta_btn: 'Start for free',

    // Footer
    footer_desc: "LoyerSûr CI — The trusted real estate platform in Côte d'Ivoire.",
    footer_about: 'About',
    footer_contact: 'Contact',
    footer_terms: 'Terms of Use',
    footer_privacy: 'Privacy',
    footer_copyright: '© 2026 LoyerSûr CI. All rights reserved.',
    footer_company: 'Company',
    footer_support: 'Support',
    footer_faq: 'FAQ',
    footer_blog: 'Blog',

    // General
    loading: 'Loading...',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    all_cities: 'All cities',
    any_price: 'Any budget',
    any_rooms: 'Any',
  },
};

type TranslationKey = keyof typeof translations.fr;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('app-lang') as Lang;
    if (saved && (saved === 'fr' || saved === 'en')) {
      setLang(saved);
    }
  }, []);

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('app-lang', l);
    document.documentElement.lang = l;
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
