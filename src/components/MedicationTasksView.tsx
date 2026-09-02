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
  const dueNowTasks = tasks.filter((t) => t.statusType === 'DUE_NOW' || t.statusType === 'OVERDUE');

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

      {/* Metric Stat Badges (4 DUE NOW, 1 STAT) */}
      <div className="grid grid-cols-2 gap-4 max-w-[280px]">
        {/* DUE NOW Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-4xl sm:text-[42px] font-extrabold text-[#d32f2f] leading-none">
            {dueNowTasks.length || 4}
          </span>
          <span className="text-xs font-bold text-[#475569] tracking-wider uppercase mt-2.5">
            DUE NOW
          </span>
        </div>

        {/* STAT Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-4xl sm:text-[42px] font-extrabold text-[#f57c00] leading-none">
            {statTasks.length || 1}
          </span>
          <span className="text-xs font-bold text-[#475569] tracking-wider uppercase mt-2.5">
            STAT
          </span>
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="w-full h-px bg-slate-200/90 my-5" />

      {/* ⚠️ Critical / STAT Section */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          {/* Amber Warning Triangle Icon */}
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
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#ff9800]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff9800]"></span>
                STAT
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
                ADMINISTER
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ⏰ Due Now Section */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center gap-2">
          {/* Red Clock Schedule Icon */}
          <span className="material-symbols-outlined text-[#d32f2f] text-[26px]">
            schedule
          </span>
          <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0f172a] tracking-tight">
            Due Now
          </h2>
        </div>

        {dueNowTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-[22px] p-5 sm:p-6 border border-slate-100 shadow-xs relative overflow-hidden space-y-4 border-l-[6px] border-l-[#800020]"
          >
            {/* Room Bed & Overdue Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-slate-500">
                {task.roomBed}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#800020] uppercase tracking-wide">
                {task.timeLabel || '30M OVERDUE'}
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
                className="px-4 py-2 bg-[#003d9b] hover:bg-[#0052cc] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Administer
              </button>
            </div>
          </div>
        ))}
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
