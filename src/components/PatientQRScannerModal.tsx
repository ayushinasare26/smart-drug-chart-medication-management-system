import React, { useState } from 'react';
import { PatientProfile } from '../types/dashboard';

interface PatientQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientProfile[];
  onScanPatient: (patientId: string) => void;
}

export const PatientQRScannerModal: React.FC<PatientQRScannerModalProps> = ({
  isOpen,
  onClose,
  patients,
  onScanPatient,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanningActive, setIsScanningActive] = useState(true);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const query = manualCode.trim().toLowerCase();
    const matched = patients.find(
      (p) =>
        p.id.toLowerCase() === query ||
        p.uhid.toLowerCase() === query ||
        p.mrn.toLowerCase() === query ||
        p.name.toLowerCase().includes(query) ||
        (p.qrCode && p.qrCode.toLowerCase().includes(query))
    );

    if (matched) {
      onScanPatient(matched.id);
    } else {
      alert(`No patient found matching code: "${manualCode}"`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700 my-auto space-y-5 p-5 sm:p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Inpatient QR Scanner
              </h3>
              <p className="text-xs text-slate-400">
                Scan patient wristband to open electronic profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Viewfinder Camera Frame with Laser Scanning Line */}
        <div className="relative w-56 h-56 mx-auto rounded-2xl bg-slate-950 border-2 border-cyan-400/80 flex flex-col items-center justify-center overflow-hidden shadow-inner shadow-cyan-500/20">
          {/* Animated Laser Line */}
          {isScanningActive && (
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 animate-bounce duration-1000"></div>
          )}

          {/* Corner Brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-sm"></div>

          <span className="material-symbols-outlined text-[52px] text-cyan-400/60 animate-pulse">
            qr_code_2
          </span>
          <span className="text-[11px] font-mono text-cyan-300 mt-2 px-3 py-1 bg-slate-900/90 rounded-full border border-cyan-500/30">
            Align Patient Wristband QR
          </span>
        </div>

        {/* 1-Tap Quick Scan Patient Wristband Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Tap to Scan Inpatient Wristband:
            </span>
            <span className="text-slate-500 text-[10px] font-mono">1-Tap Verification</span>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
            {patients.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onScanPatient(p.id)}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700/80 hover:border-cyan-500/60 flex items-center justify-between gap-3 text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition flex items-center gap-1.5">
                      <span>{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded font-mono">
                        {p.uhid}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {p.ward}, {p.roomBed} • Weight: {p.weight || '78 kg'}
                    </p>
                  </div>
                </div>

                <div className="px-2.5 py-1 bg-cyan-500/10 group-hover:bg-cyan-500 text-cyan-400 group-hover:text-slate-950 rounded-lg text-[11px] font-bold flex items-center gap-1 transition">
                  <span className="material-symbols-outlined text-[14px]">qr_code</span>
                  <span>Scan</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual UHID / QR Entry */}
        <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Or enter UHID (e.g. UHID123456)..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#003d9b] hover:bg-[#0052cc] active:scale-95 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
            >
              Verify
            </button>
          </div>
        </form>

        {/* Footer Cancel Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
