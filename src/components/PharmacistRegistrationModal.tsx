import React, { useState } from 'react';
import { ClinicalStaff } from '../types/medication';

interface PharmacistRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterPharmacist: (newPharmacist: ClinicalStaff) => void;
}

export const PharmacistRegistrationModal: React.FC<PharmacistRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterPharmacist,
}) => {
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [badgeNumber, setBadgeNumber] = useState(() => `PH-${Math.floor(10000 + Math.random() * 90000)}`);
  const [department, setDepartment] = useState('Clinical Pharmacy Services');
  const [specialty, setSpecialty] = useState('Inpatient Clinical Triage & Dispensing');
  const [pin, setPin] = useState('7777');
  const [confirmPin, setConfirmPin] = useState('7777');
  const [isVerificationAuthorized, setIsVerificationAuthorized] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRegenerateBadge = () => {
    setBadgeNumber(`PH-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Pharmacist name is required';
    if (!licenseNumber.trim()) errs.licenseNumber = 'Pharmacy board license / RPh is required';
    if (!badgeNumber.trim()) errs.badgeNumber = 'Pharmacist Badge ID is required';
    if (!pin || pin.length < 4) errs.pin = 'PIN must be at least 4 digits';
    if (pin !== confirmPin) errs.confirmPin = 'PINs do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const newPharmacist: ClinicalStaff = {
      id: `pharm-${Date.now()}`,
      name: name.trim(),
      role: 'PHARMACIST',
      badgeNumber: badgeNumber.trim().toUpperCase(),
      department: `${department} (${specialty})`,
      pin: pin.trim(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterPharmacist(newPharmacist);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#00687a] via-[#00828a] to-[#003d9b] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[28px] text-white">local_pharmacy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-[22px] font-extrabold tracking-tight">
                  Pharmacist Registration
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-cyan-100 uppercase tracking-wider">
                  Pharmacy Credentialing
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-100/90 mt-0.5">
                Register clinical pharmacist &amp; activate dispensing authority
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#00687a] tracking-wider uppercase border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>1. Pharmacist Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pharmacist Full Name &amp; Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Patel, BPharm / James Wilson, PharmD"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#00687a] focus:bg-white transition"
                />
                {errors.name && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pharmacy Board License # <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RPH-948201"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#00687a] focus:bg-white transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Pharmacist Badge ID <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateBadge}
                    className="text-[10px] font-bold text-[#00687a] hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[13px]">refresh</span>
                    Auto ID
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-100 border border-slate-200 text-sm font-mono font-bold text-[#00687a] focus:outline-none focus:border-[#00687a] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pharmacy Section
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#00687a] focus:bg-white transition"
                >
                  <option value="Clinical Pharmacy Services">Clinical Pharmacy Services</option>
                  <option value="Central Inpatient Dispensary">Central Inpatient Dispensary</option>
                  <option value="ICU & Antimicrobial Stewardship">ICU &amp; Antimicrobial Stewardship</option>
                  <option value="Oncology Pharmacy Satellite">Oncology Pharmacy Satellite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Role
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#00687a] focus:bg-white transition"
                >
                  <option value="Inpatient Clinical Triage & Dispensing">Inpatient Clinical Triage &amp; Dispensing</option>
                  <option value="Ward Clinical Pharmacist">Ward Clinical Pharmacist</option>
                  <option value="Lead Dispensing Specialist">Lead Dispensing Specialist</option>
                  <option value="Formulary & Stock Controller">Formulary &amp; Stock Controller</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#00687a] tracking-wider uppercase border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>2. Security PIN</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Security PIN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-[#00687a] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Security PIN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-[#00687a] focus:bg-white transition"
                />
                {errors.confirmPin && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.confirmPin}</p>}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200">
            <label className="flex items-center gap-2.5 text-xs font-bold text-teal-900 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerificationAuthorized}
                onChange={(e) => setIsVerificationAuthorized(e.target.checked)}
                className="rounded text-[#00687a] w-4 h-4"
              />
              <span>Authorized for Prescription Verification &amp; Pyxis Cabinet Dispensing</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#00687a] hover:bg-[#00505e] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? 'Registering...' : 'Register & Create Pharmacist Profile'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
