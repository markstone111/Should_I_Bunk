// mobile-app/utils/simulationEngine.ts

import {
  Subject,
  BunkSimulationPoint,
  RecoverySimulationPoint,
  SemesterForecast,
} from '@/types/attendance';
import {
  calculateSubjectStats,
  calculateSafeBunks,
  calculateClassesToAttend,
} from '@/utils/attendanceCalculator';

/**
 * Simulates a step-by-step projection of what happens if the student bunks consecutive classes.
 */
export function simulateBunkLadder(
  subject: Subject,
  maxBunks: number = 10
): BunkSimulationPoint[] {
  const stats = calculateSubjectStats(subject);
  const target = subject.targetPercentage || 75;
  const initialAttended = stats.attendedClasses;
  const initialTotal = stats.totalClasses;

  const points: BunkSimulationPoint[] = [];

  for (let k = 0; k <= maxBunks; k++) {
    const projTotal = initialTotal + k;
    const projAttended = initialAttended; // bunks don't add to attended
    const projPct =
      projTotal > 0
        ? Math.round((projAttended / projTotal) * 1000) / 10
        : 0;

    const bufferRemaining = calculateSafeBunks(projAttended, projTotal, target);
    const classesToRecover = calculateClassesToAttend(projAttended, projTotal, target);

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (projPct < target - 5) {
      status = 'danger';
    } else if (projPct < target) {
      status = 'warning';
    }

    points.push({
      bunksCount: k,
      totalClasses: projTotal,
      attendedClasses: projAttended,
      projectedPercentage: projPct,
      bufferRemaining,
      classesToRecover,
      status,
    });
  }

  return points;
}

/**
 * Simulates how attendance recovers if the student attends upcoming classes consecutively.
 */
export function simulateRecoveryLadder(
  subject: Subject,
  maxAttend: number = 20
): RecoverySimulationPoint[] {
  const stats = calculateSubjectStats(subject);
  const target = subject.targetPercentage || 75;
  const initialAttended = stats.attendedClasses;
  const initialTotal = stats.totalClasses;

  const points: RecoverySimulationPoint[] = [];

  for (let k = 0; k <= maxAttend; k++) {
    const projTotal = initialTotal + k;
    const projAttended = initialAttended + k; // attending adds to both total & attended
    const projPct =
      projTotal > 0
        ? Math.round((projAttended / projTotal) * 1000) / 10
        : 0;

    const isTargetReached = projPct >= target;
    const bufferAchieved = calculateSafeBunks(projAttended, projTotal, target);

    points.push({
      classesAttendedCount: k,
      totalClasses: projTotal,
      attendedClasses: projAttended,
      projectedPercentage: projPct,
      isTargetReached,
      bufferAchieved,
    });
  }

  return points;
}

/**
 * End-of-Semester Forecast
 * Estimates best case, worst case, and maximum total safe bunks across the remaining term.
 */
export function simulateSemesterForecast(
  subject: Subject,
  remainingClasses: number = 20,
  plannedBunks: number = 0
): SemesterForecast {
  const stats = calculateSubjectStats(subject);
  const target = subject.targetPercentage || 75;
  const targetFraction = target / 100;
  const A = stats.attendedClasses;
  const N = stats.totalClasses;
  const R = Math.max(0, remainingClasses);
  const P = Math.min(R, Math.max(0, plannedBunks));

  const totalAtEnd = N + R;

  // Best Case: Attend 100% of remaining classes
  const bestAttended = A + R;
  const bestCasePercentage =
    totalAtEnd > 0 ? Math.round((bestAttended / totalAtEnd) * 1000) / 10 : 0;

  // Worst Case: Bunk 100% of remaining classes
  const worstAttended = A;
  const worstCasePercentage =
    totalAtEnd > 0 ? Math.round((worstAttended / totalAtEnd) * 1000) / 10 : 0;

  // Planned Case: Attend (R - P) classes
  const plannedAttended = A + (R - P);
  const plannedCasePercentage =
    totalAtEnd > 0 ? Math.round((plannedAttended / totalAtEnd) * 1000) / 10 : 0;

  // Maximum total bunks allowed across remaining classes:
  // (A + R - B) / (N + R) >= targetFraction
  // A + R - B >= targetFraction * (N + R)
  // B <= A + R - targetFraction * (N + R)
  const maxAllowedBunks = Math.floor(A + R - targetFraction * (N + R));
  const maxBunksAllowedInRemaining = Math.max(0, Math.min(R, maxAllowedBunks));

  const canAchieveTarget = bestCasePercentage >= target;

  return {
    estimatedRemaining: R,
    plannedBunks: P,
    bestCasePercentage,
    worstCasePercentage,
    plannedCasePercentage,
    maxBunksAllowedInRemaining,
    canAchieveTarget,
  };
}
