import { IUser } from '../../models/SymeSchemas';

export interface TransformationTimeline {
  weeks: number;
  bmr: number;
  tdee: number;
  dailyTargetCalories: number;
  metabolicEfficiency: number; // 1-100
  recoveryScore: number; // 1-100
  timelineDescription: string;
}

export class TransformationPredictor {
  /**
   * Predicts the transformation timeline based on user profile and adherence.
   * Logic:
   * 1. Mifflin-St Jeor Equation for BMR.
   * 2. TDEE calculation based on Activity Level.
   * 3. Adherence and Sleep Quality factors.
   * 4. Safe weight loss/gain rate (0.5kg/week).
   */
  static predictTimeline(user: IUser, adherence: number = 0.8, sleepQuality: number = 0.8): TransformationTimeline {
    const { weight, targetWeight, height, age, gender, activityLevel } = user.profile;

    // 1. BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    // 2. TDEE
    const tdee = bmr * activityLevel;

    // 3. Adherence and Sleep Quality factors
    // Sleep is critical for fat loss/muscle gain
    const sleepFactor = 0.5 + (sleepQuality * 0.5); // 0.5 to 1.0 multiplier
    const baseWeeklyRate = 0.5; // Standard safe rate: 0.5kg per week
    const adjustedWeeklyRate = baseWeeklyRate * adherence * sleepFactor;

    // 4. Weight Difference
    const weightDiff = Math.abs(weight - targetWeight);
    const weeksToGoal = weightDiff / Math.max(adjustedWeeklyRate, 0.1); // Prevent division by zero

    // 5. Timeline Description
    let timelineDescription = "";
    if (targetWeight < weight) {
      timelineDescription = `Based on your current stats and an 80% adherence rate, you're on track to reach your goal weight in ${Math.ceil(weeksToGoal)} weeks. Focus on a 500 calorie deficit and prioritize 7-8 hours of sleep to optimize fat oxidation.`;
    } else {
      timelineDescription = `Reaching your target weight of ${targetWeight}kg with quality muscle mass will take approximately ${Math.ceil(weeksToGoal)} weeks. A slight calorie surplus of 300-500 kcal combined with progressive overload is key.`;
    }

    return {
      weeks: Math.ceil(weeksToGoal),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyTargetCalories: targetWeight < weight ? Math.round(tdee - 500) : Math.round(tdee + 500),
      metabolicEfficiency: Math.round(adherence * 100),
      recoveryScore: Math.round(sleepQuality * 100),
      timelineDescription
    };
  }
}
