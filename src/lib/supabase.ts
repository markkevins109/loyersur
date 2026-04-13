import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
