import { NextRequest, NextResponse } from 'next/server';
import { generateOtp } from '@/lib/otp-store';
import { sendOtpEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string = (body.email ?? '').trim().toLowerCase();
    const lang: 'fr' | 'en' = body.lang === 'en' ? 'en' : 'fr';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    const otp = generateOtp(email);
    await sendOtpEmail(email, otp, lang);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[send-otp] error:', err);
    return NextResponse.json(
      { error: 'send_failed', detail: String(err) },
      { status: 500 }
    );
  }
}
