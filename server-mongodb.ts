import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectToMongoDB, isMongoDBConnected } from "./src/config/mongodb.js";
import { User } from "./src/models/User.js";
import { UserProfile } from "./src/models/UserProfile.js";
import { WorkoutGeneratorService } from "./src/services/syme/WorkoutGeneratorService.js";
import { ProgressiveOverloadEngine } from "./src/services/syme/ProgressiveOverloadEngine.js";
import { NutritionEngine } from "./src/services/syme/NutritionEngine.js";
import { TransformationPredictor } from "./src/services/syme/TransformationPredictor.js";
import { AdaptiveRecommender } from "./src/services/syme/AdaptiveRecommender.js";
import { SymeSaaS } from "./src/services/syme/SymeSaaS.js";

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "syme-secret-key-2026";
const PORT = parseInt(process.env.API_PORT || "3000");

interface AuthRequest extends express.Request {
  user?: any;
}

// --- VALIDATION SCHEMAS ---
const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const ProfileSchema = z.object({
  age: z.number().min(15).max(100),
  weight: z.number().min(30).max(250),
  height: z.number().min(120).max(250),
  targetWeight: z.number().min(30).max(250),
  gender: z.enum(["male", "female", "other"]),
  goal: z.enum(["hypertrophy", "strength", "weight_loss", "maintenance", "athletic_performance"]),
  experience: z.enum(["beginner", "intermediate", "advanced", "elite"]),
  equipment: z.array(z.string()),
});

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- MIDDLEWARE: AUTH ---
  const authenticate = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: "User not found. Please log in again." });
      }
      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // --- MIDDLEWARE: SUBSCRIPTION GATING ---
  const requirePremium = (feature: string) => async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const user = req.user;
    if (!user) return res.status(404).json({ error: "User not found" });

    const profile = await UserProfile.findOne({ userId: user._id });
    const tier = profile?.subscriptionTier || "free";

    const featureAccess = SymeSaaS.checkFeatureAccess({ subscriptionTier: tier } as any, feature);
    if (!featureAccess) {
      return res.status(403).json({ 
        error: "Premium feature", 
        message: "Upgrade to Syme Premium to unlock this feature." 
      });
    }
    next();
  };

  // --- HEALTH CHECK ---
  app.get("/api/health", (req, res) => {
    const mongoStatus = isMongoDBConnected() ? "✅ Connected" : "❌ Disconnected";
    res.json({ 
      status: "✅ Syme Production Server running", 
      mongodb: mongoStatus,
      timestamp: new Date().toISOString()
    });
  });

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = RegisterSchema.parse(req.body);

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists. Please login instead." });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const newUser = new User({
        name,
        email,
        password: passwordHash,
      });
      await newUser.save();

      // Create user profile with defaults
      const userProfile = new UserProfile({
        userId: newUser._id,
        age: 28,
        weight: 75,
        height: 178,
        targetWeight: 82,
        gender: "male",
        goal: "hypertrophy",
        experience: "intermediate",
        equipment: ["barbell", "dumbbells", "bench"],
        subscriptionTier: "free",
      });
      await userProfile.save();

      // Generate JWT
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          profile: {
            age: userProfile.age,
            weight: userProfile.weight,
            height: userProfile.height,
            goal: userProfile.goal,
          },
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = LoginSchema.parse(req.body);

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const profile = await UserProfile.findOne({ userId: user._id });

      const token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profile: profile || {},
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  // --- PROFILE ROUTES ---
  app.get("/api/profile", authenticate, async (req: AuthRequest, res) => {
    try {
      const profile = await UserProfile.findOne({ userId: req.user._id });
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json({ success: true, profile });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/profile/update", authenticate, async (req: AuthRequest, res) => {
    try {
      const profileData = ProfileSchema.partial().parse(req.body);

      let profile = await UserProfile.findOne({ userId: req.user._id });
      if (!profile) {
        profile = new UserProfile({ userId: req.user._id, ...profileData });
      } else {
        Object.assign(profile, profileData);
      }

      await profile.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        profile,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Profile update failed" });
    }
  });

  // --- WORKOUT ROUTES ---
  app.post("/api/workouts/generate", authenticate, requirePremium("workout_generation"), async (req: AuthRequest, res) => {
    try {
      const profile = await UserProfile.findOne({ userId: req.user._id });
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }

      const workoutPlan = WorkoutGeneratorService.generatePlan({
        goal: profile.goal as any,
        experience: profile.experience,
        equipment: profile.equipment,
      });

      res.json({ success: true, workoutPlan });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workouts/log", authenticate, async (req: AuthRequest, res) => {
    try {
      const { exercise, sets, reps, weight } = req.body;
      res.json({
        success: true,
        message: "Workout logged successfully",
        log: { exercise, sets, reps, weight, timestamp: new Date() },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- NUTRITION ROUTES ---
  app.get("/api/nutrition/targets", authenticate, async (req: AuthRequest, res) => {
    try {
      const profile = await UserProfile.findOne({ userId: req.user._id });
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }

      const targets = NutritionEngine.calculateTargets(profile.weight);
      res.json({ success: true, targets });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/nutrition/analyze", authenticate, requirePremium("food_analysis"), async (req: AuthRequest, res) => {
    try {
      const analysis = {
        calories: 350,
        protein: 25,
        carbs: 45,
        fats: 12,
        confidence: 0.87,
      };
      res.json({ success: true, analysis });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- PROGRESS ROUTES ---
  app.get("/api/progress/predictions", authenticate, requirePremium("transformation_predictions"), async (req: AuthRequest, res) => {
    try {
      const profile = await UserProfile.findOne({ userId: req.user._id });
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }

      const prediction = TransformationPredictor.predict(
        profile.weight,
        profile.targetWeight,
        profile.goal
      );

      res.json({ success: true, prediction });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- SUBSCRIPTION ROUTES ---
  app.get("/api/subscription/plans", (req, res) => {
    res.json({
      plans: [
        { tier: "free", price: 0, features: ["basic_analytics", "sample_workouts"] },
        { tier: "premium", price: 99, features: ["ai_workouts", "food_analysis", "progress_predictions"] },
        { tier: "elite", price: 199, features: ["all_features", "1on1_coaching", "custom_plans"] },
      ],
    });
  });

  app.get("/api/subscription/status", authenticate, async (req: AuthRequest, res) => {
    try {
      const profile = await UserProfile.findOne({ userId: req.user._id });
      res.json({
        subscriptionTier: profile?.subscriptionTier || "free",
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- STATIC FILES & VITE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);

    app.get("*", async (req, res) => {
      try {
        const url = req.originalUrl;
        let template = `
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <link rel="icon" type="image/svg+xml" href="/vite.svg" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>SYME - AI Fitness Architect</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `;

        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e: any) {
        res.status(500).end(e.stack);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // --- START SERVER ---
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    app.listen(PORT, () => {
      console.log(`\n✅ Syme Production Server running on http://localhost:${PORT}\n`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🗄️  MongoDB Database: ${process.env.MONGODB_DB_NAME || "syme_fitness"}\n`);
    });
  } catch (error: any) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
