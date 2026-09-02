import React, { useState, useMemo } from 'react';
import { 
  Patient, 
  MedicationOrder, 
  MedicationCategory, 
  RouteType, 
  ClinicalStaff 
} from '../types/medication';
import { DRUG_CATALOGUE } from '../data/mockData';
import { 
  Pill, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Search, 
  PlusCircle, 
  Sparkles, 
  Activity, 
  Droplets, 
  Clock, 
  Check 
} from 'lucide-react';

interface PrescribeMedicationModalProps {
  patient: Patient;
  existingMedications: MedicationOrder[];
  currentStaff: ClinicalStaff;
  onClose: () => void;
  onPrescribeSuccess: (newMed: MedicationOrder) => void;
}

export const PrescribeMedicationModal: React.FC<PrescribeMedicationModalProps> = ({
  patient,
  existingMedications,
  currentStaff,
  onClose,
  onPrescribeSuccess,
}) => {
  const [genericName, setGenericName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState<MedicationCategory>('REGULAR');
  const [form, setForm] = useState('Oral Tablet');
  const [dose, setDose] = useState('40 mg');
  const [route, setRoute] = useState<RouteType>('Oral (PO)');
  const [frequency, setFrequency] = useState('Once Daily (OD)');
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(['08:00']);
  const [indication, setIndication] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isHighAlert, setIsHighAlert] = useState(false);
  const [requiresVitals, setRequiresVitals] = useState<('HR' | 'BP' | 'GLUCOSE' | 'INR' | 'PAIN')[]>([]);

  // Search filter for catalogue
  const [searchCatalog, setSearchCatalog] = useState('');

  // Frequency presets
  const handleFrequencyChange = (freq: string) => {
    setFrequency(freq);
    if (freq.includes('Once Daily (OD)') || freq.includes('Once Daily Morning')) {
      setScheduleTimes(['08:00']);
    } else if (freq.includes('Twice Daily (BD)')) {
      setScheduleTimes(['08:00', '20:00']);
    } else if (freq.includes('Three Times (TDS)')) {
      setScheduleTimes(['08:00', '14:00', '20:00']);
    } else if (freq.includes('Four Times (QDS)')) {
      setScheduleTimes(['06:00', '12:00', '18:00', '22:00']);
    } else if (freq.includes('Night (ON)')) {
      setScheduleTimes(['22:00']);
    } else if (freq.includes('PRN') || freq.includes('Continuous')) {
      setScheduleTimes([]);
    }
  };

  const handleSelectCatalogItem = (item: typeof DRUG_CATALOGUE[0]) => {
    setGenericName(item.genericName);
    setBrandName(item.brandNames[0] || '');
    setForm(item.forms[0]);
    setDose(item.defaultDoses[0]);
    setRoute(item.routes[0]);
    setIsHighAlert(item.highAlert);
    if (item.requiresVitals) {
      setRequiresVitals(item.requiresVitals);
    }
    setSearchCatalog('');
  };

  // Real-time Safety & Interaction Scanner against patient
  const safetyWarnings = useMemo(() => {
    const warnings: { type: 'ALLERGY' | 'INTERACTION' | 'RENAL'; title: string; text: string; severity: 'HIGH' | 'MEDIUM' }[] = [];
    const nameLower = genericName.toLowerCase();

    // Check allergies
    patient.allergies.forEach((allergy) => {
      const algLower = allergy.allergen.toLowerCase();
      if (
        (algLower.includes('penicillin') && (nameLower.includes('penicillin') || nameLower.includes('amoxicillin') || nameLower.includes('piperacillin') || nameLower.includes('ceftriaxone') || nameLower.includes('ampicillin'))) ||
        (algLower.includes('nsaid') && (nameLower.includes('ibuprofen') || nameLower.includes('naproxen') || nameLower.includes('ketorolac') || nameLower.includes('aspirin'))) ||
        (algLower.includes('codeine') && (nameLower.includes('codeine') || nameLower.includes('tramadol') || nameLower.includes('morphine'))) ||
        (algLower.includes('aspirin') && (nameLower.includes('aspirin') || nameLower.includes('salicylate')))
      ) {
        warnings.push({
          type: 'ALLERGY',
          title: `CRITICAL ALLERGY CONFLICT: ${allergy.allergen}`,
          text: `Patient has documented ${allergy.severity.replace('_', ' ')} (${allergy.reaction}).`,
          severity: 'HIGH',
        });
      }
    });

    // Check Renal impairment
    if (patient.vitals.eGFR < 60) {
      if (nameLower.includes('furosemide') || nameLower.includes('ramipril') || nameLower.includes('apixaban') || nameLower.includes('vancomycin') || nameLower.includes('gentamicin')) {
        warnings.push({
          type: 'RENAL',
          title: `RENAL DOSING ALERT (eGFR ${patient.vitals.eGFR} mL/min)`,
          text: `Dose reduction or close monitoring of serum creatinine/electrolytes is recommended for ${genericName || 'this drug'}.`,
          severity: 'MEDIUM',
        });
      }
    }

    // Check Drug-Drug Interactions with existing meds
    existingMedications.forEach((existing) => {
      const exName = existing.genericName.toLowerCase();
      if (nameLower.includes('spironolactone') && (exName.includes('potassium') || exName.includes('ramipril'))) {
        warnings.push({
          type: 'INTERACTION',
          title: `Severe Hyperkalemia Risk: ${existing.genericName}`,
          text: `Concurrent use of ACE inhibitors / Potassium supplements with potassium-sparing agents significantly increases risk of fatal hyperkalemia.`,
          severity: 'HIGH',
        });
      }
      if (nameLower.includes('ciprofloxacin') && exName.includes('warfarin')) {
        warnings.push({
          type: 'INTERACTION',
          title: `Major Bleeding Risk: Warfarin`,
          text: `Ciprofloxacin inhibits CYP1A2/CYP3A4, dramatically elevating INR levels.`,
          severity: 'HIGH',
        });
      }
    });

    return warnings;
  }, [genericName, patient, existingMedications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericName.trim()) {
      alert('Please enter a generic medication name.');
      return;
    }

    // Build slots
    const slots = scheduleTimes.map((time, idx) => ({
      id: `slot-new-${Date.now()}-${idx}`,
      scheduledTime: time,
      scheduledDateTime: `2026-09-01T${time}:00`,
      status: time === '08:00' ? ('DUE' as const) : ('SCHEDULED' as const),
      barcodeVerified: false,
    }));

    const newMed: MedicationOrder = {
      id: `med-${Date.now()}`,
      genericName: genericName.trim(),
      brandName: brandName.trim() || undefined,
      category,
      form,
      dose,
      route,
      frequency,
      scheduleTimes,
      indication: indication || 'Inpatient therapeutic management',
      prescribedBy: `${currentStaff.name} (${currentStaff.badgeNumber})`,
      prescribedDate: 'Today Just Now',
      startDate: '2026-09-01',
      specialInstructions: specialInstructions || undefined,
      isHighAlert,
      requiresVitalsCheck: requiresVitals.length > 0 ? requiresVitals : undefined,
      pharmacyStatus: 'PENDING_REVIEW',
      dispensingStatus: 'IN_STOCK',
      storageLocation: 'Ward 4B Automated Dispensing Pyxis',
      prnMaxDose24h: category === 'PRN' ? 'As prescribed' : undefined,
      prnMinIntervalHours: category === 'PRN' ? 4 : undefined,
      infusionRateMlHr: category === 'INFUSION' ? 100 : undefined,
      infusionStatus: category === 'INFUSION' ? 'RUNNING' : undefined,
      bagVolumeMl: category === 'INFUSION' ? 500 : undefined,
      volumeInfusedMl: category === 'INFUSION' ? 0 : undefined,
      slots,
    };

    onPrescribeSuccess(newMed);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                Clinical Inpatient Prescribing (e-Prescribe)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Prescriber: <strong className="text-slate-200">{currentStaff.name}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Add Medication Order for {patient.name} ({patient.roomBed})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drug Catalog Quick Autocomplete Search */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Quick Select from Hospital Formulary (BNF / Hospital Formulary)</span>
            <span className="text-[10px] text-teal-400 font-mono">Smart Autocomplete</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search formulary drug (e.g. Furosemide, Bisoprolol, Insulin, Vancomycin, Enoxaparin)..."
              value={searchCatalog}
              onChange={(e) => setSearchCatalog(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {searchCatalog.trim() && (
            <div className="max-h-40 overflow-y-auto space-y-1 pt-1 scrollbar-thin">
              {DRUG_CATALOGUE.filter((d) =>
                d.genericName.toLowerCase().includes(searchCatalog.toLowerCase()) ||
                d.brandNames.some((b) => b.toLowerCase().includes(searchCatalog.toLowerCase()))
              ).map((item) => (
                <button
                  key={item.genericName}
                  type="button"
                  onClick={() => handleSelectCatalogItem(item)}
                  className="w-full text-left p-2 rounded-xl bg-slate-900/90 hover:bg-teal-950/60 border border-slate-800/80 hover:border-teal-700/60 text-xs flex items-center justify-between transition"
                >
                  <div>
                    <strong className="text-white">{item.genericName}</strong>
                    <span className="text-slate-400 ml-1.5">({item.brandNames.join(', ')})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.highAlert && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        High Alert
                      </span>
                    )}
                    <span className="text-[11px] text-teal-400 font-mono">{item.forms[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Safety Warnings Banner */}
        {safetyWarnings.length > 0 && (
          <div className="space-y-2">
            {safetyWarnings.map((warn, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  warn.severity === 'HIGH'
                    ? 'bg-rose-950/80 border-rose-700 text-rose-200 shadow-md shadow-rose-950 animate-pulse'
                    : 'bg-amber-950/80 border-amber-700 text-amber-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{warn.title}</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{warn.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Prescribing Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Row 1: Generic Name & Brand Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Generic Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bisoprolol Fumarate"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Brand / Trade Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cardicor"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Category, Formulation, Dose, Route */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MedicationCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="REGULAR">Regular Scheduled</option>
                <option value="PRN">PRN (As-Required)</option>
                <option value="INFUSION">Continuous IV Infusion</option>
                <option value="STAT">STAT / Once-Only</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Formulation
              </label>
              <input
                type="text"
                value={form}
                onChange={(e) => setForm(e.target.value)}
                placeholder="e.g. Oral Tablet"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Dose & Strength *
              </label>
              <input
                type="text"
                required
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g. 5 mg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Route
              </label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value as RouteType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="Oral (PO)">Oral (PO)</option>
                <option value="Intravenous (IV)">Intravenous (IV)</option>
                <option value="Subcutaneous (SC)">Subcutaneous (SC)</option>
                <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                <option value="Inhalation">Inhalation</option>
                <option value="Sublingual (SL)">Sublingual (SL)</option>
                <option value="Topical">Topical</option>
              </select>
            </div>
          </div>

          {/* Row 3: Frequency & Timetable slots */}
          {category === 'REGULAR' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Standard Frequency Preset
                </label>
                <select
                  value={frequency}
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="Once Daily Morning (OD)">Once Daily Morning (OD) - 08:00</option>
                  <option value="Twice Daily (BD)">Twice Daily (BD) - 08:00, 20:00</option>
                  <option value="Three Times (TDS)">Three Times (TDS) - 08:00, 14:00, 20:00</option>
                  <option value="Four Times (QDS)">Four Times (QDS) - 06:00, 12:00, 18:00, 22:00</option>
                  <option value="Once Daily Night (ON)">Once Daily Night (ON) - 22:00</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Scheduled Administration Timings
                </label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00', '00:00'].map((time) => {
                    const isSelected = scheduleTimes.includes(time);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setScheduleTimes(scheduleTimes.filter((t) => t !== time));
                          } else {
                            setScheduleTimes([...scheduleTimes, time].sort());
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Row 4: Indication & Special Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Clinical Indication *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Heart Failure rate control, DVT Prophylaxis"
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                Special Nursing Instructions / Protocols
              </label>
              <input
                type="text"
                placeholder="e.g. Check HR before dose. Withhold if SBP < 90."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 5: High-Alert & Pre-dose Vitals Check triggers */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
              <input
                type="checkbox"
                checked={isHighAlert}
                onChange={(e) => setIsHighAlert(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded bg-slate-900 border-slate-700"
              />
              <span className="flex items-center gap-1 text-rose-300">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                High-Alert Medication (Requires Dual-Nurse PIN Sign-Off)
              </span>
            </label>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Mandatory Pre-Dose Vitals:</span>
              {(['HR', 'BP', 'GLUCOSE', 'PAIN'] as const).map((v) => {
                const checked = requiresVitals.includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      if (checked) {
                        setRequiresVitals(requiresVitals.filter((item) => item !== v));
                      } else {
                        setRequiresVitals([...requiresVitals, v]);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      checked
                        ? 'bg-teal-950 text-teal-300 border border-teal-700'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-950/60 transition active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Electronically Sign & Prescribe</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
