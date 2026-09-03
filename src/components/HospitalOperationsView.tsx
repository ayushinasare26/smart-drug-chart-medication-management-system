import React, { useState } from 'react';

export const HospitalOperationsView: React.FC = () => {
  const [selectedWard, setSelectedWard] = useState<'ALL' | 'ICU' | 'WARD_4B' | 'PEDS'>('ALL');

  // Interactive Ward Matrix (Heatmap simulated beds - Kept to 1 overdue bed and 1 due soon)
  const heatmapBeds = [
    { id: '4B-01', bedNumber: '01', status: 'normal', doseCount: 4, overdueCount: 0, compliance: 100 },
    { id: '4B-02', bedNumber: '02', status: 'normal', doseCount: 3, overdueCount: 0, compliance: 100 },
    { id: '4B-03', bedNumber: '03', status: 'warning', doseCount: 4, overdueCount: 0, compliance: 98 }, // 1 Due Soon
    { id: '4B-04', bedNumber: '04', status: 'normal', doseCount: 2, overdueCount: 0, compliance: 100 },
    { id: '4B-05', bedNumber: '05', status: 'normal', doseCount: 5, overdueCount: 0, compliance: 100 },
    { id: '4B-06', bedNumber: '06', status: 'critical', doseCount: 4, overdueCount: 1, compliance: 95 }, // Exactly 1 Overdue
    { id: '4B-07', bedNumber: '07', status: 'normal', doseCount: 3, overdueCount: 0, compliance: 100 },
    { id: '4B-08', bedNumber: '08', status: 'normal', doseCount: 4, overdueCount: 0, compliance: 100 },
    { id: '4B-09', bedNumber: '09', status: 'normal', doseCount: 4, overdueCount: 0, compliance: 100 },
    { id: '4B-10', bedNumber: '10', status: 'normal', doseCount: 2, overdueCount: 0, compliance: 100 },
    { id: '4B-11', bedNumber: '11', status: 'normal', doseCount: 5, overdueCount: 0, compliance: 100 },
    { id: '4B-12', bedNumber: '12', status: 'normal', doseCount: 4, overdueCount: 0, compliance: 100 },
    { id: '4B-13', bedNumber: '13', status: 'normal', doseCount: 3, overdueCount: 0, compliance: 100 },
    { id: '4B-14', bedNumber: '14', status: 'normal', doseCount: 4, overdueCount: 0, compliance: 100 },
    { id: '4B-15', bedNumber: '15', status: 'normal', doseCount: 3, overdueCount: 0, compliance: 100 },
    { id: '4B-16', bedNumber: '16', status: 'normal', doseCount: 3, overdueCount: 0, compliance: 100 },
  ];

  const totalDoses = heatmapBeds.reduce((acc, b) => acc + b.doseCount, 0);
  const totalOverdue = heatmapBeds.reduce((acc, b) => acc + (b.overdueCount || 0), 0);
  const overdueRatePercent = ((totalOverdue / totalDoses) * 100).toFixed(1);
  const normalBedsCount = heatmapBeds.filter((b) => b.status === 'normal').length;
  const warningBedsCount = heatmapBeds.filter((b) => b.status === 'warning').length;
  const criticalBedsCount = heatmapBeds.filter((b) => b.status === 'critical').length;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
          Hospital Operations Overview
        </h1>
        <p className="text-sm sm:text-base text-[#475569] mt-1">
          Real-time medication administration risk and compliance metrics across inpatient wards.
        </p>
      </div>

      {/* 2 Primary Resized Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Card 1: Medication Overdue Rate */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e2e8f0] shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#64748b] tracking-wider uppercase">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">alarm</span>
              </div>
              <span>Medication Overdue Rate</span>
            </div>
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">
              Low &amp; Controlled
            </span>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-4xl sm:text-5xl font-black text-rose-600 tracking-tight">
              {overdueRatePercent}%
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">
              ({totalOverdue} overdue dose out of {totalDoses} total)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#64748b] flex items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">trending_down</span>
            <span className="font-semibold text-emerald-700">↓ -1.8%</span>
            <span>improvement vs previous shift</span>
          </p>
        </div>

        {/* Card 2: Compliance Score */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e2e8f0] shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#64748b] tracking-wider uppercase">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
              </div>
              <span>Overall Compliance Score</span>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              Target &gt; 95% Exceeded
            </span>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight">
              98.4%
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">
              (56 of {totalDoses} administered on-time)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#64748b] flex items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
            <span className="font-semibold text-slate-700">Audit Grade: Exceptional</span>
            <span>• 0 critical safety misses</span>
          </p>
        </div>

      </div>

      {/* Full-Width Resized Ward Medication Heatmap Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e2e8f0] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#003d9b]/10 text-[#003d9b] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">grid_view</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight">
                  Ward Medication Heatmap
                </h3>
                <p className="text-xs text-[#64748b]">
                  Real-time bed-by-bed medication load and administration status for Ward 4B
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-extrabold rounded-full border border-rose-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Overdue Rate: {overdueRatePercent}% (1 Bed Overdue)
            </span>

            <button
              onClick={() => setSelectedWard(selectedWard === 'ALL' ? 'WARD_4B' : 'ALL')}
              className="px-3.5 py-1.5 bg-[#f8fafc] hover:bg-[#f1f4f6] text-[#003d9b] border border-[#cbd5e1] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Ward 4B (16 Beds)</span>
            </button>
          </div>
        </div>

        {/* Resized Interactive Heatmap Canvas */}
        <div className="bg-[#f8fafc] rounded-3xl p-5 sm:p-7 border border-[#e2e8f0] flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
            {heatmapBeds.map((bed) => {
              const isOverdue = bed.status === 'critical';
              const isDueSoon = bed.status === 'warning';

              const colorStyle = isOverdue
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 ring-4 ring-rose-200/80 border-rose-600'
                : isDueSoon
                ? 'bg-amber-400 text-slate-900 shadow-sm border-amber-500'
                : 'bg-emerald-100 text-emerald-900 border-emerald-200 hover:bg-emerald-200';

              return (
                <div
                  key={bed.id}
                  title={`Bed ${bed.id}: ${bed.doseCount} doses due (${bed.overdueCount || 0} overdue), ${bed.compliance}% on-time compliance`}
                  className={`h-20 sm:h-22 rounded-2xl border flex flex-col items-center justify-center font-mono cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 ${colorStyle}`}
                >
                  <span className="text-xs sm:text-sm font-black">Bed {bed.bedNumber}</span>
                  <span className="text-[10px] font-bold opacity-90 mt-0.5">
                    {bed.overdueCount ? `${bed.overdueCount} Overdue` : `${bed.doseCount} Doses`}
                  </span>
                  <span className="text-[9px] font-medium opacity-80 mt-0.5">
                    {bed.compliance}% On-time
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Statistics Legend */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-emerald-200 border border-emerald-300"></span>
                <span className="font-semibold text-slate-700">On-Time &amp; Normal ({normalBedsCount} Beds)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-amber-400 border border-amber-500"></span>
                <span className="font-semibold text-slate-700">Due Soon ({warningBedsCount} Bed)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-lg bg-rose-500 border border-rose-600 shadow-xs"></span>
                <span className="font-bold text-rose-700">Overdue ({criticalBedsCount} Bed • Bed 4B-06)</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="material-symbols-outlined text-[16px] text-slate-400">domain</span>
              <span>Ward 4B Inpatient Floorplan (Capacity: 16 Beds)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
