'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { Profile } from '../../../types';

export default function PatientsPage() {
  const supabase = createClient();
  const [patients, setPatients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error: apiError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, date_of_birth, created_at, role, avatar_url')
          .eq('role', 'patient')
          .order('full_name', { ascending: true });

        if (apiError) throw apiError;
        setPatients(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load patient registry.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [supabase]);

  const filtered = patients.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Patient Registry</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Browse and review registered patient profiles.</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-sm text-slate-950 dark:text-white focus:outline-none"
        />
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
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Date of Birth</th>
                <th className="px-6 py-4">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    No patient records found matching current search parameters.
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {patient.full_name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-950 dark:text-white">{patient.full_name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {patient.phone ?? <span className="italic text-slate-300 dark:text-slate-600">No phone</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {patient.date_of_birth ?? <span className="italic text-slate-300 dark:text-slate-600">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(patient.created_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
