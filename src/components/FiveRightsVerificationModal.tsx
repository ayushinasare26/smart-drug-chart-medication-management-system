import React, { useState } from 'react';
import { PatientProfile, PrescriptionItem } from '../types/dashboard';

interface FiveRightsVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAdminister: () => void;
  patient: PatientProfile;
  prescription?: PrescriptionItem | null;
}

export const FiveRightsVerificationModal: React.FC<FiveRightsVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirmAdminister,
  patient,
  prescription,
}) => {
  const [checkedSteps, setCheckedSteps] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  if (!isOpen) return null;

  const currentDrug = prescription?.drugName || 'Metformin';
  const currentDose = prescription?.dose || '500mg';
  const currentRoute = prescription?.route?.split(' ')[0] || 'Oral';
  const currentTime = prescription?.timing || '08:00 AM (Scheduled)';

  const toggleStep = (stepNumber: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const allVerified = checkedSteps[1] && checkedSteps[2] && checkedSteps[3] && checkedSteps[4] && checkedSteps[5];

  const handleSelectAll = () => {
    setCheckedSteps({ 1: true, 2: true, 3: true, 4: true, 5: true });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f8fafc] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b] text-[24px]">verified</span>
            <span className="font-bold text-sm text-[#003d9b]">SmartMedChart</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Patient Header Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#003d9b] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[24px]">person</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">
                  {patient.name}
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  DOB: {patient.dob} • MRN: {patient.mrn}
                </p>
              </div>
            </div>

            {patient.allergies && patient.allergies.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-xl text-right shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Allergies:</p>
                <p className="text-xs font-black">{patient.allergies[0].allergen}</p>
              </div>
            )}
          </div>

          {/* Title & Prompt */}
          <div className="text-center space-y-1 py-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#003d9b] tracking-tight">
              5 Rights Verification
            </h2>
            <p className="text-xs sm:text-sm text-[#475569]">
              Please confirm all details before administration.
            </p>
          </div>

          {/* 5 Rights Step Cards */}
          <div className="space-y-3">
            
            {/* Step 1: Right Patient */}
            <div
              onClick={() => toggleStep(1)}
              className={`p-4 rounded-2xl bg-white border transition cursor-pointer flex items-center justify-between shadow-xs ${
                checkedSteps[1] ? 'border-l-4 border-l-[#003d9b] border-[#003d9b]' : 'border-[#e2e8f0]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  checkedSteps[1] ? 'bg-[#003d9b] text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  1
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase block">
                    RIGHT PATIENT
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#0f172a]">
                    {patient.name}
                  </span>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                checkedSteps[1] ? 'border-[#003d9b] bg-[#003d9b] text-white' : 'border-slate-300'
              }`}>
                {checkedSteps[1] && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </div>
            </div>

            {/* Step 2: Right Medicine */}
            <div
              onClick={() => toggleStep(2)}
              className={`p-4 rounded-2xl bg-white border transition cursor-pointer flex items-center justify-between shadow-xs ${
                checkedSteps[2] ? 'border-l-4 border-l-[#003d9b] border-[#003d9b]' : 'border-[#e2e8f0]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  checkedSteps[2] ? 'bg-[#003d9b] text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  2
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase block">
                    RIGHT MEDICINE
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#0f172a]">
                    {currentDrug}
                  </span>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                checkedSteps[2] ? 'border-[#003d9b] bg-[#003d9b] text-white' : 'border-slate-300'
              }`}>
                {checkedSteps[2] && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </div>
            </div>

            {/* Step 3: Right Dose */}
            <div
              onClick={() => toggleStep(3)}
              className={`p-4 rounded-2xl bg-white border transition cursor-pointer flex items-center justify-between shadow-xs ${
                checkedSteps[3] ? 'border-l-4 border-l-[#003d9b] border-[#003d9b]' : 'border-[#e2e8f0]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  checkedSteps[3] ? 'bg-[#003d9b] text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  3
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase block">
                    RIGHT DOSE
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#0f172a]">
                    {currentDose}
                  </span>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                checkedSteps[3] ? 'border-[#003d9b] bg-[#003d9b] text-white' : 'border-slate-300'
              }`}>
                {checkedSteps[3] && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </div>
            </div>

            {/* Step 4: Right Route */}
            <div
              onClick={() => toggleStep(4)}
              className={`p-4 rounded-2xl bg-white border transition cursor-pointer flex items-center justify-between shadow-xs ${
                checkedSteps[4] ? 'border-l-4 border-l-[#003d9b] border-[#003d9b]' : 'border-[#e2e8f0]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  checkedSteps[4] ? 'bg-[#003d9b] text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  4
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase block">
                    RIGHT ROUTE
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#0f172a]">
                    {currentRoute}
                  </span>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                checkedSteps[4] ? 'border-[#003d9b] bg-[#003d9b] text-white' : 'border-slate-300'
              }`}>
                {checkedSteps[4] && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </div>
            </div>

            {/* Step 5: Right Time */}
            <div
              onClick={() => toggleStep(5)}
              className={`p-4 rounded-2xl bg-white border transition cursor-pointer flex items-center justify-between shadow-xs ${
                checkedSteps[5] ? 'border-l-4 border-l-[#003d9b] border-[#003d9b]' : 'border-[#e2e8f0]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  checkedSteps[5] ? 'bg-[#003d9b] text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  5
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase block">
                    RIGHT TIME &amp; FREQUENCY
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#0f172a] block">
                    {prescription?.timing || currentTime}
                  </span>
                  {prescription?.frequency && (
                    <span className="text-xs text-[#003d9b] font-semibold block">
                      {prescription.frequency}
                    </span>
                  )}
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                checkedSteps[5] ? 'border-[#003d9b] bg-[#003d9b] text-white' : 'border-slate-300'
              }`}>
                {checkedSteps[5] && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </div>
            </div>

          </div>

          {/* Quick Check All helper */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-[#003d9b] font-semibold hover:underline"
            >
              Verify All 5 Rights
            </button>
          </div>

          {/* Confirm & Administer Action Button */}
          <button
            type="button"
            disabled={!allVerified}
            onClick={onConfirmAdminister}
            className="w-full py-3.5 bg-[#003d9b] hover:bg-[#0052cc] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-[#003d9b]/25 transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
            <span>Complete Verification &amp; Administer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
