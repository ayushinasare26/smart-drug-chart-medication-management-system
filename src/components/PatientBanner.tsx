import React from 'react';
import { 
  User, 
  AlertOctagon, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Scale, 
  Droplet, 
  Flame, 
  AlertTriangle, 
  UserCheck, 
  ChevronRight,
  Sparkles,
  BedDouble,
  Info
} from 'lucide-react';
import { Patient } from '../types/medication';

interface PatientBannerProps {
  patient: Patient;
  onOpenPatientModal: () => void;
  onOpenAlertsModal: () => void;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  onOpenPatientModal,
  onOpenAlertsModal,
}) => {
  const isRenalImpaired = patient.vitals.eGFR < 60;
  const isHighRiskAllergy = patient.allergies.some((a) => a.severity === 'SEVERE_ANAPHYLAXIS');

  return (
    <section id="patient-banner" className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Main Grid: Patient Identity + Allergies + Renal/Vitals + Quick Switch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Col 1-5: Patient Identity, Bed, Demographics, Resuscitation */}
          <div className="lg:col-span-5 flex items-start gap-3.5">
            <div className="relative shrink-0">
              <img
                src={patient.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                alt={patient.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/40 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-slate-900 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-teal-300 border border-teal-500/40">
                {patient.roomBed}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-white tracking-tight truncate">
                  {patient.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {patient.mrn}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                  patient.resuscitationStatus === 'FULL_CODE'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                }`}>
                  {patient.resuscitationStatus === 'FULL_CODE' ? 'CPR Full Code' : 'DNACPR'}
                </span>
              </div>

              {/* Age, Sex, DOB, Weight, BSA, Primary Diagnosis */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                <span>
                  <strong className="text-slate-100">{patient.age}y</strong> ({patient.gender}) • DOB: {patient.dob}
                </span>
                <span className="text-slate-500">•</span>
                <span>
                  Wt: <strong className="text-slate-100">{patient.weightKg} kg</strong> | Ht: {patient.heightCm} cm
                </span>
                <span className="text-slate-500">•</span>
                <span>
                  BMI: <strong className="text-slate-100">{patient.bmi}</strong> | BSA: {patient.bsa} m²
                </span>
              </div>

              <div className="text-[11px] text-teal-300/90 font-medium truncate mt-1 flex items-center gap-1.5">
                <span className="text-slate-400">Diagnosis:</span>
                <span className="font-semibold text-slate-200">{patient.primaryDiagnosis}</span>
              </div>
            </div>
          </div>

          {/* Col 6-9: Severe Allergies & Critical Organ Metrics (eGFR, K+, INR) */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-800/80 lg:pl-4 pt-2 lg:pt-0">
            
            {/* Allergies Strip */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Allergies:
              </span>
              {patient.allergies.length === 0 ? (
                <span className="text-xs px-2 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 rounded-md font-medium">
                  No Known Drug Allergies (NKDA)
                </span>
              ) : (
                patient.allergies.map((alg) => (
                  <button
                    key={alg.id}
                    onClick={onOpenAlertsModal}
                    className={`text-xs px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border transition hover:scale-105 ${
                      alg.severity === 'SEVERE_ANAPHYLAXIS'
                        ? 'bg-rose-950/90 text-rose-200 border-rose-600/80 shadow-sm shadow-rose-950 animate-pulse'
                        : 'bg-amber-950/70 text-amber-200 border-amber-700/60'
                    }`}
                    title={`${alg.allergen}: ${alg.reaction}`}
                  >
                    <span>{alg.allergen}</span>
                    <span className="text-[10px] opacity-80 uppercase">
                      {alg.severity === 'SEVERE_ANAPHYLAXIS' ? '⚠️ ANAPHYLAXIS' : 'MOD'}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Renal & Metabolic Quick Indicators */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className={`px-2 py-1 rounded-lg border text-xs ${
                isRenalImpaired
                  ? 'bg-amber-950/40 border-amber-700/50 text-amber-300'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-200'
              }`}>
                <div className="text-[10px] text-slate-400 font-medium">eGFR</div>
                <div className="font-bold font-mono text-sm leading-tight">
                  {patient.vitals.eGFR}
                  <span className="text-[9px] font-normal text-slate-400 ml-0.5">mL/min</span>
                </div>
              </div>

              <div className="px-2 py-1 rounded-lg border bg-slate-800/60 border-slate-700/50 text-slate-200 text-xs">
                <div className="text-[10px] text-slate-400 font-medium">Creatinine</div>
                <div className="font-bold font-mono text-sm leading-tight">
                  {patient.vitals.creatinine}
                  <span className="text-[9px] font-normal text-slate-400 ml-0.5">µmol/L</span>
                </div>
              </div>

              <div className="px-2 py-1 rounded-lg border bg-slate-800/60 border-slate-700/50 text-slate-200 text-xs">
                <div className="text-[10px] text-slate-400 font-medium">Potassium</div>
                <div className="font-bold font-mono text-sm leading-tight">
                  {patient.vitals.potassium || '4.2'}
                  <span className="text-[9px] font-normal text-slate-400 ml-0.5">mmol/L</span>
                </div>
              </div>

              <div className="px-2 py-1 rounded-lg border bg-slate-800/60 border-slate-700/50 text-slate-200 text-xs">
                <div className="text-[10px] text-slate-400 font-medium">INR</div>
                <div className="font-bold font-mono text-sm leading-tight">
                  {patient.vitals.inr || '1.0'}
                </div>
              </div>
            </div>

          </div>

          {/* Col 10-12: Vitals & Ward Patient Switcher Action */}
          <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 lg:border-l border-slate-800/80 lg:pl-4 pt-2 lg:pt-0">
            
            {/* Live Vitals Snapshot */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-200">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>BP: {patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia}</span>
                <span className="text-slate-500">|</span>
                <span>HR: {patient.vitals.heartRate} bpm</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-2">
                <span>SpO2: <strong className="text-slate-200">{patient.vitals.spO2}%</strong></span>
                <span>Temp: <strong className="text-slate-200">{patient.vitals.temperature}°C</strong></span>
                <span>Pain: <strong className="text-slate-200">{patient.vitals.painScore || 0}/10</strong></span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Vitals logged: {patient.vitals.lastUpdated}
              </div>
            </div>

            {/* Switch Patient Modal trigger button */}
            <button
              id="btn-switch-patient"
              onClick={onOpenPatientModal}
              className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
              title="Open Ward Bed Map & Switch Patient"
            >
              <BedDouble className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Ward Beds</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
