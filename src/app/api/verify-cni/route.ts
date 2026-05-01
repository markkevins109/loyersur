import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'mrz';
import crypto from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────
interface VerifyRequest {
  mrzLines: [string, string, string];
  frontOcrName?: string;
  frontOcrDob?: string;
  skipOcrCrossCheck?: boolean;
}

interface VerifyResponse {
  status: 'PASS' | 'FAIL' | 'RETRY';
  errorCode?: string;
  message?: string;
  verificationResult?: {
    result: 'PASS';
    timestamp: string;
    hashedCardNumber: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mrzDateToDate(yymmdd: string): Date | null {
  if (!yymmdd || yymmdd.length !== 6) return null;
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = parseInt(yymmdd.slice(2, 4), 10);
  const dd = parseInt(yymmdd.slice(4, 6), 10);
  if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return null;
  const fullYear = yy <= 30 ? 2000 + yy : 1900 + yy;
  return new Date(Date.UTC(fullYear, mm - 1, dd));
}

function hashCardNumber(cn: string): string {
  return crypto.createHash('sha256').update(cn).digest('hex');
}

/**
 * Standard ICAO 9303 Checksum
 * Weights: 7, 3, 1
 */
function validateMrzChecksum(str: string, checkDigit: number): boolean {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    let val = 0;
    if (char >= '0' && char <= '9') val = parseInt(char, 10);
    else if (char >= 'A' && char <= 'Z') val = char.charCodeAt(0) - 55;
    else if (char === '<') val = 0;
    sum += val * weights[i % 3];
  }
  return (sum % 10) === checkDigit;
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse<VerifyResponse>> {
  let body: VerifyRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: 'FAIL', errorCode: 'INVALID_PAYLOAD', message: 'Payload invalide.' }, { status: 400 });
  }

  const { mrzLines, frontOcrName, frontOcrDob, skipOcrCrossCheck } = body;
  if (!mrzLines || mrzLines.length !== 3) {
    return NextResponse.json({ status: 'FAIL', errorCode: 'MISSING_MRZ', message: 'Code MRZ manquant.' }, { status: 400 });
  }

  // ── 1. Parse using standard library ───────────────────────────────────────
  let result: any;
  try {
    result = parse(mrzLines);
  } catch (err: any) {
    console.warn('[CNI Verify] Parse error:', err.message);
    // Continue to manual check if it's potentially Ivory Coast
  }

  const isCIV = mrzLines[0].includes('CIV') || mrzLines[1].includes('CIV');

  // ── 2. Manual Integrity Check for Ivory Coast (Special Case) ──────────────
  if (isCIV) {
    // Normalize lines 1 and 2 (Document Number and Dates) because they shouldn't contain letters O or N where numbers are expected.
    // This fixes common OCR mistakes like reading '0' as 'O', 'N', or 'D', and 'I' as '1'.
    let line1 = mrzLines[0].replace(/O/g, '0').replace(/N/g, '0'); 
    let line2 = mrzLines[1].replace(/O/g, '0');
    
    // Ensure the CIV country code and CI prefix wasn't mangled by the number normalization
    line1 = line1.replace(/^ID0IV0I/, 'IDCIVCI').replace(/^IDCIV0I/, 'IDCIVCI').replace(/^IDCIVC1/, 'IDCIVCI');
    
    // Check DOB Checksum
    const dob = line2.slice(0, 6);
    const dobCheck = parseInt(line2.charAt(6), 10);
    if (!validateMrzChecksum(dob, dobCheck)) {
       return NextResponse.json({ status: 'FAIL', errorCode: 'DOB_CHECKSUM', message: 'Code MRZ invalide (Date de naissance).' });
    }

    // Check Expiry Checksum
    const exp = line2.slice(8, 14);
    const expCheck = parseInt(line2.charAt(14), 10);
    if (!validateMrzChecksum(exp, expCheck)) {
       return NextResponse.json({ status: 'FAIL', errorCode: 'EXP_CHECKSUM', message: 'Code MRZ invalide (Date d\'expiration).' });
    }

    // Card Number extraction (CIV format allows split over field)
    // Most Ivory Coast CNIs follow: Docs 5-13 + Optional bits
    const rawDocPart = line1.slice(5, 14).replace(/</g, '');
    const optPart = line1.slice(15, 20).replace(/</g, '');
    let cardNumber = rawDocPart + optPart.slice(0, 2); // CI + digits
    
    // Sometimes the OCR reads CI as C1
    cardNumber = cardNumber.replace(/^C1/, 'CI');

    if (!/^CI\d+/.test(cardNumber)) {
       return NextResponse.json({ status: 'FAIL', errorCode: 'CARD_FORMAT', message: `Numéro de carte non reconnu (${cardNumber}).` });
    }

    // Expiry verification
    const expDate = mrzDateToDate(exp);
    if (!expDate || expDate < new Date()) {
       return NextResponse.json({ status: 'FAIL', errorCode: 'EXPIRED', message: 'Votre pièce d\'identité est expirée.' });
    }

    // All manual checks passed for CIV
    return NextResponse.json({ 
      status: 'PASS', 
      verificationResult: {
        result: 'PASS',
        timestamp: new Date().toISOString(),
        hashedCardNumber: hashCardNumber(cardNumber),
        cardNumber: cardNumber,
        dob: dob,
        expiry: expDate.toISOString().split('T')[0] // return YYYY-MM-DD
      }
    });
  }

  // ── 3. Fallback to standard result if not CIV or if library was fine ───────
  if (result && result.valid) {
    const cardNumber = (result.fields.documentNumber as string).replace(/</g, '');
    const dobStr = result.fields.birthDate as string;
    const expStr = result.fields.expirationDate as string;

    return NextResponse.json({ 
      status: 'PASS',  
      verificationResult: {
        result: 'PASS',
        timestamp: new Date().toISOString(),
        hashedCardNumber: hashCardNumber(cardNumber),
        cardNumber: cardNumber,
        dob: dobStr,
        expiry: expStr
      }
    });
  }

  return NextResponse.json({ 
    status: 'FAIL', 
    errorCode: 'MRZ_INVALID', 
    message: 'Le code MRZ est invalide ou ne correspond pas aux normes ivoiriennes.' 
  });
}
