// mobile-app/utils/attendanceCalculator.ts

import { Subject, AttendanceRecord, SubjectStats, OverallStats } from '@/types/attendance';

/**
 * Calculates the exact safe bunk buffer.
 * Formula: B = floor((Attended - (Target * Total)) / Target)
 */
export function calculateSafeBunks(
  attended: number,
  total: number,
  targetPercentage: number = 75
): number {
  if (total <= 0 || attended <= 0) return 0;
  if (targetPercentage <= 0) return 999;
  if (targetPercentage >= 100) return 0;

  const target = targetPercentage / 100;
  const currentRatio = attended / total;

  if (currentRatio < target) return 0;

  // Solving for B: attended / (total + B) >= target
  // attended >= target * total + target * B
  // target * B <= attended - target * total
  // B <= (attended - target * total) / target
  const maxBunks = Math.floor((attended - target * total) / target);
  return Math.max(0, maxBunks);
}

/**
 * Calculates how many consecutive classes must be attended to recover to target %.
 * Formula: C = ceil(((Target * Total) - Attended) / (1 - Target))
 */
export function calculateClassesToAttend(
  attended: number,
  total: number,
  targetPercentage: number = 75
): number {
  if (targetPercentage >= 100) {
    // If target is 100%, and you ever missed a class, you can never reach 100%
    return attended < total ? 999 : 0;
  }
  if (total <= 0) return 0;

  const target = targetPercentage / 100;
  const currentRatio = attended / total;

  if (currentRatio >= target) return 0;

  // Solving for C: (attended + C) / (total + C) >= target
  // attended + C >= target * total + target * C
  // C * (1 - target) >= target * total - attended
  // C >= (target * total - attended) / (1 - target)
  const needed = Math.ceil((target * total - attended) / (1 - target));
  return Math.max(0, needed);
}

/**
 * Computes exact stats for a subject from its attendance records.
 */
export function calculateSubjectStats(subject: Subject): SubjectStats {
  const target = subject.targetPercentage ?? 75;
  const records = subject.attendanceRecords ?? [];

  let totalWeighted = 0;
  let attendedWeighted = 0;
  let absentWeighted = 0;
  let cancelledCount = 0;
  let dutyLeaveCount = 0;

  for (const record of records) {
    const weight = record.weight > 0 ? record.weight : 1;

    switch (record.status) {
      case 'present':
        totalWeighted += weight;
        attendedWeighted += weight;
        break;
      case 'absent':
        totalWeighted += weight;
        absentWeighted += weight;
        break;
      case 'duty_leave':
        // Standard academic On-Duty: counts as attended, doesn't penalize
        totalWeighted += weight;
        attendedWeighted += weight;
        dutyLeaveCount += 1;
        break;
      case 'cancelled':
        // Cancelled by college/professor: exempt from both total and attended
        cancelledCount += 1;
        break;
    }
  }

  // Fallback to legacy fields if no records exist yet
  if (records.length === 0 && (subject.totalClasses || 0) > 0) {
    totalWeighted = subject.totalClasses || 0;
    attendedWeighted = subject.attendedClasses || 0;
    absentWeighted = Math.max(0, totalWeighted - attendedWeighted);
  }

  const percentage =
    totalWeighted > 0
      ? Math.round((attendedWeighted / totalWeighted) * 1000) / 10 // e.g. 75.4
      : 0;

  const safeBunks = calculateSafeBunks(attendedWeighted, totalWeighted, target);
  const classesToAttend = calculateClassesToAttend(attendedWeighted, totalWeighted, target);

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (percentage < target - 5) {
    status = 'danger';
  } else if (percentage < target) {
    status = 'warning';
  }

  return {
    totalClasses: totalWeighted,
    attendedClasses: attendedWeighted,
    absentClasses: absentWeighted,
    cancelledCount,
    dutyLeaveCount,
    percentage,
    targetPercentage: target,
    safeBunks,
    classesToAttend,
    status,
  };
}

/**
 * Calculates aggregated stats across all active subjects.
 */
export function calculateOverallStats(subjects: Subject[]): OverallStats {
  const activeSubjects = subjects.filter((s) => !s.isArchived);

  let totalClasses = 0;
  let attendedClasses = 0;
  let safeSubjectsCount = 0;
  let warningSubjectsCount = 0;
  let dangerSubjectsCount = 0;
  let totalSafeBunksAvailable = 0;

  for (const subject of activeSubjects) {
    const stats = calculateSubjectStats(subject);
    totalClasses += stats.totalClasses;
    attendedClasses += stats.attendedClasses;
    totalSafeBunksAvailable += stats.safeBunks;

    if (stats.status === 'safe') safeSubjectsCount++;
    else if (stats.status === 'warning') warningSubjectsCount++;
    else dangerSubjectsCount++;
  }

  const overallPercentage =
    totalClasses > 0
      ? Math.round((attendedClasses / totalClasses) * 1000) / 10
      : 0;

  return {
    totalSubjects: activeSubjects.length,
    totalClasses,
    attendedClasses,
    overallPercentage,
    safeSubjectsCount,
    warningSubjectsCount,
    dangerSubjectsCount,
    totalSafeBunksAvailable,
  };
}

/**
 * Filter records for a specific date string (YYYY-MM-DD), sorted by slotIndex.
 */
export function getRecordsForDate(
  subject: Subject,
  dateString: string
): AttendanceRecord[] {
  return (subject.attendanceRecords ?? [])
    .filter((r) => r.date === dateString)
    .sort((a, b) => a.slotIndex - b.slotIndex);
}
