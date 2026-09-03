import React from 'react';
import { Patient, MedicationOrder } from '../types/medication';
import { Printer, X, Check, Pill, ShieldAlert } from 'lucide-react';

interface PrintDrugChartModalProps {
  patient: Patient;
  medications: MedicationOrder[];
  onClose: () => void;
}

export const PrintDrugChartModal: React.FC<PrintDrugChartModalProps> = ({
  patient,
  medications,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8 print:border-none print:shadow-none print:bg-white print:text-black print:p-4 print:my-0">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-white">
              Official Inpatient Drug Chart Printout (eMAR)
            </h2>
            <p className="text-xs text-slate-400">
              Approved clinical summary format for ward rounds and physical handover backup.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document Container */}
        <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 space-y-6 font-sans print:border-none print:shadow-none print:p-0">
          
          {/* Hospital Header & Patient Identification */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-lg font-black tracking-tight text-slate-950 uppercase">
                National Healthcare Services • Hospital Inpatient Drug Chart
              </div>
              <div className="text-xs text-slate-600 font-semibold">
                Electronic Medication Administration Record (eMAR System) • Generated: 01-Sep-2026 08:30
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-extrabold text-teal-800 font-mono">
                {patient.ward} • {patient.roomBed}
              </div>
              <div className="text-xs text-slate-600 font-mono">
                MRN: {patient.mrn} | NHS: {patient.nhsNumber}
              </div>
            </div>
          </div>

          {/* Patient Details & Allergy Strip */}
          <div className="grid grid-cols-3 gap-3 bg-slate-100 p-3 rounded-xl border border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Patient Name:</span>
              <strong className="text-base font-bold">{patient.name}</strong>
              <div className="text-slate-600 mt-0.5">
                DOB: {patient.dob} ({patient.age}y {patient.gender})
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Clinical Parameters:</span>
              <div>Wt: <strong>{patient.weightKg} kg</strong> | Ht: <strong>{patient.heightCm} cm</strong> | BMI: <strong>{patient.bmi}</strong></div>
              <div>eGFR: <strong>{patient.vitals.eGFR} mL/min</strong> | Creatinine: <strong>{patient.vitals.creatinine} µmol/L</strong></div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Allergies & Sensitivities:</span>
              {patient.allergies.length === 0 ? (
                <span className="font-bold text-emerald-700">No Known Drug Allergies (NKDA)</span>
              ) : (
                patient.allergies.map((a) => (
                  <div key={a.id} className="text-rose-700 font-bold">
                    ⚠️ {a.allergen} ({a.reaction})
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Prescriptions Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              Active Inpatient Prescriptions & Administration Schedule
            </h3>

            <table className="w-full text-xs text-left border border-slate-300 rounded-lg overflow-hidden">
              <thead className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2">Medication & Formulation</th>
                  <th className="p-2">Dose & Route</th>
                  <th className="p-2">Frequency</th>
                  <th className="p-2">Indication & Instructions</th>
                  <th className="p-2">Prescriber / Date</th>
                  <th className="p-2">Pharmacy Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {medications.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-900">
                      {med.genericName}
                      {med.brandName && <span className="font-normal text-slate-500 block text-[10px]">({med.brandName})</span>}
                    </td>
                    <td className="p-2 font-mono">
                      <strong>{med.dose}</strong>
                      <span className="block text-[10px] text-slate-600">{med.route}</span>
                    </td>
                    <td className="p-2 font-semibold text-slate-700">
                      {med.frequency}
                    </td>
                    <td className="p-2 text-slate-700 text-[11px]">
                      {med.indication}
                      {med.specialInstructions && (
                        <span className="block text-amber-800 font-medium text-[10px]">⚠️ {med.specialInstructions}</span>
                      )}
                    </td>
                    <td className="p-2 text-slate-600 font-mono text-[10px]">
                      {med.prescribedBy}
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {med.pharmacyStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures & Certification */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300 text-xs text-slate-700">
            <div>
              <div className="font-bold">Administering Registered Nurse Certification:</div>
              <div className="h-10 border-b border-slate-400 mt-2"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature & Professional PIN</div>
            </div>
            <div>
              <div className="font-bold">Attending Medical Consultant / Doctor:</div>
              <div className="h-10 border-b border-slate-400 mt-2"></div>
              <div className="text-[10px] text-slate-500 mt-1">Dr. Julian Ross, MD (MD-99120)</div>
            </div>
          </div>

        </div>

        {/* Footer (Hidden in print) */}
        <div className="flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-xs"
          >
            Close Print Preview
          </button>
        </div>

      </div>
    </div>
  );
};
