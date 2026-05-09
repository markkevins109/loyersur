import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service-role client — bypasses ALL RLS policies
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, full_name, email, phone, role, agent_id, verified } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const isVerified = verified === true;

    // ── Step 1: Check if profile already exists ──────────────────
    const { data: existing, error: fetchError } = await adminSupabase
      .from('profiles')
      .select('id, verified, agent_id, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[finalize-profile] fetch error:', fetchError.message);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existing) {
      // ── Step 2a: Profile exists → UPDATE it ──────────────────────
      const updatePayload: Record<string, unknown> = {
        full_name: full_name ?? existing.full_name ?? 'User',
        email: email ?? '',
        phone: phone ?? null,
        role,
        verified: isVerified,
      };

      // Only overwrite agent_id if a new one is provided
      // (don't clear an existing agent_id)
      if (agent_id) {
        updatePayload.agent_id = agent_id;
      }

      console.log('[finalize-profile] Updating profile:', userId, '→ verified:', isVerified, 'role:', role);

      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId);

      if (updateError) {
        console.error('[finalize-profile] update error:', updateError.message, updateError.details);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      console.log('[finalize-profile] ✅ Profile updated successfully');
    } else {
      // ── Step 2b: Profile missing → INSERT it ─────────────────────
      const insertPayload: Record<string, unknown> = {
        id: userId,
        full_name: full_name ?? 'User',
        email: email ?? '',
        phone: phone ?? null,
        role,
        verified: isVerified,
      };

      if (agent_id) {
        insertPayload.agent_id = agent_id;
      }

      console.log('[finalize-profile] Inserting new profile:', userId, 'role:', role, 'verified:', isVerified);

      const { error: insertError } = await adminSupabase
        .from('profiles')
        .insert(insertPayload);

      if (insertError) {
        console.error('[finalize-profile] insert error:', insertError.message, insertError.details);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      console.log('[finalize-profile] ✅ Profile inserted successfully');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[finalize-profile] unexpected error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
