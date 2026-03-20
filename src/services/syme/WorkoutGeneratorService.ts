import { IUser } from '../../models/SymeSchemas';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  rest: number; // seconds
  equipment: string[];
}

export class WorkoutGeneratorService {
  /**
   * Generates a personalized workout plan based on user profile.
   * Logic:
   * 1. Filter exercises by equipment availability.
   * 2. Select volume/intensity based on experience and goal.
   * 3. Structure based on weekly schedule (e.g., PPL, Full Body).
   */
  static async generatePlan(user: IUser): Promise<any> {
    const { goal, experience, equipment, injuries } = user.profile;
    
    // 1. Define Base Volume (Sets per Muscle Group per Week)
    let weeklyVolume = 10; // Default
    if (experience === 'beginner') weeklyVolume = 8;
    if (experience === 'advanced') weeklyVolume = 15;

    // 2. Adjust Rep Ranges based on Goal
    let repRange = '8-12'; // Hypertrophy
    if (goal === 'strength') repRange = '3-5';
    if (goal === 'fat-loss') repRange = '12-15';

    // 3. Filter Exercise Library (Mock Library)
    const exerciseLibrary: Exercise[] = [
      { id: '1', name: 'Barbell Squat', muscleGroup: 'Quads', sets: 3, reps: repRange, rest: 120, equipment: ['barbell', 'rack'] },
      { id: '2', name: 'Bench Press', muscleGroup: 'Chest', sets: 3, reps: repRange, rest: 90, equipment: ['barbell', 'bench'] },
      { id: '3', name: 'Deadlift', muscleGroup: 'Back', sets: 3, reps: '5', rest: 180, equipment: ['barbell'] },
      { id: '4', name: 'Overhead Press', muscleGroup: 'Shoulders', sets: 3, reps: repRange, rest: 90, equipment: ['barbell'] },
      { id: '5', name: 'Pull Ups', muscleGroup: 'Back', sets: 3, reps: 'AMRAP', rest: 90, equipment: ['pull-up bar'] },
      { id: '6', name: 'Dumbbell Lunges', muscleGroup: 'Quads', sets: 3, reps: '10-12', rest: 60, equipment: ['dumbbells'] },
    ];

    // Filter by equipment
    const availableExercises = exerciseLibrary.filter(ex => 
      ex.equipment.every(eq => equipment.includes(eq))
    );

    // 4. Structure the Split
    // For MVP: Simple Full Body or PPL
    const split = experience === 'beginner' ? 'Full Body' : 'PPL';
    
    return {
      split,
      weeklyVolume,
      repRange,
      days: [
        {
          dayName: 'Day 1: Foundation',
          focus: 'Compound Strength',
          exercises: availableExercises.slice(0, 4)
        },
        {
          dayName: 'Day 2: Strength',
          focus: 'Power & Volume',
          exercises: availableExercises.slice(2, 6)
        }
      ]
    };
  }
}
