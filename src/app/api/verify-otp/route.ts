import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otp-store';

const REASON_MESSAGES: Record<string, { fr: string; en: string }> = {
  no_otp: {
    fr: 'Aucun code trouvé pour cet e-mail. Veuillez demander un nouveau code.',
    en: 'No code found for this email. Please request a new code.',
  },
  expired: {
    fr: 'Ce code a expiré. Veuillez demander un nouveau code.',
    en: 'This code has expired. Please request a new code.',
  },
  too_many_attempts: {
    fr: 'Trop de tentatives. Veuillez demander un nouveau code.',
    en: 'Too many attempts. Please request a new code.',
  },
  invalid: {
    fr: 'Code incorrect. Veuillez réessayer.',
    en: 'Incorrect code. Please try again.',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string = (body.email ?? '').trim().toLowerCase();
    const token: string = (body.token ?? '').trim();
    const lang: 'fr' | 'en' = body.lang === 'en' ? 'en' : 'fr';

    if (!email || !token) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const result = verifyOtp(email, token);

    if (!result.valid) {
      const reason = result.reason ?? 'invalid';
      const messages = REASON_MESSAGES[reason] ?? REASON_MESSAGES.invalid;
      return NextResponse.json(
        { error: reason, message: messages[lang] },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[verify-otp] error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
