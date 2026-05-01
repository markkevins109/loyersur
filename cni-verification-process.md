# CNI Verification Process — LoyerSûr CI

> This document explains exactly how the ID card (Carte Nationale d'Identité) verification works
> for landlords registering on LoyerSûr.

---

## Overview

Verification is **required for landlords only** and happens immediately after signup, before they
can access their dashboard. It is entirely self-serve — there is no human reviewer involved in the
happy path.

**Entry point:** `/auth/verify-cni`  
**API endpoint:** `POST /api/verify-cni`  
**Key files:**
- `src/app/auth/verify-cni/CniVerificationForm.tsx` — UI and phase state machine
- `src/app/api/verify-cni/route.ts` — Server-side MRZ parsing and validation

---

## Step-by-Step Flow (Phase State Machine)

The UI is driven by a `phase` state variable that moves the user through these screens:

```
consent → upload → quality → mrz-input → checking → PASS ✅
                                                   ↘ FAIL (retry) → mrz-input
                                                   ↘ FAIL FINAL (2 failures) 🔒
                                                   ↘ RETRY (bad image quality) → upload
```

### Phase 1: `consent`
- Displays a consent/privacy notice explaining that the user's ID photos are being collected.
- Shows three bullet points: upload front, upload back, privacy guarantee.
- User must click **Accept and Continue** to proceed.

---

### Phase 2: `upload`
- Two upload boxes shown side-by-side: **Front** of CNI and **Back** of CNI.
- Both use `<input type="file" accept="image/*" capture="environment">` — on mobile this opens the camera directly.
- When a file is selected, `loadImageDimensions()` reads the natural pixel dimensions using a hidden `<img>` element.
- The image preview is shown with its resolution (`width × height px`).
- The **Continue** button is disabled until both images are selected.

---

### Phase 3: `quality` (client-side check)
- Triggered when the user clicks **Continue** after uploading.
- `checkImageQuality()` validates:
  - Front image: **≥ 600px wide** and **≥ 400px tall**
  - Back image: **≥ 600px wide** and **≥ 400px tall**
- If either image fails → `retry` phase (user must re-upload).
- If both pass → `mrz-input` phase.

> **Note:** This is a pixel-dimension check only. There is no blur detection or lighting check.

---

### Phase 4: `mrz-input`
- The back of the CNI is displayed as a reference image.
- The user **manually types the 3 MRZ lines** from the back of their ID card.
- Each input field:
  - Accepts only uppercase `A–Z`, digits `0–9`, and `<` (filler character)
  - Has a live counter showing `X/30` characters
  - Turns green when exactly 30 characters are entered
- All 3 lines must be **exactly 30 characters** before submission is allowed.
- Clicking **Verify** triggers `submitVerification()`.

> **What is MRZ?** The Machine Readable Zone is the two or three rows of machine-readable text
> at the bottom of national ID cards, formatted per the ICAO 9303 international standard.

---

### Phase 5: `checking`
- A spinner is shown while the API call runs.
- The frontend sends:

```json
POST /api/verify-cni
{
  "mrzLines": ["line1", "line2", "line3"],
  "skipOcrCrossCheck": true
}
```

> `skipOcrCrossCheck: true` is always sent — the OCR cross-check feature (comparing MRZ name
> against front-of-card OCR) is scaffolded in the API types but **not currently active**.

---

## API Verification Logic (`/api/verify-cni`)

### Step A: Parse with Standard Library
The 3 MRZ lines are passed to the **`mrz` npm package** (`parse(mrzLines)`), which implements full ICAO 9303 parsing for TD1/TD2/TD3 card formats.

### Step B: Ivory Coast Special Case
If `CIV` appears in either line 1 or line 2, the API switches to a **manual Ivory Coast-specific validation path**:

#### 1. Date of Birth Checksum
```
Line 2: YYMMDDCEXPIRYDCIV...
         ^^^^^^  6 chars DOB
               ^ check digit
```
ICAO 9303 checksum algorithm:
- `0–9` → face value, `A–Z` → 10–35, `<` → 0
- Weights cycle: `7, 3, 1, 7, 3, 1, ...`
- `sum mod 10` must equal the check digit

If this fails → **FAIL** (`DOB_CHECKSUM`)

#### 2. Expiry Date Checksum
Same checksum algorithm applied to the 6-char expiry date field (positions 8–14 of line 2).

If this fails → **FAIL** (`EXP_CHECKSUM`)

#### 3. Card Number Format Check
Card number extracted from line 1 positions 5–14, `<` fillers stripped.
Must match pattern `CI\d+` (e.g. `CI0004420`).

If this fails → **FAIL** (`CARD_FORMAT`)

#### 4. Expiry Date Check
Expiry `YYMMDD` converted to a `Date` object:
- Year `≤ 30` → `20XX`, Year `> 30` → `19XX`

If today is past the expiry → **FAIL** (`EXPIRED`)

#### 5. All checks pass → **PASS**
```json
{
  "status": "PASS",
  "verificationResult": {
    "result": "PASS",
    "timestamp": "2026-05-01T...",
    "hashedCardNumber": "<sha256 of card number>"
  }
}
```
The card number is **SHA-256 hashed** — the raw number is never stored.

### Step C: Fallback for Non-CIV Cards
If `CIV` is not detected and the `mrz` library parsed successfully (`result.valid === true`), the card is accepted as PASS. Otherwise → **FAIL** (`MRZ_INVALID`).

---

## Outcomes

| API Response | UI Phase | Behaviour |
|---|---|---|
| `PASS` | `pass` | Green checkmark shown. After 2.5s → redirected to `/dashboard/landlord`. |
| `FAIL` (attempt 1) | `fail` | Error shown. User can retry (images + MRZ reset). |
| `FAIL` (attempt 2) | `fail-final` | Locked out. No more retries. |
| `RETRY` | `retry` | Image quality warning. User must re-upload photos. |

---

## What Is NOT Being Verified

| Check | Status |
|---|---|
| Face match (selfie vs ID photo) | ❌ Not implemented |
| Front of card OCR name cross-check | ❌ Scaffolded but always skipped |
| Government database lookup | ❌ Not implemented |
| Images uploaded to Supabase Storage | ❌ Images stay in browser memory only |
| `profiles.verified` set to `true` in DB | ❌ **Missing — critical bug** |

---

## Critical Bug: `verified` is Never Written to the Database

After a successful verification, the flow is:

1. API returns `{ status: 'PASS' }`
2. UI sets `phase = 'pass'`
3. After 2.5s → redirect to `/dashboard/landlord`

**Nowhere is `profiles.verified` updated to `true` in Supabase.** This is why a landlord who completes verification is still treated as unverified on next login — `LoginForm` reads `profile.verified` and redirects them back to `/auth/verify-cni` again.

### Fix: Add this inside `submitVerification()` after receiving PASS

```typescript
// In CniVerificationForm.tsx, after:  if (data.status === 'PASS') {
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  await supabase
    .from('profiles')
    .update({ verified: true })
    .eq('id', user.id);
}
```
