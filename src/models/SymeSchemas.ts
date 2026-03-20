import mongoose, { Schema, Document } from 'mongoose';

// --- USER SCHEMA ---
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  profile: {
    age: number;
    gender: 'male' | 'female' | 'other';
    weight: number;
    targetWeight: number;
    height: number;
    activityLevel: number; // 1.2 - 1.9
    goal: 'fat-loss' | 'hypertrophy' | 'strength';
    experience: 'beginner' | 'intermediate' | 'advanced';
    equipment: string[];
    injuries: string[];
  };
  subscription: {
    status: 'active' | 'inactive' | 'trial';
    plan: 'free' | 'premium';
    razorpayId?: string;
    expiresAt: Date;
  };
  streak: {
    current: number;
    longest: number;
    lastActive: Date;
  };
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profile: {
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    weight: Number,
    targetWeight: Number,
    height: Number,
    activityLevel: Number,
    goal: { type: String, enum: ['fat-loss', 'hypertrophy', 'strength'] },
    experience: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    equipment: [String],
    injuries: [String]
  },
  subscription: {
    status: { type: String, default: 'trial' },
    plan: { type: String, default: 'free' },
    razorpayId: String,
    expiresAt: Date
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActive: Date
  }
}, { timestamps: true });

UserSchema.index({ email: 1 });

// --- WORKOUT LOG SCHEMA ---
export interface IWorkoutLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  exercises: {
    exerciseId: string;
    name: string;
    sets: {
      weight: number;
      reps: number;
      rpe?: number;
      targetReps: number;
    }[];
    volume: number;
    intensity: number; // Average RPE or % of 1RM
  }[];
  fatigueScore: number; // 1-10
  sleepHours: number;
  soreness: number; // 1-5
}

const WorkoutLogSchema = new Schema<IWorkoutLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  exercises: [{
    exerciseId: String,
    name: String,
    sets: [{
      weight: Number,
      reps: Number,
      rpe: Number,
      targetReps: Number
    }],
    volume: Number,
    intensity: Number
  }],
  fatigueScore: Number,
  sleepHours: Number,
  soreness: Number
}, { timestamps: true });

WorkoutLogSchema.index({ userId: 1, date: -1 });

// --- FOOD LOG SCHEMA ---
export interface IFoodLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUrl?: string;
  items: {
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    confidence: number;
  }[];
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  isAIGenerated: boolean;
}

const FoodLogSchema = new Schema<IFoodLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  mealType: String,
  imageUrl: String,
  items: [{
    name: String,
    portion: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    confidence: Number
  }],
  totalMacros: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  },
  isAIGenerated: { type: Boolean, default: false }
}, { timestamps: true });

FoodLogSchema.index({ userId: 1, date: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
export const WorkoutLog = mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
export const FoodLog = mongoose.model<IFoodLog>('FoodLog', FoodLogSchema);
