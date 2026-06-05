import { supabase } from '../lib/supabase'
import { MedicalRecord } from '../types'

export const recordsService = {
  async getPatientRecords(patientId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('record_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async uploadRecord(
    patientId: string,
    title: string,
    description: string,
    file: {
      uri: string
      name: string
      type: string
    }
  ): Promise<MedicalRecord> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${patientId}/${Date.now()}.${fileExt}`

    const response = await fetch(file.uri)
    const blob = await response.blob()

    const { error: uploadError } = await supabase.storage
      .from('medical-records')
      .upload(fileName, blob, { contentType: file.type })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('medical-records')
      .getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: patientId,
        title,
        description,
        file_url: urlData.publicUrl,
        file_type: file.type,
        record_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createRecord(
    patientId: string,
    title: string,
    description: string,
    doctorId?: string
  ): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        title,
        description,
        record_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteRecord(recordId: string): Promise<void> {
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', recordId)

    if (error) throw error
  },
}