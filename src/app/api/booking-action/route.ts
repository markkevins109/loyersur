import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBookingConfirmedEmail, sendBookingCancelledEmail } from '@/lib/mailer';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      action,          // 'confirmed' | 'cancelled'
      declineReason,   // required when action === 'cancelled'
    } = body;

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    if (action === 'cancelled' && !declineReason?.trim()) {
      return NextResponse.json({ error: 'decline_reason_required' }, { status: 400 });
    }

    // ── 1. Fetch booking + tenant + property + agent details ──────
    const { data: booking, error: fetchErr } = await adminSupabase
      .from('bookings')
      .select(`
        id, preferred_date, rescheduled_to, status,
        tenant:profiles!tenant_id (full_name, email, phone),
        agent:profiles!agent_id (full_name, phone),
        properties (title, title_en, neighborhood)
      `)
      .eq('id', bookingId)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'booking_not_found' }, { status: 404 });
    }

    // ── 2. Update booking status (and save decline reason in agent_note) ──
    const updatePayload: Record<string, unknown> = { status: action };
    if (action === 'cancelled') {
      updatePayload.agent_note = declineReason.trim();
    }

    const { error: updateErr } = await adminSupabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', bookingId);

    if (updateErr) {
      console.error('[booking-action] update error:', updateErr.message);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // ── 3. Send email to tenant ───────────────────────────────────
    // Supabase types joined rows as arrays; cast through unknown since these are single-object FK joins
    const tenant = booking.tenant as unknown as { full_name: string; email: string; phone?: string } | null;
    const agent  = booking.agent  as unknown as { full_name: string; phone?: string } | null;
    const prop   = booking.properties as unknown as { title: string; title_en?: string; neighborhood: string } | null;


    if (tenant?.email && prop) {
      const rawDate = booking.rescheduled_to ?? booking.preferred_date;
      const dateObj = new Date(rawDate);
      const visitDate = dateObj.toLocaleDateString('fr-CI', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
      const visitTime = dateObj.toLocaleTimeString('fr-CI', {
        hour: '2-digit', minute: '2-digit',
      });

      if (action === 'confirmed') {
        await sendBookingConfirmedEmail({
          to: tenant.email,
          tenantName: tenant.full_name,
          propertyTitle: prop.title,
          neighborhood: prop.neighborhood,
          visitDate,
          visitTime,
          agentName: agent?.full_name ?? 'Le propriétaire',
          agentPhone: agent?.phone ?? null,
        });
      } else {
        await sendBookingCancelledEmail({
          to: tenant.email,
          tenantName: tenant.full_name,
          propertyTitle: prop.title,
          neighborhood: prop.neighborhood,
          visitDate,
          agentName: agent?.full_name ?? 'Le propriétaire',
          reason: declineReason.trim(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[booking-action] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
