import React from 'react';
import { 
  Pill, 
  ShieldAlert, 
  Activity, 
  Users, 
  Clock, 
  PlusCircle, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Droplets,
  PackageCheck
} from 'lucide-react';
import { ClinicalStaff } from '../types/medication';

interface HeaderNavbarProps {
  wards: string[];
  activeWard: string;
  onSelectWard: (ward: string) => void;
  staffList: ClinicalStaff[];
  currentStaff: ClinicalStaff;
  onChangeStaff: (staff: ClinicalStaff) => void;
  onLogout: () => void;
  onOpenPrescribe: () => void;
  onOpenAlerts: () => void;
  onOpenInfusions: () => void;
  onOpenPharmacy: () => void;
  onOpenPrint: () => void;
  onOpenPatientList: () => void;
  alertsCount: number;
  dueMedsCount: number;
  currentTime: string;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  wards,
  activeWard,
  onSelectWard,
  staffList,
  currentStaff,
  onChangeStaff,
  onLogout,
  onOpenPrescribe,
  onOpenAlerts,
  onOpenInfusions,
  onOpenPharmacy,
  onOpenPrint,
  onOpenPatientList,
  alertsCount,
  dueMedsCount,
  currentTime,
}) => {
  return (
    <header id="main-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-lg">
      {/* Top Banner with Hospital branding, Ward Selector, Round Status, and Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo and System Name */}
          <div className="flex items-center gap-3 shrink-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-y6mnetr368VOdZvoxoHMrUAUpNJwA1fIhI8zTCZatgDhcXfTP3NBk5TtoM8f55R8fNrLoachWL-nYqUc3SsFhLDKgRnBdgLz0N47nfQabJE4n09FIAjE3x8Fw3QHacjJcUZWE4NZAHAazjg_tM3pWo342dZT-Fv6d3P7kWAFL3fODK5Un54K4hJbUAiBFEqQz85Cp_jkW7UIx1ev19-RIzR03QREcuLX-LRi8Uuf9nmEqTswADCcdA"
              alt="SmartMedChart Logo"
              className="w-9 h-9 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  SmartMed<span className="text-cyan-400 font-extrabold">Chart</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded">
                  Clinical Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hospital Inpatient Drug Chart & Clinical Safety Engine
              </p>
            </div>
          </div>

          {/* Ward Selector & Active Round Badge */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
              <label htmlFor="ward-select" className="text-slate-400 font-medium">Ward:</label>
              <select
                id="ward-select"
                value={activeWard}
                onChange={(e) => onSelectWard(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {wards.map((w) => (
                  <option key={w} value={w} className="bg-slate-900 text-slate-200">
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Med Round Status */}
            <div className="flex items-center gap-2 bg-teal-950/40 border border-teal-800/40 px-3 py-1.5 rounded-lg text-xs">
              <Clock className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="text-teal-300 font-medium">Morning Round (08:00)</span>
              <span className="font-mono text-teal-400 font-bold ml-1">{currentTime}</span>
            </div>
          </div>

          {/* Right Action Controls: Safety Alerts, New Prescribe, Infusions, Staff Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Clinical Safety Alerts Button */}
            <button
              id="btn-safety-alerts"
              onClick={onOpenAlerts}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                alertsCount > 0
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60 hover:bg-rose-900/80 shadow-sm shadow-rose-950'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
              }`}
              title="Clinical Decision Support & Safety Alerts"
            >
              <ShieldAlert className={`w-4 h-4 ${alertsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Safety Engine</span>
              {alertsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Smart IV Infusion Pumps & Lines */}
            <button
              id="btn-iv-lines"
              onClick={onOpenInfusions}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              title="IV Infusions & Syringe Pumps Manager"
            >
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">IV Pumps & Lines</span>
            </button>

            {/* Pharmacy Review & Stock Cabinet */}
            <button
              id="btn-pharmacy-queue"
              onClick={onOpenPharmacy}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              title="Pharmacy Verification & Pyxis ADC Stock"
            >
              <PackageCheck className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline">Pharmacy Queue</span>
            </button>

            {/* Prescribe Medication Button */}
            <button
              id="btn-prescribe-med"
              onClick={onOpenPrescribe}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-teal-950/40 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Prescribe</span>
            </button>

            {/* Print / Export Chart */}
            <button
              id="btn-print-chart"
              onClick={onOpenPrint}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Print / Export Drug Chart"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Staff User Switcher */}
            <div className="border-l border-slate-800 pl-2 sm:pl-3 flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {currentStaff.name}
                </div>
                <div className="text-[10px] text-teal-400 font-mono">
                  {currentStaff.badgeNumber} • {currentStaff.role}
                </div>
              </div>
              <div className="relative group">
                <button
                  id="staff-profile-btn"
                  className="w-8 h-8 rounded-full bg-slate-800 border border-teal-500/40 flex items-center justify-center text-xs font-bold text-teal-300 hover:border-teal-400 transition"
                  title="Switch Active Clinical User"
                >
                  {currentStaff.role === 'DOCTOR' ? 'MD' : currentStaff.role === 'PHARMACIST' ? 'PH' : 'RN'}
                </button>

                {/* Dropdown to switch staff */}
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 mb-1 border-b border-slate-800">
                    Switch Clinical User (e-Sign)
                  </div>
                  {staffList.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => onChangeStaff(staff)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                        currentStaff.id === staff.id
                          ? 'bg-teal-950/60 text-teal-300 font-bold border border-teal-800/40'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div>{staff.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{staff.role}</div>
                      </div>
                      {currentStaff.id === staff.id && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lock Workstation / Logout */}
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition flex items-center gap-1 text-xs"
                title="Lock Workstation & Return to Secure Login"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span className="hidden xl:inline">Lock</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
