interface PredictionInput {
  attendance_percentage: number;
  total_classes: number;
  classes_attended: number;
  class_importance: string;
  upcoming_test: boolean;
  professor_strictness: string;
}

interface PredictionOutput {
  safe_to_bunk: boolean;
  probability: number;
  advice: string;
}

export class PredictionService {
  private static readonly API_BASE_URL = 'http://192.168.1.38:5000';

  static async predict(input: PredictionInput): Promise<PredictionOutput> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return await response.json();
    } catch (error) {
      console.error('Prediction error:', error);
      return this.localPredict(input);
    }
  }

  private static localPredict(input: PredictionInput): PredictionOutput {
    // Simple local prediction algorithm as fallback
    let score = input.attendance_percentage / 100;

    // Adjust based on factors
    if (input.class_importance === 'High') score -= 0.3;
    else if (input.class_importance === 'Low') score += 0.2;

    if (input.upcoming_test) score -= 0.4;

    if (input.professor_strictness === 'High') score -= 0.2;
    else if (input.professor_strictness === 'Low') score += 0.1;

    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(1, score));

    const safe_to_bunk = score > 0.6;
    const probability = safe_to_bunk ? score : 1 - score;

    let advice = '';
    if (safe_to_bunk) {
      if (score > 0.8) {
        advice = 'You have excellent attendance! Safe to take a break.';
      } else {
        advice = 'Safe to bunk, but monitor your attendance carefully.';
      }
    } else {
      if (score < 0.3) {
        advice = 'Your attendance is critically low. Attend this class!';
      } else {
        advice = 'Better to attend this class to maintain good attendance.';
      }
    }

    return {
      safe_to_bunk,
      probability,
      advice,
    };
  }
}
