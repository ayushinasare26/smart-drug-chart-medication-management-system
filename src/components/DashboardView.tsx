import React, { useState } from 'react';
import { PatientProfile, StatAlertItem, ClinicalTaskItem } from '../types/dashboard';

interface DashboardViewProps {
  patients: PatientProfile[];
  alerts: StatAlertItem[];
  tasks: ClinicalTaskItem[];
  onOpenPatient: (patientId: string) => void;
  onNewOrder: () => void;
  onOpenAlertChart: (patientId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onToggleTask: (taskId: string) => void;
  onViewAllAlerts: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  alerts,
  tasks,
  onOpenPatient,
  onNewOrder,
  onOpenAlertChart,
  onAcknowledgeAlert,
  onToggleTask,
  onViewAllAlerts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.roomBed.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ward.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8">
      {/* Title & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-[#475569] mt-1">
            Welcome back, <span className="font-semibold text-[#003d9b]">Dr. Chen</span>. You have <span className="font-semibold text-rose-600">3 critical alerts</span>.
          </p>
        </div>

        {/* + New Order Button */}
        <div>
          <button
            onClick={onNewOrder}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003d9b] hover:bg-[#0052cc] active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#003d9b]/25 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* STAT Orders & Alerts Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e2e8f0]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base sm:text-lg">
            <span className="material-symbols-outlined text-[22px]">warning</span>
            <span className="text-[#0f172a] font-bold">STAT Orders &amp; Alerts</span>
          </div>
          <button
            onClick={onViewAllAlerts}
            className="text-xs font-semibold text-[#003d9b] hover:text-[#0052cc] transition"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {/* Alert 1: Abnormal Vitals */}
          <div className="relative bg-[#f8fafc] rounded-xl p-4 border-l-4 border-l-rose-500 border border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <span className="material-symbols-outlined text-[20px]">ecg_heart</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[#0f172a]">
                    Abnormal Vitals: Ramesh Kumar
                  </h4>
                  <span className="text-xs font-semibold text-rose-600">10m ago</span>
                </div>
                <p className="text-xs text-[#475569] mt-0.5">
                  HR 130 bpm, BP 90/60. Immediate review required.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => onAcknowledgeAlert('alt-1')}
                className="px-3 py-1.5 border border-[#c3c6d6] text-[#1e293b] hover:bg-slate-100 text-xs font-semibold rounded-lg transition"
              >
                Acknowledge
              </button>
              <button
                onClick={() => onOpenAlertChart('pat-1')}
                className="px-3.5 py-1.5 bg-[#003d9b] hover:bg-[#0052cc] text-white text-xs font-semibold rounded-lg shadow-xs transition"
              >
                Open Chart
              </button>
            </div>
          </div>

          {/* Alert 2: Lab Results */}
          <div className="relative bg-[#f8fafc] rounded-xl p-4 border-l-4 border-l-amber-500 border border-[#e2e8f0] flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined text-[20px]">science</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[#0f172a]">
                    Lab Results Ready: Maria Garcia
                  </h4>
                  <span className="text-xs font-semibold text-[#64748b]">45m ago</span>
                </div>
                <p className="text-xs text-[#475569] mt-0.5">
                  CBC and BMP results available for review.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenAlertChart('pat-2')}
              className="px-3 py-1.5 border border-[#c3c6d6] text-[#1e293b] hover:bg-slate-100 text-xs font-semibold rounded-lg transition shrink-0"
            >
              View Labs
            </button>
          </div>
        </div>
      </div>

      {/* Active Patients Section */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e2e8f0]">
        <div className="flex items-center gap-2 text-[#0f172a] font-bold text-base sm:text-lg mb-3">
          <span className="material-symbols-outlined text-[#003d9b] text-[22px]">group</span>
          <span>Active Patients</span>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-xs sm:text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b]"
          />
        </div>

        {/* Patient Rows */}
        <div className="space-y-2.5">
          {filteredPatients.map((patient) => {
            const isCrit = patient.isCritical || patient.id === 'pat-1';
            const initials = patient.name.split(' ').map((n) => n[0]).join('').substring(0, 2);
            
            // Badge color based on initials/id
            const badgeBg = patient.id === 'pat-1' ? 'bg-rose-100 text-rose-700' :
              patient.id === 'pat-2' ? 'bg-blue-600 text-white' :
              'bg-emerald-700 text-white';

            return (
              <div
                key={patient.id}
                onClick={() => onOpenPatient(patient.id)}
                className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer hover:bg-slate-50 ${
                  isCrit ? 'border-l-4 border-l-rose-500 border-[#e2e8f0]' : 'border-[#e2e8f0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${badgeBg}`}>
                    {initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0f172a] hover:text-[#003d9b] transition">
                      {patient.name}
                    </h4>
                    <p className="text-xs text-[#64748b]">
                      {patient.ward} • {patient.roomBed}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCrit && (
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 font-semibold text-[11px] rounded-full uppercase tracking-wide">
                      CRITICAL
                    </span>
                  )}
                  <span className="material-symbols-outlined text-[#94a3b8] text-[20px]">
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Tasks Section */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e2e8f0]">
        <div className="flex items-center gap-2 text-[#0f172a] font-bold text-base sm:text-lg mb-4">
          <span className="material-symbols-outlined text-[#003d9b] text-[22px]">checklist</span>
          <span>My Tasks</span>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className="flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 w-4 h-4 rounded border-[#cbd5e1] text-[#003d9b] focus:ring-[#003d9b]/20 cursor-pointer"
                />
                <div>
                  <p className={`text-xs sm:text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-[#0f172a]'}`}>
                    {task.title}
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    {task.dueTime}
                  </p>
                </div>
              </div>

              {task.badgeText && (
                <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${task.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {task.badgeText}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Clinical Insights Section */}
      <div className="relative bg-white rounded-2xl p-5 shadow-xs border border-[#e2e8f0] overflow-hidden">
        {/* Subtle brain watermark background */}
        <div className="absolute right-2 bottom-2 text-slate-100 pointer-events-none select-none opacity-40">
          <span className="material-symbols-outlined text-[120px]">psychology</span>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#0f172a] font-bold text-base sm:text-lg mb-4">
            <span className="material-symbols-outlined text-[#003d9b] text-[22px]">smart_toy</span>
            <span>AI Clinical Insights</span>
          </div>

          <div className="space-y-3">
            {/* Insight 1 */}
            <div className="p-3.5 bg-[#f8fafc] rounded-xl border-l-4 border-l-[#003d9b] border border-[#e2e8f0]">
              <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">
                Sepsis Risk Indicator
              </h4>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                Algorithm detected rising trends in temp and HR for bed 12 (Kumar). Suggests evaluating for early sepsis protocol.
              </p>
            </div>

            {/* Insight 2 */}
            <div className="p-3.5 bg-[#f8fafc] rounded-xl border-l-4 border-l-slate-400 border border-[#e2e8f0]">
              <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">
                Medication Reconciliation
              </h4>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                Potential interaction noted between newly prescribed Amiodarone and current Warfarin for James Lee. Review recommended.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
