import React, { useState } from 'react';
import { 
  Patient, 
  MedicationOrder, 
  ClinicalStaff 
} from '../types/medication';
import { 
  Droplets, 
  SlidersHorizontal, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCw,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';

interface InfusionManagementModalProps {
  patient: Patient;
  medication: MedicationOrder;
  staffList: ClinicalStaff[];
  currentStaff: ClinicalStaff;
  onClose: () => void;
  onUpdateInfusion: (medId: string, updates: Partial<MedicationOrder>, logNote: string) => void;
}

export const InfusionManagementModal: React.FC<InfusionManagementModalProps> = ({
  patient,
  medication,
  staffList,
  currentStaff,
  onClose,
  onUpdateInfusion,
}) => {
  const [rateMlHr, setRateMlHr] = useState<number>(medication.infusionRateMlHr || 50);
  const [doseRate, setDoseRate] = useState<string>(medication.infusionDoseRate || '');
  const [bagVolume, setBagVolume] = useState<number>(medication.bagVolumeMl || 500);
  const [volumeInfused, setVolumeInfused] = useState<number>(medication.volumeInfusedMl || 0);
  const [lineLocation, setLineLocation] = useState<string>(medication.ivLineLocation || 'Right ACF 20G Cannula');
  const [status, setStatus] = useState<'RUNNING' | 'PAUSED' | 'COMPLETED' | 'STOPPED'>(medication.infusionStatus || 'RUNNING');
  
  // Dual witness
  const [witnessStaffId, setWitnessStaffId] = useState<string>('');
  const [witnessPin, setWitnessPin] = useState('');
  const [witnessError, setWitnessError] = useState('');
  const [changeNote, setChangeNote] = useState('');

  // Quick rate adjust
  const handleRateQuickAdjust = (delta: number) => {
    const newRate = Math.max(0, Number((rateMlHr + delta).toFixed(1)));
    setRateMlHr(newRate);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (medication.isHighAlert) {
      if (!witnessStaffId) {
        setWitnessError('Dual Registered Nurse sign-off is mandatory for smart pump titration.');
        return;
      }
      const witness = staffList.find((s) => s.id === witnessStaffId);
      if (!witness || witness.pin !== witnessPin) {
        setWitnessError('Invalid witness PIN.');
        return;
      }
    }

    const note = changeNote || `Infusion rate adjusted to ${rateMlHr} mL/hr (${doseRate || 'standard dose'}). Status: ${status}.`;

    onUpdateInfusion(
      medication.id,
      {
        infusionRateMlHr: rateMlHr,
        infusionDoseRate: doseRate,
        bagVolumeMl: bagVolume,
        volumeInfusedMl: volumeInfused,
        ivLineLocation: lineLocation,
        infusionStatus: status,
      },
      note
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Smart IV Infusion Pump & Syringe Driver
              </span>
              <span className="text-xs text-slate-400 font-mono">Pump Station #P-109</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {medication.genericName} <span className="text-cyan-400 font-mono">{medication.dose}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Patient: <strong className="text-white">{patient.name}</strong> • Carrier: {medication.carrierFluid || 'Saline 0.9%'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Pump Control Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
            
            {/* Status & Line Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Pump Running Status
                </label>
                <div className="flex items-center gap-2">
                  {(['RUNNING', 'PAUSED', 'STOPPED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        status === st
                          ? st === 'RUNNING'
                            ? 'bg-emerald-600 text-white shadow'
                            : st === 'PAUSED'
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-rose-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {st === 'RUNNING' && <Play className="w-3 h-3 fill-current" />}
                      {st === 'PAUSED' && <Pause className="w-3 h-3 fill-current" />}
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Vascular Access Line / Lumen
                </label>
                <select
                  value={lineLocation}
                  onChange={(e) => setLineLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Right ACF 20G Cannula (Line 1)">Right ACF 20G Cannula (Line 1)</option>
                  <option value="Left Forearm 18G Cannula (Line 2)">Left Forearm 18G Cannula (Line 2)</option>
                  <option value="Right Internal Jugular CVC (Lumen 1 - Medial)">Right Internal Jugular CVC (Lumen 1 - Medial)</option>
                  <option value="Right Internal Jugular CVC (Lumen 2 - Distal)">Right Internal Jugular CVC (Lumen 2 - Distal)</option>
                  <option value="PICC Line - Left Arm">PICC Line - Left Arm</option>
                </select>
              </div>
            </div>

            {/* Rate & Dose Titration */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  Volumetric Infusion Rate (mL/hr)
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  Target MAP / Response Titration
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleRateQuickAdjust(-5)}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center border border-slate-700 transition"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleRateQuickAdjust(-0.5)}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center border border-slate-700 transition"
                >
                  -0.5
                </button>

                <div className="flex-1 text-center">
                  <input
                    type="number"
                    step="0.1"
                    value={rateMlHr}
                    onChange={(e) => setRateMlHr(Number(e.target.value))}
                    className="w-full bg-slate-950 border-2 border-cyan-500/80 rounded-2xl py-2 text-center text-2xl font-mono font-extrabold text-cyan-300 focus:outline-none shadow-inner"
                  />
                  <div className="text-[10px] text-slate-400 font-mono mt-1">mL per hour</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRateQuickAdjust(+0.5)}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center border border-slate-700 transition"
                >
                  +0.5
                </button>
                <button
                  type="button"
                  onClick={() => handleRateQuickAdjust(+5)}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center border border-slate-700 transition"
                >
                  +5
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Active Concentration / Weight-Based Dose Rate
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0.04 mcg/kg/min or 3.3 mmol/hr"
                  value={doseRate}
                  onChange={(e) => setDoseRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bag Volume & VTBI (Volume to be infused) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Total Bag Volume (mL)
                </label>
                <input
                  type="number"
                  value={bagVolume}
                  onChange={(e) => setBagVolume(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Volume Infused so Far (mL)
                </label>
                <input
                  type="number"
                  value={volumeInfused}
                  onChange={(e) => setVolumeInfused(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* Dual Witness Requirement for High-Alert Infusions */}
          {medication.isHighAlert && (
            <div className="bg-rose-950/30 border border-rose-800/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Dual Witness Independent Check (Mandatory for Infusion Changes)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Witnessing Registered Nurse
                  </label>
                  <select
                    value={witnessStaffId}
                    onChange={(e) => {
                      setWitnessStaffId(e.target.value);
                      setWitnessError('');
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">-- Select Witnessing Nurse --</option>
                    {staffList
                      .filter((s) => s.id !== currentStaff.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.badgeNumber})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Witness PIN
                  </label>
                  <input
                    type="password"
                    placeholder="Witness PIN (e.g. 4321)"
                    value={witnessPin}
                    onChange={(e) => {
                      setWitnessPin(e.target.value);
                      setWitnessError('');
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {witnessError && (
                <p className="text-xs text-rose-400 font-semibold">{witnessError}</p>
              )}
            </div>
          )}

          {/* Clinical Justification Note */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">
              Clinical Note for Infusion Adjustment
            </label>
            <input
              type="text"
              placeholder="e.g. Titrated up by 0.5 mL/hr as MAP was 62 mmHg."
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/60 transition active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Pump Settings</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
