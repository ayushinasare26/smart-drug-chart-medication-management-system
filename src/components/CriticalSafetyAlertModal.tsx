import React, { useState } from 'react';

interface CriticalSafetyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOverride: (justification: string) => void;
  onCancelPrescription: () => void;
  patientName?: string;
  patientId?: string;
  patientDob?: string;
  patientRoom?: string;
  patientAvatar?: string;
  allergen?: string;
  interactionPair?: string;
}

export const CriticalSafetyAlertModal: React.FC<CriticalSafetyAlertModalProps> = ({
  isOpen,
  onClose,
  onOverride,
  onCancelPrescription,
  patientName = 'Robert Jenkins',
  patientId = '#49281',
  patientDob = '12/04/1952',
  patientRoom = 'Room 302',
  patientAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
  allergen = 'Penicillin',
  interactionPair = 'Amoxicillin + Warfarin',
}) => {
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [justification, setJustification] = useState('');

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Large Red Banner Header */}
        <div className="bg-[#ba1a1a] text-white p-5 sm:p-6 relative overflow-hidden">
          {/* Top Navigation Row */}
          <div className="relative z-20 flex items-center justify-between mb-3.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 hover:bg-black/40 active:scale-95 text-white text-xs font-bold backdrop-blur-xs transition cursor-pointer border border-white/20 shadow-xs"
              title="Navigate back"
              aria-label="Navigate back"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 active:scale-95 text-white flex items-center justify-center transition cursor-pointer border border-white/20 shadow-xs"
              title="Close alert"
              aria-label="Close alert"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Subtle background icon */}
          <div className="absolute right-[-10px] top-[-10px] text-white/10 pointer-events-none select-none">
            <span className="material-symbols-outlined text-[130px]">warning</span>
          </div>

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[30px] sm:text-[32px]">warning</span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none">
                CRITICAL SAFETY ALERT
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-red-100 font-medium leading-relaxed">
              Immediate action required before proceeding with prescription.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Patient Info Card */}
          <div className="bg-[#f1f4f6] rounded-2xl p-4 border border-[#e0e3e5] flex items-center gap-3.5">
            <img
              src={patientAvatar}
              alt={patientName}
              className="w-12 h-12 rounded-full object-cover border border-slate-300 shrink-0"
            />
            <div>
              <h4 className="text-sm font-bold text-[#0f172a]">
                Patient: {patientName} (ID: {patientId})
              </h4>
              <p className="text-xs text-[#64748b] mt-0.5">
                DOB: {patientDob} • {patientRoom}
              </p>
            </div>
          </div>

          {/* Warning Card 1: Critical Allergy Detected */}
          <div className="relative bg-rose-50/80 rounded-2xl p-5 border-2 border-rose-400/80 space-y-2 overflow-hidden shadow-xs">
            {/* Molecule watermark */}
            <div className="absolute right-2 top-2 text-rose-200/50 pointer-events-none select-none">
              <span className="material-symbols-outlined text-[80px]">coronavirus</span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">block</span>
                <span>Critical Allergy Detected</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-rose-700 mt-2">
                {allergen}
              </h3>

              <div className="space-y-1 pt-1 text-xs text-[#0f172a]">
                <p>
                  <span className="font-semibold text-slate-700">Severity:</span>{' '}
                  <span className="font-bold text-rose-700">Anaphylaxis</span>
                </p>
                <p className="text-[#64748b]">
                  Recorded: 14 Aug 2018
                </p>
              </div>
            </div>
          </div>

          {/* Warning Card 2: Severe Interaction */}
          <div className="relative bg-amber-50/80 rounded-2xl p-5 border-2 border-amber-400/80 space-y-2 overflow-hidden shadow-xs">
            {/* Interaction watermark */}
            <div className="absolute right-2 top-2 text-amber-200/50 pointer-events-none select-none">
              <span className="material-symbols-outlined text-[80px]">hub</span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">medication_liquid</span>
                <span>Severe Interaction</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-amber-900 mt-2">
                {interactionPair}
              </h3>

              <div className="space-y-1 text-xs text-[#0f172a]">
                <p>
                  <span className="font-semibold text-slate-700">Risk:</span>{' '}
                  <span className="font-bold text-amber-900">Increased Bleeding</span>
                </p>
                <p className="text-[#475569] leading-relaxed">
                  Mechanism: Potential disruption of gut flora affecting Vitamin K synthesis.
                </p>
              </div>
            </div>
          </div>

          {/* Override Form */}
          {showOverrideInput ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Clinical Justification for Override (Mandatory Audit):
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Enter clinical rationale, attending consultation, or patient condition..."
                rows={2}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#003d9b]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideInput(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!justification.trim()}
                  onClick={() => onOverride(justification)}
                  className="px-4 py-1.5 bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl"
                >
                  Confirm Override &amp; Sign
                </button>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          {!showOverrideInput && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onCancelPrescription}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer text-center"
              >
                Cancel Prescription
              </button>

              <button
                type="button"
                onClick={() => setShowOverrideInput(true)}
                className="flex-1 py-3 px-4 bg-[#ba1a1a] hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/20 transition cursor-pointer text-center"
              >
                Override Alert
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
