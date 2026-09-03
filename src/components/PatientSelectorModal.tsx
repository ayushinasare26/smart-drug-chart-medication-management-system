import React, { useState } from 'react';
import { Patient, MedicationOrder } from '../types/medication';
import { 
  BedDouble, 
  Search, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  X, 
  User, 
  ChevronRight 
} from 'lucide-react';

interface PatientSelectorModalProps {
  patients: Patient[];
  activePatientId: string;
  medicationsMap: Record<string, MedicationOrder[]>;
  onSelectPatient: (patient: Patient) => void;
  onClose: () => void;
}

export const PatientSelectorModal: React.FC<PatientSelectorModalProps> = ({
  patients,
  activePatientId,
  medicationsMap,
  onSelectPatient,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  const filteredPatients = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.roomBed.toLowerCase().includes(q) ||
      p.primaryDiagnosis.toLowerCase().includes(q) ||
      p.ward.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                Inpatient Bed Map & Patient Directory
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Total Inpatients: {patients.length}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Select Patient Chart
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, MRN, Bed, diagnosis, or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          {filteredPatients.map((pat) => {
            const isActive = pat.id === activePatientId;
            const meds = medicationsMap[pat.id] || [];
            const dueCount = meds.flatMap((m) => m.slots).filter((s) => s.status === 'DUE' || s.status === 'OVERDUE').length;
            const highAlertCount = meds.filter((m) => m.isHighAlert).length;

            return (
              <div
                key={pat.id}
                onClick={() => {
                  onSelectPatient(pat);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-teal-950/40 border-teal-500/80 shadow-lg shadow-teal-950/50 ring-1 ring-teal-500/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={pat.avatarUrl}
                    alt={pat.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-white text-sm truncate">{pat.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-teal-300 border border-slate-700">
                        {pat.roomBed}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {pat.mrn} • {pat.age}y ({pat.gender}) • Wt: {pat.weight || '78 kg'} • {pat.ward}
                    </div>

                    <p className="text-[11px] text-slate-300 truncate mt-1">
                      {pat.primaryDiagnosis}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {dueCount > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        {dueCount} Due Now
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Up to date
                      </span>
                    )}

                    {highAlertCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {highAlertCount} High Alert
                      </span>
                    )}
                  </div>

                  <span className="text-teal-400 text-xs font-semibold flex items-center gap-0.5">
                    {isActive ? 'Current Active Chart' : 'Switch Chart'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-xs"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
};
