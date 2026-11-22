// mobile-app/context/AppContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import {
  Subject,
  AttendanceRecord,
  AttendanceStatus,
  ClassType,
  TimetableSlot,
  OverallStats,
  TodayClassItem,
} from '@/types/attendance';
import { calculateOverallStats, calculateSubjectStats } from '@/utils/attendanceCalculator';
import { NotificationService } from '@/utils/NotificationService';

// --- PALETTE FOR AUTO-ASSIGNING COLORS TO SUBJECTS ---
const SUBJECT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
];

// --- APP STATE INTERFACE ---
interface AppState {
  subjects: Subject[];
  timetableSlots: TimetableSlot[];
  darkMode: boolean;
  notificationsEnabled: boolean;
  hasSeenOnboarding: boolean;
  globalTargetPercentage: number;
}

// --- APP CONTEXT TYPE ---
export interface AppContextType extends AppState {
  isDarkMode: boolean;
  overallStats: OverallStats;
  todayClasses: TodayClassItem[];
  addSubject: (
    subject: Partial<Subject> & {
      name: string;
      initialTotal?: number;
      initialAttended?: number;
    }
  ) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  archiveSubject: (id: string) => void;
  unarchiveSubject: (id: string) => void;
  recordAttendance: (
    subjectId: string,
    record: Omit<AttendanceRecord, 'id'>
  ) => void;
  updateAttendanceRecord: (
    subjectId: string,
    recordId: string,
    updates: Partial<AttendanceRecord>
  ) => void;
  deleteAttendanceRecord: (subjectId: string, recordId: string) => void;
  quickCycleAttendance: (
    subjectId: string,
    dateString: string,
    slotIndex?: number
  ) => void;
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  deleteTimetableSlot: (slotId: string) => void;
  quickMarkTodaySlot: (slot: TimetableSlot, status: AttendanceStatus) => void;
  setGlobalTargetPercentage: (target: number) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setOnboardingComplete: () => void;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// --- INITIAL STATE ---
const initialState: AppState = {
  subjects: [],
  timetableSlots: [],
  darkMode: false,
  notificationsEnabled: true,
  hasSeenOnboarding: false,
  globalTargetPercentage: 75,
};

// --- ACTION TYPES ---
type AppAction =
  | { type: 'LOAD_DATA'; payload: AppState }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'UPDATE_SUBJECT'; payload: Subject }
  | { type: 'DELETE_SUBJECT'; payload: string }
  | { type: 'ARCHIVE_SUBJECT'; payload: string }
  | { type: 'UNARCHIVE_SUBJECT'; payload: string }
  | {
      type: 'RECORD_ATTENDANCE';
      payload: { subjectId: string; record: AttendanceRecord };
    }
  | {
      type: 'UPDATE_ATTENDANCE_RECORD';
      payload: {
        subjectId: string;
        recordId: string;
        updates: Partial<AttendanceRecord>;
      };
    }
  | {
      type: 'DELETE_ATTENDANCE_RECORD';
      payload: { subjectId: string; recordId: string };
    }
  | {
      type: 'CYCLE_ATTENDANCE';
      payload: { subjectId: string; dateString: string; slotIndex: number };
    }
  | { type: 'ADD_TIMETABLE_SLOT'; payload: TimetableSlot }
  | { type: 'DELETE_TIMETABLE_SLOT'; payload: string }
  | { type: 'SET_GLOBAL_TARGET'; payload: number }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'SET_ONBOARDING_COMPLETE' }
  | { type: 'RESET_ALL_DATA' };

// --- DATA MIGRATION HELPER (v1 to v2) ---
function migrateSubjects(rawSubjects: any[]): Subject[] {
  if (!Array.isArray(rawSubjects)) return [];

  return rawSubjects.map((s, index) => {
    let records: AttendanceRecord[] = Array.isArray(s.attendanceRecords)
      ? s.attendanceRecords
      : [];

    // Migrate old attendance: [{ date, present }]
    if (records.length === 0 && Array.isArray(s.attendance)) {
      records = s.attendance.map((att: { date: string; present: boolean }, idx: number) => ({
        id: `${s.id || Date.now()}-${att.date}-${idx}`,
        date: att.date,
        slotIndex: 0,
        type: 'lecture' as ClassType,
        weight: 1,
        status: att.present ? ('present' as AttendanceStatus) : ('absent' as AttendanceStatus),
      }));
    }

    return {
      id: s.id || Date.now().toString() + index,
      name: s.name || 'Untitled Subject',
      code: s.code || '',
      color: s.color || SUBJECT_COLORS[index % SUBJECT_COLORS.length],
      targetPercentage: typeof s.targetPercentage === 'number' ? s.targetPercentage : 75,
      importance: s.importance || 'Medium',
      professorStrictness: s.professorStrictness || 'Medium',
      attendanceMethod: s.attendanceMethod || 'roll_call',
      hasUpcomingTest: Boolean(s.hasUpcomingTest),
      upcomingTestDate: s.upcomingTestDate || undefined,
      isArchived: Boolean(s.isArchived),
      createdAt: s.createdAt || new Date().toISOString(),
      updatedAt: s.updatedAt || new Date().toISOString(),
      timetable: Array.isArray(s.timetable) ? s.timetable : [],
      attendanceRecords: records,
      totalClasses: s.totalClasses,
      attendedClasses: s.attendedClasses,
    };
  });
}

// --- REDUCER ---
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA': {
      const payload = action.payload;
      return {
        subjects: migrateSubjects(payload.subjects || []),
        timetableSlots: Array.isArray(payload.timetableSlots) ? payload.timetableSlots : [],
        darkMode: Boolean(payload.darkMode),
        notificationsEnabled: payload.notificationsEnabled ?? true,
        hasSeenOnboarding: payload.hasSeenOnboarding ?? false,
        globalTargetPercentage: payload.globalTargetPercentage ?? 75,
      };
    }

    case 'ADD_SUBJECT':
      return {
        ...state,
        subjects: [...state.subjects, action.payload],
      };

    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : s
        ),
      };

    case 'DELETE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.filter((s) => s.id !== action.payload),
        timetableSlots: state.timetableSlots.filter((slot) => slot.subjectId !== action.payload),
      };

    case 'ARCHIVE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload ? { ...s, isArchived: true, updatedAt: new Date().toISOString() } : s
        ),
      };

    case 'UNARCHIVE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload ? { ...s, isArchived: false, updatedAt: new Date().toISOString() } : s
        ),
      };

    case 'RECORD_ATTENDANCE': {
      const { subjectId, record } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map((s) => {
          if (s.id !== subjectId) return s;
          const records = s.attendanceRecords || [];
          return {
            ...s,
            attendanceRecords: [...records, record],
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }

    case 'UPDATE_ATTENDANCE_RECORD': {
      const { subjectId, recordId, updates } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map((s) => {
          if (s.id !== subjectId) return s;
          return {
            ...s,
            attendanceRecords: (s.attendanceRecords || []).map((r) =>
              r.id === recordId ? { ...r, ...updates } : r
            ),
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }

    case 'DELETE_ATTENDANCE_RECORD': {
      const { subjectId, recordId } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map((s) => {
          if (s.id !== subjectId) return s;
          return {
            ...s,
            attendanceRecords: (s.attendanceRecords || []).filter((r) => r.id !== recordId),
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }

    case 'CYCLE_ATTENDANCE': {
      const { subjectId, dateString, slotIndex } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map((s) => {
          if (s.id !== subjectId) return s;
          const records = s.attendanceRecords || [];
          const existing = records.find(
            (r) => r.date === dateString && r.slotIndex === slotIndex
          );

          let updatedRecords: AttendanceRecord[];

          if (!existing) {
            const newRecord: AttendanceRecord = {
              id: `${subjectId}-${dateString}-${slotIndex}-${Date.now()}`,
              date: dateString,
              slotIndex,
              type: 'lecture',
              weight: 1,
              status: 'present',
            };
            updatedRecords = [...records, newRecord];
          } else if (existing.status === 'present') {
            updatedRecords = records.map((r) =>
              r.id === existing.id ? { ...r, status: 'absent' as AttendanceStatus } : r
            );
          } else if (existing.status === 'absent') {
            updatedRecords = records.map((r) =>
              r.id === existing.id ? { ...r, status: 'duty_leave' as AttendanceStatus } : r
            );
          } else if (existing.status === 'duty_leave') {
            updatedRecords = records.map((r) =>
              r.id === existing.id ? { ...r, status: 'cancelled' as AttendanceStatus } : r
            );
          } else {
            updatedRecords = records.filter((r) => r.id !== existing.id);
          }

          return {
            ...s,
            attendanceRecords: updatedRecords,
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }

    case 'ADD_TIMETABLE_SLOT':
      return {
        ...state,
        timetableSlots: [...state.timetableSlots, action.payload],
      };

    case 'DELETE_TIMETABLE_SLOT':
      return {
        ...state,
        timetableSlots: state.timetableSlots.filter((slot) => slot.id !== action.payload),
      };

    case 'SET_GLOBAL_TARGET':
      return {
        ...state,
        globalTargetPercentage: action.payload,
      };

    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
      };

    case 'TOGGLE_NOTIFICATIONS':
      return {
        ...state,
        notificationsEnabled: !state.notificationsEnabled,
      };

    case 'SET_ONBOARDING_COMPLETE':
      return {
        ...state,
        hasSeenOnboarding: true,
      };

    case 'RESET_ALL_DATA':
      return { ...initialState };

    default:
      return state;
  }
}

// --- PROVIDER COMPONENT ---
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const systemColorScheme = useColorScheme();
  const [dataLoaded, setDataLoaded] = useState(false);

  const isDarkMode = state.darkMode || systemColorScheme === 'dark';

  // Load state on startup
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('shouldIBunkData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          dispatch({ type: 'LOAD_DATA', payload: parsed });
        }
      } catch (error) {
        console.error('Error loading Should_I_Bunk data:', error);
      } finally {
        setDataLoaded(true);
      }
    };
    loadInitialData();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (dataLoaded) {
      AsyncStorage.setItem('shouldIBunkData', JSON.stringify(state)).catch((err) =>
        console.error('Error saving Should_I_Bunk data:', err)
      );
    }
  }, [state, dataLoaded]);

  // Overall memoized statistics
  const overallStats = useMemo(() => {
    return calculateOverallStats(state.subjects);
  }, [state.subjects]);

  // Compute Today's Classes
  const todayClasses = useMemo((): TodayClassItem[] => {
    const today = new Date();
    // JS getDay(): 0 = Sun, 1 = Mon... Convert to 1 = Mon, ..., 7 = Sun
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const todayStr = today.toISOString().split('T')[0];

    // Filter slots for today and sort by start time
    const todaySlots = state.timetableSlots
      .filter((slot) => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const items: TodayClassItem[] = [];
    for (const slot of todaySlots) {
      const subject = state.subjects.find((s) => s.id === slot.subjectId);
      if (subject && !subject.isArchived) {
        const stats = calculateSubjectStats(subject);
        // Robust 1-to-1 match by unique timetableSlotId or exact startTime
        const todayRecord = (subject.attendanceRecords || []).find((r) =>
          r.date === todayStr &&
          (r.timetableSlotId ? r.timetableSlotId === slot.id : r.timeSlot === slot.startTime)
        );
        items.push({
          slot,
          subject,
          stats,
          todayRecord,
        });
      }
    }
    return items;
  }, [state.timetableSlots, state.subjects]);

  // Sync scheduled notifications whenever timetable or subjects change
  useEffect(() => {
    if (dataLoaded && state.notificationsEnabled) {
      NotificationService.scheduleDailyBriefing(
        8,
        0,
        todayClasses.length,
        overallStats.totalSafeBunksAvailable,
        overallStats.dangerSubjectsCount
      );

      // Schedule reminders for today's upcoming classes
      for (const item of todayClasses) {
        NotificationService.scheduleClassReminder(
          item.slot,
          item.subject.name,
          item.stats.safeBunks
        );
      }
    }
  }, [dataLoaded, state.notificationsEnabled, todayClasses, overallStats]);

  // Actions
  const addSubject = (
    subjectData: Partial<Subject> & {
      name: string;
      initialTotal?: number;
      initialAttended?: number;
    }
  ) => {
    const colorIndex = state.subjects.length % SUBJECT_COLORS.length;
    const subjectId = Date.now().toString();

    const initialRecords: AttendanceRecord[] = [];
    const initialTotal = Math.max(0, subjectData.initialTotal || 0);
    const initialAttended = Math.min(initialTotal, Math.max(0, subjectData.initialAttended || 0));
    const initialAbsent = initialTotal - initialAttended;

    if (initialTotal > 0) {
      const today = new Date();
      for (let i = 0; i < initialAttended; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (initialTotal - i));
        initialRecords.push({
          id: `${subjectId}-init-p-${i}`,
          date: d.toISOString().split('T')[0],
          slotIndex: 0,
          type: 'lecture',
          weight: 1,
          status: 'present',
        });
      }
      for (let i = 0; i < initialAbsent; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (initialAbsent - i));
        initialRecords.push({
          id: `${subjectId}-init-a-${i}`,
          date: d.toISOString().split('T')[0],
          slotIndex: 1,
          type: 'lecture',
          weight: 1,
          status: 'absent',
        });
      }
    }

    const newSubject: Subject = {
      id: subjectId,
      name: subjectData.name.trim(),
      code: subjectData.code?.trim() || '',
      color: subjectData.color || SUBJECT_COLORS[colorIndex],
      targetPercentage: subjectData.targetPercentage || state.globalTargetPercentage || 75,
      importance: subjectData.importance || 'Medium',
      professorStrictness: subjectData.professorStrictness || 'Medium',
      attendanceMethod: subjectData.attendanceMethod || 'roll_call',
      hasUpcomingTest: Boolean(subjectData.hasUpcomingTest),
      upcomingTestDate: subjectData.upcomingTestDate,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timetable: subjectData.timetable || [],
      attendanceRecords: initialRecords,
    };

    dispatch({ type: 'ADD_SUBJECT', payload: newSubject });
  };

  const updateSubject = (subject: Subject) => {
    dispatch({ type: 'UPDATE_SUBJECT', payload: subject });
  };

  const deleteSubject = (id: string) => {
    dispatch({ type: 'DELETE_SUBJECT', payload: id });
  };

  const archiveSubject = (id: string) => {
    dispatch({ type: 'ARCHIVE_SUBJECT', payload: id });
  };

  const unarchiveSubject = (id: string) => {
    dispatch({ type: 'UNARCHIVE_SUBJECT', payload: id });
  };

  const recordAttendance = (
    subjectId: string,
    record: Omit<AttendanceRecord, 'id'>
  ) => {
    const fullRecord: AttendanceRecord = {
      ...record,
      id: `${subjectId}-${record.date}-${record.slotIndex}-${Date.now()}`,
    };
    dispatch({
      type: 'RECORD_ATTENDANCE',
      payload: { subjectId, record: fullRecord },
    });
  };

  const updateAttendanceRecord = (
    subjectId: string,
    recordId: string,
    updates: Partial<AttendanceRecord>
  ) => {
    dispatch({
      type: 'UPDATE_ATTENDANCE_RECORD',
      payload: { subjectId, recordId, updates },
    });
  };

  const deleteAttendanceRecord = (subjectId: string, recordId: string) => {
    dispatch({
      type: 'DELETE_ATTENDANCE_RECORD',
      payload: { subjectId, recordId },
    });
  };

  const quickCycleAttendance = (
    subjectId: string,
    dateString: string,
    slotIndex: number = 0
  ) => {
    dispatch({
      type: 'CYCLE_ATTENDANCE',
      payload: { subjectId, dateString, slotIndex },
    });
  };

  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: `slot-${Date.now()}`,
    };
    dispatch({ type: 'ADD_TIMETABLE_SLOT', payload: newSlot });
  };

  const deleteTimetableSlot = (slotId: string) => {
    dispatch({ type: 'DELETE_TIMETABLE_SLOT', payload: slotId });
  };

  const quickMarkTodaySlot = (slot: TimetableSlot, status: AttendanceStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const subject = state.subjects.find((s) => s.id === slot.subjectId);
    if (!subject) return;

    const existingRecordsForToday = (subject.attendanceRecords || []).filter(
      (r) => r.date === todayStr
    );

    // Exact, unique, robust 1-to-1 matching:
    // 1. By unique timetableSlotId (primary, industry standard)
    // 2. Fallback by exact timeSlot (e.g. "09:00" or "09:00 - 10:00")
    const existingRecord = existingRecordsForToday.find((r) =>
      r.timetableSlotId ? r.timetableSlotId === slot.id : r.timeSlot === slot.startTime
    );

    if (existingRecord) {
      updateAttendanceRecord(subject.id, existingRecord.id, {
        status,
        timetableSlotId: slot.id, // Ensure slot ID is persisted
      });
    } else {
      recordAttendance(subject.id, {
        date: todayStr,
        slotIndex: existingRecordsForToday.length, // Accurate incremental index for today (0, 1, 2...)
        timeSlot: slot.startTime,
        type: slot.type,
        weight: slot.type === 'lab' ? 2 : 1,
        status,
        timetableSlotId: slot.id, // Strictly bind record to this specific timetable slot
      });
    }

    // Trigger instant danger zone alert if marking absent causes drop below target
    if (status === 'absent') {
      const stats = calculateSubjectStats(subject);
      const newTotal = stats.totalClasses + (slot.type === 'lab' ? 2 : 1);
      const newPct = Math.round((stats.attendedClasses / newTotal) * 100);
      if (newPct < stats.targetPercentage) {
        NotificationService.sendDangerZoneAlert(
          subject.name,
          newPct,
          stats.targetPercentage
        );
      }
    }
  };

  const setGlobalTargetPercentage = (target: number) => {
    dispatch({ type: 'SET_GLOBAL_TARGET', payload: target });
  };

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const toggleNotifications = () => {
    const nextState = !state.notificationsEnabled;
    if (nextState) {
      NotificationService.requestPermissions();
    } else {
      NotificationService.cancelAll();
    }
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  };

  const setOnboardingComplete = () => {
    dispatch({ type: 'SET_ONBOARDING_COMPLETE' });
  };

  const resetAllData = async () => {
    try {
      await AsyncStorage.removeItem('shouldIBunkData');
      await NotificationService.cancelAll();
      dispatch({ type: 'RESET_ALL_DATA' });
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        isDarkMode,
        overallStats,
        todayClasses,
        addSubject,
        updateSubject,
        deleteSubject,
        archiveSubject,
        unarchiveSubject,
        recordAttendance,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        quickCycleAttendance,
        addTimetableSlot,
        deleteTimetableSlot,
        quickMarkTodaySlot,
        setGlobalTargetPercentage,
        toggleDarkMode,
        toggleNotifications,
        setOnboardingComplete,
        resetAllData,
      }}
    >
      {dataLoaded ? children : null}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
