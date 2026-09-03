import React, { useState } from 'react';
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
  const [justifyingTaskId, setJustifyingTaskId] = useState<string | null>(null);
  const [justificationReason, setJustificationReason] = useState<string>('Patient off-ward for diagnostic testing');

  // Categorize tasks according to hospital protocol (>30 min overdue = Missed)
  const statTasks = tasks.filter((t) => t.statusType === 'STAT');
  
  const missedTasks = tasks.filter(
    (t) =>
      t.statusType === 'MISSED' ||
      (t.overdueMinutes && t.overdueMinutes >= 30) ||
      (t.statusType === 'OVERDUE' && (t.timeLabel?.includes('30M') || (t.overdueMinutes || 0) >= 30))
  );

  const dueNowTasks = tasks.filter(
    (t) =>
      t.statusType === 'DUE_NOW' ||
      (t.statusType === 'OVERDUE' && (!t.overdueMinutes || t.overdueMinutes < 30) && !t.timeLabel?.includes('30M'))
  );

  const completedTasks = tasks.filter((t) => t.statusType === 'COMPLETED');

  return (
    <div className="space-y-6 pb-24 relative max-w-2xl mx-auto animate-in fade-in duration-200">
      
      {/* Title & Ward Subtitle */}
      <div>
        <h1 className="text-3xl sm:text-[34px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
          Medication Tasks
        </h1>
        <p className="text-sm sm:text-base text-[#475569] mt-1 font-medium">
          Ward 4B - Shift ending in 3h 45m
        </p>
      </div>

      {/* Metric Stat Badges (4 Counters: DUE NOW, CRITICAL, MISSED >30M, COMPLETED) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* DUE NOW Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-[36px] font-extrabold text-[#003d9b] leading-none">
            {dueNowTasks.length}
          </span>
          <span className="text-[11px] font-bold text-[#475569] tracking-wider uppercase mt-2">
            DUE NOW
          </span>
        </div>

        {/* CRITICAL Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-[36px] font-extrabold text-[#f57c00] leading-none">
            {statTasks.length}
          </span>
          <span className="text-[11px] font-bold text-[#475569] tracking-wider uppercase mt-2">
            CRITICAL
          </span>
        </div>

        {/* MISSED Card (>30 min overdue) */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-[36px] font-extrabold text-purple-700 leading-none">
            {missedTasks.length}
          </span>
          <span className="text-[11px] font-bold text-purple-900 tracking-wider uppercase mt-2">
            MISSED (&gt;30M)
          </span>
        </div>

        {/* COMPLETED Card */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-[36px] font-extrabold text-emerald-600 leading-none">
            {completedTasks.length}
          </span>
          <span className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase mt-2">
            COMPLETED
          </span>
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="w-full h-px bg-slate-200/90 my-2" />

      {/* ⚠️ 1. Critical Section */}
      {statTasks.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f57c00] text-[26px]">
              warning
            </span>
            <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0f172a] tracking-tight">
              Critical STAT Orders
            </h2>
          </div>

          {statTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-[22px] p-5 sm:p-6 border border-slate-100 shadow-xs relative overflow-hidden space-y-4 border-l-[6px] border-l-[#ff9800]"
            >
              {/* Room Bed & Critical Pill */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {task.roomBed}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#ff9800]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff9800]"></span>
                  CRITICAL STAT
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
                {task.timesPerDay && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mt-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#003d9b]">schedule</span>
                    <span>Schedule: <strong className="text-slate-800">{task.timesPerDay}</strong></span>
                  </div>
                )}
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
                  className="w-full h-12 bg-[#ff9800] hover:bg-[#f57c00] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase rounded-2xl shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center justify-center"
                >
                  ADMINISTER STAT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⏰ 2. Due Now Section */}
      {dueNowTasks.length > 0 && (
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b] text-[26px]">
              schedule
            </span>
            <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0f172a] tracking-tight">
              Due Now
            </h2>
          </div>

          {dueNowTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-[22px] p-5 sm:p-6 border border-slate-100 shadow-xs relative overflow-hidden space-y-4 border-l-[6px] border-l-[#003d9b]"
            >
              {/* Room Bed & Overdue Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {task.roomBed}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#003d9b] uppercase tracking-wide">
                  {task.timeLabel || 'DUE NOW'}
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
                {task.timesPerDay && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mt-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#003d9b]">schedule</span>
                    <span>Timing: <strong className="text-slate-800">{task.timesPerDay}</strong></span>
                  </div>
                )}
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
                  className="px-5 py-2.5 bg-[#003d9b] hover:bg-[#0052cc] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Administer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⛔ 3. Missed Doses (>30 Minutes Overdue) Section */}
      {missedTasks.length > 0 && (
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-700 text-[26px]">
                event_busy
              </span>
              <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0f172a] tracking-tight">
                Missed Medications (&gt;30 min Overdue)
              </h2>
            </div>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
              {missedTasks.length} Doses
            </span>
          </div>

          <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-900 leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-purple-700 shrink-0 mt-0.5">info</span>
            <span>
              <strong>Clinical Policy:</strong> Medications overdue by more than 30 minutes past their scheduled therapeutic window are categorized as <strong>Missed</strong>. Administering requires clinical review and dual-nurse verification.
            </span>
          </div>

          {missedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-[22px] p-5 sm:p-6 border border-purple-200 shadow-xs relative overflow-hidden space-y-4 border-l-[6px] border-l-purple-700"
            >
              {/* Room Bed & Missed Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {task.roomBed}
                </span>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-extrabold text-xs rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-700 animate-pulse"></span>
                  {task.timeLabel || 'MISSED (>30M OVERDUE)'}
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
                <div className="flex flex-wrap items-center gap-3 text-xs text-purple-800 font-semibold mt-2">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">alarm_off</span>
                    Scheduled: {task.scheduledTime || 'Overdue >30m'}
                  </span>
                  {task.timesPerDay && <span>• {task.timesPerDay}</span>}
                </div>
              </div>

              {/* Missed Reason Notice */}
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-purple-800">
                  Protocol Justification Required:
                </span>
                <p className="text-slate-600">
                  {task.missedReason || 'Dose exceeded 30-minute administration threshold. Log clinical reason prior to late delivery.'}
                </p>
              </div>

              {/* Patient Info Row & Administer Late Button */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={task.patientAvatar}
                    alt={task.patientName}
                    className="w-10 h-10 rounded-full object-cover border border-purple-200"
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (justifyingTaskId === task.id) {
                        setJustifyingTaskId(null);
                      } else {
                        setJustifyingTaskId(task.id);
                      }
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {justifyingTaskId === task.id ? 'Cancel' : 'Log Reason'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onAdministerTask(task)}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Administer Late
                  </button>
                </div>
              </div>

              {/* In-Card Justification Logger */}
              {justifyingTaskId === task.id && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                  <label className="text-xs font-bold text-slate-700 block">
                    Select Clinical Reason for &gt;30m Delay:
                  </label>
                  <select
                    value={justificationReason}
                    onChange={(e) => setJustificationReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="Patient off-ward for diagnostic testing (CT/X-Ray)">Patient off-ward for diagnostic testing (CT/X-Ray)</option>
                    <option value="Patient refused initial morning dose">Patient refused initial morning dose</option>
                    <option value="Awaiting serum lab review / eGFR confirmation">Awaiting serum lab review / eGFR confirmation</option>
                    <option value="IV access line lost / Recannulation in progress">IV access line lost / Recannulation in progress</option>
                    <option value="Pharmacy compounding delay">Pharmacy compounding delay</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Justification recorded: "${justificationReason}". Updated in patient eMAR record.`);
                      setJustifyingTaskId(null);
                    }}
                    className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Save eMAR Justification
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✅ 4. Completed Tasks Section (Administered Today) */}
      {completedTasks.length > 0 && (
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[26px]">
                check_circle
              </span>
              <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0f172a] tracking-tight">
                Completed Tasks (Administered Today)
              </h2>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              {completedTasks.length} Completed
            </span>
          </div>

          {completedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-[22px] p-5 sm:p-6 border border-emerald-200 shadow-xs relative overflow-hidden space-y-4 border-l-[6px] border-l-emerald-500"
            >
              {/* Room Bed & Administered Timestamp */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {task.roomBed}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                  <span>{task.timeLabel || 'COMPLETED'}</span>
                </span>
              </div>

              {/* Drug Name & Route */}
              <div>
                <h3 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
                  {task.drugName}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] mt-0.5 font-medium">
                  {task.doseRoute}
                </p>
                {task.administeredAt && (
                  <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">done_all</span>
                    <span>Administered: {task.administeredAt}</span>
                  </p>
                )}
              </div>

              {/* Patient Info Row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={task.patientAvatar}
                    alt={task.patientName}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-200"
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

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  5-Rights Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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
