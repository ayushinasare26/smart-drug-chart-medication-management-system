export interface PatientProfile {
  id: string;
  name: string;
  uhid: string;
  mrn: string;
  dob: string;
  age: number;
  gender: string;
  ward: string;
  roomBed: string;
  bloodGroup: string;
  admittedDate: string;
  avatarUrl: string;
  primaryDiagnosis: string;
  isCritical?: boolean;
  allergies: {
    allergen: string;
    reaction: string;
    severity: 'CRITICAL_ANAPHYLAXIS' | 'MODERATE' | 'MILD';
    recordedDate?: string;
  }[];
  vitals: {
    bp: string;
    hr: number;
    temp: number;
    tempUnit: '°F' | '°C';
    spo2: number;
    respiratoryRate?: number;
    lastUpdated: string;
    eGFR?: number;
  };
  prescriptions: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dose: string;
  route: string;
  frequency: string;
  timing: string;
  status: 'Ongoing' | 'PRN' | 'STAT' | 'Completed' | 'Withheld';
  startDate: string;
  category: 'REGULAR' | 'PRN' | 'STAT' | 'INFUSION';
  indication?: string;
  instructions?: string;
  isHighAlert?: boolean;
  specialAlert?: string;
  prescribedBy?: string;
  prescribedDate?: string;
  pharmacyStatus?: 'VERIFIED' | 'PENDING_REVIEW' | 'CLARIFICATION_REQUIRED';
  dispensingStatus?: 'IN_STOCK' | 'DISPENSED' | 'ORDERED' | 'REFRIGERATED';
  pharmacyNotes?: string;
  verifiedBy?: string;
  verifiedTimestamp?: string;
}

export interface FormularyItem {
  id: string;
  genericName: string;
  brandName: string;
  strength: string;
  form: 'Tablet' | 'Capsule' | 'IV Infusion' | 'Injection Vial' | 'Syrup' | 'Inhaler';
  category: 'Antibiotic' | 'Cardiovascular' | 'Analgesic' | 'Anticoagulant' | 'Endocrine' | 'Respiratory' | 'GI';
  centralStock: number;
  wardStock: number;
  minThreshold: number;
  storage: 'Ambient (15-25°C)' | 'Cold Chain (2-8°C)' | 'Controlled Substance (Vault)';
  lotNumber: string;
  expiryDate: string;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface StatAlertItem {
  id: string;
  type: 'ABNORMAL_VITALS' | 'LAB_RESULTS' | 'CRITICAL_ALLERGY' | 'INTERACTION';
  title: string;
  patientName: string;
  patientId: string;
  timeAgo: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  vitalsInfo?: string;
  isAcknowledged?: boolean;
}

export interface ClinicalTaskItem {
  id: string;
  title: string;
  dueTime: string;
  badgeText?: string;
  badgeColor?: string;
  completed: boolean;
  patientId?: string;
}

export interface MedicationAdminTask {
  id: string;
  patientId: string;
  patientName: string;
  roomBed: string;
  patientDob: string;
  patientAvatar: string;
  drugName: string;
  doseRoute: string;
  statusType: 'STAT' | 'DUE_NOW' | 'OVERDUE';
  timeLabel?: string;
  prescriptionId: string;
}
