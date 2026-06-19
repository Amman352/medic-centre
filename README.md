Two-Sided Healthcare Scheduling & Records Platform

A full-stack healthcare platform connecting patients and doctors — a React Native mobile app for patients and a Next.js web dashboard for doctors, both backed by a single Supabase database with row-level security.

`React Native` `Expo` `Next.js` `TypeScript` `Supabase` `Tailwind CSS`

---

## 📌 What is Medic Centre?

Medic Centre is a real-time healthcare coordination platform split across two purpose-built apps that share one backend:

- **Patients** book appointments, upload medical records, and track prescriptions from their phone.
- **Doctors** manage their patient roster, process appointment requests, and issue digital prescriptions from a web dashboard.

Both apps read and write to the same Supabase PostgreSQL database. There's no sync layer, no polling, no duplicated state — a doctor approving an appointment in the web dashboard is visible to the patient in the mobile app on their next fetch, because both are querying the same source of truth.

```
Patient books appt  →  Supabase insert  →  Doctor sees it in dashboard  →  Doctor approves
       →  Supabase update  →  Patient sees "confirmed" status in mobile app
```

---

## ✨ Key Features

| # | Feature | Description |
|---|---|---|
| 01 | 🔐 Supabase Auth | Email/password authentication with persistent sessions on mobile |
| 02 | 📅 Appointment Booking | Patients book, doctors approve/complete/cancel — full status lifecycle |
| 03 | 📋 Medical Records | Patients upload documents to Supabase Storage, viewable anytime |
| 04 | 💊 Prescription Engine | Doctors issue prescriptions with dynamic, multi-line medication entries |
| 05 | 🩺 Doctor Dashboard | Live patient count, appointment stats, and prescription totals at a glance |
| 06 | 🗄️ Shared Supabase Backend | One PostgreSQL database, one schema, two clients — no sync logic needed |
| 07 | 🛡️ Row-Level Security | Postgres RLS policies scope data access between patients and doctors |
| 08 | 🎨 Dark Clinical UI | Slate/dark theme on web, clean native UI on mobile, both Tailwind-driven |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          SUPABASE                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL Database                     │   │
│  │   profiles · appointments · medical_records ·              │   │
│  │   prescriptions · medications · medication_reminders        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────┐      ┌────────────────────────────┐   │
│  │   Auth (JWT sessions)  │      │  Storage (medical-records)  │   │
│  └──────────────────────┘      └────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Row-Level Security Policies                    │   │
│  │   patients see only their own data · doctors see only        │   │
│  │   appointments/prescriptions they created                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬───────────────────────────────────┘
                                 │
              ┌──────────────────┴───────────────────┐
              │                                       │
   ┌──────────▼───────────┐               ┌──────────▼────────────┐
   │     MOBILE APP          │               │     WEB DASHBOARD       │
   │  React Native + Expo     │               │      Next.js 16          │
   │                            │               │                            │
   │  Patient-facing:            │               │  Doctor-facing:            │
   │  • Login / Register           │               │  • Dashboard (live stats)   │
   │  • Book appointments            │               │  • Patient registry           │
   │  • View medical records           │               │  • Appointments manager         │
   │  • Track prescriptions              │               │  • Prescription issuer            │
   │  • Profile management                 │               │  • Sidebar nav (dark theme)          │
   └────────────────────────┘               └─────────────────────────┘
```

---

## 🗄️ Database Design — Why This Schema

Healthcare data has a natural shape: one person can be a patient, a doctor, or both — and every clinical record (appointment, prescription, note) needs to point at exactly two people: who it's for, and who's responsible for it.

**Design decisions:**

- **`profiles` extends `auth.users`** rather than duplicating auth logic — Supabase Auth handles credentials, `profiles` just adds a `role` column and contact info.
- **`appointments` and `prescriptions` both store `patient_id` + `doctor_id`** as separate foreign keys, not a single `participants` array — this keeps RLS policies simple (`WHERE doctor_id = auth.uid()`) instead of needing array containment checks.
- **`medications` is a child table of `prescriptions`**, not a JSON column — a doctor can prescribe 1 to N drugs per visit, and a relational table lets the web dashboard render/edit each line item independently.
- **`medical_records` stores file references, not files** — actual documents live in Supabase Storage; the table just tracks metadata and ownership.

### The 5 Core Tables

| Table | Purpose | Key Relationships |
|---|---|---|
| `profiles` | Extends auth users with role, name, contact info | `role` ∈ {`patient`, `doctor`} |
| `appointments` | Booking record between one patient and one doctor | `patient_id`, `doctor_id` → `profiles.id` |
| `medical_records` | Patient-uploaded documents | `patient_id` → `profiles.id`, file in Storage |
| `prescriptions` | Diagnosis + notes + validity window | `patient_id`, `doctor_id` → `profiles.id` |
| `medications` | Line items within a prescription | `prescription_id` → `prescriptions.id` |

Full schema: [`docs/schema.sql`](./docs/schema.sql)

---

## 📊 App Screens

| Surface | Screens |
|---|---|
| **Mobile** | Login · Register · Dashboard · Appointments · Medical Records · Prescriptions · Profile |
| **Web** | Dashboard (stats) · Patient Registry · Appointments Manager · Prescription Issuer |

---

## 📸 Screenshots

> _Add screenshots here — see `/screenshots` folder_

| Mobile: Dashboard | Mobile: Appointments | Web: Doctor Dashboard |
|---|---|---|
| ![mobile-dashboard](./screenshots/mobile-dashboard.png) | ![mobile-appointments](./screenshots/mobile-appointments.png) | ![web-dashboard](./screenshots/web-dashboard.png) |

---

## ⚙️ Tech Stack

### Mobile App

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile UI |
| Expo | Build tooling, dev client, OTA-ready |
| Expo Router | File-based navigation (`app/` directory) |
| TypeScript | Type safety across services and screens |

### Web Dashboard

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Server + client components, file-based routing |
| TypeScript | Shared types between pages and Supabase queries |
| Tailwind CSS | Utility-first styling, dark/slate clinical theme |
| shadcn/ui | Accessible base components (button, table, dialog) |

### Backend

| Technology | Purpose |
|---|---|
| Supabase (PostgreSQL) | Single source of truth for both apps |
| Supabase Auth | Email/password sessions, JWT-based |
| Supabase Storage | Medical record file uploads |
| Row Level Security | Postgres policies scoping patient/doctor data access |
| `@supabase/supabase-js` | Mobile client |
| `@supabase/ssr` | Web client (browser + server compatible) |

### Infrastructure

| Technology | Purpose |
|---|---|
| Vercel | Web dashboard deployment |
| Expo Go / EAS | Mobile app testing and builds |
| GitHub | Version control |

---

## 📁 Project Structure

```
medic-centre/
│
├── mobile/                        ← React Native Expo app (patient-facing)
│   ├── app/
│   │   ├── (auth)/                 ← login.tsx, register.tsx
│   │   ├── (tabs)/                 ← dashboard, appointments, records, prescriptions, profile
│   │   └── _layout.tsx             ← root layout, session handling
│   ├── services/                   ← auth.ts, appointments.ts, records.ts, prescriptions.ts
│   ├── lib/supabase.ts             ← Supabase client config
│   ├── constants/theme.ts          ← Colors, spacing, typography
│   ├── types/index.ts              ← Shared TypeScript types
│   └── .env.local                  ← Supabase keys (gitignored)
│
├── web/                            ← Next.js app (doctor-facing dashboard)
│   ├── app/
│   │   └── dashboard/
│   │       ├── page.tsx             ← stats overview
│   │       ├── patients/page.tsx     ← patient registry
│   │       ├── appointments/page.tsx  ← appointments manager
│   │       └── prescriptions/page.tsx  ← prescription issuer
│   ├── components/
│   │   ├── Sidebar.tsx               ← nav with active-state highlighting
│   │   └── ui/                        ← shadcn/ui components
│   ├── lib/supabase.ts                ← createClient() — @supabase/ssr
│   ├── types/index.ts                 ← Shared TypeScript types
│   └── .env.local                     ← Supabase keys (gitignored)
│
├── docs/                            ← schema.sql, architecture notes
├── screenshots/                      ← App screenshots for this README
└── README.md
```

---

## 🗄️ Database Schema

```sql
-- profiles — extends Supabase auth users
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name     TEXT,
  email         TEXT,
  phone         TEXT,
  role          TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
  date_of_birth DATE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- appointments — one booking between one patient and one doctor
CREATE TABLE appointments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         UUID REFERENCES profiles(id),
  doctor_id          UUID REFERENCES profiles(id),
  appointment_date   DATE NOT NULL,
  appointment_time   TIME NOT NULL,
  status             TEXT DEFAULT 'pending', -- pending | confirmed | completed | cancelled
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- prescriptions — diagnosis + validity window
CREATE TABLE prescriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES profiles(id),
  doctor_id     UUID REFERENCES profiles(id),
  diagnosis     TEXT NOT NULL,
  notes         TEXT,
  issued_date   DATE DEFAULT CURRENT_DATE,
  valid_until   DATE NOT NULL
);

-- medications — line items within a prescription
CREATE TABLE medications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id  UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  dosage           TEXT,
  frequency        TEXT,
  duration         TEXT,
  instructions     TEXT
);

-- medical_records — patient-uploaded documents
CREATE TABLE medical_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES profiles(id),
  file_url      TEXT NOT NULL,
  file_name     TEXT,
  uploaded_at   TIMESTAMPTZ DEFAULT now()
);
```

Full schema with RLS policies: [`docs/schema.sql`](./docs/schema.sql)

---

## ▶️ How to Run

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- [Expo Go](https://expo.dev/go) app (for mobile testing)

### Step 1 — Clone the repo

```bash
git clone https://github.com/Amman352/medic-centre.git
cd medic-centre
```

### Step 2 — Set up the database

Go to Supabase → SQL Editor → paste and run the full schema from [`docs/schema.sql`](./docs/schema.sql).

### Step 3 — Configure mobile environment

Create `mobile/.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
```

### Step 4 — Configure web environment

Create `web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
```

### Step 5 — Run everything

Open two terminals:

```bash
# Terminal 1 — Mobile app
cd mobile
npm install
npx expo start
```

```bash
# Terminal 2 — Web dashboard
cd web
npm install
npm run dev
```

- Mobile: scan the QR code with Expo Go
- Web: open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🔍 How Doctor ↔ Patient Data Flow Works

```
1. Patient registers on mobile     →  profiles row created, role = 'patient'
2. Patient books appointment        →  appointments row created, status = 'pending'
3. Doctor opens web dashboard         →  queries appointments WHERE doctor_id = current doctor
4. Doctor clicks "Approve"               →  UPDATE appointments SET status = 'confirmed'
5. Patient refreshes mobile app             →  sees status: confirmed
6. Doctor issues prescription                  →  prescriptions + medications rows created
7. Patient views prescriptions screen             →  sees new prescription instantly
```

No webhooks, no push notifications (yet) — both clients query Supabase directly, so data is consistent the moment either side refreshes.

---

## ⚠️ Known Limitations & Future Work

| Limitation | Planned Fix |
|---|---|
| Web dashboard has no doctor login flow yet | Wire `web/app/page.tsx` to Supabase Auth + session-based routing |
| No push notifications for appointment updates | Integrate Expo push notifications |
| Doctor ID is hardcoded for portfolio demo | Replace with `auth.getSession()` once web auth is wired |
| No real-time subscriptions | Add Supabase Realtime channels for live updates without refresh |
| Not yet deployed | Vercel deployment for web, EAS build for mobile |

---

## 🎯 Use Cases

- Developers building portfolio projects that demonstrate full-stack CRUD across two clients
- Healthcare startups prototyping a patient/doctor coordination MVP
- Students learning Supabase RLS, Expo Router, and Next.js App Router together in one project

---

## 👨‍💻 Author

**Amman Khan**

[GitHub](https://github.com/Amman352) · [LinkedIn](#)

---

Built as a full-stack portfolio project · Medic Centre
