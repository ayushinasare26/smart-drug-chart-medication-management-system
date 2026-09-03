import React, { useState } from 'react';
import { ClinicalStaff } from '../types/medication';

interface DoctorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterDoctor: (newDoctor: ClinicalStaff) => void;
}

export const DoctorRegistrationModal: React.FC<DoctorRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterDoctor,
}) => {
  // Form State
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [badgeNumber, setBadgeNumber] = useState(() => `DOC-${Math.floor(10000 + Math.random() * 90000)}`);
  const [department, setDepartment] = useState('Ward 4B - Internal Medicine');
  const [specialty, setSpecialty] = useState('Internal Medicine');
  const [rank, setRank] = useState('Consultant Physician');
  const [email, setEmail] = useState('');
  const [pager, setPager] = useState('');
  const [pin, setPin] = useState('9999');
  const [confirmPin, setConfirmPin] = useState('9999');
  const [isPrescribingAuthorized, setIsPrescribingAuthorized] = useState(true);
  const [isControlledSubstancesAuth, setIsControlledSubstancesAuth] = useState(true);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRegenerateBadge = () => {
    setBadgeNumber(`DOC-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Doctor full name is required';
    if (!licenseNumber.trim()) errs.licenseNumber = 'Medical license / GMC / NPI is required';
    if (!badgeNumber.trim()) errs.badgeNumber = 'Doctor Badge ID is required';
    if (!pin || pin.length < 4) errs.pin = 'PIN must be at least 4 digits';
    if (pin !== confirmPin) errs.confirmPin = 'PINs do not match';
    if (email && !email.includes('@')) errs.email = 'Valid email required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Format doctor name with Dr. prefix if not already present
    let formattedName = name.trim();
    if (!formattedName.toLowerCase().startsWith('dr.') && !formattedName.toLowerCase().startsWith('dr ')) {
      formattedName = `Dr. ${formattedName}`;
    }

    const newDoctor: ClinicalStaff = {
      id: `doc-${Date.now()}`,
      name: formattedName,
      role: 'DOCTOR',
      badgeNumber: badgeNumber.trim().toUpperCase(),
      department: `${department} (${specialty})`,
      pin: pin.trim(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterDoctor(newDoctor);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003d9b] via-[#0052cc] to-[#00687a] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[28px] text-white">stethoscope</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-[22px] font-extrabold tracking-tight">
                  Doctor Registration
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-cyan-100 uppercase tracking-wider">
                  Clinical Credentialing
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                Onboard new physician &amp; activate prescribing privileges
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
          
          {/* Section 1: Physician Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#003d9b] tracking-wider uppercase border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>1. Physician Credentials &amp; Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physician Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alexander Wright, MD"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    className={`w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 border ${
                      errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
                    } text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.name}</p>
                )}
              </div>

              {/* License Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medical License / GMC / NPI <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GMC-892014 or NPI-1948203"
                  value={licenseNumber}
                  onChange={(e) => {
                    setLicenseNumber(e.target.value);
                    if (errors.licenseNumber) setErrors((prev) => ({ ...prev, licenseNumber: '' }));
                  }}
                  className={`w-full h-11 px-3 rounded-xl bg-slate-50 border ${
                    errors.licenseNumber ? 'border-rose-500' : 'border-slate-200'
                  } text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition`}
                />
                {errors.licenseNumber && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.licenseNumber}</p>
                )}
              </div>

              {/* Doctor Badge ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Doctor Badge ID <span className="text-rose-500">*</span>
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
                  className="w-full h-11 px-3 rounded-xl bg-slate-100 border border-slate-200 text-sm font-mono font-bold text-[#003d9b] focus:outline-none focus:border-[#003d9b] transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Specialty & Department */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#003d9b] tracking-wider uppercase border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[18px]">domain</span>
              <span>2. Department &amp; Clinical Specialty</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Ward / Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                >
                  <option value="Ward 4B - Internal Medicine">Ward 4B - Internal Medicine</option>
                  <option value="Acute Surgical Unit 3A">Acute Surgical Unit 3A</option>
                  <option value="ICU - Critical Care Unit">ICU - Critical Care Unit</option>
                  <option value="Cardiology Ward 2B">Cardiology Ward 2B</option>
                  <option value="Emergency Medicine - Trauma">Emergency Medicine - Trauma</option>
                  <option value="Oncology & Hematology 1C">Oncology &amp; Hematology 1C</option>
                  <option value="Pediatrics Ward 5A">Pediatrics Ward 5A</option>
                </select>
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Specialty
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                >
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="General & Laparoscopic Surgery">General &amp; Laparoscopic Surgery</option>
                  <option value="Critical Care / Intensive Care">Critical Care / Intensive Care</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="Neurology">Neurology</option>
                </select>
              </div>

              {/* Clinical Rank */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Rank / Designation
                </label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                >
                  <option value="Consultant Physician">Consultant Physician (Attending)</option>
                  <option value="Specialist Registrar">Specialist Registrar (Fellow)</option>
                  <option value="Senior Resident">Senior Resident</option>
                  <option value="Resident Physician">Resident Physician</option>
                  <option value="Clinical Fellow">Clinical Fellow</option>
                </select>
              </div>

              {/* Official Email / Pager */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital Pager / Contact
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pager #4819 or Ext 2201"
                  value={pager}
                  onChange={(e) => setPager(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Security & Access PIN */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#003d9b] tracking-wider uppercase border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>3. Security PIN &amp; Authentication</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Security PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Security PIN (4-6 digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (errors.pin) setErrors((prev) => ({ ...prev, pin: '' }));
                  }}
                  className={`w-full h-11 px-3 rounded-xl bg-slate-50 border ${
                    errors.pin ? 'border-rose-500' : 'border-slate-200'
                  } text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition`}
                />
                {errors.pin && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.pin}</p>
                )}
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Security PIN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => {
                    setConfirmPin(e.target.value);
                    if (errors.confirmPin) setErrors((prev) => ({ ...prev, confirmPin: '' }));
                  }}
                  className={`w-full h-11 px-3 rounded-xl bg-slate-50 border ${
                    errors.confirmPin ? 'border-rose-500' : 'border-slate-200'
                  } text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition`}
                />
                {errors.confirmPin && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.confirmPin}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Clinical Prescribing Privileges */}
          <div className="space-y-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
            <div className="text-xs font-extrabold text-[#003d9b] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Prescribing Authority &amp; e-Signature Verification</span>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrescribingAuthorized}
                  onChange={(e) => setIsPrescribingAuthorized(e.target.checked)}
                  className="rounded text-[#003d9b] w-4 h-4"
                />
                <span>Enable Inpatient e-Prescribing &amp; Digital Drug Chart Signing</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isControlledSubstancesAuth}
                  onChange={(e) => setIsControlledSubstancesAuth(e.target.checked)}
                  className="rounded text-[#003d9b] w-4 h-4"
                />
                <span>Controlled Substances (Schedule II-V) Authorized</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-6 py-2.5 rounded-xl bg-[#003d9b] hover:bg-[#0052cc] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering Doctor...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Register &amp; Create Doctor Profile</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
