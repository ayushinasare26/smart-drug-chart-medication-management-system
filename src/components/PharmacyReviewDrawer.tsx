import React, { useState } from 'react';
import { 
  Patient, 
  MedicationOrder, 
  ClinicalStaff 
} from '../types/medication';
import { 
  PackageCheck, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  RotateCw,
  Clock,
  Layers
} from 'lucide-react';

interface PharmacyReviewDrawerProps {
  patient: Patient;
  medications: MedicationOrder[];
  currentStaff: ClinicalStaff;
  onClose: () => void;
  onVerifyOrder: (medId: string, notes?: string) => void;
  onFlagClarification: (medId: string, reason: string) => void;
}

export const PharmacyReviewDrawer: React.FC<PharmacyReviewDrawerProps> = ({
  patient,
  medications,
  currentStaff,
  onClose,
  onVerifyOrder,
  onFlagClarification,
}) => {
  const [activeTab, setActiveTab] = useState<'VERIFY_QUEUE' | 'CABINET_STOCK'>('VERIFY_QUEUE');
  const [clarifyNotes, setClarifyNotes] = useState<Record<string, string>>({});
  const [selectedMedToClarify, setSelectedMedToClarify] = useState<string | null>(null);

  const pendingMeds = medications.filter((m) => m.pharmacyStatus !== 'VERIFIED');
  const verifiedMeds = medications.filter((m) => m.pharmacyStatus === 'VERIFIED');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                Clinical Pharmacy Services & Dispensing
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Ward Pharmacist: <strong className="text-slate-200">{currentStaff.name}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Pharmacy Review & Ward Stock Cabinet
            </h2>
            <p className="text-xs text-slate-400">
              Active Patient: <strong className="text-white">{patient.name}</strong> ({patient.roomBed})
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('VERIFY_QUEUE')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'VERIFY_QUEUE'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Prescription Clinical Verification Queue ({pendingMeds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CABINET_STOCK')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'CABINET_STOCK'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Pyxis ADC Automated Dispensing Cabinet</span>
          </button>
        </div>

        {activeTab === 'VERIFY_QUEUE' ? (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
            {pendingMeds.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <div className="font-bold text-white">All Prescriptions Verified</div>
                <div className="text-xs text-slate-500 mt-1">No orders currently awaiting pharmacist check.</div>
              </div>
            ) : (
              pendingMeds.map((med) => (
                <div
                  key={med.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{med.genericName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {med.dose}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {med.route}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Prescribed by: <strong className="text-slate-300">{med.prescribedBy}</strong> on {med.prescribedDate}
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Indication: {med.indication}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedMedToClarify(selectedMedToClarify === med.id ? null : med.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition"
                      >
                        Request Clarification
                      </button>

                      <button
                        onClick={() => onVerifyOrder(med.id, 'Verified by Clinical Pharmacist.')}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition active:scale-95 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Release</span>
                      </button>
                    </div>
                  </div>

                  {/* Clarification input */}
                  {selectedMedToClarify === med.id && (
                    <div className="p-3 bg-slate-900 border border-amber-800/60 rounded-xl space-y-2 text-xs">
                      <label className="text-[10px] text-amber-300 font-semibold block">
                        Clarification Message to Prescribing Doctor:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Please consider renal dose reduction due to eGFR 38 mL/min."
                        value={clarifyNotes[med.id] || ''}
                        onChange={(e) =>
                          setClarifyNotes({ ...clarifyNotes, [med.id]: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMedToClarify(null)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onFlagClarification(med.id, clarifyNotes[med.id] || 'Clarification requested by pharmacist.');
                            setSelectedMedToClarify(null);
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs"
                        >
                          Send Clarification Flag
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">Ward 4B Pyxis MedStation™ 4000</span>
              </div>
              <span className="text-emerald-400 font-semibold font-mono">Online • Connected to Pharmacy</span>
            </div>

            <div className="divide-y divide-slate-800/80 bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
              {medications.map((med) => (
                <div key={med.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white">{med.genericName} ({med.dose})</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Location: {med.storageLocation}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      In Stock (Qty: 24)
                    </span>
                    <button
                      onClick={() => alert(`Pyxis Drawer unlocked for ${med.genericName}`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
                    >
                      Open Drawer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-xs"
          >
            Close Pharmacy Panel
          </button>
        </div>

      </div>
    </div>
  );
};
