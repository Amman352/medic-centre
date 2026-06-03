-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS / PROFILES TABLE
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCTORS TABLE
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  specialization TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  years_of_experience INT DEFAULT 0,
  available_from TIME,
  available_to TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS TABLE
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICAL RECORDS TABLE
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  record_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRESCRIPTIONS TABLE
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  diagnosis TEXT,
  notes TEXT,
  issued_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICATIONS TABLE (linked to prescriptions)
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICATION REMINDERS TABLE
CREATE TABLE medication_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  reminder_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_medications_prescription ON medications(prescription_id);
CREATE INDEX idx_reminders_patient ON medication_reminders(patient_id);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS POLICIES: appointments
CREATE POLICY "Patients see own appointments"
  ON appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors see their appointments"
  ON appointments FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Patients create appointments"
  ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients cancel own appointments"
  ON appointments FOR UPDATE USING (auth.uid() = patient_id);

-- RLS POLICIES: medical_records
CREATE POLICY "Patients see own records"
  ON medical_records FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients upload own records"
  ON medical_records FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctors see their patient records"
  ON medical_records FOR SELECT USING (auth.uid() = doctor_id);

-- RLS POLICIES: prescriptions
CREATE POLICY "Patients see own prescriptions"
  ON prescriptions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors manage their prescriptions"
  ON prescriptions FOR ALL USING (auth.uid() = doctor_id);

-- RLS POLICIES: medications
CREATE POLICY "Patients see own medications"
  ON medications FOR SELECT
  USING (
    prescription_id IN (
      SELECT id FROM prescriptions WHERE patient_id = auth.uid()
    )
  );

-- RLS POLICIES: reminders
CREATE POLICY "Patients manage own reminders"
  ON medication_reminders FOR ALL USING (auth.uid() = patient_id);