import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
      .select('id, agent_id, title, title_en, neighborhood')
      .eq('id', property_id)
      .single();

    if (propError || !property) {
      return NextResponse.json(
        { error: 'Property not found.' },
        { status: 404 }
      );
    }

    // 4. Resolve the landlord's UUID from profiles.agent_id (TEXT → UUID)
    const { data: agentProfile, error: agentError } = await serviceClient
      .from('profiles')
      .select('id, email, full_name')
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

    // 6. Check for duplicate pending bookings
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

    // 7. Insert the booking
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

    // 8. Send Email Notifications
    const tenantEmail = user.email;
    const tenantName = user.user_metadata?.full_name || 'Tenant';
    const landlordEmail = agentProfile.email;
    const landlordName = agentProfile.full_name || 'Landlord';
    const propTitle = property.title || 'Property';
    const propLocation = property.neighborhood || 'Unknown Location';
    const displayDate = new Date(preferred_date).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const tenantEmailHtml = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0F172A; padding: 30px; text-align: center;">
          <h2 style="color: #fff; margin: 0;">LoyerSûr CI</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello <strong>${tenantName}</strong>,</p>
          <p style="font-size: 16px;">Your viewing request has been successfully submitted!</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #10B981; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Property: <span style="font-weight: normal;">${propTitle} (${propLocation})</span></p>
            <p style="margin: 0 0 10px 0; font-weight: bold;">Date & Time: <span style="font-weight: normal;">${displayDate}</span></p>
            <p style="margin: 0; font-weight: bold;">Landlord: <span style="font-weight: normal;">${landlordName}</span></p>
          </div>
          
          <p style="font-size: 16px;">The landlord will review your request shortly. You can check the status on your <a href="https://loyersur.ci/dashboard/tenant" style="color: #10B981;">dashboard</a>.</p>
          <br/>
          <p style="font-size: 14px; color: #888;">Thank you for using LoyerSûr CI!</p>
        </div>
      </div>
    `;

    const landlordEmailHtml = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #10B981; padding: 30px; text-align: center;">
          <h2 style="color: #fff; margin: 0;">LoyerSûr CI - New Request!</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello <strong>${landlordName}</strong>,</p>
          <p style="font-size: 16px;">You have a new viewing request for your property!</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #0F172A; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Property: <span style="font-weight: normal;">${propTitle} (${propLocation})</span></p>
            <p style="margin: 0 0 10px 0; font-weight: bold;">Requested by: <span style="font-weight: normal;">${tenantName}</span></p>
            <p style="margin: 0 0 10px 0; font-weight: bold;">Date & Time: <span style="font-weight: normal;">${displayDate}</span></p>
            ${message ? `<p style="margin: 0; font-weight: bold;">Message: <span style="font-weight: normal; font-style: italic;">"${message}"</span></p>` : ''}
          </div>
          
          <p style="font-size: 16px;">Please log in to your <a href="https://loyersur.ci/dashboard/landlord" style="color: #10B981;">dashboard</a> to accept or decline this request.</p>
          <br/>
          <p style="font-size: 14px; color: #888;">Thank you for using LoyerSûr CI!</p>
        </div>
      </div>
    `;

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'LoyerSûr CI <noreply@loyersur.ci>';

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      try {
        // Send to Tenant
        await transporter.sendMail({
          from: smtpFrom,
          to: tenantEmail!,
          subject: `Viewing Request Confirmed: ${propTitle}`,
          html: tenantEmailHtml,
        });

        // Send to Landlord
        if (landlordEmail) {
          await transporter.sendMail({
            from: smtpFrom,
            to: landlordEmail,
            subject: `New Viewing Request from ${tenantName}`,
            html: landlordEmailHtml,
          });
        }
      } catch (emailError) {
        console.error('Failed to send SMTP emails:', emailError);
      }
    } else {
      console.log('--- SMTP credentials not fully set. Mocking email send ---');
      console.log(`[Email to Tenant] To: ${tenantEmail} | Subject: Viewing Request Confirmed`);
      console.log(`[Email to Landlord] To: ${landlordEmail} | Subject: New Viewing Request`);
      console.log('------------------------------------------------------');
    }

    // 9. Return success
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
