import React, { useState } from 'react';
import {
  MedicationOrder,
  AdministrationSlot,
  Patient,
  ClinicalStaff
} from '../types/medication';
import {
  CheckCircle2,
  ShieldCheck,
  Barcode,
  AlertTriangle,
  X,
  Heart,
  Activity,
  Key,
  Check,
  HelpCircle,
  UserCheck,
  Sparkles,
  AlertOctagon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdministrationModalProps {
  patient: Patient;
  medication: MedicationOrder;
  slot?: AdministrationSlot;
  isPrn?: boolean;
  staffList: ClinicalStaff[];
  currentStaff: ClinicalStaff;
  onClose: () => void;
  onAdministerSuccess: (data: {
    medicationId: string;
    slotId?: string;
    isPrn?: boolean;
    doseGiven: string;
    vitalsRecorded: { hr?: number; bp?: string; bloodGlucose?: number; painScore?: number };
    witnessId?: string;
    notes?: string;
  }) => void;
  onWithholdSuccess: (data: {
    medicationId: string;
    slotId: string;
    reasonCode: any;
    customReason: string;
  }) => void;
}

export const AdministrationModal: React.FC<AdministrationModalProps> = ({
  patient,
  medication,
  slot,
  isPrn,
  staffList,
  currentStaff,
  onClose,
  onAdministerSuccess,
  onWithholdSuccess,
}) => {
  const [mode, setMode] = useState<'ADMINISTER' | 'WITHHOLD'>('ADMINISTER');

  // 5 Rights checklist state
  const [scannedPatient, setScannedPatient] = useState(false);
  const [scannedMedication, setScannedMedication] = useState(false);
  const [confirmedDose, setConfirmedDose] = useState(true);
  const [confirmedRoute, setConfirmedRoute] = useState(true);
  const [confirmedTime, setConfirmedTime] = useState(true);

  // Vitals entry
  const [hrInput, setHrInput] = useState<number | ''>(patient.vitals.heartRate);
  const [bpSysInput, setBpSysInput] = useState<number | ''>(patient.vitals.bloodPressureSys);
  const [bpDiaInput, setBpDiaInput] = useState<number | ''>(patient.vitals.bloodPressureDia);
  const [glucoseInput, setGlucoseInput] = useState<number | ''>(patient.vitals.bloodGlucose || '');
  const [painInput, setPainInput] = useState<number | ''>(patient.vitals.painScore || 0);

  // Dual witness for high-alert
  const [witnessStaffId, setWitnessStaffId] = useState<string>('');
  const [witnessPin, setWitnessPin] = useState('');
  const [witnessError, setWitnessError] = useState('');

  // Withhold fields
  const [withholdCode, setWithholdCode] = useState<string>('PATIENT_REFUSED');
  const [withholdReason, setWithholdReason] = useState('');

  // Clinical notes
  const [adminNotes, setAdminNotes] = useState('');

  // Vital check alerts
  const isHrLow = typeof hrInput === 'number' && hrInput < 55 && medication.requiresVitalsCheck?.includes('HR');
  const isBpLow = typeof bpSysInput === 'number' && bpSysInput < 90 && medication.requiresVitalsCheck?.includes('BP');

  const handleSimulateScanPatient = () => {
    setScannedPatient(true);
  };

  const handleSimulateScanMed = () => {
    setScannedMedication(true);
  };

  const handleCompleteAdministration = (e: React.FormEvent) => {
    e.preventDefault();

    // If High Alert, check dual witness
    if (medication.isHighAlert) {
      if (!witnessStaffId) {
        setWitnessError('Dual Registered Nurse witness is mandatory for High-Alert medications.');
        return;
      }
      const witness = staffList.find((s) => s.id === witnessStaffId);
      if (!witness || witness.pin !== witnessPin) {
        setWitnessError('Invalid witness PIN entered. Please verify.');
        return;
      }
    }

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    onAdministerSuccess({
      medicationId: medication.id,
      slotId: slot?.id,
      isPrn,
      doseGiven: medication.dose,
      vitalsRecorded: {
        hr: typeof hrInput === 'number' ? hrInput : undefined,
        bp: typeof bpSysInput === 'number' ? `${bpSysInput}/${bpDiaInput}` : undefined,
        bloodGlucose: typeof glucoseInput === 'number' ? glucoseInput : undefined,
        painScore: typeof painInput === 'number' ? painInput : undefined,
      },
      witnessId: witnessStaffId,
      notes: adminNotes,
    });
  };

  const handleCompleteWithhold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    if (!withholdReason.trim()) {
      alert('Please enter a clinical justification note for withholding this dose.');
      return;
    }

    onWithholdSuccess({
      medicationId: medication.id,
      slotId: slot.id,
      reasonCode: withholdCode as any,
      customReason: withholdReason,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${mode === 'ADMINISTER' ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                {mode === 'ADMINISTER' ? 'eMAR Administration Verification' : 'Withhold Prescription'}
              </span>
              {medication.isHighAlert && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/80 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-rose-400" />
                  Dual Witness Required
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {medication.genericName} <span className="text-teal-400 font-mono">{medication.dose}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {medication.form} • Route: <strong className="text-slate-200">{medication.route}</strong> • Patient: <strong className="text-white">{patient.name}</strong> ({patient.roomBed})
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: Administer vs Withhold */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('ADMINISTER')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-2 ${mode === 'ADMINISTER'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Administer Dose</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('WITHHOLD')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-2 ${mode === 'WITHHOLD'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <X className="w-4 h-4" />
            <span>Withhold / Omit Dose</span>
          </button>
        </div>

        {mode === 'ADMINISTER' ? (
          <form onSubmit={handleCompleteAdministration} className="space-y-4">

            {/* 5 Rights Barcode Verification Section */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>The 5 Rights of Medication Administration</span>
                <span className="text-[10px] text-teal-400 font-mono font-semibold">Barcode Verification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Scan Patient Wristband */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition ${scannedPatient
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                  <div className="flex items-center gap-2 text-xs">
                    <Barcode className="w-4 h-4 text-teal-400" />
                    <div>
                      <div className="font-semibold">1. Patient Wristband</div>
                      <div className="text-[10px] text-slate-400 font-mono">{patient.mrn}</div>
                    </div>
                  </div>
                  {scannedPatient ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Scanned
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSimulateScanPatient}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold transition"
                    >
                      Scan Band
                    </button>
                  )}
                </div>

                {/* Scan Medication Barcode */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition ${scannedMedication
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                  <div className="flex items-center gap-2 text-xs">
                    <Barcode className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-semibold">2. Drug Barcode (GS1)</div>
                      <div className="text-[10px] text-slate-400 font-mono">Lot #8849-B</div>
                    </div>
                  </div>
                  {scannedMedication ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSimulateScanMed}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold transition"
                    >
                      Scan Drug
                    </button>
                  )}
                </div>
              </div>

              {/* Rights 3, 4, 5 Quick Confirmation Chips */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                  <span>3. Dose: <strong className="text-white">{medication.dose}</strong></span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                  <span>4. Route: <strong className="text-white">{medication.route.split(' ')[0]}</strong></span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                  <span>5. Time: <strong className="text-white">{slot?.scheduledTime || 'Now'}</strong></span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Pre-Administration Clinical Vitals Parameter Check */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-400" />
                  Pre-Administration Clinical Vitals
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Recorded into chart automatically</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Heart Rate */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={hrInput}
                    onChange={(e) => setHrInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full bg-slate-900 border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none ${isHrLow ? 'border-rose-500 bg-rose-950/30' : 'border-slate-800 focus:border-teal-500'
                      }`}
                  />
                  {isHrLow && (
                    <p className="text-[10px] text-rose-400 font-bold mt-0.5">⚠️ Below 55 bpm!</p>
                  )}
                </div>

                {/* Blood Pressure Sys */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    BP Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={bpSysInput}
                    onChange={(e) => setBpSysInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full bg-slate-900 border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none ${isBpLow ? 'border-rose-500 bg-rose-950/30' : 'border-slate-800 focus:border-teal-500'
                      }`}
                  />
                </div>

                {/* Blood Glucose */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Blood Glucose (mmol/L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 6.4"
                    value={glucoseInput}
                    onChange={(e) => setGlucoseInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Pain Score */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Pain Score (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={painInput}
                    onChange={(e) => setPainInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* High-Alert Dual Witness Verification */}
            {medication.isHighAlert && (
              <div className="bg-rose-950/30 border border-rose-800/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Mandatory Dual Witness Sign-Off (High-Alert Medication)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Two registered nurses must independently check patient identity, drug concentration, calculation, and delivery route.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Select Witnessing RN / Practitioner
                    </label>
                    <select
                      value={witnessStaffId}
                      onChange={(e) => {
                        setWitnessStaffId(e.target.value);
                        setWitnessError('');
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
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
                      Witness Electronic Signature PIN
                    </label>
                    <input
                      type="password"
                      placeholder="Witness PIN (e.g. 4321)"
                      value={witnessPin}
                      onChange={(e) => {
                        setWitnessPin(e.target.value);
                        setWitnessError('');
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {witnessError && (
                  <p className="text-xs text-rose-400 font-semibold">{witnessError}</p>
                )}
              </div>
            )}

            {/* Clinical Admin Notes */}
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Administration Notes / Patient Response (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Patient tolerated well with water, site clean."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
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
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-950/60 transition active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Sign Administration</span>
              </button>
            </div>

          </form>
        ) : (
          <form onSubmit={handleCompleteWithhold} className="space-y-4">
            <div className="bg-rose-950/30 border border-rose-800/50 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Clinical Withhold / Omission Protocol</span>
              </div>
              <p className="text-xs text-slate-300">
                You are recording that this scheduled dose of <strong className="text-white">{medication.genericName}</strong> was intentionally omitted. An audit record will be logged.
              </p>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Reason for Withholding Dose
                </label>
                <select
                  value={withholdCode}
                  onChange={(e) => setWithholdCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="PATIENT_REFUSED">Patient Refused Medication</option>
                  <option value="NPO_FASTING">Patient NPO / Fasting for Procedure</option>
                  <option value="CLINICAL_CONTRAINDICATION">Clinical Contraindication / Vitals Out of Range</option>
                  <option value="AWAITING_LABS">Awaiting Laboratory Blood Results</option>
                  <option value="VITAL_OUT_OF_RANGE">Heart Rate / BP Below Protocol Threshold</option>
                  <option value="MED_UNAVAILABLE">Medication Temporarily Unavailable from Pharmacy</option>
                  <option value="OTHER">Other Clinical Reason</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Detailed Clinical Justification Note *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Heart Rate was 48 bpm prior to dose. Doctor rohan Ross notified and agreed to withhold morning beta-blocker."
                  value={withholdReason}
                  onChange={(e) => setWithholdReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

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
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/60 transition active:scale-95 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Confirm Withhold Record</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
