import React, { useState } from 'react';
import { PatientProfile } from '../types/dashboard';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterPatient: (newPatient: PatientProfile) => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterPatient,
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('1985-05-15');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [contactPhone, setContactPhone] = useState('+1 (555) 234-8901');
  
  // Hospital Assignment
  const [uhid, setUhid] = useState(() => `UHID-${Math.floor(100000 + Math.random() * 900000)}`);
  const [mrn, setMrn] = useState(() => `MRN-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [ward, setWard] = useState('Ward 4B - Internal Medicine');
  const [roomBed, setRoomBed] = useState('Bed 412');
  const [consultant, setConsultant] = useState('Dr. Sarah Chen, MD');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [resuscitationStatus, setResuscitationStatus] = useState<'FULL_CODE' | 'DNACPR' | 'LIMITED_INTERVENTION'>('FULL_CODE');

  // Baseline Vitals
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [hr, setHr] = useState('74');
  const [temp, setTemp] = useState('98.6');
  const [spo2, setSpo2] = useState('98');
  const [respRate, setRespRate] = useState('16');

  // Allergy Info
  const [hasAllergy, setHasAllergy] = useState(false);
  const [allergen, setAllergen] = useState('');
  const [allergyReaction, setAllergyReaction] = useState('');
  const [allergySeverity, setAllergySeverity] = useState<'CRITICAL_ANAPHYLAXIS' | 'MODERATE' | 'MILD'>('MODERATE');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate age from DOB
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 35;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const handleRegenerateIds = () => {
    setUhid(`UHID-${Math.floor(100000 + Math.random() * 900000)}`);
    setMrn(`MRN-${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Patient full name is required';
    if (!dob) errs.dob = 'Date of birth is required';
    if (!primaryDiagnosis.trim()) errs.primaryDiagnosis = 'Primary diagnosis is required';
    if (!ward) errs.ward = 'Ward selection is required';
    if (!roomBed.trim()) errs.roomBed = 'Bed number is required';
    if (hasAllergy && !allergen.trim()) errs.allergen = 'Please specify the allergen';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const calculatedAge = calculateAge(dob);
    
    // Choose realistic avatar based on gender
    const avatarUrl =
      gender === 'Female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';

    const newPatient: PatientProfile = {
      id: `pat-${Date.now()}`,
      name: fullName.trim(),
      uhid: uhid.trim(),
      mrn: mrn.trim(),
      dob: dob,
      age: calculatedAge,
      gender: gender,
      ward: ward,
      roomBed: roomBed.trim(),
      bloodGroup: bloodGroup,
      admittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatarUrl: avatarUrl,
      primaryDiagnosis: primaryDiagnosis.trim(),
      isCritical: isCritical,
      allergies: hasAllergy && allergen.trim()
        ? [
            {
              allergen: allergen.trim(),
              reaction: allergyReaction.trim() || 'Documented sensitivity during registration admission triage.',
              severity: allergySeverity,
              recordedDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            },
          ]
        : [],
      vitals: {
        bp: `${bpSys || '120'}/${bpDia || '80'}`,
        hr: parseInt(hr, 10) || 74,
        temp: parseFloat(temp) || 98.6,
        tempUnit: '°F',
        spo2: parseInt(spo2, 10) || 98,
        respiratoryRate: parseInt(respRate, 10) || 16,
        lastUpdated: 'Just now',
        eGFR: 85,
      },
      prescriptions: [],
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterPatient(newPatient);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003d9b] to-[#00687a] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[28px] text-white">person_add</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-22px font-extrabold tracking-tight">
                  New Patient Admission
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-teal-100 uppercase tracking-wider">
                  eMAR Registration
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                Register new inpatient &amp; generate digital drug chart
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Demographics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#003d9b] tracking-wider uppercase border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>1. Patient Demographics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johnathan Hayes"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    className={`w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 border ${
                      errors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
                    } text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`h-11 rounded-xl text-xs font-bold transition border ${
                        gender === g
                          ? 'bg-[#003d9b] text-white border-[#003d9b] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* DOB & Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth <span className="text-slate-400 font-normal">({calculateAge(dob)} yrs)</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hospital & Admission Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#003d9b] tracking-wider uppercase">
                <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                <span>2. Hospital &amp; Admission Assignment</span>
              </div>
              <button
                type="button"
                onClick={handleRegenerateIds}
                className="text-[11px] font-bold text-[#00687a] hover:underline flex items-center gap-1"
                title="Regenerate UHID & MRN"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Auto IDs
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* UHID & MRN preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">UHID</label>
                <input
                  type="text"
                  value={uhid}
                  onChange={(e) => setUhid(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-100 border border-slate-200 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-[#003d9b] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MRN Number</label>
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-100 border border-slate-200 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-[#003d9b] transition"
                />
              </div>

              {/* Ward Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ward Assignment <span className="text-rose-500">*</span>
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                >
                  <option value="Ward 4B - Internal Medicine">Ward 4B - Internal Medicine</option>
                  <option value="Acute Surgical Unit 3A">Acute Surgical Unit 3A</option>
                  <option value="ICU - Critical Care">ICU - Critical Care Unit</option>
                  <option value="Cardiology Ward 2B">Cardiology Ward 2B</option>
                  <option value="Oncology & Palliative 1C">Oncology &amp; Palliative 1C</option>
                  <option value="Emergency Department - Triage">Emergency Department - Triage</option>
                </select>
              </div>

              {/* Bed */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Room / Bed <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bed 412"
                  value={roomBed}
                  onChange={(e) => setRoomBed(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                />
              </div>

              {/* Attending Consultant */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attending Consultant</label>
                <select
                  value={consultant}
                  onChange={(e) => setConsultant(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                >
                  <option value="Dr. Sarah Chen, MD">Dr. Sarah Chen, MD (Cardiology)</option>
                  <option value="Dr. Julian Ross, MD">Dr. Julian Ross, MD (Internal Med)</option>
                  <option value="Dr. Marcus Vance, MD">Dr. Marcus Vance, MD (Surgery)</option>
                  <option value="Dr. Aisha Patel, MD">Dr. Aisha Patel, MD (Intensivist)</option>
                </select>
              </div>

              {/* Resuscitation Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Code Status</label>
                <select
                  value={resuscitationStatus}
                  onChange={(e) => setResuscitationStatus(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition"
                >
                  <option value="FULL_CODE">Full Code (Resuscitation Active)</option>
                  <option value="DNACPR">DNACPR (Do Not Resuscitate)</option>
                  <option value="LIMITED_INTERVENTION">Limited Intervention</option>
                </select>
              </div>

              {/* Primary Diagnosis */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Diagnosis / Reason for Admission <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Community-Acquired Pneumonia with mild respiratory distress"
                  value={primaryDiagnosis}
                  onChange={(e) => {
                    setPrimaryDiagnosis(e.target.value);
                    if (errors.primaryDiagnosis) setErrors((prev) => ({ ...prev, primaryDiagnosis: '' }));
                  }}
                  className={`w-full h-11 px-3 rounded-xl bg-slate-50 border ${
                    errors.primaryDiagnosis ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'
                  } text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#003d9b] focus:bg-white transition`}
                />
                {errors.primaryDiagnosis && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.primaryDiagnosis}</p>
                )}
              </div>

              {/* Critical Toggle */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCritical}
                    onChange={(e) => setIsCritical(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">warning</span>
                      High-Risk / Critical Monitoring Patient
                    </span>
                    <p className="text-[11px] text-amber-700">
                      Flags this patient for continuous vital alert monitoring and frequent nurse check-ins.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Vitals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#003d9b] tracking-wider uppercase border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-[18px]">ecg_heart</span>
              <span>3. Initial Admission Vitals</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">BP (mmHg)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                    placeholder="120"
                    className="w-full h-10 px-2 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                    placeholder="80"
                    className="w-full h-10 px-2 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  placeholder="74"
                  className="w-full h-10 px-2 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="98.6"
                  className="w-full h-10 px-2 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  placeholder="98"
                  className="w-full h-10 px-2 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Resp Rate (/min)</label>
                <input
                  type="number"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  placeholder="16"
                  className="w-full h-10 px-2 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Allergies */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#003d9b] tracking-wider uppercase">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span>4. Allergy Profile</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAllergy}
                  onChange={(e) => setHasAllergy(e.target.checked)}
                  className="rounded text-[#003d9b]"
                />
                <span>Documented Known Allergy</span>
              </label>
            </div>

            {hasAllergy ? (
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-rose-900 mb-1">
                      Allergen <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Penicillin, NSAIDs, Latex"
                      value={allergen}
                      onChange={(e) => setAllergen(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-rose-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-900 mb-1">Severity</label>
                    <select
                      value={allergySeverity}
                      onChange={(e) => setAllergySeverity(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-rose-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                    >
                      <option value="CRITICAL_ANAPHYLAXIS">CRITICAL - Anaphylaxis / Airway Risk</option>
                      <option value="MODERATE">Moderate - Urticaria / Angioedema</option>
                      <option value="MILD">Mild - Rash / GI Upset</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-rose-900 mb-1">Clinical Reaction Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Causes severe bronchospasm and facial swelling"
                      value={allergyReaction}
                      onChange={(e) => setAllergyReaction(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-rose-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>No Known Drug Allergies (NKDA) recorded on admission.</span>
              </div>
            )}
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Register &amp; Create Chart</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
