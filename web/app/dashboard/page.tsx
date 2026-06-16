'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({ patients: 0, appointments: 0, prescriptions: 0 });
  const [doctorName, setDoctorName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const [profileRes, patientsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', session.user.id).single(),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
          supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', session.user.id),
          supabase.from('prescriptions').select('*', { count: 'exact', head: true }).eq('doctor_id', session.user.id),
        ]);

        setDoctorName(profileRes.data?.full_name ?? 'Doctor');
        setStats({
          patients: patientsRes.count ?? 0,
          appointments: appointmentsRes.count ?? 0,
          prescriptions: prescriptionsRes.count ?? 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [supabase]);

  const cards = [
    { label: 'Total Patients', value: stats.patients, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'My Appointments', value: stats.appointments, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'My Prescriptions', value: stats.prescriptions, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          {loading ? 'Loading...' : `Welcome back, Dr. ${doctorName}`}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your clinical overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{card.label}</p>
            <div className={`mt-3 inline-flex items-center justify-center rounded-lg px-4 py-2 ${card.bg}`}>
              <span className={`text-4xl font-bold ${card.color}`}>{loading ? '—' : card.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
