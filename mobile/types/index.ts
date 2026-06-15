export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'patient' | 'doctor';
  phone: string | null;
  avatar_url: string | null;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  patient?: Profile;
  doctor?: Profile;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  title: string;
  description: string;
  file_url: string;
  record_date: string;
  patient?: Profile;
  doctor?: Profile;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  notes: string | null;
  issued_date: string;
  valid_until: string;
  patient?: Profile;
  doctor?: Profile;
  medications?: Medication[];
}

export interface Medication {
  id: string;
  prescription_id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}