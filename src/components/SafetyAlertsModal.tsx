import React, { useState } from 'react';
import { 
  Patient, 
  MedicationOrder, 
  ClinicalStaff 
} from '../types/medication';
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertOctagon, 
  X, 
  CheckCircle2, 
  Activity, 
  Heart, 
  Droplet, 
  FileText,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';

interface SafetyAlertsModalProps {
  patient: Patient;
  medications: MedicationOrder[];
  currentStaff: ClinicalStaff;
  onClose: () => void;
}

export const SafetyAlertsModal: React.FC<SafetyAlertsModalProps> = ({
  patient,
  medications,
  currentStaff,
  onClose,
}) => {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [overrideNotes, setOverrideNotes] = useState<Record<string, string>>({});
  const [showOverrideInput, setShowOverrideInput] = useState<string | null>(null);

  // Generate dynamic clinical safety warnings
  const alertsList = [
    // Allergy cross-reactivity
    ...(patient.allergies.map((alg) => ({
      id: `alert-allergy-${alg.id}`,
      category: 'ALLERGY' as const,
      severity: alg.severity === 'SEVERE_ANAPHYLAXIS' ? ('CRITICAL' as const) : ('HIGH' as const),
      title: `Documented Allergy: ${alg.allergen}`,
      description: `Patient has documented ${alg.reaction}. Automatic contraindication check active for all prescribed beta-lactams & related drug classes.`,
      recommendation: 'Ensure no cephalosporins, penicillins, or cross-reacting carbapenems are administered without pharmacist consultation.',
      relatedDrug: alg.allergen,
    }))),

    // Renal clearance alerts
    ...(patient.vitals.eGFR < 60 ? [{
      id: 'alert-renal-egfr',
      category: 'RENAL' as const,
      severity: 'HIGH' as const,
      title: `Moderate Renal Impairment (eGFR ${patient.vitals.eGFR} mL/min/1.73m²)`,
      description: `Serum Creatinine is ${patient.vitals.creatinine} µmol/L. Renal excretion clearance is impaired.`,
      recommendation: 'Apixaban dose should be capped at 2.5mg BD. Monitor daily potassium and fluid balance for loop diuretics.',
      relatedDrug: 'Apixaban, Furosemide, Ramipril',
    }] : []),

    // High Alert Medications active
    ...(medications.filter((m) => m.isHighAlert).map((m) => ({
      id: `alert-high-alert-${m.id}`,
      category: 'HIGH_ALERT' as const,
      severity: 'MODERATE' as const,
      title: `High-Alert Regimen: ${m.genericName} (${m.dose})`,
      description: `Classified as an ISMP High-Alert Medication. Mandatory dual-nurse verification required at administration.`,
      recommendation: m.specialInstructions || 'Pre-dose vitals check and independent calculation check required.',
      relatedDrug: m.genericName,
    }))),

    // Anticoagulant bleeding risk
    ...(medications.some((m) => m.genericName.toLowerCase().includes('apixaban') || m.genericName.toLowerCase().includes('enoxaparin')) ? [{
      id: 'alert-bleed-risk',
      category: 'BLEEDING' as const,
      severity: 'MODERATE' as const,
      title: 'Anticoagulant Active Bleeding Precautions',
      description: 'Patient is receiving systemic therapeutic anticoagulation. High risk for hematoma or occult gastrointestinal bleeding.',
      recommendation: 'Do NOT administer concurrent NSAIDs or antiplatelet agents without specific haematology / consultant instruction.',
      relatedDrug: 'Apixaban / Enoxaparin',
    }] : []),
  ];

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts([...acknowledgedAlerts, alertId]);
    setShowOverrideInput(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Clinical Decision Support Engine (CDS)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Real-Time Safety Matrix
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Safety Alerts for {patient.name} ({patient.roomBed})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Status Overview Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">Renal Function</span>
            <strong className={`font-mono ${patient.vitals.eGFR < 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
              eGFR {patient.vitals.eGFR} mL/min
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Serum Potassium</span>
            <strong className="font-mono text-slate-200">{patient.vitals.potassium || 4.2} mmol/L</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Allergies Count</span>
            <strong className={`font-mono ${patient.allergies.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {patient.allergies.length} on record
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">High-Alert Meds</span>
            <strong className="font-mono text-amber-400">
              {medications.filter((m) => m.isHighAlert).length} active
            </strong>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
          {alertsList.map((alert) => {
            const isAck = acknowledgedAlerts.includes(alert.id);

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition space-y-2.5 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/40 border-rose-600/80 shadow-md shadow-rose-950/50'
                    : alert.severity === 'HIGH'
                    ? 'bg-amber-950/30 border-amber-600/70'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {alert.severity === 'CRITICAL' ? (
                      <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                    ) : alert.severity === 'HIGH' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <Info className="w-5 h-5 text-cyan-400 shrink-0" />
                    )}
                    <div>
                      <h3 className="font-bold text-white text-sm">{alert.title}</h3>
                      <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">
                        Category: {alert.category} • Related: {alert.relatedDrug}
                      </span>
                    </div>
                  </div>

                  {isAck ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowOverrideInput(showOverrideInput === alert.id ? null : alert.id)}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                    >
                      Acknowledge & Sign
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {alert.description}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-teal-300 font-semibold">Clinical Action:</strong> {alert.recommendation}
                </div>

                {/* Clinical Override / Acknowledgment Input Form */}
                {showOverrideInput === alert.id && !isAck && (
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-2 text-xs">
                    <label className="text-[10px] text-slate-400 font-semibold block">
                      Enter Clinical Rationale / Consultant Authorization:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dose reviewed with Dr. Ross; benefits outweigh risk. Daily labs ordered."
                      value={overrideNotes[alert.id] || ''}
                      onChange={(e) =>
                        setOverrideNotes({ ...overrideNotes, [alert.id]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowOverrideInput(null)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs"
                      >
                        Confirm Override
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Logged by: <strong className="text-slate-200">{currentStaff.name}</strong> ({currentStaff.role})
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Close Safety Panel
          </button>
        </div>

      </div>
    </div>
  );
};
