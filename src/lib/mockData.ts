export interface Property {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  city: string;
  neighborhood: string;
  rooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  landlordId: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  features: string[];
  featuresEn: string[];
  coordinates: { lat: number; lng: number };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'tenant' | 'landlord';
  avatar: string;
  verified: boolean;
  trustScore: number;
  reviewCount: number;
  joinedDate: string;
  properties?: string[];
  bio: string;
  bioEn: string;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  targetId: string;
  rating: number;
  comment: string;
  commentEn: string;
  date: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  amount: number;
  date: string;
  method: 'orange' | 'mtn' | 'moov' | 'wave';
  status: 'completed' | 'pending' | 'failed';
  receiptUrl: string;
}

export const mockLandlords: User[] = [
  {
    id: 'l1',
    name: 'Kouamé Adjoumani',
    email: 'k.adjoumani@email.ci',
    phone: '+225 07 12 34 56',
    type: 'landlord',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kouame',
    verified: true,
    trustScore: 4.9,
    reviewCount: 47,
    joinedDate: 'Janvier 2023',
    properties: ['p1', 'p2'],
    bio: 'Propriétaire expérimenté à Cocody depuis plus de 10 ans. Je mets tout en œuvre pour offrir des logements de qualité.',
    bioEn: 'Experienced landlord in Cocody for over 10 years. I do everything to provide quality housing.',
  },
  {
    id: 'l2',
    name: 'Ama Koffi',
    email: 'a.koffi@email.ci',
    phone: '+225 05 98 76 54',
    type: 'landlord',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ama',
    verified: true,
    trustScore: 4.7,
    reviewCount: 32,
    joinedDate: 'Mars 2023',
    properties: ['p3', 'p4'],
    bio: 'Propriétaire sérieuse à Yopougon. Logements bien entretenus et loyers transparents.',
    bioEn: 'Serious landlord in Yopougon. Well-maintained properties and transparent rents.',
  },
  {
    id: 'l3',
    name: 'Ibrahim Traoré',
    email: 'i.traore@email.ci',
    phone: '+225 01 23 45 67',
    type: 'landlord',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim',
    verified: true,
    trustScore: 4.8,
    reviewCount: 28,
    joinedDate: 'Juin 2023',
    properties: ['p5', 'p6'],
    bio: 'Gestionnaire immobilier professionnel basé au Plateau. Spécialisé dans les appartements modernes.',
    bioEn: 'Professional property manager based in Plateau. Specialized in modern apartments.',
  },
  {
    id: 'l4',
    name: 'Marie-Louise Bamba',
    email: 'm.bamba@email.ci',
    phone: '+225 09 11 22 33',
    type: 'landlord',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
    verified: false,
    trustScore: 4.3,
    reviewCount: 15,
    joinedDate: 'Septembre 2023',
    properties: ['p7', 'p8'],
    bio: 'Propriétaire à Abobo avec des logements abordables pour familles.',
    bioEn: 'Landlord in Abobo with affordable housing for families.',
  },
];

export const mockTenants: User[] = [
  {
    id: 't1',
    name: 'Fatou Diallo',
    email: 'f.diallo@email.ci',
    phone: '+225 07 55 44 33',
    type: 'tenant',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
    verified: true,
    trustScore: 4.8,
    reviewCount: 12,
    joinedDate: 'Février 2023',
    bio: 'Locataire sérieuse, cadre dans une entreprise internationale.',
    bioEn: 'Serious tenant, executive at an international company.',
  },
  {
    id: 't2',
    name: 'Jean-Baptiste N\'Goran',
    email: 'jb.ngoran@email.ci',
    phone: '+225 05 66 77 88',
    type: 'tenant',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
    verified: true,
    trustScore: 4.6,
    reviewCount: 8,
    joinedDate: 'Avril 2023',
    bio: 'Ingénieur informatique cherchant un logement stable à Abidjan.',
    bioEn: 'IT engineer looking for stable housing in Abidjan.',
  },
];

export const mockProperties: Property[] = [
  {
    id: 'p1',
    title: 'Appartement moderne 3 pièces — Cocody Riviera',
    titleEn: 'Modern 3-room apartment — Cocody Riviera',
    description: 'Bel appartement lumineux au 3ème étage avec vue sur jardin. Cuisine équipée, double vitrage, parking inclus. Quartier calme et sécurisé, proche des commerces et écoles internationales.',
    descriptionEn: 'Beautiful bright apartment on the 3rd floor with garden view. Equipped kitchen, double glazing, parking included. Quiet and secure neighborhood, close to shops and international schools.',
    price: 250000,
    city: 'Abidjan',
    neighborhood: 'Cocody',
    rooms: 3,
    bathrooms: 2,
    area: 95,
    images: ['/property-interior-1.png', '/property-exterior-1.png', '/property-interior-2.png'],
    landlordId: 'l1',
    verified: true,
    rating: 4.9,
    reviewCount: 12,
    features: ['Cuisine équipée', 'Parking', 'Sécurité 24h', 'Balcon', 'Clim centralisée', 'Eau chaude'],
    featuresEn: ['Equipped kitchen', 'Parking', '24h security', 'Balcony', 'Central AC', 'Hot water'],
    coordinates: { lat: 5.3559, lng: -4.0070 },
  },
  {
    id: 'p2',
    title: 'Studio meublé — Cocody Angré',
    titleEn: 'Furnished studio — Cocody Angré',
    description: 'Studio entièrement meublé pour jeune professionnel. Quartier prisé d\'Angré, proche du CHU. Excellent état.',
    descriptionEn: 'Fully furnished studio for young professional. Popular Angré neighborhood, near the hospital. Excellent condition.',
    price: 120000,
    city: 'Abidjan',
    neighborhood: 'Cocody',
    rooms: 1,
    bathrooms: 1,
    area: 35,
    images: ['/property-interior-2.png', '/property-exterior-2.png'],
    landlordId: 'l1',
    verified: true,
    rating: 4.7,
    reviewCount: 8,
    features: ['Meublé', 'WiFi inclus', 'Clim', 'Eau chaude', 'Sécurité'],
    featuresEn: ['Furnished', 'WiFi included', 'AC', 'Hot water', 'Security'],
    coordinates: { lat: 5.3779, lng: -3.9803 },
  },
  {
    id: 'p3',
    title: 'Villa 4 chambres avec piscine — Yopougon Maroc',
    titleEn: '4-bedroom villa with pool — Yopougon Maroc',
    description: 'Grande villa familiale avec piscine privée, jardin tropical et garage double. Idéale pour famille nombreuse. Gardien 24h/24.',
    descriptionEn: 'Large family villa with private pool, tropical garden and double garage. Ideal for large families. 24/7 guard.',
    price: 450000,
    city: 'Abidjan',
    neighborhood: 'Yopougon',
    rooms: 4,
    bathrooms: 3,
    area: 220,
    images: ['/property-exterior-2.png', '/property-interior-1.png', '/property-exterior-1.png'],
    landlordId: 'l2',
    verified: true,
    rating: 4.8,
    reviewCount: 6,
    features: ['Piscine', 'Jardin', 'Garage', 'Gardien', 'Clim', 'Groupe électrogène'],
    featuresEn: ['Pool', 'Garden', 'Garage', 'Guard', 'AC', 'Generator'],
    coordinates: { lat: 5.3453, lng: -4.0822 },
  },
  {
    id: 'p4',
    title: 'Appartement 2 pièces — Yopougon Niangon',
    titleEn: '2-room apartment — Yopougon Niangon',
    description: 'Appartement propre et bien entretenu dans résidence sécurisée. Proche marché et transports.',
    descriptionEn: 'Clean and well-maintained apartment in a secure residence. Near market and transport.',
    price: 90000,
    city: 'Abidjan',
    neighborhood: 'Yopougon',
    rooms: 2,
    bathrooms: 1,
    area: 55,
    images: ['/property-exterior-1.png', '/property-interior-2.png'],
    landlordId: 'l2',
    verified: true,
    rating: 4.5,
    reviewCount: 18,
    features: ['Eau courante', 'Électricité', 'Sécurité', 'Parking moto'],
    featuresEn: ['Running water', 'Electricity', 'Security', 'Moto parking'],
    coordinates: { lat: 5.3621, lng: -4.0911 },
  },
  {
    id: 'p5',
    title: 'Penthouse de luxe — Le Plateau',
    titleEn: 'Luxury penthouse — Le Plateau',
    description: 'Penthouse exceptionnel au dernier étage avec vue panoramique sur la lagune. Finitions haut de gamme, domotique intégrée. Standing prestige.',
    descriptionEn: 'Exceptional penthouse on the top floor with panoramic lagoon views. High-end finishes, integrated home automation. Prestige standing.',
    price: 850000,
    city: 'Abidjan',
    neighborhood: 'Plateau',
    rooms: 4,
    bathrooms: 3,
    area: 280,
    images: ['/property-interior-1.png', '/property-interior-2.png', '/property-exterior-2.png'],
    landlordId: 'l3',
    verified: true,
    rating: 5.0,
    reviewCount: 4,
    features: ['Vue lagune', 'Domotique', 'Cave à vin', 'Terrasse', 'Conciergerie', 'Spa'],
    featuresEn: ['Lagoon view', 'Home automation', 'Wine cellar', 'Terrace', 'Concierge', 'Spa'],
    coordinates: { lat: 5.3260, lng: -4.0159 },
  },
  {
    id: 'p6',
    title: 'Bureau / Local commercial — Plateau Indénié',
    titleEn: 'Office / Commercial space — Plateau Indénié',
    description: 'Espace professionnel idéal au cœur des affaires. Open space modulable, salle de réunion, accueil sécurisé.',
    descriptionEn: 'Ideal professional space in the heart of business district. Modular open space, meeting room, secure reception.',
    price: 380000,
    city: 'Abidjan',
    neighborhood: 'Plateau',
    rooms: 3,
    bathrooms: 2,
    area: 120,
    images: ['/property-exterior-1.png', '/property-interior-1.png'],
    landlordId: 'l3',
    verified: true,
    rating: 4.6,
    reviewCount: 9,
    features: ['Open space', 'Salle de réunion', 'Internet fibre', 'Clim', 'Parking'],
    featuresEn: ['Open space', 'Meeting room', 'Fiber internet', 'AC', 'Parking'],
    coordinates: { lat: 5.3279, lng: -4.0201 },
  },
  {
    id: 'p7',
    title: 'Maison 3 pièces — Abobo Baoulé',
    titleEn: '3-room house — Abobo Baoulé',
    description: 'Maison familiale avec cour intérieure, idéale pour grande famille. Quartier animé, proche de toutes commodités.',
    descriptionEn: 'Family house with inner courtyard, ideal for large families. Lively neighborhood, near all amenities.',
    price: 75000,
    city: 'Abidjan',
    neighborhood: 'Abobo',
    rooms: 3,
    bathrooms: 1,
    area: 80,
    images: ['/property-exterior-2.png', '/property-interior-2.png'],
    landlordId: 'l4',
    verified: false,
    rating: 4.2,
    reviewCount: 22,
    features: ['Cour intérieure', 'Eau courante', 'Électricité', 'Cuisine extérieure'],
    featuresEn: ['Inner courtyard', 'Running water', 'Electricity', 'Outdoor kitchen'],
    coordinates: { lat: 5.4239, lng: -4.0094 },
  },
  {
    id: 'p8',
    title: 'Appartement 2 pièces — Adjamé Liberty',
    titleEn: '2-room apartment — Adjamé Liberty',
    description: 'Appartement central bien desservi, proche des marchés et transports. Idéal pour commerçants.',
    descriptionEn: 'Central well-served apartment, close to markets and transport. Ideal for traders.',
    price: 65000,
    city: 'Abidjan',
    neighborhood: 'Adjamé',
    rooms: 2,
    bathrooms: 1,
    area: 48,
    images: ['/property-interior-2.png', '/property-exterior-1.png'],
    landlordId: 'l4',
    verified: false,
    rating: 4.0,
    reviewCount: 31,
    features: ['Centre-ville', 'Transport', 'Marché proche', 'Électricité'],
    featuresEn: ['City center', 'Transport', 'Near market', 'Electricity'],
    coordinates: { lat: 5.3529, lng: -4.0272 },
  },
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    authorId: 't1',
    authorName: 'Fatou Diallo',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
    targetId: 'l1',
    rating: 5,
    comment: 'Propriétaire exemplaire ! Très réactif, logement impeccable. Je recommande vivement.',
    commentEn: 'Exemplary landlord! Very responsive, impeccable housing. Highly recommend.',
    date: 'Janvier 2026',
  },
  {
    id: 'r2',
    authorId: 't2',
    authorName: 'Jean-Baptiste N\'Goran',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
    targetId: 'l1',
    rating: 5,
    comment: 'LoyerSûr CI a changé ma vie ! Plus de stress pour les paiements. Merci !',
    commentEn: 'LoyerSûr CI changed my life! No more stress about payments. Thank you!',
    date: 'Décembre 2025',
  },
  {
    id: 'r3',
    authorId: 't1',
    authorName: 'Fatou Diallo',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou',
    targetId: 'l2',
    rating: 4,
    comment: 'Bonne expérience globalement. Logement propre et propriétaire disponible.',
    commentEn: 'Good overall experience. Clean property and available landlord.',
    date: 'Novembre 2025',
  },
];

export const mockPayments: Payment[] = [
  {
    id: 'pay1',
    tenantId: 't1',
    landlordId: 'l1',
    propertyId: 'p1',
    amount: 250000,
    date: '1 Mars 2026',
    method: 'orange',
    status: 'completed',
    receiptUrl: '#',
  },
  {
    id: 'pay2',
    tenantId: 't1',
    landlordId: 'l1',
    propertyId: 'p1',
    amount: 250000,
    date: '1 Février 2026',
    method: 'orange',
    status: 'completed',
    receiptUrl: '#',
  },
  {
    id: 'pay3',
    tenantId: 't1',
    landlordId: 'l1',
    propertyId: 'p1',
    amount: 250000,
    date: '1 Janvier 2026',
    method: 'mtn',
    status: 'completed',
    receiptUrl: '#',
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price) + ' FCFA';
}
