 Medic Centre — MVP Architecture Plan

🎯 Product Scope
Medic Centre is a healthcare platform connecting patients and doctors. Patients manage their health records, book appointments, and track prescriptions from a mobile app. Doctors manage their patients and workflow from a web dashboard.

✅ Features to BUILD (MVP)
Patient (Mobile App)

Register / Login
View & update profile
Book, view, cancel appointments
Upload & view medical records
View prescriptions
Medication reminders (local notifications)

Doctor (Web Dashboard)

Login
View patient list
Manage appointments
Create & send prescriptions


❌ Features to EXCLUDE (Post-MVP)

Video/audio consultations
Payment gateway
Insurance integration
Chat/messaging
Multi-language support
Admin panel
Push notifications (server-side)
Analytics dashboard


👤 User Roles
RolePlatformAccessPatientMobile (React Native)Appointments, Records, Prescriptions, RemindersDoctorWeb (Next.js)Patient list, Appointments, Prescriptions

📁 Folder Structure
medic-centre/
├── mobile/                        # React Native Expo app
│   ├── app/                       # Expo Router screens
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/
│   │   │   ├── dashboard.tsx
│   │   │   ├── appointments.tsx
│   │   │   ├── records.tsx
│   │   │   ├── prescriptions.tsx
│   │   │   └── profile.tsx
│   │   └── _layout.tsx
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   └── forms/                 # Form components
│   ├── services/                  # Supabase query functions
│   │   ├── auth.ts
│   │   ├── appointments.ts
│   │   ├── records.ts
│   │   └── prescriptions.ts
│   ├── lib/
│   │   └── supabase.ts            # Supabase client
│   ├── types/
│   │   └── index.ts               # All TypeScript types
│   ├── constants/
│   │   └── theme.ts               # Colors, fonts
│   └── assets/
│
├── web/                           # Next.js Doctor Dashboard
│   ├── app/
│   │   ├── page.tsx               # Login
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── patients/
│   │   │   ├── appointments/
│   │   │   └── prescriptions/
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   │   └── supabase.ts
│   └── types/
│
├── docs/
│   ├── mvp-plan.md                ✅
│   ├── schema.sql
│   ├── ui-spec.md
│   └── api-design.md
│
├── screenshots/
├── architecture/
└── README.md

🔌 API Design (Supabase-based)
All API calls go through the Supabase JS SDK — no custom backend needed.
Auth
ActionMethodRegistersupabase.auth.signUp()Loginsupabase.auth.signInWithPassword()Logoutsupabase.auth.signOut()Get sessionsupabase.auth.getSession()
Appointments
ActionSupabase CallCreateinsert → appointmentsList (patient)select where patient_id = user.idList (doctor)select where doctor_id = user.idCancelupdate → set status = cancelled
Medical Records
ActionSupabase CallUpload filesupabase.storage.upload()Save recordinsert → medical_recordsView recordsselect where patient_id = user.id
Prescriptions
ActionSupabase CallCreate (doctor)insert → prescriptionsView (patient)select where patient_id = user.id