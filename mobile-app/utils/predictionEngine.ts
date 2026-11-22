// mobile-app/utils/predictionEngine.ts

import {
  Subject,
  DetailedPredictionResult,
  BunkVerdict,
  RiskFactorItem,
  ClassType,
} from '@/types/attendance';
import {
  calculateSubjectStats,
  calculateSafeBunks,
  calculateClassesToAttend,
} from '@/utils/attendanceCalculator';

export interface EvaluateBunkOptions {
  classType?: ClassType;
  classWeight?: number;
}

/**
 * The Zero-Failure Bunk Prediction Engine
 * Tier 1: Mathematical Invariant Gatekeeper (100% deterministic)
 * Tier 2: Multi-Dimensional Risk Matrix (Contextual evaluation when buffer > 0)
 */
export function evaluateBunkDecision(
  subject: Subject,
  options: EvaluateBunkOptions = {}
): DetailedPredictionResult {
  const stats = calculateSubjectStats(subject);
  const target = subject.targetPercentage || 75;
  const currentAttended = stats.attendedClasses;
  const currentTotal = stats.totalClasses;
  const currentPct = stats.percentage;
  const weight = options.classWeight || (options.classType === 'lab' ? 2 : 1);

  // If no classes have been held yet
  if (currentTotal === 0) {
    return {
      safeToBunk: false,
      verdict: 'DO_NOT_BUNK',
      safetyScore: 0,
      headline: 'No attendance data yet',
      tacticalAdvice: 'No classes have been recorded for this subject yet. Attend the initial classes to establish your attendance cushion.',
      currentPercentage: 0,
      projectedPercentageAfterBunk: 0,
      currentBuffer: 0,
      projectedBufferAfterBunk: 0,
      classesNeededToRecover: 1,
      riskFactors: [
        {
          name: 'Baseline Absence',
          impact: 'negative',
          description: 'First class should always be attended to set an initial 100% baseline.',
          weight: 1.0,
        },
      ],
      simulationQuickSummary: {
        maxConsecutiveBunksAllowed: 0,
        classesToRecoverIfBunked: 1,
      },
    };
  }

  // --- MATHEMATICAL PROJECTIONS (IF NEXT CLASS IS BUNKED) ---
  const projTotal = currentTotal + weight;
  const projAttended = currentAttended; // Missed class adds to total, not attended
  const projPct = Math.round((projAttended / projTotal) * 1000) / 10;
  const currentBuffer = calculateSafeBunks(currentAttended, currentTotal, target);
  const projectedBuffer = calculateSafeBunks(projAttended, projTotal, target);
  const classesNeededIfBunked = calculateClassesToAttend(projAttended, projTotal, target);

  // =========================================================================
  // TIER 1: THE DETERMINISTIC MATHEMATICAL GATEKEEPER
  // =========================================================================

  // CASE 1A: Student is ALREADY in an attendance deficit (currentPct < target)
  if (currentPct < target) {
    const recoveryNeeded = stats.classesToAttend;
    return {
      safeToBunk: false,
      verdict: 'CRITICAL_DEFICIT',
      safetyScore: 0,
      headline: `Critical Deficit: ${currentPct}% (Target: ${target}%)`,
      tacticalAdvice: `Bunking is mathematically forbidden. You are currently ${recoveryNeeded} class(es) behind your target threshold. Attend classes to avoid debarment.`,
      currentPercentage: currentPct,
      projectedPercentageAfterBunk: projPct,
      currentBuffer: 0,
      projectedBufferAfterBunk: 0,
      classesNeededToRecover: classesNeededIfBunked,
      riskFactors: [
        {
          name: 'Debarment Risk',
          impact: 'negative',
          description: `Current attendance is below the mandatory ${target}% requirement.`,
          weight: 1.0,
        },
        {
          name: 'Deficit Recovery',
          impact: 'negative',
          description: `You must attend the next ${recoveryNeeded} consecutive classes just to recover.`,
          weight: 0.9,
        },
      ],
      simulationQuickSummary: {
        maxConsecutiveBunksAllowed: 0,
        classesToRecoverIfBunked: classesNeededIfBunked,
      },
    };
  }

  // CASE 1B: Student is currently >= target, but skipping this class drops them BELOW target!
  if (projPct < target) {
    return {
      safeToBunk: false,
      verdict: 'DO_NOT_BUNK',
      safetyScore: Math.max(5, Math.min(30, Math.round((projPct / target) * 30))),
      headline: `Zero Buffer: Bunking drops attendance to ${projPct}%`,
      tacticalAdvice: `Do not bunk. Missing this class will push you below your ${target}% target down to ${projPct}%, requiring you to attend ${classesNeededIfBunked} consecutive class(es) to recover.`,
      currentPercentage: currentPct,
      projectedPercentageAfterBunk: projPct,
      currentBuffer: 0,
      projectedBufferAfterBunk: 0,
      classesNeededToRecover: classesNeededIfBunked,
      riskFactors: [
        {
          name: 'Zero Cushion',
          impact: 'negative',
          description: `Skipping drops attendance from ${currentPct}% to ${projPct}% (< ${target}%).`,
          weight: 0.9,
        },
        {
          name: 'Immediate Penalty',
          impact: 'negative',
          description: `Will require attending the next ${classesNeededIfBunked} class(es) consecutively to recover.`,
          weight: 0.8,
        },
      ],
      simulationQuickSummary: {
        maxConsecutiveBunksAllowed: 0,
        classesToRecoverIfBunked: classesNeededIfBunked,
      },
    };
  }

  // =========================================================================
  // TIER 2: MULTI-DIMENSIONAL CONTEXTUAL RISK MATRIX (When Buffer >= 1)
  // =========================================================================
  // Mathematically safe (projPct >= target). Now evaluate risk of spending this buffer!

  const riskFactors: RiskFactorItem[] = [];

  // 1. Base Score from Buffer Cushion
  let baseScore = 50;
  if (currentBuffer === 1) {
    baseScore = 55;
    riskFactors.push({
      name: 'Thin Buffer',
      impact: 'negative',
      description: 'You only have 1 safe bunk left. Bunking now will leave you with 0 margin.',
      weight: 0.3,
    });
  } else if (currentBuffer === 2) {
    baseScore = 70;
    riskFactors.push({
      name: 'Moderate Buffer',
      impact: 'positive',
      description: 'You have 2 safe bunks. You will still have 1 buffer class after today.',
      weight: 0.4,
    });
  } else if (currentBuffer >= 3) {
    baseScore = Math.min(92, 75 + currentBuffer * 4);
    riskFactors.push({
      name: 'Comfortable Buffer',
      impact: 'positive',
      description: `Solid cushion of ${currentBuffer} safe bunks above the ${target}% target.`,
      weight: 0.6,
    });
  }

  let adjustedScore = baseScore;

  // 2. Attendance Method Risk
  switch (subject.attendanceMethod) {
    case 'biometric':
      adjustedScore -= 18;
      riskFactors.push({
        name: 'Biometric / RFID Attendance',
        impact: 'negative',
        description: 'Automated biometric logs cannot be proxied or negotiated.',
        weight: 0.4,
      });
      break;
    case 'sheet':
      adjustedScore -= 8;
      riskFactors.push({
        name: 'Attendance Sheet',
        impact: 'neutral',
        description: 'Physical signature sheets can occasionally be audited by the department.',
        weight: 0.2,
      });
      break;
    case 'qr_code':
      adjustedScore -= 5;
      riskFactors.push({
        name: 'QR Code Attendance',
        impact: 'neutral',
        description: 'Dynamic QR codes may have geo-fencing or short time windows.',
        weight: 0.1,
      });
      break;
    case 'roll_call':
      adjustedScore += 10;
      riskFactors.push({
        name: 'Verbal Roll Call',
        impact: 'positive',
        description: 'Standard roll call; proxy or verbal cover is often feasible with friends.',
        weight: 0.3,
      });
      break;
  }

  // 3. Professor Strictness
  switch (subject.professorStrictness) {
    case 'High':
      adjustedScore -= 15;
      riskFactors.push({
        name: 'Strict Professor',
        impact: 'negative',
        description: 'Known for strict discipline, surprise pop quizzes, or harsh internal marks.',
        weight: 0.35,
      });
      break;
    case 'Low':
      adjustedScore += 10;
      riskFactors.push({
        name: 'Chill Professor',
        impact: 'positive',
        description: 'Lenient instructor with relaxed attendance enforcement.',
        weight: 0.25,
      });
      break;
    default:
      // Medium: neutral
      break;
  }

  // 4. Class Importance / Syllabus Weight
  switch (subject.importance) {
    case 'High':
      adjustedScore -= 12;
      riskFactors.push({
        name: 'High Importance / Core Subject',
        impact: 'negative',
        description: 'Missing lectures may cause backlog in difficult exam topics.',
        weight: 0.3,
      });
      break;
    case 'Low':
      adjustedScore += 8;
      riskFactors.push({
        name: 'Light Syllabus',
        impact: 'positive',
        description: 'Easy subject or introductory coursework; self-study is straightforward.',
        weight: 0.2,
      });
      break;
    default:
      // Medium: neutral
      break;
  }

  // 5. Upcoming Test or Exam Proximity
  if (subject.hasUpcomingTest) {
    adjustedScore -= 22;
    riskFactors.push({
      name: 'Imminent Test / Exam',
      impact: 'negative',
      description: 'Upcoming test flagged! Class might cover exam topics, hints, or test eligibility.',
      weight: 0.5,
    });
  }

  // 6. Session Weight (e.g. 2-hour lab)
  if (weight > 1) {
    adjustedScore -= 10;
    riskFactors.push({
      name: `Heavy Session (${weight}x Weight)`,
      impact: 'negative',
      description: `Missing this ${options.classType || 'lab'} counts as ${weight} absences.`,
      weight: 0.3,
    });
  }

  // Clamp final score to 10 - 98%
  const finalSafetyScore = Math.max(10, Math.min(98, Math.round(adjustedScore)));

  // Determine Verdict
  let verdict: BunkVerdict;
  let headline: string;
  let tacticalAdvice: string;

  if (finalSafetyScore >= 70) {
    verdict = 'SAFE_TO_BUNK';
    headline = `Safe to Bunk (${finalSafetyScore}% Confidence)`;
    if (projectedBuffer > 0) {
      tacticalAdvice = `You have comfortable cushion. Skipping drops attendance to ${projPct}%, leaving ${projectedBuffer} buffer class(es).`;
    } else {
      tacticalAdvice = `Safe for today. Your attendance will be ${projPct}%, exactly on the line. Attend your next class to stay in the green.`;
    }
  } else if (finalSafetyScore >= 45) {
    verdict = 'CAUTION_BORDERLINE';
    headline = `Caution: Borderline Safe (${finalSafetyScore}% Confidence)`;
    tacticalAdvice = `Mathematically safe (${projPct}% > ${target}%), but context factors (strictness or upcoming test) make this risky.`;
  } else {
    verdict = 'DO_NOT_BUNK';
    headline = `Better Attend (${finalSafetyScore}% Safety Score)`;
    tacticalAdvice = `Although you technically have buffer, situational risk (strict professor, test proximity, or attendance tracking) makes bunking ill-advised today.`;
  }

  return {
    safeToBunk: verdict === 'SAFE_TO_BUNK' || verdict === 'CAUTION_BORDERLINE',
    verdict,
    safetyScore: finalSafetyScore,
    headline,
    tacticalAdvice,
    currentPercentage: currentPct,
    projectedPercentageAfterBunk: projPct,
    currentBuffer,
    projectedBufferAfterBunk: projectedBuffer,
    classesNeededToRecover: 0,
    riskFactors,
    simulationQuickSummary: {
      maxConsecutiveBunksAllowed: currentBuffer,
      classesToRecoverIfBunked: 0,
    },
  };
}
