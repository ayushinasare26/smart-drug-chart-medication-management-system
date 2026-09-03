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
  emergencyContacts?: EmergencyContact[];
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
  statusType: 'STAT' | 'DUE_NOW' | 'OVERDUE';
  timeLabel?: string;
  prescriptionId: string;
}
