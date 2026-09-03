export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isNextOfKin: boolean;
  isHealthcareProxy: boolean;
  notes?: string;
}

export interface PastPrescriptionItem {
  id: string;
  drugName: string;
  dose: string;
  route: string;
  frequency: string;
  period: string;
  indication: string;
  outcome: 'Completed Course' | 'Discontinued' | 'Switched' | 'Tapered Off';
  prescribedBy?: string;
  notes?: string;
}

export interface PastMedicalHistory {
  id: string;
  condition: string;
  year: string;
  category: 'SURGERY' | 'CHRONIC_CONDITION' | 'PAST_ILLNESS' | 'HOSPITALIZATION';
  notes?: string;
  doctor?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  uhid: string;
  mrn: string;
  dob: string;
  age: number;
  gender: string;
  weight: string;
  height?: string;
  bmi?: number;
  qrCode?: string;
  ward: string;
  roomBed: string;
  bloodGroup: string;
  admittedDate: string;
  avatarUrl: string;
  primaryDiagnosis: string;
  isCritical?: boolean;
  emergencyContacts?: EmergencyContact[];
  pastPrescriptions?: PastPrescriptionItem[];
  medicalHistory?: PastMedicalHistory[];
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
  statusType: 'STAT' | 'DUE_NOW' | 'OVERDUE' | 'MISSED' | 'COMPLETED';
  timeLabel?: string;
  prescriptionId: string;
  scheduledTime?: string;
  frequency?: string;
  timesPerDay?: string;
  timingSlots?: string;
  administeredAt?: string;
  missedReason?: string;
  overdueMinutes?: number;
}
