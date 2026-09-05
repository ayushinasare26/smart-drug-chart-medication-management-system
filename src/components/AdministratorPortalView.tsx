import React, { useState, useMemo } from 'react';
import { ClinicalStaff, UserRole } from '../types/medication';
import { AdminStaffEnrollmentModal } from './AdminStaffEnrollmentModal';

interface AdministratorPortalViewProps {
  currentStaff: ClinicalStaff;
  staffList: ClinicalStaff[];
  onEnrollStaff: (newStaff: ClinicalStaff) => void;
  onUpdateStaff: (updatedStaff: ClinicalStaff) => void;
  onDeleteStaff: (staffId: string) => void;
  onLaunchWorkstationAsStaff: (staff: ClinicalStaff) => void;
  onLaunchMainEMAR: () => void;
  onSignOut: () => void;
}

export const AdministratorPortalView: React.FC<AdministratorPortalViewProps> = ({
  currentStaff,
  staffList,
  onEnrollStaff,
  onUpdateStaff,
  onDeleteStaff,
  onLaunchWorkstationAsStaff,
  onLaunchMainEMAR,
  onSignOut,
}) => {
  // Modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollInitialRole, setEnrollInitialRole] = useState<'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'OTHER_STAFF'>('DOCTOR');
  const [selectedStaffForBadge, setSelectedStaffForBadge] = useState<ClinicalStaff | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'OTHER_STAFF' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_DUTY' | 'ACTIVE' | 'OFF_DUTY'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenEnrollModal = (role: 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'OTHER_STAFF') => {
    setEnrollInitialRole(role);
    setIsEnrollModalOpen(true);
  };

  // Filtered staff list excluding patient profiles
  const clinicalStaffList = useMemo(() => {
    return staffList.filter((s) => s.role !== 'PATIENT');
  }, [staffList]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalStaff = clinicalStaffList.length;
    const doctors = clinicalStaffList.filter((s) => s.role === 'DOCTOR').length;
    const nurses = clinicalStaffList.filter((s) => s.role === 'NURSE' || s.role === 'CHARGE_NURSE').length;
    const pharmacists = clinicalStaffList.filter((s) => s.role === 'PHARMACIST').length;
    const otherStaff = clinicalStaffList.filter((s) => s.role === 'OTHER_STAFF').length;
    const onDutyCount = clinicalStaffList.filter((s) => s.status === 'ON_DUTY' || !s.status).length;

    return {
      totalStaff,
      doctors,
      nurses,
      pharmacists,
      otherStaff,
      onDutyCount,
    };
  }, [clinicalStaffList]);

  // Filtered List based on search & filters
  const filteredStaff = useMemo(() => {
    return clinicalStaffList.filter((s) => {
      // Role filter
      if (selectedRoleFilter !== 'ALL') {
        if (selectedRoleFilter === 'NURSE') {
          if (s.role !== 'NURSE' && s.role !== 'CHARGE_NURSE') return false;
        } else if (s.role !== selectedRoleFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        const staffStatus = s.status || 'ON_DUTY';
        if (statusFilter === 'ON_DUTY' && staffStatus !== 'ON_DUTY') return false;
        if (statusFilter === 'ACTIVE' && staffStatus !== 'ACTIVE') return false;
        if (statusFilter === 'OFF_DUTY' && (staffStatus === 'ON_DUTY' || staffStatus === 'ACTIVE')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = s.name.toLowerCase().includes(q);
        const badgeMatch = s.badgeNumber.toLowerCase().includes(q);
        const deptMatch = s.department?.toLowerCase().includes(q) || false;
        const specialtyMatch = s.specialty?.toLowerCase().includes(q) || false;
        const licenseMatch = s.licenseNumber?.toLowerCase().includes(q) || false;
        return nameMatch || badgeMatch || deptMatch || specialtyMatch || licenseMatch;
      }

      return true;
    });
  }, [clinicalStaffList, selectedRoleFilter, statusFilter, searchQuery]);

  const handleToggleDutyStatus = (staff: ClinicalStaff) => {
    const newStatus = staff.status === 'ON_DUTY' ? 'ACTIVE' : 'ON_DUTY';
    const updated: ClinicalStaff = { ...staff, status: newStatus };
    onUpdateStaff(updated);
    showNotification(`${staff.name} status switched to ${newStatus === 'ON_DUTY' ? 'On Duty' : 'Off Duty / Active'}.`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-['Inter',sans-serif] pb-24 antialiased selection:bg-[#003d9b] selection:text-white">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border bg-slate-900 text-white border-slate-700">
            <span className="material-symbols-outlined text-[18px] text-cyan-300">verified</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Administrator Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Hospital & Admin Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-[#003d9b] flex items-center justify-center text-cyan-300 shadow-md">
              <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  SmartMed<span className="text-[#003d9b]">Admin</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#003d9b] border border-blue-200">
                  Root Governance
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hospital Staff Enrollment &amp; Clinical Directory Control Portal
              </p>
            </div>
          </div>

          {/* Right Action Bar: Enter eMAR & Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLaunchMainEMAR}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#003d9b] hover:bg-[#002b70] text-white shadow-md shadow-blue-900/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Launch Inpatient eMAR Drug Chart Workspace"
            >
              <span className="material-symbols-outlined text-[18px]">launch</span>
              <span className="hidden sm:inline">Enter SmartMedChart eMAR</span>
            </button>

            {/* Admin Profile Details & Logout */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <img
                src={currentStaff.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'}
                alt={currentStaff.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#003d9b]/30"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentStaff.name}</p>
                <p className="text-[10px] text-slate-500 font-mono leading-tight">{currentStaff.badgeNumber} • Admin</p>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="Sign out of Administrator Session"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        
        {/* Banner: Executive Welcome & Quick Action Center */}
        <div className="bg-gradient-to-r from-slate-900 via-[#002b70] to-[#004b87] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-cyan-200 border border-white/20">
                Hospital Administration Bureau
              </span>
              <span className="text-xs text-blue-200 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {currentStaff.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/85 leading-relaxed">
              Authorize, credential, and onboard new hospital doctors, nurses, pharmacists, and allied diagnostic staff into the hospital's central clinical directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleOpenEnrollModal('DOCTOR')}
              className="px-4 py-2.5 bg-white text-[#003d9b] hover:bg-blue-50 font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-[#003d9b]">stethoscope</span>
              <span>Enroll Doctor</span>
            </button>

            <button
              onClick={() => handleOpenEnrollModal('NURSE')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">medical_services</span>
              <span>Enroll Nurse</span>
            </button>

            <button
              onClick={() => handleOpenEnrollModal('PHARMACIST')}
              className="px-4 py-2.5 bg-[#00687a] hover:bg-[#00505e] text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">local_pharmacy</span>
              <span>Enroll Pharmacist</span>
            </button>

            <button
              onClick={() => handleOpenEnrollModal('OTHER_STAFF')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">biomedical</span>
              <span>Other Staff</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Staff</span>
              <span className="material-symbols-outlined text-[18px] text-slate-600">groups</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalStaff}</p>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              <span>{stats.onDutyCount} On-Duty</span>
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-blue-600">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Doctors</span>
              <span className="material-symbols-outlined text-[18px] text-[#003d9b]">stethoscope</span>
            </div>
            <p className="text-2xl font-black text-[#003d9b]">{stats.doctors}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Active Prescribers</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nurses (RN)</span>
              <span className="material-symbols-outlined text-[18px] text-emerald-600">medical_services</span>
            </div>
            <p className="text-2xl font-black text-emerald-700">{stats.nurses}</p>
            <span className="text-[10px] text-slate-500 font-semibold">eMAR Verified</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#00687a]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pharmacists</span>
              <span className="material-symbols-outlined text-[18px] text-[#00687a]">local_pharmacy</span>
            </div>
            <p className="text-2xl font-black text-[#00687a]">{stats.pharmacists}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Dispensary Leads</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-purple-600">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Allied Staff</span>
              <span className="material-symbols-outlined text-[18px] text-purple-600">biomedical</span>
            </div>
            <p className="text-2xl font-black text-purple-700">{stats.otherStaff}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Lab &amp; Diagnostics</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Bed Capacity</span>
              <span className="material-symbols-outlined text-[18px] text-slate-600">hotel</span>
            </div>
            <p className="text-2xl font-black text-slate-900">28/32</p>
            <span className="text-[10px] font-bold text-amber-600 font-mono">87.5% Occupancy</span>
          </div>

        </div>

        {/* Staff Enrollment Fast Action Gateway Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div
            onClick={() => handleOpenEnrollModal('DOCTOR')}
            className="p-5 bg-gradient-to-br from-blue-50/90 to-blue-100/50 hover:to-blue-100 border border-blue-200 rounded-3xl cursor-pointer transition shadow-xs hover:shadow-md group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#003d9b] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <span className="material-symbols-outlined text-[26px]">stethoscope</span>
              </div>
              <span className="material-symbols-outlined text-blue-400 group-hover:translate-x-1 transition">arrow_forward</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Enroll Doctor</h3>
              <p className="text-xs text-slate-600 mt-1">
                Medical license (GMC/NPI), specialty, e-prescribing clearance, and badge.
              </p>
            </div>
            <span className="text-xs font-bold text-[#003d9b] flex items-center gap-1">
              <span>Add Physician</span>
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
            </span>
          </div>

          <div
            onClick={() => handleOpenEnrollModal('NURSE')}
            className="p-5 bg-gradient-to-br from-emerald-50/90 to-emerald-100/50 hover:to-emerald-100 border border-emerald-200 rounded-3xl cursor-pointer transition shadow-xs hover:shadow-md group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <span className="material-symbols-outlined text-[26px]">medical_services</span>
              </div>
              <span className="material-symbols-outlined text-emerald-400 group-hover:translate-x-1 transition">arrow_forward</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Enroll Nurse / RN</h3>
              <p className="text-xs text-slate-600 mt-1">
                Nursing license, shift schedule, ward assignment, and 5-rights admin rights.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Add Nursing Staff</span>
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
            </span>
          </div>

          <div
            onClick={() => handleOpenEnrollModal('PHARMACIST')}
            className="p-5 bg-gradient-to-br from-teal-50/90 to-teal-100/50 hover:to-teal-100 border border-teal-200 rounded-3xl cursor-pointer transition shadow-xs hover:shadow-md group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#00687a] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <span className="material-symbols-outlined text-[26px]">local_pharmacy</span>
              </div>
              <span className="material-symbols-outlined text-teal-400 group-hover:translate-x-1 transition">arrow_forward</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Enroll Pharmacist</h3>
              <p className="text-xs text-slate-600 mt-1">
                Pharmacy board (RPh), dispensary vault access, and verification clearance.
              </p>
            </div>
            <span className="text-xs font-bold text-[#00687a] flex items-center gap-1">
              <span>Add Pharmacist</span>
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
            </span>
          </div>

          <div
            onClick={() => handleOpenEnrollModal('OTHER_STAFF')}
            className="p-5 bg-gradient-to-br from-purple-50/90 to-purple-100/50 hover:to-purple-100 border border-purple-200 rounded-3xl cursor-pointer transition shadow-xs hover:shadow-md group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <span className="material-symbols-outlined text-[26px]">biomedical</span>
              </div>
              <span className="material-symbols-outlined text-purple-400 group-hover:translate-x-1 transition">arrow_forward</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Enroll Other Staff</h3>
              <p className="text-xs text-slate-600 mt-1">
                Lab technologists, radiographers, phlebotomists, and ward coordinators.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
              <span>Add Allied Staff</span>
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
            </span>
          </div>

        </div>

        {/* Staff Directory & Management Workspace */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-5 p-5 sm:p-7">
          
          {/* Header & Controls Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Hospital Personnel &amp; Staff Directory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                  {filteredStaff.length} Members
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage active clinicians, toggle shift statuses, inspect digital badges, or launch workstation as staff
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleOpenEnrollModal('DOCTOR')}
                className="px-4 py-2 bg-[#003d9b] hover:bg-[#002b70] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Enroll New Staff</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Role Filter Pills */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, badge ID, license, or department..."
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedRoleFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Staff ({clinicalStaffList.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleFilter('DOCTOR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedRoleFilter === 'DOCTOR'
                    ? 'bg-[#003d9b] text-white shadow-xs'
                    : 'bg-blue-50 text-[#003d9b] hover:bg-blue-100'
                }`}
              >
                Doctors ({stats.doctors})
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleFilter('NURSE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedRoleFilter === 'NURSE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Nurses ({stats.nurses})
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleFilter('PHARMACIST')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedRoleFilter === 'PHARMACIST'
                    ? 'bg-[#00687a] text-white shadow-xs'
                    : 'bg-teal-50 text-[#00687a] hover:bg-teal-100'
                }`}
              >
                Pharmacists ({stats.pharmacists})
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleFilter('OTHER_STAFF')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedRoleFilter === 'OTHER_STAFF'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                Allied Staff ({stats.otherStaff})
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleFilter('ADMIN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedRoleFilter === 'ADMIN'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Admin
              </button>
            </div>

          </div>

          {/* Directory Table Grid */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Staff Member</th>
                  <th className="px-4 py-3.5">Role &amp; Badge ID</th>
                  <th className="px-4 py-3.5">Department &amp; Specialty</th>
                  <th className="px-4 py-3.5">License / Credentials</th>
                  <th className="px-4 py-3.5">Shift &amp; Duty Status</th>
                  <th className="px-4 py-3.5 text-right">Actions &amp; Workstation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => {
                    const isDoctor = staff.role === 'DOCTOR';
                    const isNurse = staff.role === 'NURSE' || staff.role === 'CHARGE_NURSE';
                    const isPharm = staff.role === 'PHARMACIST';
                    const isAdmin = staff.role === 'ADMIN';
                    const isDuty = staff.status === 'ON_DUTY' || !staff.status;

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/80 transition">
                        
                        {/* Member Avatar & Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={staff.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80'}
                              alt={staff.name}
                              className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                            />
                            <div>
                              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{staff.name}</p>
                              <p className="text-[11px] text-slate-500 font-medium">{staff.designation || staff.specialty || staff.department}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role & Badge */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isDoctor ? 'bg-blue-50 text-[#003d9b] border border-blue-200' :
                              isNurse ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              isPharm ? 'bg-teal-50 text-[#00687a] border border-teal-200' :
                              isAdmin ? 'bg-slate-900 text-white' :
                              'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              <span className="material-symbols-outlined text-[13px]">
                                {isDoctor ? 'stethoscope' : isNurse ? 'medical_services' : isPharm ? 'local_pharmacy' : isAdmin ? 'admin_panel_settings' : 'biomedical'}
                              </span>
                              <span>{staff.role}</span>
                            </span>
                            <p className="font-mono font-bold text-[#003d9b] text-[11px] block">{staff.badgeNumber}</p>
                          </div>
                        </td>

                        {/* Department & Specialty */}
                        <td className="px-4 py-3.5">
                          <p className="text-slate-800 font-bold">{staff.department}</p>
                          <p className="text-[11px] text-slate-500">{staff.specialty || 'General Care'}</p>
                        </td>

                        {/* License */}
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200">
                            {staff.licenseNumber || 'VERIFIED-AUTH'}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">PIN: {staff.pin ? '••••' : '9999'}</p>
                        </td>

                        {/* Shift & Status */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => handleToggleDutyStatus(staff)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer ${
                                isDuty
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              }`}
                              title="Click to toggle On-Duty / Off-Duty"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                              <span>{isDuty ? 'On Duty' : 'Active (Off-Duty)'}</span>
                            </button>
                            <p className="text-[10px] text-slate-500 font-medium">Shift: {staff.shift || 'MORNING'}</p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Launch Workstation as this Staff */}
                            <button
                              type="button"
                              onClick={() => onLaunchWorkstationAsStaff(staff)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-[#003d9b] text-[#003d9b] hover:text-white border border-blue-200 hover:border-[#003d9b] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                              title={`Launch SmartMedChart as ${staff.name}`}
                            >
                              <span className="material-symbols-outlined text-[15px]">login</span>
                              <span className="hidden sm:inline">Log In As</span>
                            </button>

                            {/* View Badge */}
                            <button
                              type="button"
                              onClick={() => setSelectedStaffForBadge(staff)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition cursor-pointer"
                              title="Inspect ID Badge & Barcode"
                            >
                              <span className="material-symbols-outlined text-[17px]">badge</span>
                            </button>

                            {/* Delete/Deactivate (if not primary admin) */}
                            {staff.id !== currentStaff.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to deactivate ${staff.name} (${staff.badgeNumber})?`)) {
                                    onDeleteStaff(staff.id);
                                    showNotification(`${staff.name} deactivated from active directory.`);
                                  }
                                }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition cursor-pointer"
                                title="Deactivate / Remove Staff"
                              >
                                <span className="material-symbols-outlined text-[17px]">person_remove</span>
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="material-symbols-outlined text-[40px] text-slate-300">person_search</span>
                        <p className="text-sm font-bold text-slate-700">No staff found matching query</p>
                        <p className="text-xs text-slate-400">Try clearing your search query or role filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* Staff Enrollment Modal */}
      <AdminStaffEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onEnrollStaff={(newStaff) => {
          onEnrollStaff(newStaff);
          showNotification(`${newStaff.name} (${newStaff.badgeNumber}) enrolled successfully!`);
        }}
        initialRole={enrollInitialRole}
      />

      {/* ID Badge Inspection Modal */}
      {selectedStaffForBadge && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-300 text-[20px]">local_hospital</span>
                <span className="font-bold text-xs">SmartMed Hospital ID</span>
              </div>
              <button
                onClick={() => setSelectedStaffForBadge(null)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="text-center space-y-2">
              <img
                src={selectedStaffForBadge.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80'}
                alt={selectedStaffForBadge.name}
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-[#003d9b]/50 shadow-md"
              />
              <h3 className="text-base font-extrabold">{selectedStaffForBadge.name}</h3>
              <p className="text-xs text-cyan-300 font-semibold">{selectedStaffForBadge.designation || selectedStaffForBadge.role}</p>
              <p className="text-[11px] text-slate-400">{selectedStaffForBadge.department}</p>
            </div>

            <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Badge ID:</span>
                <span className="text-cyan-300 font-bold">{selectedStaffForBadge.badgeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License No:</span>
                <span className="text-slate-300">{selectedStaffForBadge.licenseNumber || 'AUTH-ACTIVE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Terminal PIN:</span>
                <span className="text-slate-300">{selectedStaffForBadge.pin || '9999'}</span>
              </div>
            </div>

            <div className="bg-white p-2 rounded-xl text-center">
              <div className="h-7 flex items-center justify-center gap-0.5 overflow-hidden">
                {[1,2,1,3,1,2,4,1,2,1,3,2,1,4,2,1,3,1,2].map((w, i) => (
                  <div key={i} className={`h-full bg-slate-900 ${w === 1 ? 'w-0.5' : w === 2 ? 'w-1' : w === 3 ? 'w-1.5' : 'w-2'}`} />
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-700 block mt-0.5 font-bold">
                *{selectedStaffForBadge.badgeNumber}*
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStaffForBadge(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close Badge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
