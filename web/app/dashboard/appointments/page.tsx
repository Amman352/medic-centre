'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { Appointment } from '../../../types';

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export default function AppointmentsPage() {
  const supabase = createClient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    const fetchAppointmentsWorkspace = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error: apiError } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            status,
            notes,
            patient_id,
            doctor_id,
            profiles!appointments_patient_id_fkey (id, full_name, email, phone)
          `)
          .eq('doctor_id', session.user.id)
          .order('appointment_date', { ascending: true });

        if (apiError) throw apiError;

        const formatted = (data || []).map((apt: any) => ({
          id: apt.id,
          patient_id: apt.patient_id,
          doctor_id: apt.doctor_id,
          appointment_date: apt.appointment_date,
          appointment_time: apt.appointment_time,
          status: apt.status,
          notes: apt.notes,
          patient: apt.profiles ? {
            id: apt.profiles.id,
            full_name: apt.profiles.full_name,
            email: apt.profiles.email,
            phone: apt.profiles.phone,
            role: 'patient' as const,
            avatar_url: null
          } : undefined
        }));

        setAppointments(formatted);
      } catch (err: any) {
        setError(err.message || 'Failed to sync clinical schedule matrices.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsWorkspace();
  }, [supabase]);

  const updateStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to modify schedule transition properties.');
    }
  };

  const filteredAppointments = appointments.filter((apt) => 
    statusFilter === 'all' ? true : apt.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Appointments Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review operational consultations, process intakes, and update state codes.</p>
        </div>

        <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                statusFilter === filter
                  ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Patient Parameters</th>
                <th className="px-6 py-4">Date & Clock Time</th>
                <th className="px-6 py-4">Clinical Context Notes</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Operational Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No matching clinical appointment records found inside this filter matrix.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950 dark:text-white">
                        {apt.patient?.full_name || 'Anonymous Intake'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{apt.patient?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900 dark:text-white">{apt.appointment_date}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{apt.appointment_time}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {apt.notes || 'No contextual telemetry notes specified by patient.'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                        apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                        apt.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        apt.status === 'completed' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                        'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex justify-end gap-2">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'confirmed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded font-medium transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'completed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded font-medium transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatus(apt.id, 'cancelled')}
                            className="border border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900/30 dark:hover:bg-red-950/20 px-2.5 py-1.5 rounded font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}