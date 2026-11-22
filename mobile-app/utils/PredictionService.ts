// mobile-app/utils/PredictionService.ts

import { Subject, DetailedPredictionResult } from '@/types/attendance';
import { evaluateBunkDecision, EvaluateBunkOptions } from '@/utils/predictionEngine';

export interface LegacyPredictionInput {
  attendance_percentage: number;
  total_classes: number;
  classes_attended: number;
  class_importance: string;
  upcoming_test: boolean;
  professor_strictness: string;
}

export interface LegacyPredictionOutput {
  safe_to_bunk: boolean;
  probability: number;
  advice: string;
  detailedResult?: DetailedPredictionResult;
}

export class PredictionService {
  /**
   * Main v2 Zero-Failure Evaluation
   * Evaluates directly from the rich Subject domain model.
   */
  static evaluate(
    subject: Subject,
    options?: EvaluateBunkOptions
  ): DetailedPredictionResult {
    return evaluateBunkDecision(subject, options);
  }

  /**
   * Legacy adapter for backward compatibility
   */
  static async predict(input: LegacyPredictionInput): Promise<LegacyPredictionOutput> {
    // Construct a temporary subject model for evaluation
    const mockSubject: Subject = {
      id: 'temp-predict',
      name: 'Subject',
      targetPercentage: 75,
      importance: (input.class_importance as any) || 'Medium',
      professorStrictness: (input.professor_strictness as any) || 'Medium',
      attendanceMethod: 'roll_call',
      hasUpcomingTest: Boolean(input.upcoming_test),
      attendanceRecords: [],
      totalClasses: input.total_classes,
      attendedClasses: input.classes_attended,
    };

    const detailed = evaluateBunkDecision(mockSubject);

    return {
      safe_to_bunk: detailed.safeToBunk,
      probability: detailed.safetyScore / 100,
      advice: detailed.tacticalAdvice,
      detailedResult: detailed,
    };
  }
}
