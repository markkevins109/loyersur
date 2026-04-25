# CLAUDE.md — LoyerSûr CI Project Guide

> **Project:** LoyerSûr CI — A verified real-estate rental marketplace for Côte d'Ivoire, West Africa.  
> **Goal:** Connect landlords (agents) and buyers/tenants directly, with mandatory government ID verification for agents, real property listings, calendar-based viewing bookings, and email notification workflows.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Current Architecture](#3-current-architecture)
   - 3.1 [Pages & Routes](#31-pages--routes)
   - 3.2 [Components](#32-components)
   - 3.3 [Data Layer](#33-data-layer)
   - 3.4 [Internationalisation (i18n)](#34-internationalisation-i18n)
   - 3.5 [Backend / API Routes](#35-backend--api-routes)
   - 3.6 [Database Types (Supabase)](#36-database-types-supabase)
   - 3.7 [Design System & Styling](#37-design-system--styling)
4. [What Is Working Today](#4-what-is-working-today)
5. [What Is Mocked / Incomplete](#5-what-is-mocked--incomplete)
6. [Product Vision](#6-product-vision)
7. [Next Steps — Full Roadmap](#7-next-steps--full-roadmap)
   - Phase 1: Database Schema & Supabase Setup
   - Phase 2: Agent (Landlord) Authentication & ID Verification
   - Phase 3: Agent Property Upload → Real Listings
   - Phase 4: Buyer Authentication & Listings View
   - Phase 5: Viewing Booking + Calendar + Email Flow
   - Phase 6: Agent Booking Management + Email Replies
   - Phase 7: Polish, Notifications & Production
8. [Environment Variables](#8-environment-variables)
9. [Running the Project](#9-running-the-project)
10. [Coding Conventions](#10-coding-conventions)

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | **Next.js** (App Router) | 16.1.6 |
| Language | **TypeScript** | ^5 |
| UI Library | **React** | 19.2.3 |
| Styling | **Tailwind CSS v4** | ^4 |
| Animation | **Framer Motion** | ^12 |
| Icons | **Lucide React** | ^0.577 |
| Backend / DB | **Supabase** (PostgreSQL + Auth + Storage) | ^2.103 |
| ID Parsing | **mrz** (Machine Readable Zone parser) | ^5.0.2 |
| Fonts | **Outfit** (display) + **Inter** (body) via Google Fonts |
| Deployment | Vercel (inferred from next.config.ts) |

### Key `package.json` scripts
```bash
npm run dev     # Start dev server (Next.js)
npm run build   # Production build
npm run lint    # ESLint
```

---

## 2. Project Structure

```
loyersur/
├── public/
│   ├── hero-couple.png
│   ├── property-exterior-1.png
│   ├── property-exterior-2.png
│   ├── property-interior-1.png
│   └── property-interior-2.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout (fonts, metadata)
│   │   ├── page.tsx                        # Root page → renders HomePage
│   │   ├── globals.css                     # Global styles + Tailwind theme
│   │   ├── HomePage.tsx                    # Landing page component
│   │   │
│   │   ├── auth/
│   │   │   ├── AuthLayout.tsx              # Shared 2-panel auth wrapper (left brand, right form)
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── LoginForm.tsx           # Login form UI
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── verify-cni/
│   │   │       ├── page.tsx
│   │   │       └── CniVerificationForm.tsx # ID verification flow (upload + MRZ)
│   │   │
│   │   ├── listings/
│   │   │   ├── page.tsx                    # → renders ListingsPage
│   │   │   ├── ListingsPage.tsx            # Search + filter + grid of property cards
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── PropertyDetailPage.tsx  # Full property detail + booking sidebar
│   │   │
│   │   ├── dashboard/
│   │   │   ├── landlord/
│   │   │   │   └── page.tsx               # Landlord dashboard (listings, requests, payments, add)
│   │   │   └── tenant/
│   │   │       └── page.tsx               # Tenant dashboard (saved, payments, receipts, messages)
│   │   │
│   │   ├── profile/                        # (empty — not yet built)
│   │   │
│   │   └── api/
│   │       └── verify-cni/
│   │           └── route.ts               # API: MRZ parsing + identity verification
│   │
│   ├── components/
│   │   ├── Navbar.tsx                      # Fixed top nav with lang toggle, login/signup links
│   │   ├── Footer.tsx                      # Site footer
│   │   ├── PropertyCard.tsx                # Reusable card used in listings grid
│   │   └── MobileMoneyModal.tsx            # Payment modal (Orange/MTN/Moov/Wave)
│   │
│   └── lib/
│       ├── supabase.ts                     # Supabase client + TypeScript DB interfaces
│       ├── mockData.ts                     # All mock data: properties, landlords, tenants, payments, reviews
│       └── lang.tsx                        # i18n hook (useLang) with FR/EN translation strings
│
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── package.json
```

---

## 3. Current Architecture

### 3.1 Pages & Routes

| Route | File | Status |
|---|---|---|
| `/` | `HomePage.tsx` | ✅ Built — hero, features, how-it-works, mock listings preview |
| `/listings` | `ListingsPage.tsx` | ✅ Built — search + filters; uses **mock data** |
| `/listings/[id]` | `PropertyDetailPage.tsx` | ✅ Built — gallery, details, landlord card, mock booking button |
| `/auth/login` | `LoginForm.tsx` | ✅ UI built; no real Supabase auth yet |
| `/auth/signup` | `page.tsx` | 🔶 Needs actual signup form component |
| `/auth/forgot-password` | `page.tsx` | 🔶 Stub only |
| `/auth/verify-cni` | `CniVerificationForm.tsx` | ✅ UI built — upload front/back; MRZ input; calls `/api/verify-cni`; redirects to landlord dashboard on pass |
| `/dashboard/landlord` | `page.tsx` | ✅ UI built — hardcoded to `l1` (Kouamé); all data is mock |
| `/dashboard/tenant` | `page.tsx` | ✅ UI built — hardcoded to Fatou Diallo; all data is mock |
| `/profile` | *(empty dir)* | ❌ Not yet built |
| `/api/verify-cni` | `route.ts` | ✅ API route — parses MRZ with `mrz` npm package |

### 3.2 Components

#### `Navbar.tsx`
- Fixed top bar with scroll-reactive styling
- Logo, nav links (`/listings`, `/about`), language toggle (FR ↔ EN), Login & Signup buttons
- Mobile hamburger menu with AnimatePresence

#### `Footer.tsx`
- Site footer (brand, links, copyright)

#### `PropertyCard.tsx`
- Used in listings grid and homepage preview
- Displays: thumbnail image, price, neighborhood, rooms, area, verified badge, rating

#### `MobileMoneyModal.tsx`
- 3-step payment modal: choose operator → enter phone → success
- Supports: 🟠 Orange Money, 🟡 MTN Money, 🔵 Moov Money, 🌊 Wave
- Currently simulates payment with a 2-second timeout (no real payment gateway)

#### `AuthLayout.tsx`
- 2-panel layout: left = brand panel (dark green gradient, features list, stats), right = form area
- Mobile: left panel is hidden

#### `CniVerificationForm.tsx`
- Multi-phase flow: `consent → upload → quality → mrz-input → checking → pass/fail/retry`
- Uploads front + back images of CNI (Carte Nationale d'Identité)
- Validates image resolution (min 600×400px)
- User manually enters 3 MRZ lines (30 chars each)
- Calls `/api/verify-cni` with MRZ lines
- On PASS: redirects to `/dashboard/landlord` after 2.5s

> ⚠️ **CRITICAL MISSING PIECE:** The face/selfie camera verification step is NOT yet implemented. The design specifies that after uploading the CNI, a selfie camera must open, capture the user's face, and compare it against the photo on the CNI. This is the key trust mechanism.

### 3.3 Data Layer

All data is currently **fully mocked** in `src/lib/mockData.ts`.

#### Interfaces defined:

```typescript
interface Property {
  id, title, titleEn, description, descriptionEn,
  price, city, neighborhood, rooms, bathrooms, area,
  images[], landlordId, verified, rating, reviewCount,
  features[], featuresEn[], coordinates: { lat, lng }
}

interface User {
  id, name, email, phone, type: 'tenant' | 'landlord',
  avatar, verified, trustScore, reviewCount, joinedDate,
  properties?: string[], bio, bioEn
}

interface Review {
  id, authorId, authorName, authorAvatar,
  targetId, rating, comment, commentEn, date
}

interface Payment {
  id, tenantId, landlordId, propertyId, amount,
  date, method: 'orange'|'mtn'|'moov'|'wave',
  status: 'completed'|'pending'|'failed', receiptUrl
}
```

#### Mock data includes:
- **4 landlords**: Kouamé Adjoumani, Ama Koffi, Ibrahim Traoré, Marie-Louise Bamba
- **2 tenants**: Fatou Diallo, Jean-Baptiste N'Goran
- **8 properties** across Cocody, Yopougon, Plateau, Abobo, Adjamé
- **3 reviews**
- **3 payments** (all for Fatou → property p1)

### 3.4 Internationalisation (i18n)

`src/lib/lang.tsx` — custom React context hook (`useLang`):
- Supports **FR** (French, default) and **EN** (English)
- Translation keys accessed via `t('key')` and raw `lang` variable
- Language persisted via `localStorage` (`lang` key)
- Toggle available in Navbar and AuthLayout

### 3.5 Backend / API Routes

#### `POST /api/verify-cni`

**Request body:**
```json
{
  "mrzLines": ["line1_30chars", "line2_30chars", "line3_30chars"],
  "skipOcrCrossCheck": true
}
```

**Response:**
```json
{
  "status": "PASS" | "FAIL" | "RETRY",
  "errorCode": "string (optional)",
  "message": "string (optional)"
}
```

Uses the `mrz` npm package to parse Ivorian CNI MRZ (TD1 format, 3×30 chars). Validates:
- MRZ format correctness
- Check digits
- Document type, country code (CIV), name, DOB, document number

> ⚠️ The face-match verification against the ID photo is **not implemented** in this route yet.

### 3.6 Database Types (Supabase)

Currently defined in `src/lib/supabase.ts`:
```typescript
interface Tenant {
  id: string;        // UUID — matches auth.users.id
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Landlord {
  id: string;        // UUID — matches auth.users.id
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}
```

> ⚠️ These are the **only** two DB interfaces defined. The `properties` table, `bookings` table, and `verification` table are not yet typed or created in Supabase.

### 3.7 Design System & Styling

**Color Palette** (defined in `globals.css` `@theme`):

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1a4d3a` | Deep Forest Green — main brand color |
| `--color-primary-dark` | `#0f2e23` | Hover states |
| `--color-accent` | `#c8501e` | Burnt Orange — CTAs, highlights |
| `--color-bg-cream` | `#f8f6f2` | Warm background |
| `--color-text-main` | `#111827` | Near black |
| `--color-text-muted` | `#4b5563` | Muted text |
| `--color-border-soft` | `#e5e7eb` | Subtle borders |

**Fonts:**
- Display: `Outfit` (headings, brand)
- Body: `Inter` (all body text)

**Component classes:**
- `.btn-primary` — green filled button with shadow
- `.btn-secondary` — outline green button
- `.premium-card` — elevated card
- `.listing-card` — property card with hover effects
- `.premium-badge` — accent-colored status badge
- `.premium-input` — styled form input

**Animations:**
- `animate-float` — floating element (y-axis sine wave)
- `Framer Motion` — page/element transitions throughout

---

## 4. What Is Working Today

- ✅ Landing page (`/`) with hero, feature cards, how-it-works, mock listings preview
- ✅ Listings page (`/listings`) with search and filter UI (city, neighborhood, price, rooms, verified-only)
- ✅ Property detail page (`/listings/[id]`) with image gallery, specs, landlord card, placeholder map
- ✅ "Book Viewing" button (sets `booked=true` state — no real booking logic)
- ✅ Mobile Money payment modal (simulated — no real payment gateway)
- ✅ Auth layout (split-panel design) used by login/signup/verify-cni
- ✅ CNI ID upload flow (upload front+back, image quality check, MRZ manual entry)
- ✅ `/api/verify-cni` — parses and validates Ivorian CNI MRZ data
- ✅ Landlord dashboard (static UI — tabs for listings, requests, payments, add property)
- ✅ Tenant dashboard (static UI — tabs for saved, payments, receipts, messages)
- ✅ Bilingual FR/EN support throughout
- ✅ Supabase client initialized

---

## 5. What Is Mocked / Incomplete

| Feature | Current State | What's Needed |
|---|---|---|
| User authentication | No real auth — dashboards hardcoded to mock users | Supabase Auth integration for both landlord and tenant flows |
| Selfie / face verification | ❌ Not built | Camera API + face-matching against CNI photo (see Phase 2) |
| Property table in DB | ❌ No real DB table | Supabase `properties` table; landlord upload writes to DB |  
| Listings data | Mock data in `mockData.ts` | Replace with Supabase query from real `properties` table |
| "Book Viewing" | Sets local state only | Real `bookings` table + calendar UI + email to agent |
| Email notifications | ❌ None | Use Resend/SendGrid/Nodemailer for all booking emails |
| Agent booking management | Static mock request list in dashboard | Real bookings table, approve/reschedule/decline actions |
| Buyer login | No separate buyer login page | Separate role-based signup/login for tenant/buyer |
| Agent ID stored with property | Not implemented | `agent_id` FK in properties table, populated on upload |
| Property images upload | No file upload mechanism | Supabase Storage bucket for property images |
| Payment gateway | Simulated 2s timeout | Real Mobile Money API integration (CinetPay, FedaPay) |
| Map on property detail | Placeholder div | Real map embed (Google Maps or Mapbox) |
| Profile pages | Empty directory | Landlord & tenant public/private profile pages |

---

## 6. Product Vision

**LoyerSûr CI** is a trusted real estate rental marketplace for Côte d'Ivoire with two distinct user roles:

### Agents / Landlords
1. Register and verify identity using government-issued CNI (Carte Nationale d'Identité)
2. Upload CNI front + back → system parses MRZ data
3. Take a selfie via camera → system matches face to CNI photo
4. Upon match: account is marked **Verified** ✅
5. Access dashboard to upload property listings (bedroom count, bathroom count, amenities, rent in FCFA, surface area in m², photos, neighborhood)
6. Uploaded property is saved to the `properties` DB table with `agent_id` FK
7. Property appears in the public `/listings` page
8. Receive email notifications when buyers book viewings
9. Can **Confirm**, **Reschedule**, or **Contact Buyer** for each booking request
10. If they reschedule → buyer gets a reschedule email → buyer can confirm or contact agent

### Buyers / Tenants
1. Register with a separate buyer login flow
2. Browse all agent-uploaded property listings on `/listings`
3. View full property detail page (photos, specs, amenities, agent info)
4. Book a viewing: calendar picker → select date and time → confirm booking
5. Email sent to agent with booking details + buyer contact info
6. Receive email confirmation once agent approves
7. If agent reschedules → buyer receives reschedule email → can accept or contact agent

---

## 7. Next Steps — Full Roadmap

### Phase 1: Database Schema & Supabase Setup

**Goal:** Create all required tables in Supabase and update TypeScript types.

#### Tables to create:

```sql
-- Extend existing implicit users with role
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL CHECK (role IN ('landlord', 'tenant')),
  verified    BOOLEAN DEFAULT false,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CNI Verification per landlord
CREATE TABLE public.verifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id     UUID REFERENCES public.profiles(id),
  cni_front_url   TEXT,
  cni_back_url    TEXT,
  selfie_url      TEXT,
  mrz_data        JSONB,
  status          TEXT CHECK (status IN ('pending', 'verified', 'failed')),
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Properties uploaded by verified landlords
CREATE TABLE public.properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID REFERENCES public.profiles(id) NOT NULL,
  title           TEXT NOT NULL,
  title_en        TEXT,
  description     TEXT,
  description_en  TEXT,
  price           INTEGER NOT NULL,
  city            TEXT NOT NULL DEFAULT 'Abidjan',
  neighborhood    TEXT NOT NULL,
  bedrooms        INTEGER NOT NULL,
  bathrooms       INTEGER NOT NULL,
  area            NUMERIC NOT NULL,
  features        TEXT[],
  images          TEXT[],
  coordinates     JSONB,
  verified        BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Viewing bookings
CREATE TABLE public.bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID REFERENCES public.properties(id) NOT NULL,
  tenant_id       UUID REFERENCES public.profiles(id) NOT NULL,
  agent_id        UUID REFERENCES public.profiles(id) NOT NULL,
  preferred_date  TIMESTAMPTZ NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'cancelled')),
  rescheduled_to  TIMESTAMPTZ,
  message         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Files to update:**
- `src/lib/supabase.ts` — add TypeScript interfaces for all 4 tables
- Enable Supabase Row Level Security (RLS) policies for each table

---

### Phase 2: Agent (Landlord) Authentication & ID Verification

**Goal:** Full landlord signup → CNI upload → selfie match → verified status.

#### 2a. Landlord Signup Page (`/auth/signup`)
- Add a signup form component to `src/app/auth/signup/`
- Form fields: Full Name, Email, Phone, Password, Role selector (Agent/Tenant)
- On submit: call `supabase.auth.signUp()` → insert into `profiles` with `role = 'landlord'`
- After signup: redirect to `/auth/verify-cni` if role is landlord

#### 2b. CNI Upload API Enhancement (`/api/verify-cni`)
- Currently: only parses MRZ text input
- **Add:** Accept base64 image of CNI front → extract photo from ID card
- Store CNI images to Supabase Storage bucket `cni-documents` (private)
- Save `cni_front_url`, `cni_back_url` to `verifications` table

#### 2c. Selfie Camera & Face Match (NEW FEATURE)
This is the **most critical missing piece** of the verification flow.

**In `CniVerificationForm.tsx`, add a new phase after MRZ validation:**

```
Phase flow:
consent → upload → quality → mrz-input → checking → SELFIE (new) → face_checking → pass/fail
```

**Selfie phase implementation:**
```typescript
// New phase: 'selfie'
// Use browser MediaDevices API to open front camera
const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
// Show video preview
// Capture frame on button click → canvas.toDataURL('image/jpeg')
// Send selfie + CNI front image to new API endpoint
```

**New API route:** `POST /api/verify-face`
- Receives: `{ selfieBase64: string, cniPhotoBase64: string }`
- Option A (recommended): Use **AWS Rekognition** `compareFaces` API
- Option B: Use **Azure Face API** `verify` endpoint  
- Option C: Use **Google Cloud Vision** face match
- Returns: `{ match: boolean, confidence: number }`
- If confidence >= 80%: mark `verifications.status = 'verified'`, update `profiles.verified = true`
- If < 80%: return fail state

**In `CniVerificationForm.tsx`:**
- After MRZ passes → open camera → capture selfie → call `/api/verify-face`
- On face match: show ✅ Verified, update DB, redirect to landlord dashboard
- On no match: block access, show clear error message

---

### Phase 3: Agent Property Upload → Real Listings

**Goal:** When a verified landlord submits the "Add Property" form, the property is saved to Supabase and immediately appears in `/listings`.

#### 3a. Enhance the Add Property Form (Landlord Dashboard - `add` tab)

Current form fields: title, neighborhood, price, rooms, area, description

**Add missing fields:**
- Bathrooms count (select 1–5)
- Amenities / Features (multi-select checklist: Parking, Pool, AC, WiFi, Security, Generator, etc.)
- Property type (Apartment, Villa, Studio, Office)
- Property photos upload (multi-image) → Supabase Storage `property-images` bucket
- GPS Coordinates (optional — auto-detect or manual entry)
- Bilingual title/description (FR + EN)

#### 3b. Form submission logic

```typescript
// In dashboard/landlord/page.tsx — handleAddProperty()
const { data: { user } } = await supabase.auth.getUser();

// 1. Upload images to Supabase Storage
const imageUrls = await Promise.all(
  images.map(async (file) => {
    const { data } = await supabase.storage
      .from('property-images')
      .upload(`${user.id}/${Date.now()}_${file.name}`, file);
    return supabase.storage.from('property-images').getPublicUrl(data.path).data.publicUrl;
  })
);

// 2. Insert property into DB with agent_id
const { data, error } = await supabase.from('properties').insert({
  agent_id: user.id,
  title: formData.title,
  price: Number(formData.price),
  neighborhood: formData.neighborhood,
  bedrooms: Number(formData.bedrooms),
  bathrooms: Number(formData.bathrooms),
  area: Number(formData.area),
  description: formData.description,
  features: selectedFeatures,
  images: imageUrls,
  city: 'Abidjan',
});
```

#### 3c. Show only verified landlord's properties in their dashboard

- Replace hardcoded `mockProperties.filter(p => p.landlordId === 'l1')` with:
```typescript
const { data: myProps } = await supabase
  .from('properties')
  .select('*')
  .eq('agent_id', user.id);
```

---

### Phase 4: Buyer Authentication & Listings View

**Goal:** Separate buyer registration + login + real listings from DB.

#### 4a. Buyer Signup/Login

- Reuse `AuthLayout.tsx` wrapper
- Create `src/app/auth/signup/TenantSignupForm.tsx`
- Add role selection at signup: "Je cherche un logement" (Tenant) vs "Je loue mon bien" (Landlord)
- On signup as tenant: insert `profiles` with `role = 'tenant'` → redirect to `/listings`
- On signup as landlord: redirect to `/auth/verify-cni`

#### 4b. Connect Listings to Real Database

In `ListingsPage.tsx`:
- Replace `import { mockProperties }` with a Supabase query:
```typescript
const { data: properties } = await supabase
  .from('properties')
  .select('*, profiles!agent_id(full_name, verified, avatar_url)')
  .order('created_at', { ascending: false });
```
- Do the same in `HomePage.tsx` for the "Latest opportunities" preview section
- `PropertyCard.tsx` and `PropertyDetailPage.tsx` should accept `property` from DB shape

#### 4c. Property Detail Page

- Replace mock data in `PropertyDetailPage.tsx` with Supabase query by `id`
- Show real agent info fetched via the `agent_id` FK join

---

### Phase 5: Viewing Booking + Calendar + Email Flow (Buyer Side)

**Goal:** Buyer clicks "Book Viewing" → selects date/time → email sent to agent.

#### 5a. Build the Booking Calendar UI

Replace the current dummy "Book Viewing" button in `PropertyDetailPage.tsx` with:

- A calendar picker component (recommend: `react-day-picker` or custom grid)
- Time slot selector (e.g., 09:00, 11:00, 14:00, 16:00, 18:00)
- A brief message field (optional)
- "Confirm Booking" button

```typescript
// Booking sidebar flow:
// 1. User clicks "Book a Viewing"
// 2. Calendar opens → user picks date
// 3. Time slot picker appears
// 4. User adds optional message
// 5. User clicks "Confirm"
// 6. POST /api/book-viewing
```

#### 5b. New API Route: `POST /api/book-viewing`

```typescript
// src/app/api/book-viewing/route.ts
export async function POST(req: Request) {
  const { propertyId, preferredDate, message, tenantId } = await req.json();
  
  // 1. Get property + agent details
  const { data: property } = await supabase
    .from('properties')
    .select('*, profiles!agent_id(*)')
    .eq('id', propertyId)
    .single();
  
  // 2. Get tenant details
  const { data: tenant } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', tenantId)
    .single();
  
  // 3. Insert booking
  const { data: booking } = await supabase.from('bookings').insert({
    property_id: propertyId,
    tenant_id: tenantId,
    agent_id: property.agent_id,
    preferred_date: preferredDate,
    message,
    status: 'pending',
  }).select().single();
  
  // 4. Send email to agent
  await sendBookingEmailToAgent({ booking, property, tenant });
  
  // 5. Send confirmation email to buyer
  await sendBookingConfirmationToBuyer({ booking, property, tenant });
  
  return Response.json({ success: true, bookingId: booking.id });
}
```

#### 5c. Email Templates

Use **Resend** (recommended) or **Nodemailer** with SMTP.

**Email 1 — To Agent: New Booking Request**
```
Subject: 📅 Nouvelle demande de visite — [Property Title]

Bonjour [Agent Name],

[Tenant Name] souhaite visiter votre bien : [Property Title] à [Neighborhood].
Date souhaitée : [Date & Time]
Message : [Message]

Contact acheteur : [Tenant email/phone]

Actions disponibles :
[✅ Confirmer la visite]  ← link to /api/booking/[id]/confirm
[📅 Proposer une autre date]  ← link to /api/booking/[id]/reschedule
[📞 Contacter l'acheteur]  ← mailto:[tenant_email]
```

**Email 2 — To Buyer: Booking Received**
```
Subject: ✅ Votre demande de visite a été envoyée

Bonjour [Buyer Name],
Votre demande de visite pour [Property Title] a été envoyée à l'agent [Agent Name].
Vous recevrez une confirmation dès que l'agent aura accepté.
```

---

### Phase 6: Agent Booking Management + Email Replies

**Goal:** Agent can confirm, reschedule, or contact buyer from their dashboard AND via email action links.

#### 6a. Agent Dashboard — Bookings Tab

Replace the hardcoded mock request list with real data:

```typescript
// In dashboard/landlord/page.tsx
const { data: bookings } = await supabase
  .from('bookings')
  .select('*, profiles!tenant_id(full_name, email, phone, avatar_url), properties(title, neighborhood)')
  .eq('agent_id', user.id)
  .order('created_at', { ascending: false });
```

Each booking card shows:
- Buyer name, avatar, trust score
- Property name
- Requested date/time
- Buyer's message
- **3 Action Buttons:**
  - ✅ **Confirm Booking** — updates `bookings.status = 'confirmed'`, sends confirmation email to buyer
  - 📅 **Reschedule** — opens a date/time picker, updates `bookings.rescheduled_to`, changes status to `'rescheduled'`, sends reschedule email to buyer
  - 📞 **Contact Buyer** — direct mailto/tel link to buyer

#### 6b. New API Routes for Booking Actions

```
POST /api/booking/[id]/confirm       → status = 'confirmed' + email buyer
POST /api/booking/[id]/reschedule    → status = 'rescheduled' + email buyer with new date
```

#### 6c. Email to Buyer — Booking Confirmed by Agent

```
Subject: 🎉 Visite confirmée — [Property Title]

Bonjour [Buyer Name],

Bonne nouvelle ! [Agent Name] a confirmé votre visite.

📍 Bien : [Property Title], [Neighborhood]
📅 Date : [Confirmed Date & Time]
📞 Contact agent : [Agent Phone]

À bientôt !
```

#### 6d. Email to Buyer — Agent Rescheduled

```
Subject: 📅 Votre visite a été reportée — [Property Title]

Bonjour [Buyer Name],

[Agent Name] propose de reporter votre visite à :
📅 Nouvelle date : [Rescheduled Date & Time]

[✅ Accepter la nouvelle date]  ← link to /api/booking/[id]/confirm
[📞 Contacter l'agent directement]  ← mailto:[agent_email]
```

---

### Phase 7: Polish, Notifications & Production

- **Map integration:** Replace the placeholder map div in `PropertyDetailPage.tsx` with Google Maps embed or Mapbox GL JS using `property.coordinates`
- **Saved properties:** Wire up the `❤️ Save` heart button on property cards to a `saved_properties` table
- **Trust Score system:** Calculate landlord trust score from reviews (average ratings)
- **Review system:** Allow tenants to rate landlord + property after visit
- **Profile pages:** `/profile/[id]` showing public landlord/tenant profiles
- **Notifications bell:** In-app notifications for bookings, messages
- **Mobile Money integration:** Replace simulated payment with CinetPay or FedaPay API
- **Admin panel:** Flag/review unverified properties, monitor verifications
- **Rate limiting:** Add to `/api/verify-cni` and `/api/verify-face`
- **Error boundaries:** Add React error boundaries on major pages
- **SEO:** Add `generateMetadata()` to all dynamic routes (`/listings/[id]`)

---

## 8. Environment Variables

Create a `.env.local` file at the project root (never commit to Git):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # Server-side only

# Email (Resend recommended)
RESEND_API_KEY=re_xxxxxxxxxxxxxxx
EMAIL_FROM=noreply@loyersur.ci

# Face Verification (choose one)
AWS_ACCESS_KEY_ID=                     # For AWS Rekognition
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-1

AZURE_FACE_API_KEY=                    # For Azure Face API
AZURE_FACE_ENDPOINT=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Change to prod URL on deploy
```

---

## 9. Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# App will run at http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## 10. Coding Conventions

### File naming
- Pages: `page.tsx` (Next.js App Router convention)
- Page components: `PascalCasePage.tsx` (e.g., `ListingsPage.tsx`)
- Shared components: `PascalCase.tsx` in `src/components/`
- Utilities/hooks: `camelCase.ts` or `camelCase.tsx` in `src/lib/`

### Component patterns
- All interactive components use `'use client'` directive at the top
- Server components for data-fetching pages (future) — no `'use client'`
- State management: local `useState` / `useRef` — no external state library yet
- Forms use controlled inputs with `useState`

### Styling
- Prefer Tailwind CSS v4 utility classes for layout and spacing
- Use custom component classes (`.btn-primary`, `.premium-card`) for repeated patterns
- Inline styles (`style={{}}`) used in some complex components — refactor to Tailwind when possible
- Do NOT use hardcoded hex colors; always reference CSS tokens

### i18n
- Always use `const { t, lang } = useLang()` for any user-facing text
- Add ALL new translation strings to `src/lib/lang.tsx` (both `fr` and `en` keys)
- Bilingual fields in DB (e.g., `title` / `title_en`) use `lang === 'fr' ? row.title : row.title_en`

### Supabase
- Client-side: use `import { supabase } from '@/lib/supabase'`
- Server-side (API routes): create a service-role client with `SUPABASE_SERVICE_ROLE_KEY`
- Always handle `error` from Supabase responses; never silently ignore

### TypeScript
- All DB row types should mirror table schemas in `src/lib/supabase.ts`
- Avoid `any` — prefer `unknown` and proper type guards

---

*Last updated: April 2026 — This document should be updated as features are built and the data layer migrates from mock to real Supabase data.*
