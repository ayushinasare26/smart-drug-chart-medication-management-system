export type DoseStatus = 'SCHEDULED' | 'DUE' | 'OVERDUE' | 'ADMINISTERED' | 'WITHHELD' | 'MISSED';

export type MedicationCategory = 'REGULAR' | 'PRN' | 'STAT' | 'INFUSION' | 'DISCONTINUED';

export type RouteType = 'Oral (PO)' | 'Intravenous (IV)' | 'Subcutaneous (SC)' | 'Intramuscular (IM)' | 'Inhalation' | 'Topical' | 'Sublingual (SL)' | 'Transdermal' | 'Rectal (PR)';

export type SeverityLevel = 'HIGH' | 'CRITICAL' | 'MODERATE' | 'INFO';

export type UserRole = 'NURSE' | 'DOCTOR' | 'PHARMACIST' | 'CHARGE_NURSE' | 'PATIENT';

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE_ANAPHYLAXIS';
  verifiedDate: string;
}

export interface PatientVital {
  heartRate: number; // bpm
  bloodPressureSys: number;
  bloodPressureDia: number;
  temperature: number; // °C
  spO2: number; // %
  respiratoryRate: number;
  bloodGlucose?: number; // mmol/L or mg/dL
  painScore?: number; // 0-10
  eGFR: number; // mL/min/1.73m2
  creatinine: number; // umol/L
  inr?: number;
  potassium?: number; // mmol/L
  lastUpdated: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  nhsNumber: string;
  name: string;
  age: number;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  weightKg: number;
  heightCm: number;
  bmi: number;
  bsa: number; // Body Surface Area
  ward: string;
  roomBed: string;
  admissionDate: string;
  primaryDiagnosis: string;
  consultant: string;
  assignedNurse: string;
  resuscitationStatus: 'FULL_CODE' | 'DNACPR' | 'LIMITED_INTERVENTION';
  infectionControl?: string;
  fallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  allergies: Allergy[];
  vitals: PatientVital;
  avatarUrl?: string;
}

export interface AdministrationSlot {
  id: string;
  scheduledTime: string; // e.g. '08:00'
  scheduledDateTime: string; // ISO
  status: DoseStatus;
  administeredTime?: string;
  administeredBy?: string;
  administeredRole?: string;
  witnessedBy?: string;
  doseGiven?: string;
  vitalsAtAdmin?: {
    hr?: number;
    bp?: string;
    bloodGlucose?: number;
    painScore?: number;
  };
  withheldReason?: string;
  withheldCode?: 'PATIENT_REFUSED' | 'NPO_FASTING' | 'CLINICAL_CONTRAINDICATION' | 'AWAITING_LABS' | 'VITAL_OUT_OF_RANGE' | 'MED_UNAVAILABLE' | 'OTHER';
  barcodeVerified?: boolean;
  notes?: string;
}

export interface DrugInteraction {
  id: string;
  severity: SeverityLevel;
  interactingDrug: string;
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
  acknowledged?: boolean;
}

export interface MedicationOrder {
  id: string;
  brandName?: string;
  genericName: string;
  category: MedicationCategory;
  form: string; // Tablet, Solution, Injection, Inhaler, IV Bag, Patch
  dose: string;
  route: RouteType;
  frequency: string; // Once Daily (OD), BD, TDS, QDS, PRN Q4H, Continuous
  scheduleTimes: string[]; // e.g. ['08:00', '12:00', '18:00', '22:00']
  indication: string;
  prescribedBy: string;
  prescribedDate: string;
  startDate: string;
  endDate?: string;
  specialInstructions?: string;
  isHighAlert: boolean; // Requires dual verification
  requiresVitalsCheck?: ('HR' | 'BP' | 'GLUCOSE' | 'INR' | 'PAIN')[];
  pharmacyStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'CLARIFICATION_REQUIRED';
  pharmacyNotes?: string;
  dispensingStatus: 'IN_STOCK' | 'DISPENSING' | 'ORDERED' | 'REFRIGERATED';
  storageLocation: string; // e.g. 'Ward ADC Pyxis Cabinet Drawer 3'
  
  // PRN specific
  prnMaxDose24h?: string;
  prnMinIntervalHours?: number;
  lastPrnAdministered?: string;

  // Infusion specific
  infusionRateMlHr?: number;
  infusionDoseRate?: string; // e.g. '0.05 mcg/kg/min'
  bagVolumeMl?: number;
  volumeInfusedMl?: number;
  carrierFluid?: string; // Normal Saline 0.9%, D5W
  ivLineLocation?: string; // 'Right ACF Peripheral', 'Central Venous Lumen 1'
  infusionStatus?: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'STOPPED';

  // Administration slots for today
  slots: AdministrationSlot[];

  // Clinical Safety Alerts attached
  interactions?: DrugInteraction[];
  renalWarning?: string;
  allergyWarning?: string;
}

export interface ClinicalStaff {
  id: string;
  name: string;
  role: UserRole;
  badgeNumber: string;
  department: string;
  pin: string;
}

export interface AdministrationLogEntry {
  id: string;
  timestamp: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  dose: string;
  route: string;
  action: 'ADMINISTERED' | 'WITHHELD' | 'DISCONTINUED' | 'PRESCRIBED' | 'PHARMACY_VERIFIED' | 'RATE_ADJUSTED';
  staffName: string;
  staffRole: string;
  witnessName?: string;
  notes?: string;
  vitalRecorded?: string;
}
