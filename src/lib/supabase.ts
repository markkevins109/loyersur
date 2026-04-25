import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are MISSING! Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// ─── Database Row Types ────────────────────────────────────────────────────────

export type UserRole = 'landlord' | 'tenant';
export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'manual_review';
export type PropertyType = 'apartment' | 'villa' | 'studio' | 'office' | 'house';
export type BookingStatus = 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
export type PaymentMethod = 'orange' | 'mtn' | 'moov' | 'wave';

// ── profiles table ────────────────────────────────────────────
export interface Profile {
  id: string;               // UUID — matches auth.users.id
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  verified: boolean;
  agent_id: string | null;  // Human-readable landlord ID e.g. "sree6389" (null for tenants)
  avatar_url: string | null;
  trust_score: number;
  review_count: number;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// ── verifications table ───────────────────────────────────────
export interface Verification {
  id: string;
  landlord_id: string;
  cni_front_url: string | null;
  cni_back_url: string | null;
  selfie_url: string | null;
  mrz_data: Record<string, unknown> | null;
  extracted_name: string | null;
  extracted_dob: string | null;
  extracted_doc_no: string | null;
  face_confidence: number | null;
  status: VerificationStatus;
  failure_reason: string | null;
  verified_at: string | null;
  created_at: string;
}

// ── properties table ──────────────────────────────────────────
export interface Property {
  id: string;
  agent_id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  price: number;              // Monthly rent in FCFA
  city: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  area: number;               // m²
  property_type: PropertyType;
  features: string[] | null;
  features_en: string[] | null;
  images: string[] | null;    // Supabase Storage public URLs
  coordinates: { lat: number; lng: number } | null;
  verified: boolean;
  available: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields (when using .select with join)
  profiles?: Profile;         // agent info
}

// ── bookings table ────────────────────────────────────────────
export interface Booking {
  id: string;
  property_id: string;
  tenant_id: string;
  agent_id: string;
  preferred_date: string;     // ISO timestamp
  rescheduled_to: string | null;
  status: BookingStatus;
  message: string | null;
  agent_note: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  properties?: Property;
  tenant?: Profile;
  agent?: Profile;
}

// ── saved_properties table ────────────────────────────────────
export interface SavedProperty {
  id: string;
  tenant_id: string;
  property_id: string;
  created_at: string;
  properties?: Property;
}

// ── reviews table ─────────────────────────────────────────────
export interface Review {
  id: string;
  author_id: string;
  target_id: string;
  property_id: string | null;
  rating: number;             // 1–5
  comment: string | null;
  created_at: string;
  author?: Profile;
}

// ─── Insert / Update helpers ───────────────────────────────────────────────────

export type ProfileInsert = Omit<Profile, 'trust_score' | 'review_count' | 'created_at' | 'updated_at'>;
export type PropertyInsert = Omit<Property, 'id' | 'verified' | 'available' | 'rating' | 'review_count' | 'created_at' | 'updated_at' | 'profiles'>;
export type BookingInsert = Omit<Booking, 'id' | 'status' | 'rescheduled_to' | 'agent_note' | 'created_at' | 'updated_at' | 'properties' | 'tenant' | 'agent'>;

// ─── Supabase Auth helpers ─────────────────────────────────────────────────────

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data as Profile | null;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/';
}

// ─── Legacy aliases (kept for backward compatibility during migration) ─────────
export interface Tenant extends Profile { role: 'tenant'; }
export interface Landlord extends Profile { role: 'landlord'; }
