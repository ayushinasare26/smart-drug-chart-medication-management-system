import React, { useState } from 'react';

export const HospitalOperationsView: React.FC = () => {
  const [selectedWard, setSelectedWard] = useState<'ALL' | 'ICU' | 'WARD_4B' | 'PEDS'>('ALL');

  // Interactive Ward Matrix (Heatmap simulated beds)
  const heatmapBeds = [
    { id: '4B-01', status: 'normal', doseCount: 4, compliance: 100 },
    { id: '4B-02', status: 'normal', doseCount: 3, compliance: 100 },
    { id: '4B-03', status: 'warning', doseCount: 7, compliance: 92 },
    { id: '4B-04', status: 'normal', doseCount: 2, compliance: 100 },
    { id: '4B-05', status: 'normal', doseCount: 5, compliance: 100 },
    { id: '4B-06', status: 'critical', doseCount: 9, compliance: 85 },
    { id: '4B-07', status: 'normal', doseCount: 3, compliance: 100 },
    { id: '4B-08', status: 'warning', doseCount: 6, compliance: 94 },
    { id: '4B-09', status: 'normal', doseCount: 4, compliance: 100 },
    { id: '4B-10', status: 'normal', doseCount: 2, compliance: 100 },
    { id: '4B-11', status: 'normal', doseCount: 5, compliance: 100 },
    { id: '4B-12', status: 'critical', doseCount: 12, compliance: 80 },
    { id: '4B-13', status: 'normal', doseCount: 3, compliance: 100 },
    { id: '4B-14', status: 'normal', doseCount: 4, compliance: 100 },
    { id: '4B-15', status: 'warning', doseCount: 8, compliance: 90 },
    { id: '4B-16', status: 'normal', doseCount: 3, compliance: 100 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
          Hospital Operations Overview
        </h1>
        <p className="text-sm sm:text-base text-[#475569] mt-1">
          Real-time medication administration risk and compliance metrics across all wards.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Error Rate */}
        <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748b] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[#003d9b] text-[18px]">verified_user</span>
            <span>Medication Error Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">0.4%</span>
          </div>
          <p className="text-xs text-[#64748b]">
            <span className="font-semibold text-rose-500">+0.1%</span> from last week
          </p>
        </div>

        {/* Card 2: Compliance Score */}
        <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748b] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[#003d9b] text-[18px]">fact_check</span>
            <span>Compliance Score</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">98.2%</span>
          </div>
          <p className="text-xs text-[#64748b]">
            Target: <span className="font-semibold text-slate-700">&gt;95%</span>
          </p>
        </div>

        {/* Card 3: Avg Admin Time */}
        <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748b] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[#003d9b] text-[18px]">timer</span>
            <span>Avg Admin Time</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0f172a]">14m</span>
          </div>
          <p className="text-xs text-[#64748b]">
            <span className="font-semibold text-emerald-600">-2m</span> improvement
          </p>
        </div>

        {/* Card 4: AI Risk Prediction */}
        <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748b] tracking-wider uppercase">
            <span className="material-symbols-outlined text-[#003d9b] text-[18px]">psychology</span>
            <span>AI Risk Prediction</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#00687a]">Low</span>
          </div>
          <p className="text-xs text-[#64748b]">
            Next 24h outlook
          </p>
        </div>

      </div>

      {/* 2 Visual Panels: Heatmap & High-Risk Wards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Ward Medication Heatmap */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#0f172a]">
              Ward Medication Heatmap
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedWard(selectedWard === 'ALL' ? 'WARD_4B' : 'ALL')}
                className="px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f4f6] text-[#003d9b] border border-[#cbd5e1] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Interactive Heatmap Canvas */}
          <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0] flex flex-col justify-between min-h-[260px]">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {heatmapBeds.map((bed) => {
                const color =
                  bed.status === 'critical'
                    ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-200'
                    : bed.status === 'warning'
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';

                return (
                  <div
                    key={bed.id}
                    title={`Bed ${bed.id}: ${bed.doseCount} doses due, ${bed.compliance}% compliance`}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-[11px] cursor-pointer transition ${color}`}
                  >
                    <span>{bed.id.split('-')[1]}</span>
                    <span className="text-[9px] opacity-80">{bed.doseCount}d</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748b]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-200"></span>
                  <span>Normal Load</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-400"></span>
                  <span>Moderate (5-8 doses)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-rose-500"></span>
                  <span>High Acuity / Critical</span>
                </div>
              </div>
              <span className="font-semibold text-slate-700">Ward 4B Inpatient Floorplan</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: High-Risk Wards (AI Prediction) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-[#0f172a]">
            High-Risk Wards (AI Prediction)
          </h3>

          <div className="space-y-3">
            
            {/* ICU */}
            <div className="bg-[#f8fafc] rounded-xl p-4 border-l-4 border-l-rose-500 border border-[#e2e8f0] space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#0f172a]">
                  ICU - North Wing
                </h4>
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-md">
                  High
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                Elevated volume expected
              </p>
            </div>

            {/* Ward 4B */}
            <div className="bg-[#f8fafc] rounded-xl p-4 border-l-4 border-l-[#003d9b] border border-[#e2e8f0] space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#0f172a]">
                  Ward 4B - Internal Med
                </h4>
                <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-bold rounded-md">
                  Moderate
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                Staffing shift incoming
              </p>
            </div>

            {/* Pediatrics */}
            <div className="bg-[#f8fafc] rounded-xl p-4 border-l-4 border-l-emerald-600 border border-[#e2e8f0] space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#0f172a]">
                  Pediatrics - East
                </h4>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
                  Low
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                Routine schedule
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
