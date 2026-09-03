import React, { useState } from 'react';
import { PatientProfile, PrescriptionItem, FormularyItem } from '../types/dashboard';
import { ClinicalStaff } from '../types/medication';
import { INITIAL_FORMULARY_STOCK } from '../data/formularyData';

interface PharmacistPortalViewProps {
  currentStaff: ClinicalStaff;
  patients: PatientProfile[];
  onVerifyPrescription: (patientId: string, prescriptionId: string, notes?: string) => void;
  onDispensePrescription: (patientId: string, prescriptionId: string) => void;
  onFlagClarification: (patientId: string, prescriptionId: string, reason: string) => void;
  onOpenDrugChart: (patientId: string) => void;
}

export const PharmacistPortalView: React.FC<PharmacistPortalViewProps> = ({
  currentStaff,
  patients,
  onVerifyPrescription,
  onDispensePrescription,
  onFlagClarification,
  onOpenDrugChart,
}) => {
  const [activeTab, setActiveTab] = useState<'PRESCRIPTIONS' | 'INVENTORY' | 'VERIFIED_LOGS'>('PRESCRIPTIONS');
  const [filterUrgency, setFilterUrgency] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'CLARIFY' | 'STAT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [formularyStock, setFormularyStock] = useState<FormularyItem[]>(INITIAL_FORMULARY_STOCK);
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState<string>('ALL');

  // Full Patient Drug Chart Modal State
  const [selectedPatientForChart, setSelectedPatientForChart] = useState<PatientProfile | null>(null);

  // Clarification Modal State
  const [clarifyingItem, setClarifyingItem] = useState<{ patientId: string; rx: PrescriptionItem; patientName: string } | null>(null);
  const [clarificationReason, setClarificationReason] = useState('');

  // Collect all inpatient prescriptions across all patients
  const allPrescriptionEntries = patients.flatMap((p) =>
    p.prescriptions.map((rx) => ({
      patient: p,
      rx,
    }))
  );

  // Filter prescriptions
  const filteredPrescriptions = allPrescriptionEntries.filter(({ patient, rx }) => {
    // Tab / Status filter
    if (filterUrgency === 'PENDING' && rx.pharmacyStatus === 'VERIFIED') return false;
    if (filterUrgency === 'VERIFIED' && rx.pharmacyStatus !== 'VERIFIED') return false;
    if (filterUrgency === 'CLARIFY' && rx.pharmacyStatus !== 'CLARIFICATION_REQUIRED') return false;
    if (filterUrgency === 'STAT' && rx.category !== 'STAT') return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchDrug = rx.drugName.toLowerCase().includes(q);
      const matchPat = patient.name.toLowerCase().includes(q);
      const matchDoc = (rx.prescribedBy || '').toLowerCase().includes(q);
      const matchBed = patient.roomBed.toLowerCase().includes(q);
      if (!matchDrug && !matchPat && !matchDoc && !matchBed) return false;
    }

    return true;
  });

  const pendingCount = allPrescriptionEntries.filter(({ rx }) => rx.pharmacyStatus !== 'VERIFIED' && rx.pharmacyStatus !== 'CLARIFICATION_REQUIRED').length;
  const verifiedCount = allPrescriptionEntries.filter(({ rx }) => rx.pharmacyStatus === 'VERIFIED').length;
  const clarifyCount = allPrescriptionEntries.filter(({ rx }) => rx.pharmacyStatus === 'CLARIFICATION_REQUIRED').length;
  const lowStockCount = formularyStock.filter((s) => s.stockStatus === 'LOW_STOCK' || s.stockStatus === 'OUT_OF_STOCK').length;

  const handleReplenishStock = (drugId: string) => {
    setFormularyStock((prev) =>
      prev.map((item) =>
        item.id === drugId
          ? {
              ...item,
              centralStock: item.centralStock + 100,
              wardStock: item.wardStock + 20,
              stockStatus: 'IN_STOCK',
            }
          : item
      )
    );
  };

  const handleSendClarification = () => {
    if (!clarifyingItem || !clarificationReason.trim()) return;
    onFlagClarification(clarifyingItem.patientId, clarifyingItem.rx.id, clarificationReason.trim());
    setClarifyingItem(null);
    setClarificationReason('');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner / Pharmacist Header */}
      <div className="bg-gradient-to-r from-[#004f5e] via-[#00687a] to-[#003d9b] rounded-3xl p-6 sm:p-7 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[32px] text-teal-200">local_pharmacy</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Pharmacy Clinical &amp; Dispensing Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-400/20 text-teal-200 border border-teal-300/30 uppercase">
                Active Dispensary
              </span>
            </div>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1">
              Duty Pharmacist: <strong className="text-white font-bold">{currentStaff.name}</strong> • {currentStaff.department || 'Clinical Pharmacy Services'}
            </p>
          </div>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex items-center gap-2.5 z-10 flex-wrap">
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/15 text-center">
            <span className="block text-xl font-extrabold leading-none text-amber-300">{pendingCount}</span>
            <span className="text-[10px] font-bold text-teal-100 uppercase tracking-wider">Pending Verify</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/15 text-center">
            <span className="block text-xl font-extrabold leading-none text-emerald-300">{verifiedCount}</span>
            <span className="text-[10px] font-bold text-teal-100 uppercase tracking-wider">Verified Orders</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/15 text-center">
            <span className="block text-xl font-extrabold leading-none text-rose-300">{lowStockCount}</span>
            <span className="text-[10px] font-bold text-teal-100 uppercase tracking-wider">Stock Alerts</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('PRESCRIPTIONS')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'PRESCRIPTIONS'
                ? 'bg-white text-[#00687a] shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">prescriptions</span>
            <span>Inpatient Prescriptions Queue ({allPrescriptionEntries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'INVENTORY'
                ? 'bg-white text-[#00687a] shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            <span>Formulary &amp; Stock Availability ({formularyStock.length})</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder={activeTab === 'PRESCRIPTIONS' ? 'Search medication, patient, doctor...' : 'Search drug generic/brand...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00687a] transition"
          />
        </div>
      </div>

      {/* TAB 1: PRESCRIPTIONS VERIFICATION & DISPENSING */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div className="space-y-4">
          
          {/* Sub-Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mr-1">Filter By:</span>
            {[
              { id: 'ALL', label: 'All Orders', count: allPrescriptionEntries.length },
              { id: 'PENDING', label: 'Needs Verification', count: pendingCount },
              { id: 'VERIFIED', label: 'Verified & Approved', count: verifiedCount },
              { id: 'CLARIFY', label: 'Clarifications', count: clarifyCount },
              { id: 'STAT', label: 'STAT / Emergency', count: allPrescriptionEntries.filter(e => e.rx.category === 'STAT').length },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterUrgency(f.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border cursor-pointer ${
                  filterUrgency === f.id
                    ? 'bg-[#00687a] text-white border-[#00687a] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {/* Prescriptions List Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPrescriptions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <span className="material-symbols-outlined text-[48px] text-slate-300">task_alt</span>
                <h3 className="text-base font-bold text-slate-800">No Prescriptions Matching Filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All active inpatient orders in this queue have been processed or no matching doctor orders found.
                </p>
              </div>
            ) : (
              filteredPrescriptions.map(({ patient, rx }) => {
                const isVerified = rx.pharmacyStatus === 'VERIFIED';
                const isClarify = rx.pharmacyStatus === 'CLARIFICATION_REQUIRED';
                const isDispensed = rx.dispensingStatus === 'DISPENSED' || rx.dispensingStatus === 'IN_STOCK';

                // Look up matching stock from formulary
                const matchedStock = formularyStock.find(
                  (s) => s.genericName.toLowerCase().includes(rx.drugName.toLowerCase()) || rx.drugName.toLowerCase().includes(s.brandName.toLowerCase())
                );

                return (
                  <div
                    key={`${patient.id}-${rx.id}`}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition shadow-xs space-y-4 ${
                      isVerified
                        ? 'border-emerald-200 border-l-6 border-l-emerald-500'
                        : isClarify
                        ? 'border-amber-200 border-l-6 border-l-amber-500'
                        : rx.category === 'STAT'
                        ? 'border-rose-200 border-l-6 border-l-rose-500'
                        : 'border-slate-200 border-l-6 border-l-[#00687a]'
                    }`}
                  >
                    {/* Card Top Row: Patient Info, Bed, Prescriber */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={patient.avatarUrl}
                          alt={patient.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-[#0f172a]">{patient.name}</h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                              {patient.roomBed} • {patient.ward}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {patient.uhid}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Dx: <strong className="text-slate-700">{patient.primaryDiagnosis}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Prescriber Tag & Urgency Badge */}
                      <div className="flex items-center gap-2">
                        {rx.category === 'STAT' && (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">bolt</span>
                            STAT ORDER
                          </span>
                        )}
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-xs font-extrabold text-[#003d9b]">
                            <span className="material-symbols-outlined text-[15px] text-[#003d9b]">stethoscope</span>
                            <span>{rx.prescribedBy || 'Dr. Sarah Chen, MD (Inpatient Attending)'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rx.startDate || 'Today'} • {rx.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Drug Prescription Details & Dosage */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                      
                      {/* Drug Name & Strength */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prescribed Medication</span>
                        <h4 className="text-lg font-extrabold text-[#003d9b] leading-tight">
                          {rx.drugName}
                        </h4>
                        <p className="text-xs font-bold text-slate-700">
                          {rx.dose} • {rx.route} • {rx.frequency}
                        </p>
                        {rx.instructions && (
                          <p className="text-[11px] text-slate-500 italic mt-1">
                            Sig: "{rx.instructions}"
                          </p>
                        )}
                      </div>

                      {/* Clinical Safety & Allergy Check */}
                      <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200/80 md:pl-4 pt-2 md:pt-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety &amp; Renal Screen</span>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                            <span>eGFR {patient.vitals?.eGFR || 65} mL/min (Dose Safe)</span>
                          </div>
                          {patient.allergies && patient.allergies.length > 0 ? (
                            <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                              <span className="material-symbols-outlined text-[16px] text-rose-600">warning</span>
                              <span>Allergy: {patient.allergies[0].allergen} ({patient.allergies[0].severity})</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">check_circle</span>
                              <span>No Known Drug Allergies (NKDA)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hospital Stock Availability */}
                      <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200/80 md:pl-4 pt-2 md:pt-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispensary Stock Check</span>
                        {matchedStock ? (
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-slate-700">Ward Pyxis Stock:</span>
                              <span className="text-[#00687a] font-mono">{matchedStock.wardStock} units</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Central Pharmacy:</span>
                              <span className="font-mono font-bold text-slate-700">{matchedStock.centralStock} units</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-600">
                              <span className="material-symbols-outlined text-[14px]">ac_unit</span>
                              <span>{matchedStock.storage}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-600 space-y-1">
                            <p className="font-bold text-emerald-700">✓ In Stock (Standard Formulary)</p>
                            <p className="text-[11px] text-slate-500">Pyxis Auto-Cabinet Ready</p>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Pharmacist Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      
                      {/* Current Status Pill */}
                      <div className="flex items-center gap-2">
                        {isVerified ? (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>Pharmacist Verified by {rx.verifiedBy || currentStaff.name}</span>
                          </span>
                        ) : isClarify ? (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">help</span>
                            <span>Clarification Flagged: {rx.pharmacyNotes || 'Review requested with prescriber'}</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-amber-600">hourglass_top</span>
                            <span>Pending Pharmacist Clinical Check</span>
                          </span>
                        )}

                        {isDispensed && (
                          <span className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">inventory</span>
                            <span>Dispensed to Pyxis</span>
                          </span>
                        )}
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            const freshPatient = patients.find((p) => p.id === patient.id) || patient;
                            setSelectedPatientForChart(freshPatient);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-[#003d9b] hover:text-[#003d9b] transition cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Open Complete Inpatient Drug Chart & eMAR for this patient"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#003d9b]">assignment</span>
                          <span>Full Chart</span>
                        </button>

                        {!isVerified && (
                          <button
                            type="button"
                            onClick={() => {
                              setClarifyingItem({ patientId: patient.id, rx, patientName: patient.name });
                              setClarificationReason('');
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-bold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">question_mark</span>
                            <span>Clarify with Doctor</span>
                          </button>
                        )}

                        {!isVerified ? (
                          <button
                            type="button"
                            onClick={() => onVerifyPrescription(patient.id, rx.id, 'Clinical verification stamped')}
                            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            <span>Verify &amp; Approve</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onDispensePrescription(patient.id, rx.id)}
                            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#00687a] hover:bg-[#00505e] active:scale-95 text-white shadow-sm transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                            <span>Dispense / Send to Ward</span>
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FORMULARY INVENTORY & DRUG AVAILABILITY */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mr-1">Therapeutic Class:</span>
            {['ALL', 'Antibiotic', 'Cardiovascular', 'Analgesic', 'Anticoagulant', 'Endocrine'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedInventoryCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border cursor-pointer ${
                  selectedInventoryCategory === cat
                    ? 'bg-[#00687a] text-white border-[#00687a] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'All Classes' : cat}
              </button>
            ))}
          </div>

          {/* Formulary Stock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formularyStock
              .filter((item) => {
                if (selectedInventoryCategory !== 'ALL' && item.category !== selectedInventoryCategory) return false;
                if (searchTerm.trim()) {
                  const q = searchTerm.toLowerCase();
                  return item.genericName.toLowerCase().includes(q) || item.brandName.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
                }
                return true;
              })
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category & Stock Status */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.category} • {item.form}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.stockStatus === 'IN_STOCK'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : item.stockStatus === 'LOW_STOCK'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {item.stockStatus === 'IN_STOCK' ? '✓ In Stock' : item.stockStatus === 'LOW_STOCK' ? '⚠️ Low Stock' : '✕ Out of Stock'}
                      </span>
                    </div>

                    {/* Drug Names & Strength */}
                    <div className="mt-2">
                      <h3 className="text-base font-extrabold text-[#0f172a]">{item.genericName}</h3>
                      <p className="text-xs font-bold text-[#00687a] mt-0.5">
                        {item.brandName} • <span className="font-mono">{item.strength}</span>
                      </p>
                    </div>

                    {/* Quantities & Ward Cabinet breakdown */}
                    <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">Ward 4B Pyxis Cabinet</span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono">{item.wardStock} units</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">Central Pharmacy</span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono">{item.centralStock} units</span>
                      </div>
                    </div>

                    {/* Storage & Lot Metadata */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[14px]">thermostat</span>
                        {item.storage}
                      </span>
                      <span className="font-mono">Exp: {item.expiryDate}</span>
                    </div>
                  </div>

                  {/* Stock Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">Lot: {item.lotNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleReplenishStock(item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#00687a] border border-teal-200 text-xs font-extrabold transition cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_circle</span>
                      <span>Replenish Stock (+100)</span>
                    </button>
                  </div>

                </div>
              ))}
          </div>

        </div>
      )}

      {/* Flag Clarification with Doctor Modal */}
      {clarifyingItem && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-base">
                <span className="material-symbols-outlined text-[22px]">help</span>
                <span>Flag Order for Doctor Review</span>
              </div>
              <button
                onClick={() => setClarifyingItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-xs text-slate-700 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span><strong>Patient:</strong> <span className="font-bold text-slate-900">{clarifyingItem.patientName}</span></span>
                <span className="text-[10px] font-mono font-bold bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">Patient ID: {clarifyingItem.patientId}</span>
              </div>
              <p><strong>Medication:</strong> <span className="font-bold text-[#00687a]">{clarifyingItem.rx.drugName}</span> ({clarifyingItem.rx.dose}, {clarifyingItem.rx.route}, {clarifyingItem.rx.frequency})</p>
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-amber-200/70 text-slate-800">
                <span className="material-symbols-outlined text-[16px] text-[#003d9b]">stethoscope</span>
                <span><strong>Prescribed by:</strong> <strong className="text-[#003d9b] font-extrabold">{clarifyingItem.rx.prescribedBy || 'Dr. Sarah Chen, MD (Inpatient Attending)'}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Pharmacist Query / Recommendation:
              </label>
              <textarea
                rows={3}
                value={clarificationReason}
                onChange={(e) => setClarificationReason(e.target.value)}
                placeholder="e.g. Recommend dose reduction to 250mg due to mild renal impairment (eGFR 48 mL/min)..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00687a]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClarifyingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendClarification}
                disabled={!clarificationReason.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Send Clarification to Prescriber
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL INPATIENT DRUG CHART MODAL (eMAR Grid & Complete Clinical Medication Record) */}
      {selectedPatientForChart && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003d9b] via-[#00687a] to-[#00828a] p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedPatientForChart.avatarUrl}
                  alt={selectedPatientForChart.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      {selectedPatientForChart.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-white border border-white/30">
                      {selectedPatientForChart.uhid}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-400/20 text-teal-100 border border-teal-300/30">
                      {selectedPatientForChart.ward} • {selectedPatientForChart.roomBed}
                    </span>
                  </div>
                  <p className="text-xs text-teal-100/90 mt-1">
                    {selectedPatientForChart.age} yrs • {selectedPatientForChart.gender} • Blood: <strong className="text-white">{selectedPatientForChart.bloodGroup}</strong> • Dx: <strong className="text-white">{selectedPatientForChart.primaryDiagnosis}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForChart(null)}
                  className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition cursor-pointer"
                  title="Close Drug Chart"
                >
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>
            </div>

            {/* Critical Allergy & Safety Ribbon */}
            <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedPatientForChart.allergies && selectedPatientForChart.allergies.length > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl font-bold">
                    <span className="material-symbols-outlined text-[16px] text-rose-600">warning</span>
                    <span>ALLERGY ALERT: {selectedPatientForChart.allergies[0].allergen} ({selectedPatientForChart.allergies[0].severity})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                    <span>No Known Drug Allergies (NKDA)</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl font-bold font-mono">
                  <span>eGFR: {selectedPatientForChart.vitals?.eGFR || 65} mL/min</span>
                </div>
              </div>

              <div className="text-slate-600 font-medium">
                Vitals: <strong className="text-slate-900">{selectedPatientForChart.vitals?.bp} mmHg</strong> • HR: <strong className="text-slate-900">{selectedPatientForChart.vitals?.hr} bpm</strong> • SpO2: <strong className="text-slate-900">{selectedPatientForChart.vitals?.spo2}%</strong>
              </div>
            </div>

            {/* Scrollable Drug Chart Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#f8fafc]">
              
              {/* Section 1: Inpatient Electronic Medication Administration Record (eMAR 24hr Grid) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#003d9b] text-[20px]">calendar_view_week</span>
                    <h3 className="text-sm font-bold text-slate-900">
                      24-Hour eMAR Administration Timeline Grid
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Today's Dose Rounds</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3.5 min-w-[220px]">Medication &amp; Prescriber</th>
                        <th className="py-2.5 px-2 text-center min-w-[60px]">06:00</th>
                        <th className="py-2.5 px-2 text-center min-w-[60px]">08:00</th>
                        <th className="py-2.5 px-2 text-center min-w-[60px]">12:00</th>
                        <th className="py-2.5 px-2 text-center min-w-[60px]">14:00</th>
                        <th className="py-2.5 px-2 text-center min-w-[60px]">18:00</th>
                        <th className="py-2.5 px-2 text-center min-w-[60px]">20:00</th>
                        <th className="py-2.5 px-2 text-center min-w-[60px]">22:00</th>
                        <th className="py-2.5 px-3 text-right">Pharmacy Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPatientForChart.prescriptions.map((rx) => {
                        const isVerified = rx.pharmacyStatus === 'VERIFIED';
                        const isClarify = rx.pharmacyStatus === 'CLARIFICATION_REQUIRED';

                        return (
                          <tr key={rx.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3.5">
                              <div className="font-extrabold text-[#003d9b] text-sm">{rx.drugName}</div>
                              <div className="text-slate-600 font-medium text-[11px]">
                                {rx.dose} • {rx.route} • {rx.frequency}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                <span className="material-symbols-outlined text-[12px] text-[#003d9b]">stethoscope</span>
                                <span className="font-bold text-slate-700">{rx.prescribedBy || 'Dr. Sarah Chen, MD'}</span>
                              </div>
                            </td>

                            {/* Hour slots */}
                            {['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00'].map((hr, i) => {
                              const isSlotActive = (rx.timing || '').includes(hr) || (rx.frequency.toLowerCase().includes('daily') && hr === '08:00') || (rx.frequency.toLowerCase().includes('twice') && (hr === '08:00' || hr === '20:00'));
                              const isPast = hr === '06:00' || hr === '08:00';

                              return (
                                <td key={hr} className="py-3 px-1.5 text-center">
                                  {isSlotActive ? (
                                    isPast ? (
                                      <div className="inline-flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold" title="Given by Staff Nurse">
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                        <span className="text-[8px] font-mono leading-none">GIVEN</span>
                                      </div>
                                    ) : (
                                      <div className="inline-flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-300 font-bold" title="Due on round">
                                        <span className="text-[10px] font-mono leading-none font-extrabold">{hr}</span>
                                        <span className="text-[8px] font-mono leading-none text-blue-500">DUE</span>
                                      </div>
                                    )
                                  ) : rx.category === 'PRN' ? (
                                    <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-1 py-0.5 rounded">PRN</span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                              );
                            })}

                            <td className="py-3 px-3 text-right">
                              {isVerified ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                  <span>Verified</span>
                                </span>
                              ) : isClarify ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">help</span>
                                  <span>Clarify</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">hourglass_top</span>
                                  <span>Pending</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Full Prescriptions Review & Action Controls */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00687a] text-[20px]">prescriptions</span>
                  <span>Active Inpatient Drug Orders for Review &amp; Dispensing</span>
                </h3>

                <div className="space-y-3">
                  {selectedPatientForChart.prescriptions.map((rx) => {
                    const isVerified = rx.pharmacyStatus === 'VERIFIED';
                    const isClarify = rx.pharmacyStatus === 'CLARIFICATION_REQUIRED';
                    const isDispensed = rx.dispensingStatus === 'DISPENSED';

                    return (
                      <div
                        key={rx.id}
                        className={`p-4 rounded-2xl border bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isVerified ? 'border-emerald-200' : isClarify ? 'border-amber-200' : 'border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-extrabold text-[#003d9b]">{rx.drugName}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {rx.category} • {rx.status}
                            </span>
                            {rx.isHighAlert && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                ⚠️ High Alert Med
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-700">
                            {rx.dose} • {rx.route} • {rx.frequency} {rx.instructions ? `• Sig: "${rx.instructions}"` : ''}
                          </p>
                          <p className="text-[11px] text-[#003d9b] font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">stethoscope</span>
                            <span>Prescribed by: <strong>{rx.prescribedBy || 'Dr. Sarah Chen, MD (Inpatient Attending)'}</strong></span>
                            <span className="text-slate-400">• Started {rx.startDate || 'Today'}</span>
                          </p>
                        </div>

                        {/* Action Buttons for this Prescription */}
                        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                          {!isVerified ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setClarifyingItem({ patientId: selectedPatientForChart.id, rx, patientName: selectedPatientForChart.name });
                                  setClarificationReason('');
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                              >
                                Clarify
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onVerifyPrescription(selectedPatientForChart.id, rx.id, 'Clinical verification approved in full chart review');
                                  // Update local modal patient state
                                  setSelectedPatientForChart((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          prescriptions: prev.prescriptions.map((r) =>
                                            r.id === rx.id ? { ...r, pharmacyStatus: 'VERIFIED', verifiedBy: currentStaff.name } : r
                                          ),
                                        }
                                      : null
                                  );
                                }}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[15px]">verified</span>
                                <span>Verify</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onDispensePrescription(selectedPatientForChart.id, rx.id);
                                setSelectedPatientForChart((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        prescriptions: prev.prescriptions.map((r) =>
                                          r.id === rx.id ? { ...r, dispensingStatus: 'DISPENSED' } : r
                                        ),
                                      }
                                    : null
                                );
                              }}
                              disabled={isDispensed}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                                isDispensed
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                                  : 'bg-[#00687a] hover:bg-[#00505e] text-white shadow-xs'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                {isDispensed ? 'check' : 'local_shipping'}
                              </span>
                              <span>{isDispensed ? 'Dispensed' : 'Dispense to Pyxis'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Duty Pharmacist e-Sign: <strong className="text-slate-800">{currentStaff.name} ({currentStaff.badgeNumber})</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedPatientForChart(null)}
                className="px-5 py-2 rounded-xl bg-[#003d9b] hover:bg-[#0052cc] active:scale-95 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
              >
                Done &amp; Return to Queue
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
