import { IWorkoutLog } from '../../models/SymeSchemas';

export interface DailyRecommendation {
  intensityAdjustment: number; // 0.5 - 1.2
  message: string;
  suggestedWorkout: string;
  recoveryScore: number; // 0-100
}

export class AdaptiveRecommender {
  /**
   * Calculates a daily workout recommendation based on fatigue and recovery.
   * Logic:
   * 1. Previous workout intensity.
   * 2. Sleep hours input.
   * 3. Soreness input.
   * 4. Missed workout compensation logic.
   */
  static calculateRecommendation(lastLog: IWorkoutLog | null, sleepHours: number, soreness: number): DailyRecommendation {
    let intensityAdjustment = 1.0;
    let message = "You're primed for peak performance!";
    let suggestedWorkout = "Scheduled Session";

    // 1. Sleep Adjustment
    if (sleepHours < 6) {
      intensityAdjustment -= 0.2;
      message = "Low sleep detected. Reducing intensity for optimal recovery.";
    } else if (sleepHours > 8) {
      intensityAdjustment += 0.1;
      message = "Excellent recovery! Feel free to push harder today.";
    }

    // 2. Soreness Adjustment
    if (soreness >= 4) {
      intensityAdjustment -= 0.3;
      message = "High soreness detected. Suggesting an active recovery session or mobility work.";
      suggestedWorkout = "Active Recovery / Mobility";
    } else if (soreness === 3) {
      intensityAdjustment -= 0.1;
      message = "Moderate soreness. Stick to the plan but avoid RPE 10.";
    }

    // 3. Fatigue Score from Last Log
    if (lastLog && lastLog.fatigueScore > 8) {
      intensityAdjustment -= 0.15;
      message = "High fatigue from your last session. Focus on quality over quantity today.";
    }

    // 4. Recovery Score (0-100)
    const recoveryScore = Math.max(0, Math.min(100, (sleepHours / 8) * 50 + (5 - soreness) * 10));

    return {
      intensityAdjustment: Math.max(0.5, Math.min(1.2, intensityAdjustment)),
      message,
      suggestedWorkout,
      recoveryScore: Math.round(recoveryScore)
    };
  }
}
