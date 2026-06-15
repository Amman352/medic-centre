export type UserRole = 'patient' | 'doctor'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  avatar_url?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface MedicalRecord {
  id: string
  patient_id: string
  doctor_id?: string
  title: string
  description?: string
  file_url?: string
  file_type?: string
  record_date: string
  created_at: string
}

export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  diagnosis?: string
  notes?: string
  issued_date: string
  valid_until?: string
  created_at: string
}

export interface Medication {
  id: string
  prescription_id: string
  name: string
  dosage: string
  frequency: string
  duration?: string
  instructions?: string
  created_at: string
}