import React, { useState } from 'react';
import { ClinicalStaff, UserRole } from '../types/medication';

interface AdminStaffEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollStaff: (newStaff: ClinicalStaff) => void;
  initialRole?: 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'OTHER_STAFF';
}

export const AdminStaffEnrollmentModal: React.FC<AdminStaffEnrollmentModalProps> = ({
  isOpen,
  onClose,
  onEnrollStaff,
  initialRole = 'DOCTOR',
}) => {
  const [activeTab, setActiveTab] = useState<'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'OTHER_STAFF'>(initialRole);

  // Common & Dynamic Fields
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [badgeNumber, setBadgeNumber] = useState(() => `DOC-${Math.floor(10000 + Math.random() * 90000)}`);
  const [department, setDepartment] = useState('Ward 4B (Acute Medicine)');
  const [specialty, setSpecialty] = useState('Internal Medicine');
  const [designation, setDesignation] = useState('Consultant Physician');
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT' | 'ROTATING'>('MORNING');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('9999');
  const [confirmPin, setConfirmPin] = useState('9999');

  // Other staff specific role category
  const [otherRoleType, setOtherRoleType] = useState<string>('Medical Lab Technologist');

  // Privileges checkboxes
  const [privileges, setPrivileges] = useState<Record<string, boolean>>({
    prescribe: true,
    controlledSubstances: true,
    administerMeds: true,
    infusions: true,
    pharmacyVerify: true,
    labAccess: true,
    dualSignoff: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle Tab Switch & update default prefixes/badges
  const handleTabChange = (tab: 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'OTHER_STAFF') => {
    setActiveTab(tab);
    setErrors({});
    const randomCode = Math.floor(10000 + Math.random() * 90000);

    if (tab === 'DOCTOR') {
      setBadgeNumber(`DOC-${randomCode}`);
      setDepartment('Ward 4B (Acute Medicine)');
      setSpecialty('Internal Medicine');
      setDesignation('Consultant Physician');
      setPin('9999');
      setConfirmPin('9999');
    } else if (tab === 'NURSE') {
      setBadgeNumber(`RN-${randomCode}`);
      setDepartment('Ward 4B (Acute Medicine)');
      setSpecialty('Acute Inpatient Nursing');
      setDesignation('Staff Registered Nurse');
      setPin('1234');
      setConfirmPin('1234');
    } else if (tab === 'PHARMACIST') {
      setBadgeNumber(`PH-${randomCode}`);
      setDepartment('Clinical Pharmacy Services');
      setSpecialty('Inpatient Dispensing & Pharmacotherapy');
      setDesignation('Clinical Specialist Pharmacist');
      setPin('7777');
      setConfirmPin('7777');
    } else {
      setBadgeNumber(`STAFF-${randomCode}`);
      setDepartment('Central Pathology & Diagnostics');
      setSpecialty('Diagnostic Support Services');
      setDesignation('Medical Lab Technologist');
      setPin('1234');
      setConfirmPin('1234');
    }
  };

  const handleRegenerateBadge = () => {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const prefix =
      activeTab === 'DOCTOR'
        ? 'DOC'
        : activeTab === 'NURSE'
        ? 'RN'
        : activeTab === 'PHARMACIST'
        ? 'PH'
        : otherRoleType === 'Medical Lab Technologist'
        ? 'LT'
        : otherRoleType === 'Radiologic Technologist'
        ? 'RT'
        : otherRoleType === 'Phlebotomist'
        ? 'PT'
        : 'STAFF';
    setBadgeNumber(`${prefix}-${randomCode}`);
  };

  const togglePrivilege = (key: string) => {
    setPrivileges((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full staff name is required';
    if (!licenseNumber.trim()) errs.licenseNumber = 'Professional license / Council registration ID is required';
    if (!badgeNumber.trim()) errs.badgeNumber = 'Employee badge ID is required';
    if (!pin || pin.length < 4) errs.pin = 'PIN must be at least 4 digits';
    if (pin !== confirmPin) errs.confirmPin = 'Security PINs do not match';
    if (email && !email.includes('@')) errs.email = 'Valid institutional email required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Format Name based on role
    let formattedName = fullName.trim();
    if (activeTab === 'DOCTOR') {
      if (!formattedName.toLowerCase().startsWith('dr.') && !formattedName.toLowerCase().startsWith('dr ')) {
        formattedName = `Dr. ${formattedName}`;
      }
      if (!formattedName.includes('MD') && !formattedName.includes('MBBS') && !formattedName.includes('DO')) {
        formattedName = `${formattedName}, MD`;
      }
    } else if (activeTab === 'NURSE') {
      if (!formattedName.includes('RN') && !formattedName.includes('BSN') && !formattedName.includes('NP')) {
        formattedName = `${formattedName}, RN`;
      }
    } else if (activeTab === 'PHARMACIST') {
      if (!formattedName.includes('BPharm') && !formattedName.includes('PharmD') && !formattedName.includes('RPh')) {
        formattedName = `${formattedName}, PharmD`;
      }
    }

    // Determine final UserRole
    let finalRole: UserRole = 'DOCTOR';
    if (activeTab === 'NURSE') {
      finalRole = designation.toLowerCase().includes('charge') ? 'CHARGE_NURSE' : 'NURSE';
    } else if (activeTab === 'PHARMACIST') {
      finalRole = 'PHARMACIST';
    } else if (activeTab === 'OTHER_STAFF') {
      finalRole = 'OTHER_STAFF';
    }

    // Role-based avatar
    const avatarUrl =
      activeTab === 'DOCTOR'
        ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
        : activeTab === 'NURSE'
        ? 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80'
        : activeTab === 'PHARMACIST'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

    const newStaff: ClinicalStaff = {
      id: `staff-${activeTab.toLowerCase()}-${Date.now()}`,
      name: formattedName,
      role: finalRole,
      badgeNumber: badgeNumber.trim().toUpperCase(),
      department: department.trim(),
      specialty: activeTab === 'OTHER_STAFF' ? otherRoleType : specialty,
      designation: activeTab === 'OTHER_STAFF' ? otherRoleType : designation,
      licenseNumber: licenseNumber.trim().toUpperCase(),
      pin: pin.trim(),
      email: email.trim() || `${fullName.trim().toLowerCase().replace(/\s+/g, '.')}@smartmed.org`,
      phone: phone.trim() || '+1 (555) 019-8000',
      shift,
      status: 'ON_DUTY',
      enrolledDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatarUrl,
      permissions: Object.entries(privileges)
        .filter(([_, enabled]) => enabled)
        .map(([k]) => k.toUpperCase()),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onEnrollStaff(newStaff);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header with Hospital Admin Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#003d9b] to-[#00687a] p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner text-cyan-300">
              <span className="material-symbols-outlined text-[30px]">how_to_reg</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Hospital Staff Enrollment Hub
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-cyan-200 uppercase tracking-wider border border-white/20">
                  Admin Authority
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                Credential and activate new hospital personnel into SmartMedChart eMAR
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Close enrollment modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Role Tabs Selection Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 pt-3 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-3">
            <button
              type="button"
              onClick={() => handleTabChange('DOCTOR')}
              className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                activeTab === 'DOCTOR'
                  ? 'bg-white text-[#003d9b] border-[#003d9b]/30 shadow-md ring-2 ring-[#003d9b]/20'
                  : 'bg-slate-200/70 text-slate-600 border-transparent hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#003d9b]">stethoscope</span>
              <span>1. Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('NURSE')}
              className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                activeTab === 'NURSE'
                  ? 'bg-white text-emerald-700 border-emerald-500/30 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-slate-200/70 text-slate-600 border-transparent hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600">medical_services</span>
              <span>2. Nurse / RN</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('PHARMACIST')}
              className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                activeTab === 'PHARMACIST'
                  ? 'bg-white text-[#00687a] border-[#00687a]/30 shadow-md ring-2 ring-[#00687a]/20'
                  : 'bg-slate-200/70 text-slate-600 border-transparent hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#00687a]">local_pharmacy</span>
              <span>3. Pharmacist</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('OTHER_STAFF')}
              className={`py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                activeTab === 'OTHER_STAFF'
                  ? 'bg-white text-purple-800 border-purple-500/30 shadow-md ring-2 ring-purple-500/20'
                  : 'bg-slate-200/70 text-slate-600 border-transparent hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-purple-700">biomedical</span>
              <span>4. Other Staff</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Form Fields */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Section 1: Staff Identification */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-[#003d9b]">badge</span>
                  <span>Personal &amp; Professional Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-800">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={
                        activeTab === 'DOCTOR'
                          ? 'e.g. Alexander Wright'
                          : activeTab === 'NURSE'
                          ? 'e.g. Clara Oswald'
                          : activeTab === 'PHARMACIST'
                          ? 'e.g. Elena Gilbert'
                          : 'e.g. David Kim'
                      }
                      className={`w-full h-11 px-3.5 bg-white border rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 ${
                        errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-[#003d9b]'
                      }`}
                      required
                    />
                    {errors.fullName && <p className="text-[11px] text-rose-600 font-semibold">{errors.fullName}</p>}
                  </div>

                  {/* Professional License No */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      {activeTab === 'DOCTOR'
                        ? 'Medical License / GMC / NPI'
                        : activeTab === 'NURSE'
                        ? 'Nursing Council License / RN'
                        : activeTab === 'PHARMACIST'
                        ? 'Pharmacy Board License / RPh'
                        : 'Professional License / Cert ID'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder={
                        activeTab === 'DOCTOR'
                          ? 'e.g. GMC-948102'
                          : activeTab === 'NURSE'
                          ? 'e.g. RN-882194'
                          : activeTab === 'PHARMACIST'
                          ? 'e.g. RPH-394012'
                          : 'e.g. MLS-44201'
                      }
                      className={`w-full h-11 px-3.5 bg-white border rounded-xl text-xs sm:text-sm font-semibold text-slate-900 uppercase focus:outline-none focus:ring-2 ${
                        errors.licenseNumber ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-[#003d9b]'
                      }`}
                      required
                    />
                    {errors.licenseNumber && <p className="text-[11px] text-rose-600 font-semibold">{errors.licenseNumber}</p>}
                  </div>

                  {/* Badge ID with Auto-Regenerate */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Employee Badge ID <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRegenerateBadge}
                        className="text-[10px] font-bold text-[#003d9b] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px]">refresh</span>
                        <span>Auto-ID</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-[#003d9b] focus:outline-none focus:ring-2 focus:ring-blue-100 uppercase"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Department, Specialty & Shift */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-teal-600">domain</span>
                  <span>Clinical Assignment &amp; Shift</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Type (For Other Staff) */}
                  {activeTab === 'OTHER_STAFF' && (
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-800">
                        Staff Role Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={otherRoleType}
                        onChange={(e) => {
                          setOtherRoleType(e.target.value);
                          if (e.target.value === 'Medical Lab Technologist') {
                            setDepartment('Central Pathology & Blood Bank');
                            setBadgeNumber(`LT-${Math.floor(10000 + Math.random() * 90000)}`);
                          } else if (e.target.value === 'Radiologic Technologist') {
                            setDepartment('Diagnostic Radiology & CT Imaging');
                            setBadgeNumber(`RT-${Math.floor(10000 + Math.random() * 90000)}`);
                          } else if (e.target.value === 'Phlebotomist') {
                            setDepartment('Vascular Access & Phlebotomy Team');
                            setBadgeNumber(`PT-${Math.floor(10000 + Math.random() * 90000)}`);
                          } else if (e.target.value === 'Physiotherapist / OT') {
                            setDepartment('Inpatient Physical Rehabilitation');
                            setBadgeNumber(`PT-${Math.floor(10000 + Math.random() * 90000)}`);
                          } else {
                            setDepartment('Hospital Operations & Administration');
                            setBadgeNumber(`STAFF-${Math.floor(10000 + Math.random() * 90000)}`);
                          }
                        }}
                        className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Medical Lab Technologist">Medical Lab Technologist (MLS / Hematology)</option>
                        <option value="Radiologic Technologist">Radiologic / CT Technologist (ARRT)</option>
                        <option value="Phlebotomist">Clinical Phlebotomy Specialist (CPT)</option>
                        <option value="Physiotherapist / OT">Physiotherapist / Occupational Therapist</option>
                        <option value="Ward Clerk / Coordinator">Ward Coordinator / Clinical Clerk</option>
                        <option value="Biomedical Engineer">Biomedical Device Engineer</option>
                        <option value="Hospital Security / Operations">Hospital Safety &amp; Operations Officer</option>
                      </select>
                    </div>
                  )}

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Assigned Department / Ward <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Ward 4B (Acute Medicine)">Ward 4B (Acute Medicine)</option>
                      <option value="Cardiology Step-Down (CSU)">Cardiology Step-Down (CSU)</option>
                      <option value="ICU / High Dependency">ICU / High Dependency</option>
                      <option value="Ward 2A (Post-Op Surgical)">Ward 2A (Post-Op Surgical)</option>
                      <option value="Respiratory Care Unit (RCU)">Respiratory Care Unit (RCU)</option>
                      <option value="Emergency & Trauma Unit">Emergency &amp; Trauma Unit</option>
                      <option value="Clinical Pharmacy Services">Clinical Pharmacy Services</option>
                      <option value="Central Pathology & Blood Bank">Central Pathology &amp; Blood Bank</option>
                      <option value="Diagnostic Radiology & CT Imaging">Diagnostic Radiology &amp; CT Imaging</option>
                      <option value="Inpatient Pediatrics 3C">Inpatient Pediatrics 3C</option>
                      <option value="Oncology Care Unit">Oncology Care Unit</option>
                    </select>
                  </div>

                  {/* Specialty / Subspecialty */}
                  {activeTab !== 'OTHER_STAFF' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">
                        {activeTab === 'DOCTOR' ? 'Medical Specialty' : activeTab === 'NURSE' ? 'Nursing Role / Rank' : 'Pharmacy Specialty'}
                      </label>
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        {activeTab === 'DOCTOR' ? (
                          <>
                            <option value="Internal Medicine">Internal Medicine &amp; Geriatrics</option>
                            <option value="Cardiology">Cardiology &amp; Heart Failure</option>
                            <option value="General Surgery">Trauma &amp; General Surgery</option>
                            <option value="Critical Care & ICU">Intensive Care &amp; Resuscitation</option>
                            <option value="Pulmonology">Pulmonology &amp; Respiratory</option>
                            <option value="Pediatrics">Inpatient Pediatrics</option>
                            <option value="Oncology">Medical Oncology &amp; Palliative</option>
                            <option value="Anesthesiology">Anesthesiology &amp; Pain</option>
                          </>
                        ) : activeTab === 'NURSE' ? (
                          <>
                            <option value="Acute Inpatient Nursing">Staff Registered Nurse (RN)</option>
                            <option value="Ward Charge Nurse">Ward Charge Nurse (CN)</option>
                            <option value="ICU / HDU Critical Care">ICU / Critical Care Specialist</option>
                            <option value="Nurse Practitioner">Advanced Practice Nurse (APRN)</option>
                            <option value="IV Infusion Specialist">IV &amp; Vascular Access Nurse</option>
                          </>
                        ) : (
                          <>
                            <option value="Inpatient Dispensing & Pharmacotherapy">Inpatient Pharmacotherapy &amp; Triage</option>
                            <option value="Critical Care Pharmacy">ICU &amp; Emergency Pharmacy</option>
                            <option value="Oncology Chemotherapy Compounding">Oncology Compounding &amp; Dosing</option>
                            <option value="Antimicrobial Stewardship">Infectious Disease Stewardship</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Shift Selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Assigned Shift Schedule</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as any)}
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="MORNING">Morning Shift (07:00 - 15:30)</option>
                      <option value="EVENING">Evening Shift (15:00 - 23:30)</option>
                      <option value="NIGHT">Night Shift (23:00 - 07:30)</option>
                      <option value="ROTATING">Rotating 12-Hour Shift Roster</option>
                    </select>
                  </div>

                  {/* Institutional Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Institutional Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@smartmed.org"
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Security Passcode & Privileges */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">lock</span>
                  <span>Security PIN &amp; eMAR Privileges</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Security PIN */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Terminal Security PIN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="4-6 digit numeric PIN"
                      maxLength={6}
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                    {errors.pin && <p className="text-[11px] text-rose-600 font-semibold">{errors.pin}</p>}
                  </div>

                  {/* Confirm PIN */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Confirm Security PIN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Re-enter PIN"
                      maxLength={6}
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                    {errors.confirmPin && <p className="text-[11px] text-rose-600 font-semibold">{errors.confirmPin}</p>}
                  </div>
                </div>

                {/* Role Specific Privileges Toggle List */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Authorized Access Clearances:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeTab === 'DOCTOR' && (
                      <>
                        <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privileges.prescribe}
                            onChange={() => togglePrivilege('prescribe')}
                            className="w-4 h-4 text-[#003d9b] rounded border-slate-300 focus:ring-blue-200"
                          />
                          <span className="font-semibold text-slate-800">e-Prescribing &amp; Order Signing</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privileges.controlledSubstances}
                            onChange={() => togglePrivilege('controlledSubstances')}
                            className="w-4 h-4 text-[#003d9b] rounded border-slate-300 focus:ring-blue-200"
                          />
                          <span className="font-semibold text-slate-800">Controlled Substances Clearance</span>
                        </label>
                      </>
                    )}

                    {activeTab === 'NURSE' && (
                      <>
                        <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privileges.administerMeds}
                            onChange={() => togglePrivilege('administerMeds')}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-200"
                          />
                          <span className="font-semibold text-slate-800">Bedside 5 Rights eMAR Admin</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privileges.infusions}
                            onChange={() => togglePrivilege('infusions')}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-200"
                          />
                          <span className="font-semibold text-slate-800">IV Pumps &amp; Titration Clearance</span>
                        </label>
                      </>
                    )}

                    {activeTab === 'PHARMACIST' && (
                      <>
                        <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privileges.pharmacyVerify}
                            onChange={() => togglePrivilege('pharmacyVerify')}
                            className="w-4 h-4 text-[#00687a] rounded border-slate-300 focus:ring-teal-200"
                          />
                          <span className="font-semibold text-slate-800">Clinical Verification &amp; Dispensing</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privileges.controlledSubstances}
                            onChange={() => togglePrivilege('controlledSubstances')}
                            className="w-4 h-4 text-[#00687a] rounded border-slate-300 focus:ring-teal-200"
                          />
                          <span className="font-semibold text-slate-800">Pyxis Vault Narcotic Access</span>
                        </label>
                      </>
                    )}

                    {activeTab === 'OTHER_STAFF' && (
                      <>
                        <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privileges.labAccess}
                            onChange={() => togglePrivilege('labAccess')}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-200"
                          />
                          <span className="font-semibold text-slate-800">Diagnostic Specimen &amp; Data Entry</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privileges.dualSignoff}
                            onChange={() => togglePrivilege('dualSignoff')}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-200"
                          />
                          <span className="font-semibold text-slate-800">Barcode Wristband Scanner Access</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Live Digital Hospital ID Card Preview */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Live Employee Badge Preview
              </span>

              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#002b70] rounded-3xl p-5 text-white shadow-xl border border-slate-700 relative overflow-hidden space-y-4">
                {/* Badge Top Header */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px] text-cyan-300">local_hospital</span>
                    </div>
                    <span className="text-xs font-bold tracking-tight text-slate-200">SmartMed Hospital</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active • On-Duty
                  </span>
                </div>

                {/* Badge Avatar & Name */}
                <div className="flex items-center gap-3.5 pt-1">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-cyan-400/40 overflow-hidden flex items-center justify-center text-slate-400 shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-[36px] text-cyan-300">
                      {activeTab === 'DOCTOR' ? 'stethoscope' : activeTab === 'NURSE' ? 'medical_services' : activeTab === 'PHARMACIST' ? 'local_pharmacy' : 'person'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-white truncate">
                      {fullName.trim() || 'Staff Name'}
                    </h4>
                    <p className="text-[11px] font-semibold text-cyan-300 truncate">
                      {activeTab === 'OTHER_STAFF' ? otherRoleType : specialty}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {department}
                    </p>
                  </div>
                </div>

                {/* Badge ID Details Grid */}
                <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 text-[10px] space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Badge ID:</span>
                    <span className="text-cyan-300 font-bold">{badgeNumber || 'PENDING'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">License ID:</span>
                    <span className="text-slate-200">{licenseNumber.trim().toUpperCase() || 'UNVERIFIED'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shift:</span>
                    <span className="text-slate-300 font-semibold">{shift}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="text-amber-300 font-bold">{activeTab}</span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="bg-white p-2 rounded-xl text-center shadow-inner">
                  <div className="h-6 flex items-center justify-center gap-0.5 overflow-hidden">
                    {[1,2,1,3,1,2,4,1,2,1,3,2,1,4,2,1,3,1,2].map((w, i) => (
                      <div key={i} className={`h-full bg-slate-900 ${w === 1 ? 'w-0.5' : w === 2 ? 'w-1' : w === 3 ? 'w-1.5' : 'w-2'}`} />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 block mt-0.5 font-bold tracking-widest">
                    *{badgeNumber || '000000'}*
                  </span>
                </div>
              </div>

              {/* Safety Confirmation Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-[#003d9b] leading-relaxed flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5 text-[#003d9b]">verified_user</span>
                <p>
                  Enrolled staff receive instant cryptographic access tokens and can authenticate at any ward station immediately.
                </p>
              </div>

            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#003d9b] to-[#00687a] hover:from-[#002b70] hover:to-[#00505e] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Credentialing Staff...</span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Authorize &amp; Enroll Staff</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
