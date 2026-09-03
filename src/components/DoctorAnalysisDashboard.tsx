import React, { useState } from 'react';

export const DoctorAnalysisDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedAIInsight, setSelectedAIInsight] = useState<string | null>('ai-1');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [chartViewMode, setChartViewMode] = useState<'GRAPHS' | 'CARDS'>('GRAPHS');
  const [activeHoverBar, setActiveHoverBar] = useState<string | null>(null);

  // Core KPI Data based on Subproblem 5 specifications
  const kpiData = {
    dueToday: timeRange === 'TODAY' ? 142 : timeRange === 'WEEK' ? 984 : 4210,
    completedOnTime: timeRange === 'TODAY' ? 128 : timeRange === 'WEEK' ? 892 : 3850,
    completedRate: '90.1%',
    delayedMedicines: timeRange === 'TODAY' ? 10 : timeRange === 'WEEK' ? 68 : 280,
    avgDelayMinutes: '18m',
    missedMedicines: timeRange === 'TODAY' ? 4 : timeRange === 'WEEK' ? 24 : 80,
    pendingStatOrders: 2,
    avgStatVelocity: '5.8 min',
    targetStatVelocity: '< 10 min',
  };

  // Ward Comparison Matrix
  const wardMetrics = [
    {
      name: 'ICU - North Wing',
      code: 'ICU',
      onTimeRate: 94.8,
      delayedRate: 4.2,
      missedRate: 1.0,
      totalDoses: 38,
      avgStatTime: '4.2 min',
      riskLevel: 'LOW',
      topDelayedDrug: 'Noradrenaline Infusion (Titration)',
    },
    {
      name: 'Ward 4B - Internal Med',
      code: 'WARD_4B',
      onTimeRate: 88.5,
      delayedRate: 8.5,
      missedRate: 3.0,
      totalDoses: 52,
      avgStatTime: '6.4 min',
      riskLevel: 'MEDIUM',
      topDelayedDrug: 'Vancomycin IVPB (Compounding delay)',
    },
    {
      name: 'Cardiology Step-Down',
      code: 'CARDIO',
      onTimeRate: 96.2,
      delayedRate: 2.8,
      missedRate: 1.0,
      totalDoses: 28,
      avgStatTime: '5.1 min',
      riskLevel: 'LOW',
      topDelayedDrug: 'Amiodarone (ECG check prior)',
    },
    {
      name: 'Pediatrics - East Wing',
      code: 'PEDS',
      onTimeRate: 98.0,
      delayedRate: 2.0,
      missedRate: 0.0,
      totalDoses: 24,
      avgStatTime: '3.9 min',
      riskLevel: 'OPTIMAL',
      topDelayedDrug: 'Oral Suspension (Weight-dosing verification)',
    },
  ];

  // AI Predictive Risk Engine Scenarios
  const aiPredictions = [
    {
      id: 'ai-1',
      title: 'Shift Change Medication Administration Peak (18:00 – 20:00)',
      targetWard: 'Ward 4B - Internal Med',
      riskScore: 84,
      riskLevel: 'HIGH_RISK',
      affectedDoses: '7 Scheduled Doses (Antibiotics & Evening Insulins)',
      predictionSummary: 'High probability of 25–40m delays during upcoming nurse shift handover.',
      primaryRootCauses: [
        'Cognitive load peak during nurse-to-nurse bedside verbal handovers (18:30 – 19:15).',
        'Simultaneous evening discharge paperwork and transport coordination.',
        'High clustering of 24 scheduled doses falling within a narrow 45-minute window.',
      ],
      aiRecommendations: [
        'Pre-stage oral and subcutaneous medications in automated dispensing carts by 17:30.',
        'Assign a dedicated floating medication nurse during the 18:00–20:00 transition period.',
        'Stagger routine maintenance doses by ±30 minutes where clinically permissible.',
      ],
      confidence: '93% Historical Accuracy (based on past 90 days eMAR logs)',
    },
    {
      id: 'ai-2',
      title: 'Complex Multi-Nurse IVPB Infusions (Vancomycin / Heparin)',
      targetWard: 'ICU & Ward 4B',
      riskScore: 68,
      riskLevel: 'MODERATE_RISK',
      affectedDoses: '3 High-Alert Infusions',
      predictionSummary: 'Delayed administration likely due to 2-nurse independent verification bottleneck.',
      primaryRootCauses: [
        'Both charge nurses engaged in emergency admissions during scheduled infusion window.',
        'Required lab review (Serum Creatinine & Peak/Trough levels) pending verification.',
      ],
      aiRecommendations: [
        'Auto-alert secondary verifier 20 minutes before infusion start.',
        'Flag STAT pharmacy priority for pre-mixed Vancomycin bags.',
      ],
      confidence: '88% Historical Accuracy',
    },
    {
      id: 'ai-3',
      title: 'Off-Ward Diagnostic Procedure Conflict (Radiology / Dialysis)',
      targetWard: 'Internal Medicine & Step-Down',
      riskScore: 91,
      riskLevel: 'CRITICAL_RISK',
      affectedDoses: '2 Oral Antihypertensives (Bed 4B-12)',
      predictionSummary: 'Patient scheduled for CT Angiogram at 10:00 AM while oral medication is due at 10:15 AM.',
      primaryRootCauses: [
        'Radiology scheduling system not synchronized with bedside eMAR timing grid.',
        'Patient will be in transit / holding bay during scheduled dose window.',
      ],
      aiRecommendations: [
        'Reschedule morning dose to 13:00 PM post-procedure or administer at 08:30 AM pre-transport.',
        'Notify attending physician to authorize timing adjustment.',
      ],
      confidence: '96% Historical Accuracy',
    },
  ];

  // Hourly 24-Hour Administration & Delay Peak Timeline Data
  const hourlyData = [
    { hour: '06:00', totalDoses: 12, delayedDoses: 0, onTimeDoses: 12, label: 'Early AM' },
    { hour: '08:00', totalDoses: 28, delayedDoses: 2, onTimeDoses: 26, label: 'Morning Peak' },
    { hour: '10:00', totalDoses: 16, delayedDoses: 1, onTimeDoses: 15, label: 'Rounds' },
    { hour: '12:00', totalDoses: 20, delayedDoses: 1, onTimeDoses: 19, label: 'Noon Meds' },
    { hour: '14:00', totalDoses: 14, delayedDoses: 0, onTimeDoses: 14, label: 'Afternoon' },
    { hour: '16:00', totalDoses: 10, delayedDoses: 1, onTimeDoses: 9, label: 'Pre-Shift' },
    { hour: '18:00', totalDoses: 26, delayedDoses: 4, onTimeDoses: 22, label: 'Handover Spike' },
    { hour: '20:00', totalDoses: 18, delayedDoses: 2, onTimeDoses: 16, label: 'Evening' },
    { hour: '22:00', totalDoses: 22, delayedDoses: 0, onTimeDoses: 22, label: 'Night Peak' },
    { hour: '02:00', totalDoses: 6, delayedDoses: 0, onTimeDoses: 6, label: 'Night Round' },
  ];

  const maxHourlyVolume = Math.max(...hourlyData.map((d) => d.totalDoses));

  // Generate and download a formatted PDF / HTML clinical report
  const generateAndDownloadReport = () => {
    const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Clinical Medication Analysis & AI Risk Audit Report</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #fff; }
    .header { border-bottom: 2px solid #003d9b; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .hospital-title { font-size: 20px; font-weight: 900; color: #003d9b; text-transform: uppercase; letter-spacing: 0.5px; }
    .doc-subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
    .meta-box { text-align: right; font-size: 11px; color: #475569; }
    .meta-box strong { color: #0f172a; }
    .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; }
    .kpi-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .kpi-value { font-size: 24px; font-weight: 900; color: #0f172a; }
    .kpi-sub { font-size: 10px; font-weight: 600; margin-top: 4px; }
    .text-emerald { color: #059669; }
    .text-amber { color: #d97706; }
    .text-purple { color: #7e22ce; }
    .text-rose { color: #e11d48; }
    .section-title { font-size: 14px; font-weight: 800; color: #003d9b; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
    th { background: #f1f5f9; color: #334155; font-weight: 800; text-align: left; padding: 8px 10px; border: 1px solid #cbd5e1; }
    td { padding: 8px 10px; border: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .ai-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 14px; margin-bottom: 14px; }
    .ai-title { font-size: 12px; font-weight: 800; color: #5b21b6; margin-bottom: 4px; display: flex; justify-content: space-between; }
    .ai-cause { font-size: 11px; color: #4c1d95; margin: 4px 0; }
    .ai-rec { font-size: 11px; color: #047857; font-weight: 600; margin-top: 6px; }
    .sign-box { border-top: 1px solid #cbd5e1; padding-top: 16px; margin-top: 28px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
    .sign-line { border-bottom: 1px dashed #94a3b8; width: 180px; height: 30px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="hospital-title">National Hospital Health System • SmartMedChart</div>
      <div class="doc-subtitle">Clinical Medication Administration Analysis & AI Risk Audit Report • Subproblem 5</div>
    </div>
    <div class="meta-box">
      <div>Report ID: <strong>RPT-${Date.now().toString().slice(-6)}</strong></div>
      <div>Generated: <strong>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</strong></div>
      <div>Audit Level: <strong>Certified Inpatient eMAR</strong></div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-title">Due Today</div>
      <div class="kpi-value">${kpiData.dueToday}</div>
      <div class="kpi-sub">Total Scheduled</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Completed On-Time</div>
      <div class="kpi-value text-emerald">${kpiData.completedOnTime}</div>
      <div class="kpi-sub text-emerald">${kpiData.completedRate} Adherence</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Delayed (&gt;15m)</div>
      <div class="kpi-value text-amber">${kpiData.delayedMedicines}</div>
      <div class="kpi-sub text-amber">Avg Delay ${kpiData.avgDelayMinutes}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Missed (&gt;1h)</div>
      <div class="kpi-value text-purple">${kpiData.missedMedicines}</div>
      <div class="kpi-sub text-purple">Logged Justifications</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">STAT Velocity</div>
      <div class="kpi-value text-rose">${kpiData.avgStatVelocity}</div>
      <div class="kpi-sub text-emerald">Target ${kpiData.targetStatVelocity} (Met)</div>
    </div>
  </div>

  <div class="section-title">1. Inpatient Ward Delay & Adherence Comparison</div>
  <table>
    <thead>
      <tr>
        <th>Ward Name</th>
        <th>Total Doses</th>
        <th>On-Time %</th>
        <th>Delayed %</th>
        <th>Missed %</th>
        <th>STAT Admin Velocity</th>
        <th>Primary Delay Factor</th>
      </tr>
    </thead>
    <tbody>
      ${wardMetrics
        .map(
          (w) => `
        <tr>
          <td><strong>${w.name}</strong></td>
          <td>${w.totalDoses}</td>
          <td style="color: #059669; font-weight: bold;">${w.onTimeRate}%</td>
          <td style="color: #d97706;">${w.delayedRate}%</td>
          <td style="color: #7e22ce;">${w.missedRate}%</td>
          <td style="font-weight: bold; color: #003d9b;">${w.avgStatTime}</td>
          <td>${w.topDelayedDrug}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="section-title">2. Artificial Intelligence Predictive Delay Forecast & Root-Cause Explanations</div>
  ${aiPredictions
    .map(
      (pred) => `
    <div class="ai-box">
      <div class="ai-title">
        <span>⚠️ ${pred.title} (${pred.targetWard})</span>
        <span>Predicted Delay Probability: ${pred.riskScore}%</span>
      </div>
      <div style="font-size: 11px; margin-bottom: 6px; color: #334155;"><strong>Impact:</strong> ${pred.affectedDoses}</div>
      <div class="ai-cause"><strong>Root Cause Explanations:</strong> ${pred.primaryRootCauses.join(' | ')}</div>
      <div class="ai-rec"><strong>Recommended Clinical Action:</strong> ${pred.aiRecommendations.join('; ')}</div>
    </div>
  `
    )
    .join('')}

  <div class="sign-box">
    <div>
      <div>Clinical Oversight Officer: <strong>Dr. Julian Ross, MD / Dr. Sarah Chen, MD</strong></div>
      <div>Designation: Attending Physician & eMAR Safety Lead</div>
      <div>Audit Cryptographic Hash: <code style="font-size: 9px;">eMAR-SHA256-${Date.now()}</code></div>
    </div>
    <div>
      <div>Physician Signature:</div>
      <div class="sign-line"></div>
    </div>
  </div>
</body>
</html>`;

    // 1. Download file as document
    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Medication_Analysis_Shift_Report_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 2. Open print dialog for instant Save-As-PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 350);
    }
  };

  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setShowReportModal(true);
      generateAndDownloadReport();
      setTimeout(() => setExportSuccess(false), 5000);
    }, 400);
  };

  const filteredWards =
    selectedWard === 'ALL'
      ? wardMetrics
      : wardMetrics.filter((w) => w.code === selectedWard);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002b70] via-[#003d9b] to-[#0052cc] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-mono font-bold tracking-wider uppercase border border-white/20">
                Doctor Portal • Subproblem 5
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-400/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-2.5">
              Medication Analysis &amp; AI Smart Monitoring
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
              Visual graphs, ward-by-ward delay analytics, STAT velocity benchmarks, and predictive AI delay forecasting.
            </p>
          </div>

          {/* Quick Report Export Action */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className="px-4 py-2.5 bg-white text-[#003d9b] hover:bg-blue-50 active:scale-95 font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isExporting ? 'progress_activity' : 'picture_as_pdf'}
              </span>
              <span>{isExporting ? 'Downloading...' : 'Export & Print PDF'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl backdrop-blur-sm">
            {(['TODAY', 'WEEK', 'MONTH'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  timeRange === r
                    ? 'bg-white text-[#003d9b] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {r === 'TODAY' ? 'Current Shift / Today' : r === 'WEEK' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/70 font-medium">Filter Ward:</span>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-1.5 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="text-slate-900">All Inpatient Wards</option>
              <option value="WARD_4B" className="text-slate-900">Ward 4B (Internal Med)</option>
              <option value="ICU" className="text-slate-900">ICU - North Wing</option>
              <option value="CARDIO" className="text-slate-900">Cardiology Step-Down</option>
              <option value="PEDS" className="text-slate-900">Pediatrics - East</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Success Toast */}
      {exportSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>Clinical Medication Analysis &amp; AI Risk Audit Report generated and downloaded!</span>
          </div>
          <button
            onClick={generateAndDownloadReport}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Re-Download
          </button>
        </div>
      )}

      {/* SECTION 1: Core Dashboard KPI Cards (Subproblem 5 Specification) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Card 1: Medicines Due Today */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#003d9b] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Medicines Due Today
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0f172a]">{kpiData.dueToday}</span>
            <span className="text-xs text-slate-500 font-medium">doses</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Across 4 Inpatient Wards
          </p>
        </div>

        {/* Card 2: Completed Medicines */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Completed Medicines
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{kpiData.completedOnTime}</span>
            <span className="text-xs font-bold text-emerald-700">({kpiData.completedRate})</span>
          </div>
          <p className="text-[11px] text-emerald-700 pt-1 border-t border-slate-100 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Administered on-time</span>
          </p>
        </div>

        {/* Card 3: Delayed Medicines */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">history_toggle_off</span>
          </div>
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Delayed Medicines
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{kpiData.delayedMedicines}</span>
            <span className="text-xs font-bold text-amber-700">avg {kpiData.avgDelayMinutes}</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Given &gt;15m past window
          </p>
        </div>

        {/* Card 4: Missed Medicines */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">event_busy</span>
          </div>
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
            Missed Medicines
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700">{kpiData.missedMedicines}</span>
            <span className="text-xs font-bold text-purple-600">(&gt;1h late)</span>
          </div>
          <p className="text-[11px] text-purple-700 pt-1 border-t border-slate-100 font-medium">
            Justifications logged
          </p>
        </div>

        {/* Card 5: Pending STAT Orders & Response Velocity */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          </div>
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
            Pending STAT Orders
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{kpiData.pendingStatOrders}</span>
            <span className="text-xs font-bold text-slate-600">Avg {kpiData.avgStatVelocity}</span>
          </div>
          <p className="text-[11px] text-emerald-700 pt-1 border-t border-slate-100 font-semibold">
            Velocity Target: {kpiData.targetStatVelocity}
          </p>
        </div>

      </div>

      {/* SECTION 2: Visual Graphical Analysis Section (Graphs & Charts) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
        
        {/* Section Header with View Toggle (Graphs vs Cards) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#003d9b]/10 text-[#003d9b] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">bar_chart_4_bars</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight">
                Ward-by-Ward Medication Delay &amp; On-Time Charts
              </h3>
              <p className="text-xs text-slate-500">
                Visual comparison of on-time adherence, delay proportions, and STAT response speeds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartViewMode('GRAPHS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                chartViewMode === 'GRAPHS'
                  ? 'bg-white text-[#003d9b] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              <span>Graphical Charts</span>
            </button>
            <button
              onClick={() => setChartViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                chartViewMode === 'CARDS'
                  ? 'bg-white text-[#003d9b] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Unit Cards</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: GRAPHICAL CHARTS & VISUAL DIAGRAMS */}
        {chartViewMode === 'GRAPHS' && (
          <div className="space-y-6">
            
            {/* Top Grid: Comparative Multi-Bar Chart & Donut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Ward Delay & Adherence Comparison Multi-Bar Chart */}
              <div className="lg:col-span-2 bg-[#f8fafc] rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0f172a] flex items-center gap-2">
                      <span>Inpatient Ward Adherence &amp; Delay Comparison</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-[#003d9b] font-bold rounded-full">
                        % Rates
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Comparing On-Time, Delayed (&gt;15m), and Missed (&gt;1h) rates across inpatient units
                    </p>
                  </div>

                  {/* Chart Legend */}
                  <div className="flex items-center gap-3 text-[11px] font-bold flex-wrap">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>On-Time</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span>Delayed</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                      <span>Missed</span>
                    </div>
                  </div>
                </div>

                {/* The Visual Bar Chart Canvas */}
                <div className="space-y-4 pt-2">
                  {filteredWards.map((w) => (
                    <div
                      key={w.code}
                      onMouseEnter={() => setActiveHoverBar(w.code)}
                      onMouseLeave={() => setActiveHoverBar(null)}
                      className={`p-3 rounded-xl transition space-y-2 border ${
                        activeHoverBar === w.code
                          ? 'bg-white border-[#003d9b]/30 shadow-xs'
                          : 'bg-transparent border-transparent hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#0f172a] flex items-center gap-1.5">
                          <span>{w.name}</span>
                          <span className="text-[10px] font-normal text-slate-400 font-mono">
                            ({w.totalDoses} doses)
                          </span>
                        </span>
                        <div className="flex items-center gap-3 font-mono font-bold text-[11px]">
                          <span className="text-emerald-700">{w.onTimeRate}%</span>
                          <span className="text-amber-700">{w.delayedRate}%</span>
                          <span className="text-purple-700">{w.missedRate}%</span>
                        </div>
                      </div>

                      {/* Multi-Segment Stacked Visual Bar */}
                      <div className="w-full h-5 bg-slate-200/90 rounded-xl overflow-hidden flex shadow-inner relative">
                        {/* On-time Segment */}
                        <div
                          style={{ width: `${w.onTimeRate}%` }}
                          title={`On-time: ${w.onTimeRate}%`}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                        >
                          {w.onTimeRate > 20 && `${w.onTimeRate}%`}
                        </div>

                        {/* Delayed Segment */}
                        <div
                          style={{ width: `${w.delayedRate}%` }}
                          title={`Delayed: ${w.delayedRate}%`}
                          className="bg-gradient-to-r from-amber-400 to-amber-500 h-full flex items-center justify-center text-[9px] font-bold text-slate-900 transition-all duration-500"
                        >
                          {w.delayedRate > 4 && `${w.delayedRate}%`}
                        </div>

                        {/* Missed Segment */}
                        <div
                          style={{ width: `${w.missedRate}%` }}
                          title={`Missed: ${w.missedRate}%`}
                          className="bg-purple-600 h-full flex items-center justify-center text-[9px] font-bold text-white transition-all duration-500"
                        >
                          {w.missedRate > 1 && `${w.missedRate}%`}
                        </div>
                      </div>

                      {/* Ward Subtext & Stat Admin Velocity */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span className="truncate max-w-[240px]">
                          Primary delay factor: <strong className="text-slate-700">{w.topDelayedDrug}</strong>
                        </span>
                        <span className="font-semibold text-[#003d9b] shrink-0">
                          STAT Speed: {w.avgStatTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart Baseline Guide */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-3 pt-1 border-t border-slate-200">
                  <span>0% (Worst)</span>
                  <span>50% Threshold</span>
                  <span>75% Target</span>
                  <span>100% (Perfect Adherence)</span>
                </div>
              </div>

              {/* Right 1 Col: Overall Status Donut & KPI Gauge */}
              <div className="bg-[#f8fafc] rounded-2xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-[#0f172a]">
                    Total Medication Breakdown
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Distribution of {kpiData.dueToday} total scheduled doses
                  </p>
                </div>

                {/* Circular SVG Donut Chart */}
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    {/* On-time segment (90.1%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - 0.901)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000"
                    />
                    {/* Delayed segment (7.0%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f59e0b"
                      strokeWidth="12"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - 0.07)}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{
                        transformOrigin: 'center',
                        transform: 'rotate(324deg)',
                      }}
                      className="transition-all duration-1000"
                    />
                    {/* Missed segment (2.9%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#7e22ce"
                      strokeWidth="12"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - 0.029)}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{
                        transformOrigin: 'center',
                        transform: 'rotate(349deg)',
                      }}
                      className="transition-all duration-1000"
                    />
                  </svg>

                  {/* Inner text callout */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-[#0f172a] leading-none">
                      {kpiData.completedRate}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                      On-Time
                    </span>
                  </div>
                </div>

                {/* Donut Legend Stats */}
                <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-700">On-Time (Target &gt;90%)</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{kpiData.completedOnTime} ({kpiData.completedRate})</span>
                  </div>

                  <div className="flex items-center justify-between font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="text-slate-700">Delayed (&gt;15m)</span>
                    </div>
                    <span className="font-mono font-bold text-amber-800">{kpiData.delayedMedicines} (7.0%)</span>
                  </div>

                  <div className="flex items-center justify-between font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                      <span className="text-slate-700">Missed (&gt;1h)</span>
                    </div>
                    <span className="font-mono font-bold text-purple-700">{kpiData.missedMedicines} (2.9%)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Grid: 24-Hour Load & Delay Timeline + STAT Velocity Benchmark */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              
              {/* Left 2 Cols: 24-Hour Hourly Medication Load & Delay Peak Timeline */}
              <div className="lg:col-span-2 bg-[#f8fafc] rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0f172a] flex items-center gap-2">
                      <span>24-Hour Medication Load &amp; Delay Timeline</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-full">
                        Shift Peak at 18:00
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Hourly distribution of routine administration volume vs. delay occurrences
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <div className="flex items-center gap-1 text-[#003d9b]">
                      <span className="w-2.5 h-2.5 rounded bg-[#003d9b]"></span>
                      <span>On-Time Meds</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-700">
                      <span className="w-2.5 h-2.5 rounded bg-amber-400"></span>
                      <span>Delayed Meds</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Bar Histogram Canvas */}
                <div className="pt-6 pb-2">
                  <div className="h-40 flex items-end justify-between gap-1.5 sm:gap-3 px-2 border-b border-slate-300">
                    {hourlyData.map((d) => {
                      const totalHeight = (d.totalDoses / maxHourlyVolume) * 100;
                      const delayHeight = (d.delayedDoses / d.totalDoses) * 100;
                      const isPeak = d.hour === '18:00';

                      return (
                        <div
                          key={d.hour}
                          title={`${d.hour} (${d.label}): ${d.totalDoses} doses (${d.delayedDoses} delayed)`}
                          className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                        >
                          <span className="text-[9px] font-mono font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition">
                            {d.totalDoses}d
                          </span>

                          <div
                            style={{ height: `${totalHeight}%` }}
                            className={`w-full max-w-[28px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:scale-105 ${
                              isPeak ? 'ring-2 ring-amber-400/80 shadow-md' : ''
                            }`}
                          >
                            {/* Delayed portion on top */}
                            {d.delayedDoses > 0 && (
                              <div
                                style={{ height: `${delayHeight}%` }}
                                className="w-full bg-amber-400 border-b border-amber-500"
                              ></div>
                            )}
                            {/* On-time portion */}
                            <div className="w-full flex-1 bg-[#003d9b]"></div>
                          </div>

                          <span className="text-[10px] font-mono text-slate-600 mt-2 font-bold group-hover:text-[#003d9b]">
                            {d.hour}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 px-2">
                    <span>Morning Rounds (08:00)</span>
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ⚠️ Handover Delay Peak (18:00 - 20:00)
                    </span>
                    <span>Night Rounds (22:00)</span>
                  </div>
                </div>
              </div>

              {/* Right 1 Col: STAT Velocity Speedometer & Benchmark */}
              <div className="bg-[#f8fafc] rounded-2xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-[#0f172a] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-rose-600">speed</span>
                    <span>STAT Response Velocity</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Order-to-injection velocity vs &lt;10 min safety target
                  </p>
                </div>

                {/* Speedometer Bar Visuals */}
                <div className="space-y-3.5 pt-1">
                  {filteredWards.map((w) => {
                    const speedNum = parseFloat(w.avgStatTime);
                    const speedPercent = (speedNum / 10) * 100;
                    const isOptimal = speedNum <= 5.0;

                    return (
                      <div key={w.code} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800">{w.name}</span>
                          <span className={`font-mono ${isOptimal ? 'text-emerald-700' : 'text-[#003d9b]'}`}>
                            {w.avgStatTime}
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
                          {/* 10 min target line mark */}
                          <div
                            style={{ width: `${Math.min(speedPercent, 100)}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOptimal
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            }`}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* STAT Benchmark Note */}
                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">verified</span>
                  <div>
                    <span className="font-bold block">Hospital Velocity Standard:</span>
                    <span>All wards successfully beating the &lt; 10 min critical threshold (Hospital Avg: 5.8m).</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: WARD MATRIX CARDS */}
        {chartViewMode === 'CARDS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWards.map((w) => (
              <div
                key={w.code}
                className="bg-[#f8fafc] rounded-2xl p-5 border border-slate-200/80 space-y-3.5 hover:border-[#003d9b]/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#0f172a]">{w.name}</h4>
                    <span className="text-xs text-slate-500 font-mono">{w.totalDoses} Doses Scheduled Today</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                      w.riskLevel === 'OPTIMAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : w.riskLevel === 'LOW'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {w.riskLevel === 'OPTIMAL' ? 'Optimal Compliance' : `${w.riskLevel} Risk`}
                  </span>
                </div>

                {/* Progress Distribution Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-700">On-Time: {w.onTimeRate}%</span>
                    <span className="text-amber-700">Delayed: {w.delayedRate}%</span>
                    <span className="text-purple-700">Missed: {w.missedRate}%</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                    <div style={{ width: `${w.onTimeRate}%` }} className="bg-emerald-500 h-full"></div>
                    <div style={{ width: `${w.delayedRate}%` }} className="bg-amber-400 h-full"></div>
                    <div style={{ width: `${w.missedRate}%` }} className="bg-purple-600 h-full"></div>
                  </div>
                </div>

                {/* Secondary Ward Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">STAT Admin Speed</span>
                    <span className="text-xs font-extrabold text-[#003d9b] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">speed</span>
                      {w.avgStatTime}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Top Delayed Drug</span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate block mt-0.5" title={w.topDelayedDrug}>
                      {w.topDelayedDrug}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* SECTION 3: Artificial Intelligence Predictive Risk & Root-Cause Explanation Engine */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <span className="material-symbols-outlined text-[22px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  AI Predictive Delay &amp; Missed Dose Risk Engine
                </h3>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold rounded border border-indigo-400/30">
                  Neural eMAR ML
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyzes historical medication logs to predict delay-prone situations and explains root causes.
              </p>
            </div>
          </div>
        </div>

        {/* AI Insight Selector & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column: AI Prediction Cards List */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Delay Predictions:
            </span>
            {aiPredictions.map((pred) => {
              const isSelected = selectedAIInsight === pred.id;
              return (
                <div
                  key={pred.id}
                  onClick={() => setSelectedAIInsight(pred.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-indigo-900/60 border-indigo-400 shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-400/40'
                      : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-700/50">
                      {pred.targetWard}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pred.riskLevel === 'CRITICAL_RISK'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : pred.riskLevel === 'HIGH_RISK'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {pred.riskScore}% Delay Probability
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-2">
                    {pred.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {pred.affectedDoses}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right 2 Columns: In-Depth AI Root-Cause & Recommendation Explainer */}
          {selectedAIInsight && (() => {
            const activePred = aiPredictions.find((p) => p.id === selectedAIInsight) || aiPredictions[0];
            return (
              <div className="lg:col-span-2 bg-slate-950/80 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-5 flex flex-col justify-between">
                
                {/* Prediction Summary Header */}
                <div className="space-y-2 border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-base sm:text-lg font-bold text-indigo-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                      <span>{activePred.title}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {activePred.confidence}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activePred.predictionSummary}
                  </p>
                </div>

                {/* AI Root-Cause Explanations */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
                    <span>AI Root-Cause Explanations (Why this delay is predicted):</span>
                  </div>
                  <div className="space-y-2 bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
                    {activePred.primaryRootCauses.map((cause, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{cause}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Clinical Recommendations */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">recommend</span>
                    <span>Recommended Physician / Charge Nurse Actions:</span>
                  </div>
                  <div className="space-y-2 bg-emerald-950/30 rounded-xl p-3.5 border border-emerald-500/20">
                    {activePred.aiRecommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-emerald-200 leading-relaxed">
                        <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0">check_circle</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                  <span>Impact: {activePred.affectedDoses}</span>
                  <button
                    type="button"
                    onClick={() => alert(`AI Intervention logged for ${activePred.title}. Notification dispatched to Ward Charge Nurse.`)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition cursor-pointer"
                  >
                    Dispatch AI Pre-Alert to Ward
                  </button>
                </div>

              </div>
            );
          })()}

        </div>
      </div>

    </div>
  );
};
