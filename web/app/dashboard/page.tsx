'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';

const DOCTOR_ID = 'aeebcd7a-0f23-49b5-a798-12e3c114cecb';

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({ patients: 0, appointments: 0, prescriptions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [p, a, rx] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
          supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', DOCTOR_ID),
          supabase.from('prescriptions').select('*', { count: 'exact', head: true }).eq('doctor_id', DOCTOR_ID),
        ]);
        setStats({ patients: p.count ?? 0, appointments: a.count ?? 0, prescriptions: rx.count ?? 0 });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const cards = [
    { label: 'Total Patients', value: stats.patients, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'My Appointments', value: stats.appointments, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'My Prescriptions', value: stats.prescriptions, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Welcome back, Dr. Amman</h1>
        <p className="text-slate-500 mt-1">Here's your clinical overview for today.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
            <div className={`mt-3 inline-flex items-center justify-center rounded-lg px-4 py-2 ${card.bg}`}>
              <span className={`text-4xl font-bold ${card.color}`}>{loading ? '—' : card.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
