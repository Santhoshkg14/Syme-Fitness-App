import { IUser } from '../../models/SymeSchemas';

export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export class NutritionEngine {
  /**
   * Calculates daily macro targets based on user profile.
   * Logic:
   * 1. Mifflin-St Jeor Equation for BMR.
   * 2. TDEE calculation based on Activity Level.
   * 3. Goal-based adjustment (Fat Loss: -500, Hypertrophy: +300).
   * 4. Macro split (Protein: 1.8g/kg, Fats: 25% of calories, Carbs: Remainder).
   */
  static calculateTargets(user: IUser): MacroTarget {
    const { weight, height, age, gender, activityLevel, goal } = user.profile;

    // 1. BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    // 2. TDEE
    const tdee = bmr * activityLevel;

    // 3. Goal Adjustment
    let targetCalories = tdee;
    if (goal === 'fat-loss') targetCalories -= 500;
    if (goal === 'hypertrophy') targetCalories += 300;

    // 4. Macro Split
    const protein = weight * 1.8; // 1.8g per kg
    const proteinCalories = protein * 4;
    const fatsCalories = targetCalories * 0.25; // 25% of total
    const fats = fatsCalories / 9;
    const carbsCalories = targetCalories - proteinCalories - fatsCalories;
    const carbs = carbsCalories / 4;

    return {
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats)
    };
  }

  /**
   * Maps AI Vision output to Indian Food Database.
   * Mock logic for MVP.
   */
  static async mapIndianFood(aiOutput: string): Promise<any> {
    const indianFoodDB: any = {
      'paneer tikka': { calories: 250, protein: 15, carbs: 5, fats: 18 },
      'dal tadka': { calories: 180, protein: 8, carbs: 25, fats: 6 },
      'roti': { calories: 80, protein: 3, carbs: 15, fats: 1 },
      'chicken biryani': { calories: 450, protein: 25, carbs: 55, fats: 15 },
    };

    const normalized = aiOutput.toLowerCase();
    return indianFoodDB[normalized] || { calories: 200, protein: 10, carbs: 20, fats: 10 };
  }
}
