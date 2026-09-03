import React, { useState } from 'react';
import { PatientProfile } from '../types/dashboard';

interface NewPrescriptionViewProps {
  patient: PatientProfile;
  onCancel: () => void;
  onSaveDraft: (data: any) => void;
  onSignAndTransmit: (data: any) => void;
  onTriggerSafetyAlert?: () => void;
}

export const NewPrescriptionView: React.FC<NewPrescriptionViewProps> = ({
  patient,
  onCancel,
  onSaveDraft,
  onSignAndTransmit,
  onTriggerSafetyAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState('Lisinopril');
  const [selectedDrug, setSelectedDrug] = useState({
    name: 'Lisinopril',
    drugClass: 'ACE Inhibitor',
    formulation: 'Tablet',
  });
  const [hasDuplicateAlert, setHasDuplicateAlert] = useState(true);
  const [overrideAcknowledged, setOverrideAcknowledged] = useState(false);

  // Form Fields
  const [dosage, setDosage] = useState('10');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [route, setRoute] = useState('Oral (PO)');
  const [frequency, setFrequency] = useState('Daily (QD)');
  const [duration, setDuration] = useState('30');
  const [dispenseQty, setDispenseQty] = useState('30 Tablets');
  const [sig, setSig] = useState('Take one tablet by mouth daily.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.toLowerCase().includes('amoxicillin') || searchQuery.toLowerCase().includes('penicillin')) {
      if (onTriggerSafetyAlert) {
        onTriggerSafetyAlert();
        return;
      }
    }

    onSignAndTransmit({
      drugName: selectedDrug.name,
      dose: `${dosage}${dosageUnit}`,
      route,
      frequency,
      duration: `${duration} Days`,
      dispenseQty,
      sig,
      patientId: patient.id,
      overrideAcknowledged,
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
          New e-Prescription
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] mt-1">
          Patient: <span className="font-bold text-[#003d9b]">{patient.name}</span> (DOB: {patient.dob}) • MRN: {patient.mrn}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Hospital Formulary Search & Selected Drug Box */}
        <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-4">
          <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider">
            Hospital Formulary Search
          </label>
          
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedDrug({
                  name: e.target.value || 'Lisinopril',
                  drugClass: 'ACE Inhibitor',
                  formulation: 'Tablet',
                });
              }}
              placeholder="Search by generic, brand, or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm text-[#0f172a] focus:outline-none focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b]"
            />
          </div>

          {/* Selected Formulary Card */}
          <div className="bg-[#f8fafc] rounded-xl p-4 border border-blue-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-[#003d9b]">
                  {selectedDrug.name}
                </h4>
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                  verified
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Class: {selectedDrug.drugClass} • Selected Formulation: {selectedDrug.formulation}
              </p>
            </div>
          </div>
        </div>

        {/* Clinical Alerts (Duplicate Therapy) */}
        {hasDuplicateAlert && (
          <div className="bg-rose-50/70 rounded-2xl p-5 border-l-4 border-l-rose-500 border border-rose-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span>Clinical Alerts</span>
            </div>

            <div>
              <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                Duplicate Therapy
              </h5>
              <p className="text-xs text-rose-900/90 mt-0.5 leading-relaxed">
                Patient is currently prescribed <span className="font-bold">Enalapril 5mg</span>. Co-prescribing ACE inhibitors is contraindicated.
              </p>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-rose-200">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={overrideAcknowledged}
                  onChange={(e) => setOverrideAcknowledged(e.target.checked)}
                  className="w-4 h-4 rounded border-[#cbd5e1] text-[#003d9b] focus:ring-[#003d9b]/20"
                />
                <span className="font-medium">
                  Acknowledge alert and override (Requires justification)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Dosage & Administration */}
        <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">
            Dosage &amp; Administration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Dosage */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Dosage
              </label>
              <div className="flex rounded-xl border border-[#cbd5e1] overflow-hidden focus-within:border-[#003d9b]">
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] focus:outline-none"
                  required
                />
                <span className="px-3 py-2.5 bg-slate-100 text-xs font-bold text-slate-600 border-l border-[#cbd5e1] flex items-center">
                  mg
                </span>
              </div>
            </div>

            {/* Route */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Route
              </label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm text-[#0f172a] focus:outline-none focus:border-[#003d9b]"
              >
                <option value="Oral (PO)">Oral (PO)</option>
                <option value="Intravenous (IV)">Intravenous (IV)</option>
                <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                <option value="Subcutaneous (SC)">Subcutaneous (SC)</option>
                <option value="Inhaled">Inhaled</option>
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm text-[#0f172a] focus:outline-none focus:border-[#003d9b]"
              >
                <option value="Daily (QD)">Daily (QD)</option>
                <option value="Twice Daily (BID)">Twice Daily (BID)</option>
                <option value="Three times daily (TID)">Three times daily (TID)</option>
                <option value="Four times daily (QID)">Four times daily (QID)</option>
                <option value="PRN As needed">PRN As needed</option>
                <option value="STAT (Immediately)">STAT (Immediately)</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Duration
              </label>
              <div className="flex rounded-xl border border-[#cbd5e1] overflow-hidden focus-within:border-[#003d9b]">
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] focus:outline-none"
                />
                <span className="px-3 py-2.5 bg-slate-100 text-xs font-bold text-slate-600 border-l border-[#cbd5e1] flex items-center">
                  Days
                </span>
              </div>
            </div>

            {/* Dispense Quantity */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Dispense Quantity
              </label>
              <input
                type="text"
                value={dispenseQty}
                onChange={(e) => setDispenseQty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm text-[#0f172a] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

            {/* Patient Instructions (Sig) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Patient Instructions (Sig)
              </label>
              <textarea
                value={sig}
                onChange={(e) => setSig(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm text-[#0f172a] focus:outline-none focus:border-[#003d9b]"
              />
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-4 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#475569] font-bold text-sm rounded-xl transition cursor-pointer text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSaveDraft({ drugName: selectedDrug.name, dosage })}
            className="py-3 px-4 bg-white border-2 border-[#003d9b] hover:bg-blue-50 text-[#003d9b] font-bold text-sm rounded-xl transition cursor-pointer text-center"
          >
            Save Draft
          </button>

          <button
            type="submit"
            className="py-3 px-4 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold text-sm rounded-xl shadow-md shadow-[#003d9b]/25 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">draw</span>
            <span>Sign &amp; Transmit</span>
          </button>
        </div>

      </form>
    </div>
  );
};
