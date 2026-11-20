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
  timeSlot?: string; // e.g. "09:00 - 10:00" or "Period 1"
  type: ClassType; // 'lecture' | 'lab' | 'tutorial'
  weight: number; // default: 1 (or 2 for double period/lab)
  status: AttendanceStatus;
  note?: string;
}

export interface TimetableSlot {
  id: string;
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
