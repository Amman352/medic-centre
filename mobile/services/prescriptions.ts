import { supabase } from '../lib/supabase'
import { Prescription, Medication } from '../types'

export const prescriptionService = {
  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('issued_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getPrescriptionMedications(
    prescriptionId: string
  ): Promise<Medication[]> {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('prescription_id', prescriptionId)

    if (error) throw error
    return data || []
  },

  async createPrescription(
    patientId: string,
    doctorId: string,
    diagnosis: string,
    notes: string,
    validUntil: string,
    medications: Omit<Medication, 'id' | 'prescription_id' | 'created_at'>[]
  ): Promise<Prescription> {
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        diagnosis,
        notes,
        issued_date: new Date().toISOString().split('T')[0],
        valid_until: validUntil,
      })
      .select()
      .single()

    if (prescriptionError) throw prescriptionError

    if (medications.length > 0) {
      const medicationsWithId = medications.map((med) => ({
        ...med,
        prescription_id: prescription.id,
      }))

      const { error: medError } = await supabase
        .from('medications')
        .insert(medicationsWithId)

      if (medError) throw medError
    }

    return prescription
  },

  async getRecentPrescriptions(
    patientId: string,
    limit = 3
  ): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('issued_date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },
}