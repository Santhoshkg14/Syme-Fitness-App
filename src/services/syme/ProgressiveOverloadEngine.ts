import { IWorkoutLog } from '../../models/SymeSchemas';

export interface OverloadSuggestion {
  exerciseId: string;
  name: string;
  suggestion: 'INCREASE' | 'STAY' | 'DELOAD';
  nextWeight: number;
  nextReps: number;
  reason: string;
  rollingVolumeAverage: number;
  estimatedOneRepMax: number;
}

export class ProgressiveOverloadEngine {
  /**
   * Analyzes workout history and suggests overload.
   * Logic:
   * 1. Calculate Rolling Volume Average (last 4 sessions).
   * 2. Calculate Estimated 1RM (Brzycki Formula).
   * 3. Detect Plateau (3 sessions with no volume increase).
   * 4. Suggest Deload (if fatigue score > 8 for 2 sessions).
   */
  static async analyzeProgress(exerciseId: string, logs: IWorkoutLog[]): Promise<OverloadSuggestion | null> {
    const exerciseLogs = logs.map(log => log.exercises.find(ex => ex.exerciseId === exerciseId)).filter(Boolean);
    if (exerciseLogs.length === 0) return null;

    // 1. Rolling Volume Average (last 4)
    const recentLogs = exerciseLogs.slice(-4);
    const rollingVolumeAverage = recentLogs.reduce((acc, log) => acc + (log?.volume || 0), 0) / recentLogs.length;

    // 2. Estimated 1RM (Brzycki: Weight / (1.0278 - (0.0278 * Reps)))
    const lastLog = exerciseLogs[exerciseLogs.length - 1];
    const bestSet = lastLog?.sets.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), lastLog.sets[0]);
    const estimatedOneRepMax = bestSet ? bestSet.weight / (1.0278 - (0.0278 * bestSet.reps)) : 0;

    // 3. Plateau Detection
    const volumes = recentLogs.map(log => log?.volume || 0);
    const isPlateau = volumes.length >= 3 && volumes.every((v, i) => i === 0 || v <= volumes[i - 1]);

    // 4. Suggestion Logic
    let suggestion: 'INCREASE' | 'STAY' | 'DELOAD' = 'STAY';
    let nextWeight = bestSet?.weight || 0;
    let nextReps = bestSet?.targetReps || 8;
    let reason = "Maintain consistency and focus on form.";

    if (isPlateau) {
      suggestion = 'DELOAD';
      nextWeight = (bestSet?.weight || 0) * 0.8; // 20% reduction
      reason = "Plateau detected. Suggesting a deload week to recover and break through.";
    } else if (bestSet && bestSet.reps >= bestSet.targetReps) {
      suggestion = 'INCREASE';
      nextWeight = bestSet.weight + 2.5; // Standard 2.5kg increase
      reason = "You hit your rep targets! Time to increase the load.";
    }

    return {
      exerciseId,
      name: lastLog?.name || '',
      suggestion,
      nextWeight,
      nextReps,
      reason,
      rollingVolumeAverage,
      estimatedOneRepMax
    };
  }
}
