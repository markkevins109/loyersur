import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: Number(process.env.SMTP_PORT ?? 465) === 465,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

// ─── Shared HTML shell ────────────────────────────────────────────────────────
function emailShell(headerGradient: string, headerIcon: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:${headerGradient};padding:28px 40px;text-align:center;">
            <div style="font-size:34px;margin-bottom:8px;">${headerIcon}</div>
            <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">LoyerSûr CI</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px;">La location sécurisée en Côte d'Ivoire</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 28px;">${body}</td>
        </tr>
        <tr>
          <td style="background:#F8FAFC;padding:18px 40px;border-top:1px solid #E2E8F0;text-align:center;">
            <p style="margin:0;font-size:11px;color:#CBD5E1;">© ${new Date().getFullYear()} LoyerSûr CI · Abidjan, Côte d'Ivoire</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── OTP Email ────────────────────────────────────────────────────────────────
export async function sendOtpEmail(to: string, otp: string, lang: 'fr' | 'en' = 'fr') {
  const isFr = lang === 'fr';
  const subject = isFr
    ? `🔐 Votre code de vérification LoyerSûr : ${otp}`
    : `🔐 Your LoyerSûr verification code: ${otp}`;

  const body = `
    <p style="margin:0 0 8px;font-size:15px;color:#64748B;">${isFr ? 'Bonjour,' : 'Hello,'}</p>
    <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.6;">
      ${isFr
        ? 'Utilisez le code ci-dessous pour vérifier votre adresse e-mail et activer votre compte LoyerSûr.'
        : 'Use the code below to verify your email address and activate your LoyerSûr account.'}
    </p>
    <div style="background:#F1F5F9;border:2px dashed #CBD5E1;border-radius:14px;padding:28px;text-align:center;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#94A3B8;margin-bottom:10px;">
        ${isFr ? 'Code de vérification' : 'Verification Code'}
      </div>
      <div style="font-size:42px;font-weight:900;letter-spacing:0.3em;color:#0F172A;font-family:monospace;">${otp}</div>
      <div style="font-size:12px;color:#94A3B8;margin-top:10px;">${isFr ? 'Valide pendant 10 minutes' : 'Valid for 10 minutes'}</div>
    </div>
    <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;">
      ${isFr
        ? "Si vous n'avez pas créé de compte LoyerSûr, ignorez cet e-mail."
        : 'If you did not create a LoyerSûr account, please ignore this email.'}
    </p>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject,
    html: emailShell('linear-gradient(135deg,#0F172A 0%,#10B981 100%)', '🔐', body),
  });
}

// ─── Booking Confirmed Email ──────────────────────────────────────────────────
export async function sendBookingConfirmedEmail(params: {
  to: string;
  tenantName: string;
  propertyTitle: string;
  neighborhood: string;
  visitDate: string;
  visitTime: string;
  agentName: string;
  agentPhone?: string | null;
}) {
  const { to, tenantName, propertyTitle, neighborhood, visitDate, visitTime, agentName, agentPhone } = params;

  const subject = `✅ Visite confirmée — ${propertyTitle}`;

  const body = `
    <p style="margin:0 0 6px;font-size:15px;color:#64748B;">Bonjour <strong style="color:#0F172A;">${tenantName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Bonne nouvelle ! Votre demande de visite a été <strong style="color:#166534;">confirmée</strong> par le propriétaire.
    </p>

    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1.5px solid #86efac;border-radius:14px;padding:24px;margin-bottom:24px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">🎉</div>
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#166534;margin-bottom:6px;">Visite Confirmée</div>
      <div style="font-size:26px;font-weight:900;color:#0F172A;margin-bottom:2px;">${visitDate}</div>
      <div style="font-size:16px;font-weight:600;color:#374151;">à ${visitTime}</div>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:12px 16px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94A3B8;margin-bottom:4px;">Bien à visiter</div>
          <div style="font-size:15px;font-weight:700;color:#0F172A;">${propertyTitle}</div>
          <div style="font-size:13px;color:#64748B;">📍 ${neighborhood}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94A3B8;margin-bottom:4px;">Propriétaire</div>
          <div style="font-size:14px;font-weight:600;color:#0F172A;">${agentName}</div>
          ${agentPhone ? `<div style="font-size:13px;color:#64748B;">📞 ${agentPhone}</div>` : ''}
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;">
      Pensez à être ponctuel(le). En cas d'empêchement, contactez directement le propriétaire.
    </p>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject,
    html: emailShell('linear-gradient(135deg,#166534 0%,#16a34a 100%)', '✅', body),
  });
}

// ─── Booking Cancelled Email ──────────────────────────────────────────────────
export async function sendBookingCancelledEmail(params: {
  to: string;
  tenantName: string;
  propertyTitle: string;
  neighborhood: string;
  visitDate: string;
  agentName: string;
  reason: string;
}) {
  const { to, tenantName, propertyTitle, neighborhood, visitDate, agentName, reason } = params;

  const subject = `❌ Visite annulée — ${propertyTitle}`;

  const body = `
    <p style="margin:0 0 6px;font-size:15px;color:#64748B;">Bonjour <strong style="color:#0F172A;">${tenantName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Nous sommes désolés de vous informer que votre demande de visite a été <strong style="color:#b91c1c;">refusée</strong> par le propriétaire.
    </p>

    <div style="background:#fff5f5;border:1.5px solid #fca5a5;border-radius:14px;padding:18px 20px;margin-bottom:20px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#b91c1c;margin-bottom:6px;">Bien concerné</div>
      <div style="font-size:16px;font-weight:800;color:#0F172A;margin-bottom:2px;">${propertyTitle}</div>
      <div style="font-size:13px;color:#64748B;">📍 ${neighborhood} &nbsp;·&nbsp; 📅 Visite prévue le ${visitDate}</div>
    </div>

    <div style="background:#FFF7ED;border-left:4px solid #f97316;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:24px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#c2410c;margin-bottom:6px;">
        Motif communiqué par ${agentName}
      </div>
      <div style="font-size:14px;color:#374151;line-height:1.6;font-style:italic;">"${reason}"</div>
    </div>

    <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;">
      Ne vous découragez pas — d'autres biens sont disponibles sur la plateforme.
    </p>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject,
    html: emailShell('linear-gradient(135deg,#7f1d1d 0%,#b91c1c 100%)', '❌', body),
  });
}
