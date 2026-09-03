import React, { useState } from 'react';
import { PatientProfile, PrescriptionItem } from '../types/dashboard';
import { UserRole } from '../types/medication';

interface PatientDetailViewProps {
  patient: PatientProfile;
  userRole?: UserRole | string;
  isPatientView?: boolean;
  onPrescribeMedicine: (patient: PatientProfile) => void;
  onAddClinicalNote: (patient: PatientProfile) => void;
  onAdministerPrescription: (prescription: PrescriptionItem, patient: PatientProfile) => void;
  onViewAllPrescriptions?: () => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  userRole,
  isPatientView,
  onPrescribeMedicine,
  onAddClinicalNote,
  onAdministerPrescription,
  onViewAllPrescriptions,
}) => {
  const isPatient = userRole === 'PATIENT' || isPatientView;
  const [historyTab, setHistoryTab] = useState<'PRESCRIPTIONS' | 'MEDICAL'>('PRESCRIPTIONS');

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto">
      {/* 1. CRITICAL ALLERGY Banner */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="bg-[#fee2e2]/70 border border-[#fecaca] rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
          <div className="text-[#dc2626] shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#b91c1c] uppercase tracking-wide">
              CRITICAL ALLERGY: {patient.allergies[0].allergen}
            </h3>
            <p className="text-xs sm:text-sm text-[#991b1b] mt-1 leading-relaxed font-normal">
              {patient.allergies[0].reaction ||
                'Patient has a documented severe anaphylactic reaction to Penicillin and related antibiotics.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. Patient Profile Demographics Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col items-center text-center space-y-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={patient.avatarUrl}
            alt={patient.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#e0f2fe] shadow-xs"
          />
        </div>

        {/* Patient Name & UHID Badge */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            {patient.name}
          </h2>
          <span className="px-3 py-0.5 bg-[#dbeafe] text-[#1e40af] font-semibold text-xs rounded-full">
            {patient.uhid}
          </span>
        </div>

        {/* Demographics 2-Row / 2-Column Grid */}
        <div className="w-full max-w-md grid grid-cols-2 gap-y-2 gap-x-4 text-xs sm:text-sm text-[#475569] pt-1">
          <div className="flex items-center justify-start gap-1.5 font-medium">
            <span className="text-slate-700 font-bold">♂</span>
            <span>{patient.age} yrs, {patient.gender}</span>
          </div>

          <div className="flex items-center justify-start gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[18px] text-slate-600">bed</span>
            <span>{patient.ward}, {patient.roomBed}</span>
          </div>

          <div className="flex items-center justify-start gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[18px] text-rose-500">water_drop</span>
            <span>Blood: {patient.bloodGroup}</span>
          </div>

          <div className="flex items-center justify-start gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[18px] text-slate-600">calendar_month</span>
            <span>Admitted: {patient.admittedDate}</span>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons (Prescribe & Add Clinical Note) - Only visible for clinicians, hidden in patient portal */}
      {!isPatient && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3">
          <button
            type="button"
            onClick={() => onPrescribeMedicine(patient)}
            className="w-full h-12 bg-[#003d9b] hover:bg-[#0052cc] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md shadow-[#003d9b]/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">edit_document</span>
            <span>Prescribe New Medicine</span>
          </button>

          <button
            type="button"
            onClick={() => onAddClinicalNote(patient)}
            className="w-full h-12 bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-[#003d9b] text-[#003d9b] font-bold text-sm sm:text-base rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">note_add</span>
            <span>Add Clinical Note</span>
          </button>
        </div>
      )}

      {/* 4. Vitals Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#003d9b] font-extrabold text-lg">
            <span className="material-symbols-outlined text-[22px]">ecg_heart</span>
            <span className="text-[#0f172a]">Vitals</span>
          </div>
          <span className="text-xs text-[#64748b] font-medium">
            Updated {patient.vitals.lastUpdated}
          </span>
        </div>

        {/* 2x2 Vitals Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Blood Pressure */}
          <div className="bg-[#f8fafc] p-4 rounded-2xl border-l-[5px] border-l-[#00828a] flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
              BLOOD PRESSURE
            </span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
                {patient.vitals.bp}
              </span>
              <span className="text-xs text-[#64748b] block mt-0.5 font-medium">mmHg</span>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="bg-[#f8fafc] p-4 rounded-2xl border-l-[5px] border-l-[#003d9b] flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
              HEART RATE
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
                {patient.vitals.hr}
              </span>
              <span className="text-xs text-[#64748b] font-medium">bpm</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-[#f8fafc] p-4 rounded-2xl border-l-[5px] border-l-[#00687a] flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
              TEMPERATURE
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
                {patient.vitals.temp}
              </span>
              <span className="text-xs text-[#64748b] font-medium">
                {patient.vitals.tempUnit || '°F'}
              </span>
            </div>
          </div>

          {/* SPO2 */}
          <div className="bg-[#f8fafc] p-4 rounded-2xl border-l-[5px] border-l-[#00687a] flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
              SPO2
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
                {patient.vitals.spo2}
              </span>
              <span className="text-xs text-[#64748b] font-medium">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Active Prescriptions Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#003d9b] font-extrabold text-lg">
            <span className="material-symbols-outlined text-[22px]">medication</span>
            <span className="text-[#0f172a]">Active Prescriptions</span>
          </div>
          <button
            type="button"
            onClick={onViewAllPrescriptions}
            className="text-xs font-bold text-[#003d9b] hover:text-[#0052cc] transition cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Prescription Item List */}
        <div className="space-y-3 divide-y divide-slate-100">
          {patient.prescriptions.map((rx, idx) => {
            const isPRN = rx.status === 'PRN';
            const iconBg = isPRN
              ? 'bg-[#e6f4f1] text-[#00828a]'
              : 'bg-[#e0edff] text-[#003d9b]';

            return (
              <div
                key={rx.id}
                onClick={() => {
                  if (!isPatient) {
                    onAdministerPrescription(rx, patient);
                  }
                }}
                className={`pt-3 first:pt-0 flex items-center justify-between gap-3 ${isPatient ? 'cursor-default' : 'cursor-pointer group'
                  }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isPRN ? 'vaccines' : idx === 0 ? 'medical_services' : 'pill'}
                    </span>
                  </div>

                  <div>
                    <h4
                      className={`text-sm sm:text-base font-bold text-[#0f172a] ${!isPatient ? 'group-hover:text-[#003d9b]' : ''
                        } transition`}
                    >
                      {rx.drugName}
                    </h4>
                    <p className="text-xs text-[#475569] font-medium mt-0.5">
                      {rx.dose}, {rx.route}, {rx.frequency}
                    </p>
                    <p className="text-xs text-[#94a3b8] font-normal">
                      Started: {rx.startDate}
                    </p>
                  </div>
                </div>

                <div>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-md ${isPRN
                        ? 'bg-[#e6f4f1] text-[#00828a]'
                        : 'bg-[#f1f5f9] text-[#475569]'
                      }`}
                  >
                    {rx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Previous Medical & Prescription History Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#003d9b]/10 text-[#003d9b] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">history_edu</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a]">
                Previous History &amp; Past Prescriptions
              </h3>
              <p className="text-xs text-[#64748b]">
                Past medication courses, discontinued regimens &amp; clinical history
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setHistoryTab('PRESCRIPTIONS')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              historyTab === 'PRESCRIPTIONS'
                ? 'bg-white text-[#003d9b] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">medication</span>
            <span>Past Prescriptions ({patient.pastPrescriptions?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setHistoryTab('MEDICAL')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              historyTab === 'MEDICAL'
                ? 'bg-white text-[#003d9b] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">medical_information</span>
            <span>Past Medical &amp; Surgeries ({patient.medicalHistory?.length || 0})</span>
          </button>
        </div>

        {/* Content: Past Prescriptions */}
        {historyTab === 'PRESCRIPTIONS' && (
          <div className="space-y-3 divide-y divide-slate-100">
            {patient.pastPrescriptions && patient.pastPrescriptions.length > 0 ? (
              patient.pastPrescriptions.map((pastRx) => {
                const isDiscontinued = pastRx.outcome === 'Discontinued';
                const isCompleted = pastRx.outcome === 'Completed Course';
                const isSwitched = pastRx.outcome === 'Switched';

                return (
                  <div
                    key={pastRx.id}
                    className="pt-3.5 first:pt-0 space-y-2 p-3 rounded-2xl hover:bg-slate-50/80 transition border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                            isDiscontinued
                              ? 'bg-rose-100 text-rose-700'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isSwitched
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isDiscontinued ? 'cancel' : isCompleted ? 'check_circle' : 'swap_horiz'}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-extrabold text-[#0f172a]">
                              {pastRx.drugName}
                            </h4>
                            <span
                              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md ${
                                isDiscontinued
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : isCompleted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isSwitched
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {pastRx.outcome}
                            </span>
                          </div>

                          <p className="text-xs text-[#475569] font-medium mt-0.5">
                            {pastRx.dose}, {pastRx.route} • {pastRx.frequency}
                          </p>

                          <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 mt-1">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">calendar_month</span>
                            <span className="font-semibold text-slate-700">{pastRx.period}</span>
                            <span>• Indication: <strong className="text-slate-800 font-semibold">{pastRx.indication}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes / Prescribed by box */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-1">
                      {pastRx.prescribedBy && (
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <span className="material-symbols-outlined text-[15px] text-[#003d9b]">person</span>
                          <span>Prescribed by: {pastRx.prescribedBy}</span>
                        </div>
                      )}
                      {pastRx.notes && (
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">
                          "{pastRx.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No past prescription records available for this patient.
              </div>
            )}
          </div>
        )}

        {/* Content: Medical & Surgical History */}
        {historyTab === 'MEDICAL' && (
          <div className="space-y-3">
            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              patient.medicalHistory.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#003d9b] flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-2xs">
                    <span className="material-symbols-outlined text-[20px]">
                      {med.category === 'SURGERY' ? 'healing' : 'cardiology'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-[#0f172a]">{med.condition}</h4>
                      <span className="text-xs px-2.5 py-0.5 bg-white border border-slate-200 rounded-full font-bold text-slate-700">
                        {med.year}
                      </span>
                    </div>
                    {med.doctor && (
                      <p className="text-xs text-[#003d9b] font-semibold mt-0.5">
                        Attending / Specialist: {med.doctor}
                      </p>
                    )}
                    {med.notes && (
                      <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                        {med.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No prior surgical or chronic history recorded.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
