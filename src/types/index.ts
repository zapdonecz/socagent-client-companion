export type UserRole = 'admin' | 'worker';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phone?: string;
  email?: string;
  keyWorker: string;
  contractDate: string;
  contractNumber: string;
  contractEndDate?: string;
  guardianship?: {
    hasGuardian: boolean;
    guardianName?: string;
  };
  disability?: string;
  careAllowance?: {
    level?: string;
    dateGranted?: string;
  };
  treatmentSupport: boolean;
  contacts: ClientContact[];
  notes: ClientNote[];
  documents: ClientDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientNote {
  id: string;
  clientId: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
}

export interface ClientContact {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  hasConsent: boolean;
}

export interface PersonalProfile {
  id: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  areas: {
    housing: ProfileArea;
    work: ProfileArea;
    finances: ProfileArea;
    education: ProfileArea;
    recreation: ProfileArea;
    health: ProfileArea;
    selfCare: ProfileArea;
    relationships: ProfileArea;
    safety: ProfileArea;
  };
  priorities: string[];
}

export interface ProfileArea {
  currentSkills: string;
  wishes: string;
  pastSkills: string;
}

export interface PersonalPlan {
  id: string;
  clientId: string;
  goal: string;
  importance: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'cancelled';
  steps: PlanStep[];
}

export interface PlanStep {
  id: string;
  clientAction: string;
  othersAction: string;
  deadline: string;
  completedDate?: string;
  completed: boolean;
  notes: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'accompaniment' | 'community' | 'planning' | 'review' | 'other';
  clientId?: string;
  clientName?: string;
  date: string;
  duration: number;
  notes?: string;
  createdBy: string;
}

export interface SemiAnnualReview {
  id: string;
  clientId: string;
  period: {
    start: string;
    end: string;
  };
  createdAt: string;
  areas: {
    housing: ReviewArea;
    work: ReviewArea;
    education: ReviewArea;
    recreation: ReviewArea;
    health: ReviewArea;
    selfCare: ReviewArea;
    relationships: ReviewArea;
    safety: ReviewArea;
    finances: ReviewArea;
  };
  clientSatisfaction: string;
  workerNotes: string;
  signedByClient: boolean;
  signedByWorker: boolean;
}

export interface ReviewArea {
  clientView: string;
  workerView: string;
  progress: 'green' | 'yellow' | 'red';
}

export interface Meeting {
  id: string;
  clientId?: string;
  title: string;
  content: string;
  startTime: string;
  endTime?: string;
  createdBy: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  deadlineWarningDays: number;
  reviewReminderMonths: number;
  profileUpdateMonths: number;
  showCompletedPlans: boolean;
}
