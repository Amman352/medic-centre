import { supabase } from '../lib/supabase'
import { Appointment } from '../types'

export const appointmentService = {
  async createAppointment(
    patientId: string,
    doctorId: string,
    date: string,
    time: string,
    notes?: string
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: date,
        appointment_time: time,
        notes,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  async updateAppointmentStatus(
    appointmentId: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', appointmentId)

    if (error) throw error
  },

  async getUpcomingAppointments(patientId: string): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .gte('appointment_date', today)
      .in('status', ['pending', 'confirmed'])
      .order('appointment_date', { ascending: true })
      .limit(5)

    if (error) throw error
    return data || []
  },
}