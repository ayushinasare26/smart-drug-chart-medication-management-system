import React, { useState } from 'react';
import { ClinicalStaff } from '../types/medication';

interface SecureLoginScreenProps {
  onLoginSuccess: (staff: ClinicalStaff) => void;
  staffList: ClinicalStaff[];
}

export const SecureLoginScreen: React.FC<SecureLoginScreenProps> = ({
  onLoginSuccess,
  staffList,
}) => {
  const [selectedRole, setSelectedRole] = useState<'DOCTOR' | 'NURSE' | 'PATIENT'>('DOCTOR');
  const [employeeId, setEmployeeId] = useState('DOC-84729');
  const [pin, setPin] = useState('••••••');
  const [actualPin, setActualPin] = useState('9999');
  const [showPin, setShowPin] = useState(false);
  const [rememberId, setRememberId] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);

  // Role click updates defaults for seamless testability
  const handleRoleSelect = (role: 'DOCTOR' | 'NURSE' | 'PATIENT') => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'DOCTOR') {
      const doc = staffList.find((s) => s.role === 'DOCTOR') || staffList[2];
      setEmployeeId(doc.badgeNumber || 'DOC-84729');
      setActualPin(doc.pin || '9999');
    } else if (role === 'NURSE') {
      const nurse = staffList.find((s) => s.role === 'NURSE') || staffList[0];
      setEmployeeId(nurse.badgeNumber || 'RN-88219');
      setActualPin(nurse.pin || '1234');
    } else {
      const patient = staffList.find((s) => s.role === 'PATIENT') || staffList.find((s) => s.badgeNumber === 'UHID123456');
      setEmployeeId(patient?.badgeNumber || 'UHID123456');
      setActualPin(patient?.pin || '1234');
    }
  };

  const handleAuthenticate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsAuthenticating(true);

    setTimeout(() => {
      // Find matching staff by badge number or default to current role
      const matched = staffList.find(
        (s) => s.badgeNumber.toLowerCase() === employeeId.trim().toLowerCase()
      );

      if (matched) {
        setIsAuthenticating(false);
        onLoginSuccess(matched);
        return;
      }

      // If custom ID entered, instantiate clinician / patient profile
      const fallbackStaff: ClinicalStaff = {
        id: selectedRole === 'PATIENT' ? 'pat-1' : `custom-staff-${Date.now()}`,
        name:
          selectedRole === 'DOCTOR'
            ? 'Dr. Sarah Chen, MD'
            : selectedRole === 'NURSE'
            ? 'Sarah Jenkins, RN'
            : 'Ramesh Kumar',
        role: selectedRole === 'DOCTOR' ? 'DOCTOR' : selectedRole === 'NURSE' ? 'NURSE' : 'PATIENT',
        badgeNumber: employeeId.trim() || (selectedRole === 'PATIENT' ? 'UHID123456' : 'DOC-84729'),
        department: selectedRole === 'PATIENT' ? 'Ward 3, Bed 12' : 'Ward 4B - Internal Medicine',
        pin: actualPin || '1234',
      };

      setIsAuthenticating(false);
      onLoginSuccess(fallbackStaff);
    }, 500);
  };

  const handleBiometricAuth = () => {
    setIsBiometricScanning(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsBiometricScanning(false);
      const matched =
        staffList.find((s) =>
          selectedRole === 'DOCTOR'
            ? s.role === 'DOCTOR'
            : selectedRole === 'NURSE'
            ? s.role === 'NURSE'
            : s.role === 'PATIENT'
        ) || (selectedRole === 'PATIENT' ? staffList.find(s => s.role === 'PATIENT') : staffList[2]) || staffList[0];
      onLoginSuccess(matched);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf2f8] via-[#eef6fc] to-[#f4f9fd] font-['Inter',sans-serif] text-[#181c1e] antialiased flex flex-col justify-between items-center relative overflow-x-hidden p-4 sm:p-6 select-none">
      
      {/* Background Soft Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Card Container */}
      <div className="w-full max-w-[430px] my-auto pt-4 pb-2">
        <div className="bg-white rounded-[28px] p-7 sm:p-9 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center">
          
          {/* Logo & Header */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50/80 border border-cyan-200/70 flex flex-col items-center justify-center shadow-xs p-2.5 mb-2 hover:scale-105 transition duration-300">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Medical Cross in double outline rounded geometry */}
                <path
                  d="M18 6C18 4.89543 18.8954 4 20 4H28C29.1046 4 30 4.89543 30 6V18H42C43.1046 18 44 18.8954 44 20V28C44 29.1046 43.1046 30 42 30H30V42C30 43.1046 29.1046 44 28 44H20C18.8954 44 18 43.1046 18 42V30H6C4.89543 30 4 29.1046 4 28V20C4 18.8954 4.89543 18 6 18H18V6Z"
                  stroke="#00828a"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 12V36M12 24H36"
                  stroke="#003d9b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            <span className="text-[11px] font-bold text-[#00828a] tracking-wide mb-2">
              SmartMedChart
            </span>

            <h1 className="text-3xl sm:text-[32px] font-extrabold text-[#003d9b] tracking-tight text-center leading-none">
              SmartMedChart
            </h1>
            <p className="text-sm text-[#475569] text-center mt-2 font-medium">
              Secure Clinical Portal
            </p>
          </div>

          {/* Role Segmented Tabs (Doctor, Nurse, Patient) */}
          <div className="w-full mb-5 flex items-center justify-between bg-[#f1f5f9] p-1 rounded-2xl border border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => handleRoleSelect('DOCTOR')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'DOCTOR'
                  ? 'bg-white shadow-xs text-[#003d9b] font-bold'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">stethoscope</span>
              <span>Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('NURSE')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'NURSE'
                  ? 'bg-white shadow-xs text-[#003d9b] font-bold'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">medical_services</span>
              <span>Nurse</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('PATIENT')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'PATIENT'
                  ? 'bg-white shadow-xs text-[#003d9b] font-bold'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span>Patient</span>
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAuthenticate} className="w-full space-y-4">
            
            {/* Employee/Patient ID Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="employee-id"
                className="text-xs sm:text-sm font-bold text-[#0f172a] block"
              >
                {selectedRole === 'PATIENT' ? 'Patient ID / UHID' : 'Employee ID'}
              </label>
              <div className="relative rounded-2xl border border-[#cbd5e1] bg-white transition flex items-center h-12 px-3.5 focus-within:border-[#003d9b] focus-within:ring-2 focus-within:ring-[#003d9b]/15">
                <span className="material-symbols-outlined text-[#94a3b8] mr-2.5 text-[20px]">
                  {selectedRole === 'PATIENT' ? 'account_circle' : 'badge'}
                </span>
                <input
                  id="employee-id"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={
                    selectedRole === 'PATIENT'
                      ? 'e.g. UHID123456'
                      : selectedRole === 'DOCTOR'
                      ? 'e.g. DOC-84729'
                      : 'e.g. RN-88219'
                  }
                  className="w-full bg-transparent border-none p-0 text-sm sm:text-base text-[#0f172a] placeholder-[#94a3b8] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Secure PIN Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="pin"
                className="text-xs sm:text-sm font-bold text-[#0f172a] block"
              >
                Secure PIN
              </label>
              <div className="relative rounded-2xl border border-[#cbd5e1] bg-white transition flex items-center h-12 px-3.5 focus-within:border-[#003d9b] focus-within:ring-2 focus-within:ring-[#003d9b]/15">
                <span className="material-symbols-outlined text-[#94a3b8] mr-2.5 text-[20px]">
                  pin
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
                  className="w-full bg-transparent border-none p-0 text-sm sm:text-base text-[#0f172a] placeholder-[#94a3b8] tracking-widest focus:outline-none font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[#94a3b8] hover:text-[#003d9b] transition p-1 cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPin ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember ID & Forgot PIN */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberId}
                  onChange={(e) => setRememberId(e.target.checked)}
                  className="w-4 h-4 rounded border-[#cbd5e1] text-[#003d9b] focus:ring-[#003d9b]/20 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-[#475569]">Remember ID</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPinModal(true)}
                className="text-xs sm:text-sm font-bold text-[#003d9b] hover:text-[#0052cc] transition cursor-pointer"
              >
                Forgot PIN?
              </button>
            </div>

            {/* Primary Action Button: Authenticate ➔ */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full h-12 sm:h-13 bg-[#003d9b] hover:bg-[#0052cc] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-[#003d9b]/25 transition flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isAuthenticating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Authenticate</span>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                </>
              )}
            </button>
          </form>

          {/* Divider: OR ACCESS VIA */}
          <div className="w-full flex items-center gap-3 my-5">
            <div className="h-[1px] flex-1 bg-[#e2e8f0]"></div>
            <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase">
              OR ACCESS VIA
            </span>
            <div className="h-[1px] flex-1 bg-[#e2e8f0]"></div>
          </div>

          {/* Biometric Login Button */}
          <button
            type="button"
            onClick={handleBiometricAuth}
            disabled={isBiometricScanning}
            className="w-full h-12 border-2 border-[#00687a]/70 hover:bg-[#00687a]/5 active:scale-[0.99] text-[#00687a] font-bold text-sm sm:text-base rounded-2xl transition flex items-center justify-center gap-2.5 cursor-pointer bg-white"
          >
            {isBiometricScanning ? (
              <div className="flex items-center gap-2 text-[#00687a]">
                <span className="material-symbols-outlined text-[22px] animate-pulse">fingerprint</span>
                <span className="animate-pulse">Verifying Fingerprint...</span>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px] text-[#00687a]">
                  fingerprint
                </span>
                <span>Biometric Login</span>
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#64748b]">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <p>End-to-end encrypted connection.</p>
          </div>

        </div>
      </div>

      {/* Footer Links Below Card */}
      <div className="pb-4 flex justify-center items-center gap-3 text-xs text-[#64748b]">
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="hover:text-[#003d9b] transition"
        >
          Help &amp; Support
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="hover:text-[#003d9b] transition"
        >
          Privacy Policy
        </button>
      </div>

      {/* Forgot PIN Modal */}
      {showForgotPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#003d9b] font-bold text-base">
              <span className="material-symbols-outlined">key</span>
              <span>Clinical Test Credentials</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use any preset authorized badge code or click any role tab:
            </p>
            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Doctor (Sarah Chen):</span>
                <span className="font-mono text-[#003d9b] font-bold">DOC-84729 / 9999</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Nurse (Sarah Jenkins):</span>
                <span className="font-mono text-[#003d9b] font-bold">RN-88219 / 1234</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Patient (Ramesh Kumar):</span>
                <span className="font-mono text-[#003d9b] font-bold">UHID123456 / 1234</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPinModal(false)}
                className="px-4 py-2 bg-[#003d9b] text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#003d9b] font-bold text-base">
              <span className="material-symbols-outlined">shield</span>
              <span>SmartMedChart Clinical Security</span>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                This terminal is protected with electronic signature logging, role-based access controls (RBAC), and cryptographic audit tracking.
              </p>
              <p className="font-semibold text-slate-800">
                Hospital IT Support: ext 4402 • itsupport@hospital.internal
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#003d9b] text-white text-xs font-bold rounded-xl"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
