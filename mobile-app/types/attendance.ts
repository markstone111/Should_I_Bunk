// mobile-app/types/attendance.ts

export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | 'duty_leave';
export type ClassType = 'lecture' | 'lab' | 'tutorial';
export type AttendanceMethod = 'roll_call' | 'biometric' | 'qr_code' | 'sheet';
export type StrictnessLevel = 'Low' | 'Medium' | 'High';
export type ImportanceLevel = 'Low' | 'Medium' | 'High';

export interface AttendanceRecord {
  id: string;
  date: string; // ISO format "YYYY-MM-DD"
  slotIndex: number; // 0, 1, 2... for multiple sessions on the same date
  timeSlot?: string; // e.g. "09:00 - 10:00" or "09:00"
  type: ClassType; // 'lecture' | 'lab' | 'tutorial'
  weight: number; // default: 1 (or 2 for double period/lab)
  status: AttendanceStatus;
  note?: string;
  timetableSlotId?: string; // Unique 1-to-1 link to timetable slot
}

export interface TimetableSlot {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ... 7 = Sunday
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  type: ClassType;
  room?: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string; // e.g., "CS301"
  color?: string; // hex color for badges
  targetPercentage: number; // default: 75
  importance: ImportanceLevel;
  professorStrictness: StrictnessLevel;
  attendanceMethod: AttendanceMethod;
  hasUpcomingTest: boolean;
  upcomingTestDate?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  timetable?: TimetableSlot[];
  attendanceRecords: AttendanceRecord[];

  // Legacy compatibility fields
  attendance?: { date: string; present: boolean }[];
  totalClasses?: number;
  attendedClasses?: number;
}

export interface SubjectStats {
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  cancelledCount: number;
  dutyLeaveCount: number;
  percentage: number;
  targetPercentage: number;
  safeBunks: number;
  classesToAttend: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface OverallStats {
  totalSubjects: number;
  totalClasses: number;
  attendedClasses: number;
  overallPercentage: number;
  safeSubjectsCount: number;
  dangerSubjectsCount: number;
  warningSubjectsCount: number;
  totalSafeBunksAvailable: number;
}

export interface TodayClassItem {
  slot: TimetableSlot;
  subject: Subject;
  stats: SubjectStats;
  todayRecord?: AttendanceRecord;
}

export const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 7, name: 'Sunday', short: 'Sun' },
];

// --- PHASE 3 PREDICTION & SIMULATION TYPES ---

export type BunkVerdict =
  | 'SAFE_TO_BUNK'
  | 'CAUTION_BORDERLINE'
  | 'DO_NOT_BUNK'
  | 'CRITICAL_DEFICIT';

export interface RiskFactorItem {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number;
}

export interface DetailedPredictionResult {
  safeToBunk: boolean;
  verdict: BunkVerdict;
  safetyScore: number; // 0 - 100%
  headline: string;
  tacticalAdvice: string;
  currentPercentage: number;
  projectedPercentageAfterBunk: number;
  currentBuffer: number;
  projectedBufferAfterBunk: number;
  classesNeededToRecover: number;
  riskFactors: RiskFactorItem[];
  simulationQuickSummary: {
    maxConsecutiveBunksAllowed: number;
    classesToRecoverIfBunked: number;
  };
}

export interface BunkSimulationPoint {
  bunksCount: number;
  totalClasses: number;
  attendedClasses: number;
  projectedPercentage: number;
  bufferRemaining: number;
  classesToRecover: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface RecoverySimulationPoint {
  classesAttendedCount: number;
  totalClasses: number;
  attendedClasses: number;
  projectedPercentage: number;
  isTargetReached: boolean;
  bufferAchieved: number;
}

export interface SemesterForecast {
  estimatedRemaining: number;
  plannedBunks: number;
  bestCasePercentage: number;
  worstCasePercentage: number;
  plannedCasePercentage: number;
  maxBunksAllowedInRemaining: number;
  canAchieveTarget: boolean;
}
