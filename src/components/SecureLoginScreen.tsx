import React, { useState } from 'react';
import { ClinicalStaff } from '../types/medication';
import { PatientProfile } from '../types/dashboard';
import { PatientRegistrationModal } from './PatientRegistrationModal';
import { AdminStaffEnrollmentModal } from './AdminStaffEnrollmentModal';

interface SecureLoginScreenProps {
  onLoginSuccess: (staff: ClinicalStaff) => void;
  staffList: ClinicalStaff[];
  onRegisterPatient?: (newPatient: PatientProfile) => void;
  onRegisterStaff?: (newStaff: ClinicalStaff) => void;
  onRegisterDoctor?: (newDoctor: ClinicalStaff) => void;
  onRegisterPharmacist?: (newPharmacist: ClinicalStaff) => void;
}

export const SecureLoginScreen: React.FC<SecureLoginScreenProps> = ({
  onLoginSuccess,
  staffList,
  onRegisterPatient,
  onRegisterStaff,
  onRegisterDoctor,
  onRegisterPharmacist,
}) => {
  // Main Authentication Portal Mode (ADMIN is the primary entry gate)
  const [loginMode, setLoginMode] = useState<'ADMIN' | 'CLINICIAN'>('ADMIN');

  // Clinician sub-role state
  const [selectedRole, setSelectedRole] = useState<'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'PATIENT'>('DOCTOR');
  
  // Credentials
  const [employeeId, setEmployeeId] = useState('ADM-9001');
  const [pin, setPin] = useState('••••••');
  const [actualPin, setActualPin] = useState('9999');
  const [showPin, setShowPin] = useState(false);
  const [rememberId, setRememberId] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showStaffEnrollModal, setShowStaffEnrollModal] = useState(false);
  const [enrollInitialRole, setEnrollInitialRole] = useState<'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'OTHER_STAFF'>('DOCTOR');
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState<string | null>(null);

  const adminList = staffList.filter((s) => s.role === 'ADMIN');
  const doctorsList = staffList.filter((s) => s.role === 'DOCTOR');
  const nursesList = staffList.filter((s) => s.role === 'NURSE' || s.role === 'CHARGE_NURSE');
  const pharmacistsList = staffList.filter((s) => s.role === 'PHARMACIST');

  // Handle Mode Switch between Admin Gateway and Clinician Sign-In
  const handleSwitchMode = (mode: 'ADMIN' | 'CLINICIAN') => {
    setLoginMode(mode);
    setErrorMessage('');
    if (mode === 'ADMIN') {
      const admin = adminList[0] || { badgeNumber: 'ADM-9001', pin: '9999' };
      setEmployeeId(admin.badgeNumber);
      setActualPin(admin.pin || '9999');
      setPin('••••••');
    } else {
      handleRoleSelect('DOCTOR');
    }
  };

  const handleRoleSelect = (role: 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'PATIENT') => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'DOCTOR') {
      const doc = doctorsList[0] || staffList.find((s) => s.role === 'DOCTOR');
      setEmployeeId(doc?.badgeNumber || 'DOC-84729');
      setActualPin(doc?.pin || '9999');
    } else if (role === 'NURSE') {
      const nurse = nursesList[0] || staffList.find((s) => s.role === 'NURSE');
      setEmployeeId(nurse?.badgeNumber || 'RN-88219');
      setActualPin(nurse?.pin || '1234');
    } else if (role === 'PHARMACIST') {
      const pharm = pharmacistsList[0] || staffList.find((s) => s.role === 'PHARMACIST');
      setEmployeeId(pharm?.badgeNumber || 'PH-31405');
      setActualPin(pharm?.pin || '7777');
    } else {
      const patient = staffList.find((s) => s.role === 'PATIENT') || staffList.find((s) => s.badgeNumber === 'UHID123456');
      setEmployeeId(patient?.badgeNumber || 'UHID123456');
      setActualPin(patient?.pin || '1234');
    }
    setPin('••••••');
  };

  const handleRegisterPatient = (newPatient: PatientProfile) => {
    if (onRegisterPatient) {
      onRegisterPatient(newPatient);
    }
    setRegistrationSuccessMessage(`Patient ${newPatient.name} (${newPatient.uhid}) registered successfully!`);
    setTimeout(() => {
      setRegistrationSuccessMessage(null);
    }, 5000);
  };

  const handleStaffEnrolled = (newStaff: ClinicalStaff) => {
    if (onRegisterStaff) {
      onRegisterStaff(newStaff);
    } else if (onRegisterDoctor && newStaff.role === 'DOCTOR') {
      onRegisterDoctor(newStaff);
    } else if (onRegisterPharmacist && newStaff.role === 'PHARMACIST') {
      onRegisterPharmacist(newStaff);
    }

    setRegistrationSuccessMessage(`${newStaff.name} (${newStaff.badgeNumber}) enrolled successfully as ${newStaff.role}!`);
    setTimeout(() => {
      setRegistrationSuccessMessage(null);
    }, 6000);
  };

  const handleAuthenticate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsAuthenticating(true);

    setTimeout(() => {
      const cleanId = employeeId.trim().toLowerCase();

      // 1. Find matching staff by badge number, name or id
      const matched = staffList.find(
        (s) =>
          s.badgeNumber.toLowerCase() === cleanId ||
          s.id.toLowerCase() === cleanId ||
          s.name.toLowerCase() === cleanId ||
          (s.email && s.email.toLowerCase() === cleanId)
      );

      if (matched) {
        setIsAuthenticating(false);
        onLoginSuccess(matched);
        return;
      }

      // 2. If Admin Mode and custom admin entered
      if (loginMode === 'ADMIN') {
        const fallbackAdmin: ClinicalStaff = {
          id: `admin-${Date.now()}`,
          name: employeeId.includes('@') ? employeeId.split('@')[0] : `Admin (${employeeId})`,
          role: 'ADMIN',
          badgeNumber: employeeId.trim().toUpperCase(),
          department: 'Hospital Administration & Executive Directorate',
          pin: actualPin || '9999',
          designation: 'Hospital Administrator',
          status: 'ACTIVE',
        };
        setIsAuthenticating(false);
        onLoginSuccess(fallbackAdmin);
        return;
      }

      // 3. If Clinician Mode and custom ID entered
      let customName = employeeId.trim();
      if (selectedRole === 'DOCTOR') {
        if (!customName.toLowerCase().startsWith('dr.') && !customName.toLowerCase().startsWith('dr ')) {
          customName = `Dr. ${customName}`;
        }
      } else if (selectedRole === 'NURSE') {
        if (!customName.toLowerCase().startsWith('nurse')) {
          customName = `Nurse ${customName}`;
        }
      } else if (selectedRole === 'PHARMACIST') {
        if (!customName.toLowerCase().startsWith('pharm') && !customName.includes('BPharm') && !customName.includes('PharmD')) {
          customName = `${customName}, BPharm`;
        }
      }

      const fallbackStaff: ClinicalStaff = {
        id: `staff-${Date.now()}`,
        name: customName,
        role: selectedRole === 'DOCTOR' ? 'DOCTOR' : selectedRole === 'NURSE' ? 'NURSE' : selectedRole === 'PHARMACIST' ? 'PHARMACIST' : 'PATIENT',
        badgeNumber: employeeId.trim().toUpperCase(),
        department: selectedRole === 'DOCTOR' ? 'Inpatient Clinical Medicine' : selectedRole === 'PHARMACIST' ? 'Clinical Pharmacy Services' : selectedRole === 'NURSE' ? 'Ward 4B' : 'Ward 3',
        pin: actualPin || '9999',
        status: 'ON_DUTY',
      };

      if (onRegisterDoctor && selectedRole === 'DOCTOR') {
        onRegisterDoctor(fallbackStaff);
      } else if (onRegisterPharmacist && selectedRole === 'PHARMACIST') {
        onRegisterPharmacist(fallbackStaff);
      }

      setIsAuthenticating(false);
      onLoginSuccess(fallbackStaff);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b132b] via-[#1c2541] to-[#0f172a] font-['Inter',sans-serif] text-slate-100 antialiased flex flex-col justify-between items-center relative overflow-x-hidden p-4 sm:p-6 select-none">
      
      {/* Background Ambient Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar with Hospital Credentialing Tag */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-400 to-[#003d9b] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[20px]">local_hospital</span>
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-white">
              SmartMed<span className="text-cyan-400">Chart</span>
            </span>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Hospital Inpatient &amp; Administration System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800/80 border border-slate-700 text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secure Server Active</span>
          </span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-[480px] my-auto py-2">
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-black/50 border border-white/20 text-slate-900 flex flex-col items-center relative overflow-hidden">
          
          {/* Top Mode Segmented Switcher (Administrator Gateway vs Bedside Clinicians) */}
          <div className="w-full mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleSwitchMode('ADMIN')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMode === 'ADMIN'
                  ? 'bg-[#003d9b] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              <span>1. Administrator</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('CLINICIAN')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMode === 'CLINICIAN'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">stethoscope</span>
              <span>2. Clinical Staff</span>
            </button>
          </div>

          {/* Mode Title & Emblem */}
          <div className="mb-5 flex flex-col items-center text-center">
            {loginMode === 'ADMIN' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-[#003d9b] to-[#00687a] flex items-center justify-center shadow-lg text-cyan-300 mb-3 border border-blue-300/40">
                  <span className="material-symbols-outlined text-[32px]">shield_person</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#003d9b] border border-blue-200 mb-1">
                  Level 4 Root Authority
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Administrator Login
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  Sign in with your Admin ID to manage &amp; enroll doctors, nurses, pharmacists, and support staff.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center shadow-md text-[#003d9b] mb-3">
                  <span className="material-symbols-outlined text-[32px]">clinical_notes</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 mb-1">
                  Bedside Terminal
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Clinical Staff Sign-In
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  Direct access for authorized physicians, nurses, and pharmacists.
                </p>
              </>
            )}
          </div>

          {/* ADMIN MODE: Preset Admin Accounts Quick-Selector */}
          {loginMode === 'ADMIN' && adminList.length > 0 && (
            <div className="w-full mb-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <span>Select Authorized Administrator:</span>
                <span className="text-[10px] text-[#003d9b] font-mono font-bold">2 Preset Profiles</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {adminList.map((admin) => {
                  const isSelected = employeeId.trim().toLowerCase() === admin.badgeNumber.toLowerCase();
                  return (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => {
                        setEmployeeId(admin.badgeNumber);
                        setActualPin(admin.pin);
                        setPin('••••••');
                        setErrorMessage('');
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition text-xs flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-[#003d9b] text-[#003d9b] ring-2 ring-[#003d9b]/20 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#003d9b]">admin_panel_settings</span>
                        <span className="truncate font-extrabold text-xs">{admin.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 mt-1">
                        {admin.badgeNumber} • PIN: {admin.pin}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CLINICIAN MODE: Role Tabs & Preset Selectors */}
          {loginMode === 'CLINICIAN' && (
            <>
              {/* Role Tabs */}
              <div className="w-full mb-4 grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('DOCTOR')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    selectedRole === 'DOCTOR' ? 'bg-white shadow-xs text-[#003d9b]' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                  <span className="truncate">Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('NURSE')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    selectedRole === 'NURSE' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">medical_services</span>
                  <span className="truncate">Nurse</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('PHARMACIST')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    selectedRole === 'PHARMACIST' ? 'bg-white shadow-xs text-[#00687a]' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">local_pharmacy</span>
                  <span className="truncate">Pharm</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('PATIENT')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    selectedRole === 'PATIENT' ? 'bg-white shadow-xs text-[#003d9b]' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  <span className="truncate">Patient</span>
                </button>
              </div>

              {/* Quick Clinician Pickers */}
              {selectedRole === 'DOCTOR' && doctorsList.length > 0 && (
                <div className="w-full mb-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Select Doctor:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-0.5">
                    {doctorsList.map((doc) => {
                      const isSelected = employeeId.trim().toLowerCase() === doc.badgeNumber.toLowerCase();
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setEmployeeId(doc.badgeNumber);
                            setActualPin(doc.pin);
                            setPin('••••••');
                            setErrorMessage('');
                          }}
                          className={`p-2 rounded-xl text-left border transition text-xs flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-[#003d9b] text-[#003d9b] font-bold shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate font-bold text-xs">{doc.name.replace('Dr. ', '')}</span>
                          <span className="text-[10px] font-mono text-slate-500">{doc.badgeNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="w-full mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAuthenticate} className="w-full space-y-3.5">
            
            {/* ID Field */}
            <div className="space-y-1">
              <label htmlFor="employee-id" className="text-xs font-bold text-slate-800 block">
                {loginMode === 'ADMIN'
                  ? 'Administrator ID / Username'
                  : selectedRole === 'PATIENT'
                  ? 'Patient ID / UHID'
                  : 'Employee Badge ID'}
              </label>
              <div className="relative rounded-2xl border border-slate-300 bg-white transition flex items-center h-12 px-3.5 focus-within:border-[#003d9b] focus-within:ring-2 focus-within:ring-[#003d9b]/15">
                <span className="material-symbols-outlined text-slate-400 mr-2.5 text-[20px]">
                  {loginMode === 'ADMIN' ? 'admin_panel_settings' : selectedRole === 'PATIENT' ? 'account_circle' : 'badge'}
                </span>
                <input
                  id="employee-id"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={
                    loginMode === 'ADMIN'
                      ? 'e.g. ADM-9001 or admin@smartmed.org'
                      : selectedRole === 'PATIENT'
                      ? 'e.g. UHID123456'
                      : 'e.g. DOC-84729'
                  }
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* PIN Field */}
            <div className="space-y-1">
              <label htmlFor="pin" className="text-xs font-bold text-slate-800 block">
                {loginMode === 'ADMIN' ? 'Admin Security Passcode / PIN' : 'Terminal Security PIN'}
              </label>
              <div className="relative rounded-2xl border border-slate-300 bg-white transition flex items-center h-12 px-3.5 focus-within:border-[#003d9b] focus-within:ring-2 focus-within:ring-[#003d9b]/15">
                <span className="material-symbols-outlined text-slate-400 mr-2.5 text-[20px]">
                  lock
                </span>
                <input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  value={showPin ? actualPin : pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setActualPin(e.target.value);
                  }}
                  placeholder="••••••"
                  className="w-full bg-transparent border-none p-0 text-sm font-mono font-bold tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-400 hover:text-[#003d9b] transition p-1 cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPin ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember & Forgot PIN */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberId}
                  onChange={(e) => setRememberId(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#003d9b] focus:ring-[#003d9b]/20 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Remember Device</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPinModal(true)}
                className="text-xs font-bold text-[#003d9b] hover:underline cursor-pointer"
              >
                Demo Credentials?
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full h-12 sm:h-13 font-black text-sm sm:text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2 text-white active:scale-98 ${
                loginMode === 'ADMIN'
                  ? 'bg-gradient-to-r from-[#003d9b] via-[#0052cc] to-[#00687a] hover:from-[#002b70] hover:to-[#00505e] shadow-blue-900/30'
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'
              }`}
            >
              {isAuthenticating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>
                    {loginMode === 'ADMIN' ? 'Authenticate & Enter Admin Hub' : 'Sign In to Clinical eMAR'}
                  </span>
                  <span className="material-symbols-outlined text-[20px]">
                    {loginMode === 'ADMIN' ? 'arrow_forward' : 'login'}
                  </span>
                </>
              )}
            </button>

          </form>

          {/* Quick Staff Enrollment Trigger directly on Login */}
          <div className="w-full flex items-center gap-3 my-4">
            <div className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
              {loginMode === 'ADMIN' ? 'HOSPITAL STAFF ENROLLMENT' : 'PATIENT REGISTRATION'}
            </span>
            <div className="h-[1px] flex-1 bg-slate-200" />
          </div>

          {loginMode === 'ADMIN' ? (
            <button
              type="button"
              onClick={() => {
                setEnrollInitialRole('DOCTOR');
                setShowStaffEnrollModal(true);
              }}
              className="w-full h-11 border-2 border-dashed border-[#003d9b]/50 hover:bg-blue-50/60 active:scale-[0.99] text-[#003d9b] font-bold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer bg-white"
            >
              <span className="material-symbols-outlined text-[20px] text-[#003d9b]">
                person_add
              </span>
              <span>Enroll New Doctor, Nurse, or Staff</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowRegistrationModal(true)}
              className="w-full h-11 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer bg-white"
            >
              <span className="material-symbols-outlined text-[20px] text-teal-600">
                person_add
              </span>
              <span>Register New Patient</span>
            </button>
          )}

          {/* Registration Success Notification Banner */}
          {registrationSuccessMessage && (
            <div className="mt-3 w-full p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              <span>{registrationSuccessMessage}</span>
            </div>
          )}

          {/* HIPAA & TLS Encryption Footer */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
            <span>256-bit TLS Encrypted • HIPAA &amp; NHS Digital Compliant</span>
          </div>

        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pb-3 flex justify-center items-center gap-4 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="hover:text-cyan-300 transition"
        >
          Administrator Support
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="hover:text-cyan-300 transition"
        >
          Clinical Security Policy
        </button>
      </div>

      {/* Forgot PIN / Demo Credentials Modal */}
      {showForgotPinModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#003d9b] font-bold text-base">
              <span className="material-symbols-outlined">key</span>
              <span>Authorized Demo Passcodes</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use any preset credential to log in directly:
            </p>
            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="font-extrabold text-[#003d9b]">Administrator:</span>
                <span className="font-mono text-slate-900 font-bold">ADM-9001 / 9999</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Doctor (Sarah Chen):</span>
                <span className="font-mono text-slate-900 font-bold">DOC-84729 / 9999</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Nurse (Sarah Jenkins):</span>
                <span className="font-mono text-slate-900 font-bold">RN-88219 / 1234</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-slate-700">Pharmacist (Priya Patel):</span>
                <span className="font-mono text-[#00687a] font-bold">PH-31405 / 7777</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPinModal(false)}
                className="px-4 py-2 bg-[#003d9b] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#003d9b] font-bold text-base">
              <span className="material-symbols-outlined">security</span>
              <span>SmartMedChart Enterprise Security</span>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Access to this hospital system requires administrator authority or verified clinician credentials.
              </p>
              <p className="font-semibold text-slate-800">
                Hospital IT Support: Ext 4402 • itsupport@smartmed.org
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#003d9b] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Staff Enrollment Modal */}
      <AdminStaffEnrollmentModal
        isOpen={showStaffEnrollModal}
        onClose={() => setShowStaffEnrollModal(false)}
        onEnrollStaff={handleStaffEnrolled}
        initialRole={enrollInitialRole}
      />

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onRegisterPatient={handleRegisterPatient}
      />

    </div>
  );
};
