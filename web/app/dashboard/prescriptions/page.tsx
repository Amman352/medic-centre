'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { Profile, Prescription } from '../../../types';

interface MedicationFormInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function PrescriptionsPage() {
  const supabase = createClient();
  const [patients, setPatients] = useState<Profile[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State Vectors
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [medications, setMedications] = useState<MedicationFormInput[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  useEffect(() => {
    const fetchPrescriptionWorkspaceData = async () => {
      try {

        // 1. Pull patient directories for the selection dropdown list layout
        const [patientsRes, prescriptionsRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email').eq('role', 'patient').order('full_name'),
          supabase
            .from('prescriptions')
            .select(`
              id, diagnosis, notes, issued_date, valid_until, patient_id, doctor_id,
              profiles!prescriptions_patient_id_fkey (id, full_name, email),
              medications (id, name, dosage, frequency, duration, instructions)
            `)
            .eq('doctor_id', 'aeebcd7a-0f23-49b5-a798-12e3c114cecb')
            .order('issued_date', { ascending: false })
        ]);

        if (patientsRes.error) throw patientsRes.error;
        if (prescriptionsRes.error) throw prescriptionsRes.error;

        setPatients(patientsRes.data || []);

        const formattedRx = (prescriptionsRes.data || []).map((rx: any) => ({
          id: rx.id,
          patient_id: rx.patient_id,
          doctor_id: rx.doctor_id,
          diagnosis: rx.diagnosis,
          notes: rx.notes,
          issued_date: rx.issued_date,
          valid_until: rx.valid_until,
          patient: rx.profiles ? {
            id: rx.profiles.id,
            full_name: rx.profiles.full_name,
            email: rx.profiles.email,
            role: 'patient' as const,
            phone: null,
            avatar_url: null
          } : undefined,
          medications: rx.medications || []
        }));

        setPrescriptions(formattedRx);
      } catch (err: any) {
        setError(err.message || 'Failed to populate pharmaceutical workspace dependencies.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptionWorkspaceData();
  }, [supabase]);

  const handleAddMedicationRow = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleRemoveMedicationRow = (index: number) => {
    if (medications.length === 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: keyof MedicationFormInput, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !diagnosis.trim() || !validUntil) {
      alert('Please configure mandatory structural fields: Patient, Diagnosis, and Validation Bounds.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (!session?.user) throw new Error('Active credentials not detected.');

      // 1. Transaction block execution step A: Write root script summary fields
      const { data: newRx, error: rxError } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: selectedPatientId,
          doctor_id: session.user.id,
          diagnosis: diagnosis.trim(),
          notes: notes.trim() || null,
          issued_date: new Date().toISOString().split('T')[0],
          valid_until: validUntil,
        })
        .select()
        .single();

      if (rxError) throw rxError;

      // 2. Transaction block execution step B: Map relational row items sequentially if configured
      const validMeds = medications.filter(m => m.name.trim());
      if (validMeds.length > 0) {
        const medsPayload = validMeds.map(m => ({
          prescription_id: newRx.id,
          name: m.name.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
          duration: m.duration.trim(),
          instructions: m.instructions.trim() || null,
        }));

        const { error: medsError } = await supabase.from('medications').insert(medsPayload);
        if (medsError) throw medsError;
      }

      alert('Pharmaceutical record structured and saved successfully.');
      
      // Clean up inputs and force full dashboard state hydration cycle reload
      setDiagnosis('');
      setNotes('');
      setValidUntil('');
      setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Error executing script transactional write updates.');
    } finally {
      setSubmitLoading(false);
    }
  };

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
    <div className="p-8 grid gap-8 lg:grid-cols-2 items-start">
      {/* Left Column: Script Creation Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Issue Therapeutic Script</h2>
          <p className="text-xs text-slate-400 mt-0.5">Authoritative pharmaceutical compound and dosage instruction entry form.</p>
        </div>

        <form onSubmit={handleCreatePrescription} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Target Patient Profile</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-950 dark:text-white focus:outline-none"
              required
            >
              <option value="">Select recipient patient identity...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Primary Clinical Diagnosis</label>
              <input
                type="text"
                placeholder="e.g., Chronic Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Script Refill Validity Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-950 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Global Pharmacological Advisory Notes</label>
            <textarea
              placeholder="Specify general administration requirements or conditional metrics..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-950 dark:text-white h-20 resize-none"
            />
          </div>

          {/* Dynamic Medication Row Stack Injection */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Compounds & Items Inventory</label>
              <button
                type="button"
                onClick={handleAddMedicationRow}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add Medication Compound
              </button>
            </div>

            {medications.map((med, index) => (
              <div key={index} className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl space-y-3 relative">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Compound Name (e.g., Metformin)"
                    value={med.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    className="block w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dosage metric (e.g., 500mg)"
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    className="block w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Frequency code (e.g., Twice Daily)"
                    value={med.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    className="block w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Duration runtime (e.g., 3 Months)"
                    value={med.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    className="block w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Specific patient intake instructions..."
                  value={med.instructions}
                  onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                  className="block w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs"
                />
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicationRow(index)}
                    className="absolute top-2 right-3 text-xs font-semibold text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitLoading ? 'Finalizing Write Operations...' : 'Commit and Authorize Script Profile'}
          </button>
        </form>
      </div>

      {/* Right Column: Historical Ledger Overview */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Active Registry Log</h2>
          <p className="text-xs text-slate-400 mt-0.5">Historical verification table of authorized active prescriptions.</p>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

        <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
          {prescriptions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
              No historical scripts managed under this doctor account profile.
            </div>
          ) : (
            prescriptions.map((rx) => (
              <div key={rx.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm text-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white text-base">{rx.diagnosis}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Patient: <span className="font-medium text-slate-700 dark:text-slate-300">{rx.patient?.full_name}</span> ({rx.patient?.email})</p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    Ref: {rx.id.slice(0, 8)}
                  </span>
                </div>

                {rx.notes && <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">Note: {rx.notes}</p>}

                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Linked Compounds</h4>
                  {rx.medications?.map((med: any) => (
                    <div key={med.id} className="text-xs flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-1">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{med.name}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">{med.frequency} ({med.duration})</span>
                      </div>
                      <span className="font-bold text-blue-600">{med.dosage}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Issued: <span className="font-semibold text-slate-700 dark:text-slate-300">{rx.issued_date}</span></span>
                  <span>Expires: <span className="font-semibold text-red-500">{rx.valid_until}</span></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}