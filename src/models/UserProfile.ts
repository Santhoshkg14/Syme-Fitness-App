import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  age: number;
  weight: number;
  height: number;
  targetWeight: number;
  gender: string;
  activityLevel: number;
  goal: string;
  experience: string;
  equipment: string[];
  injuries: string[];
  subscriptionTier: string;
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      min: 15,
      max: 100,
      required: true,
    },
    weight: {
      type: Number,
      min: 30,
      max: 250,
      required: true,
    },
    height: {
      type: Number,
      min: 120,
      max: 250,
      required: true,
    },
    targetWeight: {
      type: Number,
      min: 30,
      max: 250,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    activityLevel: {
      type: Number,
      default: 1.55,
    },
    goal: {
      type: String,
      enum: ['hypertrophy', 'strength', 'weight_loss', 'maintenance', 'athletic_performance'],
      required: true,
    },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'elite'],
      default: 'intermediate',
    },
    equipment: {
      type: [String],
      default: ['barbell', 'dumbbells', 'bench'],
    },
    injuries: {
      type: [String],
      default: [],
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'premium', 'elite'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
);

export const UserProfile = mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', userProfileSchema);
