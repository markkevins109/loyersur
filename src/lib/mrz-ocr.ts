/**
 * MRZ OCR Utility — LoyerSûr CI
 * Extracts Machine Readable Zone lines from a CNI back-of-card image
 * and provides name comparison helpers.
 */

export interface MrzOcrResult {
  success: boolean;
  lines?: string[];        // 2 or 3 lines of 30 chars
  error?: 'NOT_FOUND' | 'OCR_FAILED';
}

export interface ParsedMrzName {
  surname: string;         // e.g. "KOUAME"
  givenNames: string;      // e.g. "ADJOUMANI PASCAL"
  displayName: string;     // "Adjoumani Pascal Kouame"
}

export type NameMatchLevel = 'EXACT' | 'FUZZY' | 'MISMATCH';

export interface NameMatchResult {
  level: NameMatchLevel;
  cardName: string;        // Formatted name from card
  profileName: string;     // Name from signup
}

// ── OCR ───────────────────────────────────────────────────────────────────────

function cleanLine(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/\s/g, '')
    .replace(/[^A-Z0-9<]/g, '');
}

function normTo30(line: string): string {
  if (line.length > 30) return line.slice(0, 30);
  return line.padEnd(30, '<');
}

export async function extractMrzFromImage(
  imageFile: File,
  onProgress?: (pct: number) => void
): Promise<MrzOcrResult> {
  try {
    // Dynamic import keeps Tesseract out of SSR bundles
    const Tesseract = (await import('tesseract.js')).default;

    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });

    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
    });

    const result = await worker.recognize(imageFile);
    await worker.terminate();

    const rawLines = result.data.text.split('\n');
    const candidates = rawLines
      .map(l => cleanLine(l))
      .filter(l => l.length >= 20)   // allow slightly truncated lines (trailing < often dropped by OCR)
      .map(normTo30)
      .filter(l => /^[A-Z0-9<]{30}$/.test(l));

    // Deduplicate
    const unique = [...new Set(candidates)];

    if (unique.length >= 3) return { success: true, lines: unique.slice(0, 3) };

    return { success: false, error: 'NOT_FOUND' };
  } catch {
    return { success: false, error: 'OCR_FAILED' };
  }
}

// ── Name parsing ──────────────────────────────────────────────────────────────

/**
 * For Ivory Coast TD1 format:
 *   Line 1: IDCIV<DOCNUM...
 *   Line 2: YYMMDDCFYYMMDDCNAT...
 *   Line 3: SURNAME<<GIVENNAMES<...
 * Name is in line index 2.
 */
export function parseMrzName(mrzLines: string[]): ParsedMrzName | null {
  let nameLine = '';

  // 1. Smartly identify the exact line containing the name.
  // In standard MRZ, the name line ALWAYS contains '<<' separating the surname and given names,
  // and it is flanked by letters (e.g., "ALLA<<AYA"). This avoids confusing it with line 1
  // which might have trailing '<<<<' but no letters after them.
  for (const line of mrzLines) {
    if (/[A-Z]<<[A-Z]/.test(line)) {
      nameLine = line;
      break;
    }
  }

  // Fallback: If not perfectly matching the regex, just find any line with '<<' that doesn't start with ID/numbers
  if (!nameLine) {
    nameLine = mrzLines.find(l => l.includes('<<') && !l.startsWith('ID') && !/^[0-9]/.test(l)) || '';
  }

  if (!nameLine) return null;

  // Handle TD2/TD3 passports where the name line starts with P<CIV or I<CIV
  if (/^[A-Z]{1,2}</.test(nameLine) && nameLine.includes('<<')) {
     nameLine = nameLine.slice(5); // Strip document code and country code
  }

  const [surnameRaw = '', givenRaw = ''] = nameLine.split('<<');
  const surname = surnameRaw.replace(/</g, ' ').trim();
  const givenNames = givenRaw.replace(/</g, ' ').trim();

  if (!surname) return null;

  const displayName = [givenNames, surname]
    .filter(Boolean)
    .map(p => p.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' '))
    .join(' ');

  return { surname, givenNames, displayName };
}

// ── Name comparison ───────────────────────────────────────────────────────────

function normalize(name: string): string {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^A-Z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function compareNames(
  profileFullName: string,
  mrzSurname: string,
  mrzGivenNames: string
): NameMatchResult {
  const cardName = [mrzGivenNames, mrzSurname].filter(Boolean).join(' ');
  const normProfile = normalize(profileFullName);
  const normCard1 = normalize(`${mrzGivenNames} ${mrzSurname}`);
  const normCard2 = normalize(`${mrzSurname} ${mrzGivenNames}`);

  // Exact match (either order)
  if (normProfile === normCard1 || normProfile === normCard2) {
    return { level: 'EXACT', cardName, profileName: profileFullName };
  }

  // Fuzzy: every word in profile name appears in card name
  const profileWords = normProfile.split(' ').filter(Boolean);
  const cardWords = normCard1.split(' ').filter(Boolean);
  const allMatch = profileWords.every(w => cardWords.includes(w));
  const halfMatch = profileWords.filter(w => cardWords.includes(w)).length >= Math.ceil(profileWords.length / 2);

  if (allMatch || halfMatch) {
    return { level: 'FUZZY', cardName, profileName: profileFullName };
  }

  return { level: 'MISMATCH', cardName, profileName: profileFullName };
}
