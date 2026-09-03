import React, { useState } from 'react';
import { 
  MedicationOrder, 
  MedicationCategory, 
  AdministrationSlot, 
  Patient, 
  AdministrationLogEntry 
} from '../types/medication';
import { 
  Pill, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Search, 
  Filter, 
  Droplets, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  History, 
  Activity, 
  HelpCircle, 
  Flame, 
  SlidersHorizontal,
  ChevronDown,
  Check,
  Building,
  RotateCw,
  Syringe,
  Play,
  Pause,
  ArrowUpRight
} from 'lucide-react';

interface SmartDrugChartProps {
  patient: Patient;
  medications: MedicationOrder[];
  logs: AdministrationLogEntry[];
  onSelectSlotToAdminister: (med: MedicationOrder, slot: AdministrationSlot) => void;
  onAdministerPRN: (med: MedicationOrder) => void;
  onAdjustInfusion: (med: MedicationOrder) => void;
  onOpenPrescribe: () => void;
  onOpenSafetyAlerts: () => void;
}

const TIMETABLE_HOURS = ['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00', '00:00'];

export const SmartDrugChart: React.FC<SmartDrugChartProps> = ({
  patient,
  medications,
  logs,
  onSelectSlotToAdminister,
  onAdministerPRN,
  onAdjustInfusion,
  onOpenPrescribe,
  onOpenSafetyAlerts,
}) => {
  const [activeTab, setActiveTab] = useState<MedicationCategory | 'LOGS'>('REGULAR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('ALL');
  const [onlyDueFilter, setOnlyDueFilter] = useState(false);
  const [onlyHighAlertFilter, setOnlyHighAlertFilter] = useState(false);
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<{ med: MedicationOrder; slot: AdministrationSlot } | null>(null);

  // Filter medications
  const filteredMeds = medications.filter((med) => {
    // Tab filter
    if (activeTab !== 'LOGS' && med.category !== activeTab) return false;
    
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = med.genericName.toLowerCase().includes(q) || (med.brandName && med.brandName.toLowerCase().includes(q));
      const matchIndication = med.indication.toLowerCase().includes(q);
      if (!matchName && !matchIndication) return false;
    }

    // Route filter
    if (selectedRouteFilter !== 'ALL' && !med.route.toLowerCase().includes(selectedRouteFilter.toLowerCase())) {
      return false;
    }

    // High Alert filter
    if (onlyHighAlertFilter && !med.isHighAlert) return false;

    // Due filter
    if (onlyDueFilter) {
      const hasDue = med.slots.some((s) => s.status === 'DUE' || s.status === 'OVERDUE');
      if (!hasDue && med.category !== 'PRN') return false;
    }

    return true;
  });

  // Calculate badge counts
  const regularCount = medications.filter((m) => m.category === 'REGULAR').length;
  const prnCount = medications.filter((m) => m.category === 'PRN').length;
  const infusionCount = medications.filter((m) => m.category === 'INFUSION').length;
  const statCount = medications.filter((m) => m.category === 'STAT').length;
  const dueCount = medications.flatMap((m) => m.slots).filter((s) => s.status === 'DUE' || s.status === 'OVERDUE').length;

  return (
    <div id="smart-drug-chart" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Category Tabs & Quick Prescribe Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
          <button
            id="tab-regular-meds"
            onClick={() => setActiveTab('REGULAR')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'REGULAR'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/60'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Regular Prescriptions</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'REGULAR' ? 'bg-teal-700 text-teal-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {regularCount}
            </span>
          </button>

          <button
            id="tab-prn-meds"
            onClick={() => setActiveTab('PRN')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'PRN'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/60'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>PRN (As-Required)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'PRN' ? 'bg-teal-700 text-teal-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {prnCount}
            </span>
          </button>

          <button
            id="tab-infusion-meds"
            onClick={() => setActiveTab('INFUSION')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'INFUSION'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/60'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span>Continuous Infusions & IV Lines</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'INFUSION' ? 'bg-teal-700 text-teal-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {infusionCount}
            </span>
          </button>

          <button
            id="tab-stat-meds"
            onClick={() => setActiveTab('STAT')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'STAT'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/60'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-rose-400" />
            <span>STAT / Once-Only</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'STAT' ? 'bg-teal-700 text-teal-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {statCount}
            </span>
          </button>

          <button
            id="tab-audit-logs"
            onClick={() => setActiveTab('LOGS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'LOGS'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/60'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>Administration Logs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400">
              {logs.length}
            </span>
          </button>
        </div>

        {/* Due Now Summary Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          {dueCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/70 border border-amber-600/70 rounded-xl text-xs font-bold text-amber-200 shadow-sm animate-pulse">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{dueCount} Doses Due for Administration</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All Current Shift Doses Up to Date</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      {activeTab !== 'LOGS' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medication name, brand, or indication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
            
            {/* Route Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Route:</span>
              <select
                value={selectedRouteFilter}
                onChange={(e) => setSelectedRouteFilter(e.target.value)}
                className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Routes</option>
                <option value="Oral" className="bg-slate-900">Oral (PO)</option>
                <option value="Intravenous" className="bg-slate-900">Intravenous (IV)</option>
                <option value="Subcutaneous" className="bg-slate-900">Subcutaneous (SC)</option>
                <option value="Inhalation" className="bg-slate-900">Inhalation</option>
              </select>
            </div>

            {/* Toggle: Due Now Only */}
            <button
              onClick={() => setOnlyDueFilter(!onlyDueFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                onlyDueFilter
                  ? 'bg-amber-950/80 text-amber-200 border-amber-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Due Now Only</span>
            </button>

            {/* Toggle: High-Alert Only */}
            <button
              onClick={() => setOnlyHighAlertFilter(!onlyHighAlertFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                onlyHighAlertFilter
                  ? 'bg-rose-950/80 text-rose-200 border-rose-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>High Alert Only</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'REGULAR' && (
        <div className="space-y-4">
          
          {/* Drug Timetable Grid Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 bg-slate-950/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider py-3 px-4">
              <div className="col-span-5 flex items-center gap-2">
                <span>Medication & Clinical Details</span>
              </div>
              <div className="col-span-7 grid grid-cols-8 text-center">
                {TIMETABLE_HOURS.map((hr) => (
                  <div key={hr} className="font-mono">
                    {hr}
                  </div>
                ))}
              </div>
            </div>

            {/* Drug Rows */}
            {filteredMeds.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No regular medications found matching the selected filters.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {filteredMeds.map((med) => (
                  <div
                    key={med.id}
                    id={`med-row-${med.id}`}
                    className="grid grid-cols-12 p-4 items-center gap-4 hover:bg-slate-800/30 transition"
                  >
                    {/* Left Details: Name, Brand, Dose, Route, Frequency, Alerts */}
                    <div className="col-span-5 space-y-1.5 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white hover:text-teal-300 transition">
                          {med.genericName}
                        </span>
                        {med.brandName && (
                          <span className="text-xs text-slate-400 font-medium">
                            ({med.brandName})
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950/80 text-teal-300 border border-teal-800/60">
                          {med.dose}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {med.route}
                        </span>
                        {med.isHighAlert && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            High Alert (2-RN)
                          </span>
                        )}
                      </div>

                      {/* Indication & Instructions */}
                      <p className="text-xs text-slate-300">
                        <strong className="text-slate-400 font-normal">Indication:</strong> {med.indication}
                      </p>

                      {med.specialInstructions && (
                        <p className="text-[11px] text-amber-300/90 font-medium bg-amber-950/30 border border-amber-800/30 px-2 py-0.5 rounded">
                          ⚠️ {med.specialInstructions}
                        </p>
                      )}

                      {/* Renal / Interaction warnings */}
                      {med.renalWarning && (
                        <div className="text-[11px] text-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{med.renalWarning}</span>
                        </div>
                      )}

                      {/* Pharmacy & Stock Location Badge */}
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          {med.pharmacyStatus === 'VERIFIED' ? 'Pharmacist Verified' : 'Pending Pharmacy Review'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Building className="w-3 h-3" />
                          {med.storageLocation}
                        </span>
                      </div>
                    </div>

                    {/* Right Columns: Timetable Slots (06:00, 08:00, 12:00, 14:00, 18:00, 20:00, 22:00, 00:00) */}
                    <div className="col-span-7 grid grid-cols-8 gap-2 text-center items-center">
                      {TIMETABLE_HOURS.map((hr) => {
                        const slot = med.slots.find((s) => s.scheduledTime === hr);

                        if (!slot) {
                          return (
                            <div
                              key={hr}
                              className="h-14 rounded-xl border border-dashed border-slate-800/60 flex items-center justify-center opacity-30"
                            >
                              <span className="text-[10px] text-slate-600">-</span>
                            </div>
                          );
                        }

                        // Render active slot based on status
                        if (slot.status === 'ADMINISTERED') {
                          return (
                            <button
                              key={slot.id}
                              id={`slot-${slot.id}`}
                              onClick={() => setSelectedSlotDetails({ med, slot })}
                              className="h-14 rounded-xl bg-emerald-950/80 border border-emerald-600/70 p-1 flex flex-col items-center justify-center text-center shadow-sm hover:ring-2 hover:ring-emerald-400 transition group"
                              title="Click to view full administration record"
                            >
                              <div className="flex items-center gap-0.5 text-emerald-300 text-[10px] font-bold">
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>{slot.administeredTime}</span>
                              </div>
                              <span className="text-[9px] font-mono text-emerald-200/90 truncate max-w-full font-semibold">
                                {slot.administeredBy?.split(' ')[0]}
                              </span>
                              <span className="text-[8px] text-emerald-400/80 uppercase">Given</span>
                            </button>
                          );
                        }

                        if (slot.status === 'DUE') {
                          return (
                            <button
                              key={slot.id}
                              id={`slot-${slot.id}`}
                              onClick={() => onSelectSlotToAdminister(med, slot)}
                              className="h-14 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-600/30 border-2 border-amber-500 p-1 flex flex-col items-center justify-center text-center shadow-lg shadow-amber-950/50 hover:scale-105 transition cursor-pointer group animate-pulse"
                              title="Click to Administer Dose (5-Rights Verification)"
                            >
                              <span className="text-[10px] font-extrabold text-amber-200">DUE</span>
                              <span className="text-[9px] font-bold text-white bg-amber-600 px-1.5 py-0.2 rounded mt-0.5 group-hover:bg-amber-500">
                                Give
                              </span>
                            </button>
                          );
                        }

                        if (slot.status === 'OVERDUE') {
                          return (
                            <button
                              key={slot.id}
                              id={`slot-${slot.id}`}
                              onClick={() => onSelectSlotToAdminister(med, slot)}
                              className="h-14 rounded-xl bg-rose-950/90 border-2 border-rose-500 p-1 flex flex-col items-center justify-center text-center shadow-lg shadow-rose-950 hover:scale-105 transition cursor-pointer"
                              title="Overdue dose! Click to administer immediately."
                            >
                              <span className="text-[10px] font-extrabold text-rose-300">OVERDUE</span>
                              <span className="text-[9px] font-bold text-white bg-rose-600 px-1.5 py-0.2 rounded mt-0.5">
                                Urgent
                              </span>
                            </button>
                          );
                        }

                        if (slot.status === 'WITHHELD') {
                          return (
                            <button
                              key={slot.id}
                              id={`slot-${slot.id}`}
                              onClick={() => setSelectedSlotDetails({ med, slot })}
                              className="h-14 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition"
                              title={`Withheld: ${slot.withheldReason || slot.withheldCode}`}
                            >
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[9px] text-slate-300 font-semibold line-through">Held</span>
                              <span className="text-[8px] text-slate-400 truncate max-w-full">
                                {slot.withheldCode?.replace('_', ' ') || 'Clinical'}
                              </span>
                            </button>
                          );
                        }

                        // Default SCHEDULED
                        return (
                          <div
                            key={slot.id}
                            className="h-14 rounded-xl bg-slate-950/60 border border-slate-800 p-1 flex flex-col items-center justify-center text-center"
                          >
                            <span className="text-[10px] font-mono text-slate-400">{hr}</span>
                            <span className="text-[9px] text-slate-500">Scheduled</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* PRN / As-Required Tab */}
      {activeTab === 'PRN' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeds.map((med) => (
              <div
                key={med.id}
                id={`prn-card-${med.id}`}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">{med.genericName}</span>
                      {med.brandName && (
                        <span className="text-xs text-slate-400">({med.brandName})</span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                        {med.dose}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {med.route} • {med.frequency}
                    </p>
                  </div>

                  <button
                    id={`btn-give-prn-${med.id}`}
                    onClick={() => onAdministerPRN(med)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-amber-950/40 transition active:scale-95 flex items-center gap-1.5 shrink-0"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Give PRN Dose</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Indication:</span>
                    <span className="font-semibold text-slate-200">{med.indication}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max 24h Dose:</span>
                    <span className="font-mono text-amber-300 font-bold">{med.prnMaxDose24h || 'As prescribed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Interval:</span>
                    <span className="font-mono text-slate-200">{med.prnMinIntervalHours} hours</span>
                  </div>
                  {med.lastPrnAdministered && (
                    <div className="flex justify-between border-t border-slate-800/60 pt-1 text-[11px]">
                      <span className="text-slate-400">Last Dose Given:</span>
                      <span className="text-teal-300 font-medium">{med.lastPrnAdministered}</span>
                    </div>
                  )}
                </div>

                {med.specialInstructions && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/30 p-2 rounded-xl">
                    ⚠️ {med.specialInstructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continuous Infusions & Syringe Pumps Tab */}
      {activeTab === 'INFUSION' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeds.map((med) => {
              const progressPct = med.bagVolumeMl && med.volumeInfusedMl
                ? Math.min(100, Math.round((med.volumeInfusedMl / med.bagVolumeMl) * 100))
                : 40;

              return (
                <div
                  key={med.id}
                  id={`infusion-card-${med.id}`}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base">{med.genericName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                          {med.dose}
                        </span>
                        {med.isHighAlert && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            High Alert
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cyan-400/90 font-mono mt-1">
                        {med.ivLineLocation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        med.infusionStatus === 'RUNNING'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        {med.infusionStatus || 'RUNNING'}
                      </span>
                    </div>
                  </div>

                  {/* Flow Rate & Dosage Matrix */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">Current Rate</div>
                      <div className="font-mono text-base font-bold text-cyan-300">
                        {med.infusionRateMlHr || 0}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">mL/hr</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Dose Rate</div>
                      <div className="font-mono text-xs font-bold text-slate-200 mt-1">
                        {med.infusionDoseRate || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Carrier Fluid</div>
                      <div className="font-mono text-[11px] font-bold text-slate-300 mt-1 truncate">
                        {med.carrierFluid || 'Saline 0.9%'}
                      </div>
                    </div>
                  </div>

                  {/* Volume Infused Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Volume Infused: <strong className="text-slate-200 font-mono">{med.volumeInfusedMl} mL</strong></span>
                      <span>Total Bag: <strong className="text-slate-200 font-mono">{med.bagVolumeMl} mL</strong> ({progressPct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Infusion Control Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onAdjustInfusion(med)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Titrate Rate / Change Bag</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAT / Once Only Tab */}
      {activeTab === 'STAT' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeds.map((med) => (
              <div
                key={med.id}
                id={`stat-card-${med.id}`}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">{med.genericName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                        {med.dose}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {med.route}
                      </span>
                    </div>
                    <p className="text-xs text-rose-400 font-semibold mt-1">
                      STAT Once-Only • Prescribed: {med.prescribedDate}
                    </p>
                  </div>

                  {med.slots[0] && med.slots[0].status === 'DUE' && (
                    <button
                      onClick={() => onSelectSlotToAdminister(med, med.slots[0])}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-950/50 transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Give STAT Now</span>
                    </button>
                  )}
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1 text-xs text-slate-300">
                  <div><strong className="text-slate-400">Indication:</strong> {med.indication}</div>
                  <div><strong className="text-slate-400">Prescriber:</strong> {med.prescribedBy}</div>
                </div>

                {med.allergyWarning && (
                  <div className="text-xs text-rose-200 bg-rose-950/60 border border-rose-700/60 p-2.5 rounded-xl flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{med.allergyWarning}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Administration Audit Log Tab */}
      {activeTab === 'LOGS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-teal-400" />
              Medication Administration Record (Audit Trail)
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Showing recent logs across all shifts
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/30 transition flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'ADMINISTERED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : log.action === 'RATE_ADJUSTED'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {log.action}
                    </span>
                    <strong className="text-white text-sm">{log.medicationName}</strong>
                    <span className="text-xs text-slate-400">({log.dose} - {log.route})</span>
                  </div>
                  
                  {log.notes && (
                    <p className="text-xs text-slate-300 font-normal">{log.notes}</p>
                  )}

                  {log.vitalRecorded && (
                    <div className="text-[11px] text-teal-400/90 font-mono flex items-center gap-1">
                      <Activity className="w-3 h-3 text-teal-400" />
                      <span>Vitals: {log.vitalRecorded}</span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-slate-200">{log.timestamp}</div>
                  <div className="text-[11px] text-slate-400">{log.staffName}</div>
                  {log.witnessName && (
                    <div className="text-[10px] text-slate-500 font-mono">Witness: {log.witnessName}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popover / Modal for clicking an already administered or withheld slot */}
      {selectedSlotDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedSlotDetails.med.genericName} {selectedSlotDetails.med.dose}
                </h3>
                <p className="text-xs text-slate-400">
                  Dose Scheduled for: {selectedSlotDetails.slot.scheduledTime}
                </p>
              </div>
              <button
                onClick={() => setSelectedSlotDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400">{selectedSlotDetails.slot.status}</span>
              </div>
              {selectedSlotDetails.slot.administeredTime && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Administered At:</span>
                  <span className="font-mono text-slate-200">{selectedSlotDetails.slot.administeredTime}</span>
                </div>
              )}
              {selectedSlotDetails.slot.administeredBy && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Administered By:</span>
                  <span className="text-slate-200">{selectedSlotDetails.slot.administeredBy}</span>
                </div>
              )}
              {selectedSlotDetails.slot.witnessedBy && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Dual Witness:</span>
                  <span className="text-teal-300">{selectedSlotDetails.slot.witnessedBy}</span>
                </div>
              )}
              {selectedSlotDetails.slot.doseGiven && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Dose Delivered:</span>
                  <span className="text-slate-200 font-mono">{selectedSlotDetails.slot.doseGiven}</span>
                </div>
              )}
              {selectedSlotDetails.slot.withheldReason && (
                <div className="flex justify-between text-rose-300">
                  <span>Withheld Reason:</span>
                  <span>{selectedSlotDetails.slot.withheldReason}</span>
                </div>
              )}
              {selectedSlotDetails.slot.notes && (
                <div className="border-t border-slate-800 pt-2 text-slate-300">
                  <strong className="text-slate-400">Clinical Notes:</strong> {selectedSlotDetails.slot.notes}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSlotDetails(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
