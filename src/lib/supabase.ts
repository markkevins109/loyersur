import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// During build time on Vercel, these might be missing if not configured in the dashboard.
// We use a fallback to prevent the build worker from crashing.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url-for-build.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// ─── TypeScript types matching our DB schema ────────────────────────────────

export interface Tenant {
  id: string;               // UUID — matches auth.users.id
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Landlord {
  id: string;               // UUID — matches auth.users.id
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}
