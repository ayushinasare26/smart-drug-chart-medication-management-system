import React, { useState } from 'react';
import {
  CLINICAL_PATIENTS,
  INITIAL_STAT_ALERTS,
  INITIAL_CLINICAL_TASKS,
  INITIAL_MED_TASKS,
} from './data/clinicalData';
import { PatientProfile, PrescriptionItem, StatAlertItem, ClinicalTaskItem, MedicationAdminTask } from './types/dashboard';
import { ClinicalStaff } from './types/medication';
import { CLINICAL_STAFF, INITIAL_MEDICATIONS, INITIAL_ADMINISTRATION_LOGS } from './data/mockData';

// Core Screens matching user's Google Stitch Prototype
import { SecureLoginScreen } from './components/SecureLoginScreen';
import { DashboardView } from './components/DashboardView';
import { MedicationTasksView } from './components/MedicationTasksView';
import { PatientDetailView } from './components/PatientDetailView';
import { HospitalOperationsView } from './components/HospitalOperationsView';
import { NewPrescriptionView } from './components/NewPrescriptionView';
import { CriticalSafetyAlertModal } from './components/CriticalSafetyAlertModal';
import { FiveRightsVerificationModal } from './components/FiveRightsVerificationModal';

// Advanced Hospital eMAR & Drug Chart Modules
import { SmartDrugChart } from './components/SmartDrugChart';
import { AdministrationModal } from './components/AdministrationModal';
import { SafetyAlertsModal } from './components/SafetyAlertsModal';
import { InfusionManagementModal } from './components/InfusionManagementModal';
import { PharmacyReviewDrawer } from './components/PharmacyReviewDrawer';
import { PrintDrugChartModal } from './components/PrintDrugChartModal';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';

export default function App() {
  // Authentication State (Starts at Secure Login screen as designed)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Starts at Secure Login screen
  const [staffList, setStaffList] = useState<ClinicalStaff[]>(CLINICAL_STAFF);
  const [currentStaff, setCurrentStaff] = useState<ClinicalStaff>(CLINICAL_STAFF[0]); // Default to first doctor (Dr. Sarah Chen)

  // Navigation Tabs: 'Home' | 'Patients' | 'Tasks' | 'Charts' | 'Profile' | 'NewPrescription'
  const [activeTab, setActiveTab] = useState<'Home' | 'Patients' | 'Tasks' | 'Charts' | 'Profile'>('Home');

  // Subview State
  const [isPrescribing, setIsPrescribing] = useState<boolean>(false);
  const [showFullDrugChart, setShowFullDrugChart] = useState<boolean>(false);

  // Clinical Datasets
  const [patients, setPatients] = useState<PatientProfile[]>(CLINICAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1');
  const [statAlerts, setStatAlerts] = useState<StatAlertItem[]>(INITIAL_STAT_ALERTS);
  const [clinicalTasks, setClinicalTasks] = useState<ClinicalTaskItem[]>(INITIAL_CLINICAL_TASKS);
  const [medTasks, setMedTasks] = useState<MedicationAdminTask[]>(INITIAL_MED_TASKS);

  // Modals
  const [isSafetyAlertOpen, setIsSafetyAlertOpen] = useState<boolean>(false);
  const [isFiveRightsOpen, setIsFiveRightsOpen] = useState<boolean>(false);
  const [isRegisterPatientOpen, setIsRegisterPatientOpen] = useState<boolean>(false);
  const [verifyingPrescription, setVerifyingPrescription] = useState<PrescriptionItem | null>(null);
  const [verifyingPatient, setVerifyingPatient] = useState<PatientProfile>(CLINICAL_PATIENTS[0]);

  // Secondary legacy eMAR modals
  const [isLegacyAdminModalOpen, setIsLegacyAdminModalOpen] = useState(false);
  const [isAlertsCenterOpen, setIsAlertsCenterOpen] = useState(false);
  const [isInfusionModalOpen, setIsInfusionModalOpen] = useState(false);
  const [isPharmacyDrawerOpen, setIsPharmacyDrawerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [clinicalNoteModal, setClinicalNoteModal] = useState<PatientProfile | null>(null);
  const [noteText, setNoteText] = useState('');

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'INFO' | 'SUCCESS' | 'ALERT'>('SUCCESS');

  const showToast = (msg: string, type: 'INFO' | 'SUCCESS' | 'ALERT' = 'SUCCESS') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Actions
  const handleOpenPatientDetail = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('Patients');
    setIsPrescribing(false);
  };

  const handleToggleTask = (taskId: string) => {
    setClinicalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    showToast('Task updated successfully.');
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setStatAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showToast('STAT Alert acknowledged and logged.', 'INFO');
  };

  const handleAdministerMedTask = (task: MedicationAdminTask) => {
    const pat = patients.find((p) => p.id === task.patientId) || patients[0];
    const rx = pat.prescriptions.find((r) => r.id === task.prescriptionId) || pat.prescriptions[0];
    setVerifyingPatient(pat);
    setVerifyingPrescription(rx);
    setIsFiveRightsOpen(true);
  };

  const handleAdministerPrescription = (rx: PrescriptionItem, pat: PatientProfile) => {
    setVerifyingPatient(pat);
    setVerifyingPrescription(rx);
    setIsFiveRightsOpen(true);
  };

  const handleCompleteFiveRights = () => {
    setIsFiveRightsOpen(false);
    if (verifyingPrescription && verifyingPatient) {
      showToast(`Administered ${verifyingPrescription.drugName} to ${verifyingPatient.name}. 5 Rights verified.`, 'SUCCESS');
      // Remove from medTasks if present
      setMedTasks((prev) => prev.filter((t) => t.patientId !== verifyingPatient.id || t.drugName !== verifyingPrescription.drugName));
    }
  };

  const handleSaveNewPrescription = (data: any) => {
    setIsPrescribing(false);
    const newRx: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      drugName: data.drugName || 'Lisinopril',
      dose: data.dose || '10mg',
      route: data.route || 'Oral (PO)',
      frequency: data.frequency || 'Daily (QD)',
      timing: '08:00',
      status: 'Ongoing',
      startDate: 'Today',
      category: 'REGULAR',
      instructions: data.sig,
    };

    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatientId ? { ...p, prescriptions: [newRx, ...p.prescriptions] } : p))
    );
    showToast(`Prescription for ${newRx.drugName} signed & transmitted.`, 'SUCCESS');
  };

  // If not authenticated, render the Secure Login Screen
  if (!isAuthenticated) {
    return (
      <SecureLoginScreen
        staffList={staffList}
        onRegisterDoctor={(newDoctor) => {
          setStaffList((prev) => [newDoctor, ...prev]);
          showToast(`${newDoctor.name} (${newDoctor.badgeNumber}) registered to Physician Directory.`, 'SUCCESS');
        }}
        onRegisterPatient={(newPatient) => {
          setPatients((prev) => [newPatient, ...prev]);
          setSelectedPatientId(newPatient.id);
          showToast(`Patient ${newPatient.name} registered and chart created!`, 'SUCCESS');
        }}
        onLoginSuccess={(staff) => {
          setCurrentStaff(staff);
          // Ensure staff is in staffList if it was custom
          setStaffList((prev) => {
            const exists = prev.some((s) => s.id === staff.id || s.badgeNumber.toLowerCase() === staff.badgeNumber.toLowerCase());
            return exists ? prev : [staff, ...prev];
          });
          setIsAuthenticated(true);
          // If patient logs in, navigate directly to Patient Dashboard
          if (staff.role === 'PATIENT') {
            setActiveTab('Patients');
          } else if (staff.role === 'NURSE' || staff.role === 'CHARGE_NURSE') {
            // If nurse logs in, navigate directly to Medication Tasks dashboard
            setActiveTab('Tasks');
          } else {
            setActiveTab('Home');
          }
          showToast(`Welcome, ${staff.name}. Session verified.`);
        }}
      />
    );
  }

  // Get staff/patient avatar based on role/user
  const staffAvatar =
    currentStaff.role === 'PATIENT'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
      : currentStaff.role === 'NURSE' || currentStaff.role === 'CHARGE_NURSE'
      ? 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80'
      : currentStaff.role === 'PHARMACIST'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#181c1e] font-['Inter',sans-serif] flex flex-col antialiased selection:bg-[#003d9b] selection:text-white">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border ${
            toastType === 'SUCCESS' ? 'bg-[#003d9b] text-white border-blue-400' :
            toastType === 'ALERT' ? 'bg-rose-600 text-white border-rose-400' :
            'bg-slate-900 text-white border-slate-700'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {toastType === 'SUCCESS' ? 'check_circle' : toastType === 'ALERT' ? 'warning' : 'info'}
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Application Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e2e8f0] px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        {/* Brand & Logo */}
        <div
          onClick={() => {
            if (currentStaff.role === 'PATIENT') {
              setActiveTab('Patients');
            } else if (currentStaff.role === 'NURSE' || currentStaff.role === 'CHARGE_NURSE') {
              setActiveTab('Tasks');
            } else {
              setActiveTab('Home');
            }
            setIsPrescribing(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#003d9b] flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[20px]">local_hospital</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#003d9b]">
            SmartMedChart
          </span>
        </div>

        {/* Header Right Actions: Quick Safety Alert Demo, Notification Bell, User Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Quick Demo Safety Alert Trigger */}
          <button
            onClick={() => setIsSafetyAlertOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition"
            title="Demonstrate Critical Safety Alert"
          >
            <span className="material-symbols-outlined text-[16px] text-rose-600">notification_important</span>
            <span>Trigger Alert Demo</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setIsSafetyAlertOpen(true)}
            className="relative p-2 rounded-xl text-[#475569] hover:bg-slate-100 transition"
            title="Clinical Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => setActiveTab('Profile')}
            className="flex items-center gap-2.5 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition"
          >
            {/* Clinician Staff Info & Switcher */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-[#0f172a] leading-tight">{currentStaff.name}</p>
                <p className="text-[11px] text-[#64748b] leading-tight">{currentStaff.badgeNumber} • {currentStaff.department || 'Ward 4B'}</p>
              </div>
              <img
                src={staffAvatar}
                alt={currentStaff.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 ring-2 ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => {
                  setIsAuthenticated(false);
                  showToast('Signed out of clinical session.', 'INFO');
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-600 transition flex items-center gap-1 cursor-pointer"
                title="Switch Staff / Sign Out"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className="hidden sm:inline">Switch</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* VIEW: New Prescription */}
        {isPrescribing ? (
          <NewPrescriptionView
            patient={currentPatient}
            onCancel={() => setIsPrescribing(false)}
            onSaveDraft={(data) => {
              showToast('Prescription draft saved locally.', 'INFO');
              setIsPrescribing(false);
            }}
            onSignAndTransmit={handleSaveNewPrescription}
            onTriggerSafetyAlert={() => setIsSafetyAlertOpen(true)}
          />
        ) : (
          <>
            {/* VIEW 1: Home Dashboard (Renders Physician Dashboard for Doctors or Medication Tasks for Nurses) */}
            {activeTab === 'Home' && (
              currentStaff.role === 'NURSE' || currentStaff.role === 'CHARGE_NURSE' ? (
                <MedicationTasksView
                  tasks={medTasks}
                  onAdministerTask={handleAdministerMedTask}
                  onScanBarcode={() => setShowBarcodeScanner(true)}
                />
              ) : (
                <DashboardView
                  patients={patients}
                  alerts={statAlerts}
                  tasks={clinicalTasks}
                  onOpenPatient={handleOpenPatientDetail}
                  onNewOrder={() => setIsPrescribing(true)}
                  onOpenAlertChart={handleOpenPatientDetail}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onToggleTask={handleToggleTask}
                  onViewAllAlerts={() => setIsSafetyAlertOpen(true)}
                />
              )
            )}

            {/* VIEW 2: Patient Detail */}
            {activeTab === 'Patients' && (
              <div className="space-y-6">
                {/* Patient Selector Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {patients.map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => setSelectedPatientId(pat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
                        selectedPatientId === pat.id
                          ? 'bg-[#003d9b] text-white border-[#003d9b] shadow-xs'
                          : 'bg-white text-[#475569] border-[#e2e8f0] hover:bg-slate-50'
                      }`}
                    >
                      <span>{pat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        selectedPatientId === pat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {pat.roomBed}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setIsRegisterPatientOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-teal-50 text-[#00687a] border border-teal-200 hover:bg-teal-100 active:scale-95 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Admit / Register New Patient"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>Add Patient</span>
                  </button>
                </div>

                <PatientDetailView
                  patient={currentPatient}
                  onPrescribeMedicine={() => setIsPrescribing(true)}
                  onAddClinicalNote={(pat) => setClinicalNoteModal(pat)}
                  onAdministerPrescription={handleAdministerPrescription}
                  onViewAllPrescriptions={() => setShowFullDrugChart(!showFullDrugChart)}
                />

                {/* Optional Expanded Smart Drug Chart View */}
                {showFullDrugChart && (
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#0f172a]">
                        Interactive Inpatient Drug Chart (eMAR Grid)
                      </h3>
                      <button
                        onClick={() => setShowFullDrugChart(false)}
                        className="text-xs text-[#003d9b] font-semibold hover:underline"
                      >
                        Collapse Chart
                      </button>
                    </div>
                    <SmartDrugChart
                      orders={INITIAL_MEDICATIONS['pat-1']}
                      logs={INITIAL_ADMINISTRATION_LOGS}
                      currentStaff={currentStaff}
                      patientName={currentPatient.name}
                      onSelectSlot={() => {
                        setVerifyingPatient(currentPatient);
                        setVerifyingPrescription(currentPatient.prescriptions[0]);
                        setIsFiveRightsOpen(true);
                      }}
                      onViewAuditLog={() => showToast('Displaying full eMAR cryptographic audit log.')}
                    />
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: Medication Tasks */}
            {activeTab === 'Tasks' && (
              <MedicationTasksView
                tasks={medTasks}
                onAdministerTask={handleAdministerMedTask}
                onScanBarcode={() => setShowBarcodeScanner(true)}
              />
            )}

            {/* VIEW 4: Charts / Operations Analytics */}
            {activeTab === 'Charts' && (
              <HospitalOperationsView />
            )}

            {/* VIEW 5: Clinician Profile & Workstation Controls */}
            {activeTab === 'Profile' && (
              <div className="max-w-xl mx-auto space-y-6 pb-20">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs text-center space-y-4">
                  <img
                    src={staffAvatar}
                    alt={currentStaff.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-[#003d9b]/20 shadow-sm"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-[#0f172a]">{currentStaff.name}</h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      {currentStaff.role === 'PATIENT'
                        ? 'Inpatient • Ward 3, Bed 12'
                        : currentStaff.role === 'NURSE' || currentStaff.role === 'CHARGE_NURSE'
                        ? 'Staff Nurse • Ward 4B eMAR'
                        : currentStaff.role === 'PHARMACIST'
                        ? 'Clinical Pharmacist • Dispensary & Review'
                        : 'Staff Physician • Internal Medicine'}
                    </p>
                    <p className="text-xs font-mono text-[#003d9b] mt-1 font-semibold">
                      {currentStaff.role === 'PATIENT' ? 'UHID' : 'Badge'}: {currentStaff.badgeNumber} • {currentStaff.department || 'Ward 4B'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-left">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Department</span>
                      <p className="text-xs font-bold text-slate-800">{currentStaff.department || 'Ward 4B'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Shift Status</span>
                      <p className="text-xs font-bold text-emerald-600">Active (Ward 4B)</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <button
                      onClick={() => {
                        setIsAuthenticated(false);
                        showToast('Workstation locked. Session ended.', 'INFO');
                      }}
                      className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      <span>Lock Workstation &amp; Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* Bottom Navigation Bar (Matching Stitch prototype layout) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e2e8f0] px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setActiveTab('Home');
            setIsPrescribing(false);
          }}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'Home' && !isPrescribing ? 'text-[#003d9b]' : 'text-[#64748b] hover:text-[#003d9b]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="text-[11px] font-bold">Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('Patients');
            setIsPrescribing(false);
          }}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'Patients' || isPrescribing ? 'text-[#003d9b]' : 'text-[#64748b] hover:text-[#003d9b]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">group</span>
          <span className="text-[11px] font-bold">Patients</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('Tasks');
            setIsPrescribing(false);
          }}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'Tasks' && !isPrescribing ? 'text-[#003d9b]' : 'text-[#64748b] hover:text-[#003d9b]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">checklist</span>
          <span className="text-[11px] font-bold">Tasks</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('Charts');
            setIsPrescribing(false);
          }}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'Charts' && !isPrescribing ? 'text-[#003d9b]' : 'text-[#64748b] hover:text-[#003d9b]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">analytics</span>
          <span className="text-[11px] font-bold">Charts</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('Profile');
            setIsPrescribing(false);
          }}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'Profile' && !isPrescribing ? 'text-[#003d9b]' : 'text-[#64748b] hover:text-[#003d9b]'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">person</span>
          <span className="text-[11px] font-bold">Profile</span>
        </button>
      </nav>

      {/* Critical Safety Alert Modal (Screenshot 4) */}
      <CriticalSafetyAlertModal
        isOpen={isSafetyAlertOpen}
        onClose={() => setIsSafetyAlertOpen(false)}
        onCancelPrescription={() => {
          setIsSafetyAlertOpen(false);
          showToast('Prescription order cancelled due to critical allergy risk.', 'ALERT');
        }}
        onOverride={(justification) => {
          setIsSafetyAlertOpen(false);
          showToast(`Clinical override logged with justification: "${justification}".`, 'ALERT');
        }}
      />

      {/* 5 Rights Verification Modal (Screenshot 7 & 8) */}
      <FiveRightsVerificationModal
        isOpen={isFiveRightsOpen}
        onClose={() => setIsFiveRightsOpen(false)}
        onConfirmAdminister={handleCompleteFiveRights}
        patient={verifyingPatient}
        prescription={verifyingPrescription}
      />

      {/* Add Clinical Note Modal */}
      {clinicalNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0f172a]">
                Add Clinical Note for {clinicalNoteModal.name}
              </h3>
              <button
                onClick={() => setClinicalNoteModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Document patient progress, vitals response, clinical discussion..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#003d9b]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClinicalNoteModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setClinicalNoteModal(null);
                  setNoteText('');
                  showToast('Clinical progress note saved to electronic chart.');
                }}
                className="px-4 py-2 bg-[#003d9b] text-white text-xs font-bold rounded-xl"
              >
                Save Clinical Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal Simulation */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-700 space-y-4 text-center">
            <h3 className="text-base font-bold">Inpatient Barcode Scanner</h3>
            <div className="w-48 h-48 mx-auto border-2 border-dashed border-cyan-400 rounded-2xl flex flex-col items-center justify-center bg-slate-800/80 relative overflow-hidden">
              <div className="absolute inset-x-0 h-1 bg-cyan-400 animate-bounce"></div>
              <span className="material-symbols-outlined text-[48px] text-cyan-300">qr_code_scanner</span>
              <span className="text-[11px] text-slate-300 mt-2 font-mono">Align Patient Wristband / Vial QR</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBarcodeScanner(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBarcodeScanner(false);
                  const firstMedTask = medTasks[0];
                  if (firstMedTask) {
                    handleAdministerMedTask(firstMedTask);
                  }
                }}
                className="flex-1 py-2 bg-[#003d9b] text-white text-xs font-bold rounded-xl"
              >
                Simulate Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Registration Modal in Main App */}
      <PatientRegistrationModal
        isOpen={isRegisterPatientOpen}
        onClose={() => setIsRegisterPatientOpen(false)}
        onRegisterPatient={(newPatient) => {
          setPatients((prev) => [newPatient, ...prev]);
          setSelectedPatientId(newPatient.id);
          showToast(`Patient ${newPatient.name} admitted to ${newPatient.ward}!`, 'SUCCESS');
        }}
      />

    </div>
  );
}
