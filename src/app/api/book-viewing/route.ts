import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Server-side Supabase client with service role key for DB writes
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  }

  return createClient(url, serviceKey);
}

// Auth-aware client using the user's token from the request
function getAnonClientWithAuth(authHeader: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase env vars');
  }

  return createClient(url, anonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate the caller
    const authHeader = req.headers.get('authorization');
    const anonClient = getAnonClientWithAuth(authHeader);

    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in first.' },
        { status: 401 }
      );
    }

    // 2. Parse and validate the request body
    const body = await req.json();
    const { property_id, preferred_date, message } = body as {
      property_id?: string;
      preferred_date?: string;
      message?: string;
    };

    if (!property_id || !preferred_date) {
      return NextResponse.json(
        { error: 'property_id and preferred_date are required.' },
        { status: 400 }
      );
    }

    // Validate the date is in the future
    const bookingDate = new Date(preferred_date);
    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        { error: 'preferred_date must be a valid ISO date string.' },
        { status: 400 }
      );
    }
    if (bookingDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book a viewing in the past.' },
        { status: 400 }
      );
    }

    // 3. Fetch the property to get the agent_id (TEXT, e.g. "sree0327")
    const serviceClient = getServiceClient();

    const { data: property, error: propError } = await serviceClient
      .from('properties')
      .select('id, agent_id')
      .eq('id', property_id)
      .single();

    if (propError || !property) {
      return NextResponse.json(
        { error: 'Property not found.' },
        { status: 404 }
      );
    }

    // 4. Resolve the landlord's UUID from profiles.agent_id (TEXT → UUID)
    //    properties.agent_id is TEXT (e.g. "sree0327")
    //    bookings.agent_id is UUID (FK to profiles.id)
    //    So we must look up the profile to get the UUID
    const { data: agentProfile, error: agentError } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('agent_id', property.agent_id)
      .single();

    if (agentError || !agentProfile) {
      return NextResponse.json(
        { error: 'Property agent not found.' },
        { status: 404 }
      );
    }

    const agentUuid: string = agentProfile.id;

    // 5. Ensure the tenant is not booking their own property
    if (agentUuid === user.id) {
      return NextResponse.json(
        { error: 'You cannot book a viewing for your own property.' },
        { status: 400 }
      );
    }

    // 6. Check for duplicate pending bookings (same tenant + property + date)
    const { data: existingBooking } = await serviceClient
      .from('bookings')
      .select('id')
      .eq('property_id', property_id)
      .eq('tenant_id', user.id)
      .eq('preferred_date', preferred_date)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle();

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for this property at this time.' },
        { status: 409 }
      );
    }

    // 7. Insert the booking (agent_id must be UUID, not the TEXT code)
    const { data: booking, error: insertError } = await serviceClient
      .from('bookings')
      .insert({
        property_id,
        tenant_id: user.id,
        agent_id: agentUuid,
        preferred_date,
        message: message?.trim() || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError || !booking) {
      console.error('Booking insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create booking. Please try again.' },
        { status: 500 }
      );
    }

    // 8. Return success (email notification will be added later)
    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    });
  } catch (err) {
    console.error('book-viewing error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
