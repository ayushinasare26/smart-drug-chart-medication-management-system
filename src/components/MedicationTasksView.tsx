import React from 'react';
import { MedicationAdminTask } from '../types/dashboard';

interface MedicationTasksViewProps {
  tasks: MedicationAdminTask[];
  onAdministerTask: (task: MedicationAdminTask) => void;
  onScanBarcode: () => void;
}

export const MedicationTasksView: React.FC<MedicationTasksViewProps> = ({
  tasks,
  onAdministerTask,
  onScanBarcode,
}) => {
  const statTasks = tasks.filter((t) => t.statusType === 'STAT');
  const missedTasks = tasks.filter(
    (t) => t.statusType === 'MISSED' || (t.overdueMinutes !== undefined && t.overdueMinutes > 60)
  );
  const dueNowTasks = tasks.filter(
    (t) =>
      t.statusType === 'DUE_NOW' ||
      (t.statusType === 'OVERDUE' && (!t.overdueMinutes || t.overdueMinutes <= 60))
  );
  const completedTasks = tasks.filter((t) => t.statusType === 'COMPLETED');

  return (
    <div className="space-y-6 pb-24 relative max-w-xl mx-auto">
      {/* Title & Ward Subtitle */}
      <div>
        <h1 className="text-3xl sm:text-[34px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
          Medication Tasks
        </h1>
        <p className="text-sm sm:text-base text-[#475569] mt-1 font-medium">
          Ward 4B - Shift ending in 3h 45m
        </p>
      </div>

      {/* 4 Top Metric Stat Badges (DUE NOW, STAT, MISSED >1H, COMPLETED) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
        {/* DUE NOW Card */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black text-[#003d9b] leading-none">
            {dueNowTasks.length}
          </span>
          <span className="text-[11px] font-bold text-[#475569] tracking-wider uppercase mt-2">
            DUE NOW
          </span>
        </div>

        {/* STAT Card */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black text-[#f57c00] leading-none">
            {statTasks.length}
          </span>
          <span className="text-[11px] font-bold text-[#475569] tracking-wider uppercase mt-2">
            STAT
          </span>
        </div>

        {/* MISSED (>1H) Card */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black text-[#7e22ce] leading-none">
            {missedTasks.length}
          </span>
          <span className="text-[11px] font-bold text-[#7e22ce] tracking-wider uppercase mt-2">
            MISSED (&gt;1H)
          </span>
        </div>

        {/* COMPLETED Card */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black text-emerald-600 leading-none">
            {completedTasks.length}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase mt-2">
            COMPLETED
          </span>
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="w-full h-px bg-slate-200/90 my-5" />

      {/* ⚠️ Critical / STAT Section */}
      {statTasks.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f57c00] text-[26px]">
              warning
            </span>
            <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0f172a] tracking-tight">
              Critical / STAT
            </h2>
          </div>

          {statTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-[22px] p-5 sm:p-6 border border-slate-100 shadow-xs relative overflow-hidden space-y-4 border-l-[6px] border-l-[#ff9800]"
            >
              {/* Room Bed & STAT Pill */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {task.roomBed}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-xs font-bold text-[#ff9800] rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#ff9800] animate-pulse"></span>
                  {task.timeLabel || 'STAT • IMMEDIATE'}
                </span>
              </div>

              {/* Drug Name & Protocol */}
              <div>
                <h3 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
                  {task.drugName}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] mt-0.5 font-medium">
                  {task.doseRoute}
                </p>
              </div>

              {/* Exact Timing & Daily Frequency Box */}
              <div className="bg-[#fff8f0] rounded-2xl p-3.5 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">alarm</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Exact Timing
                    </span>
                    <span className="font-extrabold text-[#0f172a] text-xs sm:text-sm">
                      {task.scheduledTime || 'STAT Immediate (09:00 AM)'}
                    </span>
                    <span className="text-[11px] text-amber-900/80 block font-medium">
                      Order Type: STAT Immediate
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-amber-200/80 pt-2 sm:pt-0 sm:pl-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">event_repeat</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Daily Frequency
                    </span>
                    <span className="font-extrabold text-[#0f172a] text-xs sm:text-sm">
                      {task.timesPerDay || '1 time (Single STAT Order)'}
                    </span>
                    <span className="text-[11px] text-amber-900/80 block font-medium">
                      {task.frequency || 'Single Dose STAT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Info Row */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  src={task.patientAvatar}
                  alt={task.patientName}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#0f172a]">
                    {task.patientName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    DOB: {task.patientDob}
                  </p>
                </div>
              </div>

              {/* ADMINISTER Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onAdministerTask(task)}
                  className="w-full h-12 bg-[#ff9800] hover:bg-[#f57c00] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase rounded-2xl shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">vaccines</span>
                  <span>ADMINISTER STAT</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🛑 Missed Medications (>1 Hour Overdue) Section */}
      {missedTasks.length > 0 && (
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7e22ce] text-[26px]">
                event_busy
              </span>
              <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0f172a] tracking-tight">
                Missed Doses (&gt;1 Hour Overdue)
              </h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full border border-purple-200">
              Protocol Flagged
            </span>
          </div>

          {missedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-[22px] p-5 sm:p-6 border border-purple-100 shadow-xs relative overflow-hidden space-y-4 border-l-[6px] border-l-[#7e22ce]"
            >
              {/* Room Bed & Missed Alert Pill */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {task.roomBed}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-xs font-black text-[#7e22ce] rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#7e22ce]"></span>
                  {task.timeLabel || 'MISSED (>1H OVERDUE)'}
                </span>
              </div>

              {/* Drug Name & Protocol */}
              <div>
                <h3 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
                  {task.drugName}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] mt-0.5 font-medium">
                  {task.doseRoute}
                </p>
              </div>

              {/* Missed Dose Justification Notice */}
              <div className="bg-purple-50/70 rounded-2xl p-3.5 border border-purple-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-purple-900 font-bold">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  <span>Missed Dose Policy Triggered (Overdue &gt; 60 Minutes)</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  {task.missedReason ||
                    'Dose was not administered within the 60-minute therapeutic window. Requires clinical justification or delayed administration.'}
                </p>
              </div>

              {/* Exact Timing & Daily Frequency Box */}
              <div className="bg-[#f8fafc] rounded-2xl p-3.5 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Scheduled Slot
                    </span>
                    <span className="font-extrabold text-[#0f172a] text-xs sm:text-sm">
                      {task.scheduledTime || '07:00 AM'}
                    </span>
                    <span className="text-[11px] text-purple-700 font-semibold block">
                      Status: Marked as Missed
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-2 sm:pt-0 sm:pl-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">event_repeat</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Frequency
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                      {task.timesPerDay || '1 time a day'}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      {task.frequency || 'Routine order'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Info Row & Late Administer Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3">
                  <img
                    src={task.patientAvatar}
                    alt={task.patientName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#0f172a]">
                      {task.patientName}
                    </h4>
                    {task.patientDob && (
                      <p className="text-xs text-slate-500 font-medium">
                        DOB: {task.patientDob}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => onAdministerTask(task)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-[#7e22ce] hover:bg-[#6b21a8] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">history_toggle_off</span>
                    <span>Administer Late</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⏰ Due Now & Scheduled Section */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003d9b] text-[26px]">
            schedule
          </span>
          <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0f172a] tracking-tight">
            Due Now &amp; Scheduled
          </h2>
        </div>

        {dueNowTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 text-slate-500 space-y-1">
            <span className="material-symbols-outlined text-[32px] text-emerald-500">task_alt</span>
            <p className="text-sm font-bold text-slate-700">All scheduled doses up to date!</p>
          </div>
        ) : (
          dueNowTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-[22px] p-5 sm:p-6 border border-slate-100 shadow-xs relative overflow-hidden space-y-4 border-l-[6px] border-l-[#003d9b]"
            >
              {/* Room Bed & Overdue Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {task.roomBed}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                    task.statusType === 'OVERDUE'
                      ? 'bg-rose-100 text-[#800020] border border-rose-200'
                      : 'bg-blue-100 text-[#003d9b] border border-blue-200'
                  }`}
                >
                  {task.timeLabel || (task.statusType === 'OVERDUE' ? '30M OVERDUE' : 'DUE NOW')}
                </span>
              </div>

              {/* Drug Name & Protocol */}
              <div>
                <h3 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
                  {task.drugName}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] mt-0.5 font-medium">
                  {task.doseRoute}
                </p>
              </div>

              {/* Exact Timing & Daily Frequency Box */}
              <div className="bg-[#f8fafc] rounded-2xl p-3.5 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#003d9b] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Exact Timing
                    </span>
                    <span className="font-extrabold text-[#0f172a] text-xs sm:text-sm">
                      {task.scheduledTime || '08:00 AM'}
                    </span>
                    {task.timingSlots && (
                      <span className="text-[11px] text-[#003d9b] block font-mono font-semibold">
                        Slots: {task.timingSlots}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-2 sm:pt-0 sm:pl-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">event_repeat</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Daily Frequency
                    </span>
                    <span className="font-extrabold text-emerald-800 text-xs sm:text-sm">
                      {task.timesPerDay || '2 times a day'}
                    </span>
                    {task.frequency && (
                      <span className="text-[11px] text-slate-600 block font-medium">
                        {task.frequency}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Info Row & Administer Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={task.patientAvatar}
                    alt={task.patientName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#0f172a]">
                      {task.patientName}
                    </h4>
                    {task.patientDob && (
                      <p className="text-xs text-slate-500 font-medium">
                        DOB: {task.patientDob}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAdministerTask(task)}
                  className="px-5 py-2.5 bg-[#003d9b] hover:bg-[#0052cc] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  <span>Administer</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ Completed / Administered Medications Section */}
      <div className="space-y-3.5 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[26px]">
              check_circle
            </span>
            <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0f172a] tracking-tight">
              Completed Medications ({completedTasks.length})
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            Shift Logged
          </span>
        </div>

        {completedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 text-slate-400">
            <p className="text-xs font-medium">No completed doses logged yet for this shift.</p>
          </div>
        ) : (
          completedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-[22px] p-5 sm:p-6 border border-emerald-100 shadow-xs relative overflow-hidden space-y-3 border-l-[6px] border-l-emerald-500"
            >
              {/* Room Bed & Completed Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {task.roomBed}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="material-symbols-outlined text-[14px]">done</span>
                  <span>{task.timeLabel || 'COMPLETED'}</span>
                </span>
              </div>

              {/* Drug Name & Protocol */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a]">
                    {task.drugName}
                  </h3>
                  <p className="text-xs text-[#475569] mt-0.5">
                    {task.doseRoute}
                  </p>
                </div>

                <div className="px-2.5 py-1 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] font-semibold text-emerald-800 flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                  <span>5 Rights Verified</span>
                </div>
              </div>

              {/* Administration Timestamp and Nurse Signature Row */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={task.patientAvatar}
                    alt={task.patientName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <span className="font-bold text-slate-800">{task.patientName}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">how_to_reg</span>
                  <span>{task.administeredAt || 'Administered on time'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button (Barcode / QR Scanner) in Bottom Right */}
      <div className="fixed bottom-20 right-5 sm:right-8 z-40">
        <button
          type="button"
          onClick={onScanBarcode}
          className="w-14 h-14 sm:w-15 sm:h-15 rounded-2xl bg-[#003d9b] hover:bg-[#0052cc] active:scale-95 text-white shadow-xl shadow-[#003d9b]/40 border-2 border-white flex items-center justify-center transition cursor-pointer relative group"
          title="Scan Patient Barcode / Drug QR"
        >
          {/* Custom QR scanner with red corner brackets */}
          <div className="relative w-7 h-7 flex items-center justify-center">
            {/* Red corner brackets */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-rose-400 rounded-tl-[3px]"></div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-rose-400 rounded-tr-[3px]"></div>
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-rose-400 rounded-bl-[3px]"></div>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-rose-400 rounded-br-[3px]"></div>
            <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
          </div>
        </button>
      </div>
    </div>
  );
};
