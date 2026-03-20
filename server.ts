import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { WorkoutGeneratorService } from "./src/services/syme/WorkoutGeneratorService";
import { ProgressiveOverloadEngine } from "./src/services/syme/ProgressiveOverloadEngine";
import { NutritionEngine } from "./src/services/syme/NutritionEngine";
import { TransformationPredictor } from "./src/services/syme/TransformationPredictor";
import { AdaptiveRecommender } from "./src/services/syme/AdaptiveRecommender";
import { SymeSaaS } from "./src/services/syme/SymeSaaS";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "syme-secret-key-2026";

interface AuthRequest extends express.Request {
  user?: any;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MOCK DATABASE (In-memory for MVP Demo) ---
  const db: any = {
    users: [],
    workoutLogs: [],
    foodLogs: []
  };

  // --- MIDDLEWARE: AUTH ---
  const authenticate = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = db.users.find((u: any) => u.id === decoded.id);
      if (!user) {
        return res.status(401).json({ error: "User not found in database. Please log in again." });
      }
      req.user = user; // Store the full user object for convenience
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // --- MIDDLEWARE: SUBSCRIPTION GATING ---
  const requirePremium = (feature: string) => (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const user = req.user;
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!SymeSaaS.checkFeatureAccess(user, feature)) {
      return res.status(403).json({ 
        error: "Premium feature", 
        message: "Upgrade to Syme Premium to unlock this feature." 
      });
    }
    next();
  };

  // --- API ROUTES: AUTH ---
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    
    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "User already exists. Please login instead." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      passwordHash,
      profile: {
        age: 28,
        gender: "male",
        weight: 75,
        targetWeight: 82,
        height: 178,
        activityLevel: 1.55,
        goal: "hypertrophy",
        experience: "intermediate",
        equipment: ["barbell", "dumbbells", "bench", "rack"],
        injuries: []
      },
      subscription: {
        status: "trial",
        plan: "free",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 day trial
      }
    };

    db.users.push(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET);
    res.json({ token, user: newUser });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find((u: any) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user });
  });

  app.post("/api/profile/update", authenticate, (req: AuthRequest, res: express.Response) => {
    const user = req.user;
    user.profile = { ...user.profile, ...req.body };
    res.json({ success: true, profile: user.profile });
  });

  // --- API ROUTES: WORKOUTS ---
  app.get("/api/workouts/generate", authenticate, requirePremium("personalized-workout-generation"), async (req: AuthRequest, res: express.Response) => {
    const user = req.user;
    const plan = await WorkoutGeneratorService.generatePlan(user);
    res.json(plan);
  });

  app.post("/api/workouts/log", authenticate, async (req: AuthRequest, res: express.Response) => {
    const log = { ...req.body, userId: req.user.id, date: new Date() };
    db.workoutLogs.push(log);
    res.json({ success: true, message: "Workout logged" });
  });

  app.get("/api/workouts/overload/:exerciseId", authenticate, async (req: AuthRequest, res: express.Response) => {
    const logs = db.workoutLogs.filter((l: any) => l.userId === req.user.id);
    const suggestion = await ProgressiveOverloadEngine.analyzeProgress(req.params.exerciseId, logs);
    res.json(suggestion);
  });

  app.post("/api/workouts/recommendation", authenticate, (req: AuthRequest, res: express.Response) => {
    const { sleepHours, soreness } = req.body;
    const logs = db.workoutLogs.filter((l: any) => l.userId === req.user.id);
    const lastLog = logs[logs.length - 1] || null;
    const recommendation = AdaptiveRecommender.calculateRecommendation(lastLog, sleepHours, soreness);
    res.json(recommendation);
  });

  // --- API ROUTES: NUTRITION ---
  app.get("/api/nutrition/targets", authenticate, (req: AuthRequest, res: express.Response) => {
    const user = req.user;
    const targets = NutritionEngine.calculateTargets(user);
    res.json(targets);
  });

  app.post("/api/nutrition/analyze", authenticate, requirePremium("ai-food-tracking"), async (req: AuthRequest, res: express.Response) => {
    const { foodName } = req.body; // Mocking AI Vision output
    const macros = await NutritionEngine.mapIndianFood(foodName);
    res.json(macros);
  });

  // --- API ROUTES: PREDICTIONS ---
  app.get("/api/predict-transformation", authenticate, (req: AuthRequest, res: express.Response) => {
    const user = req.user;
    const prediction = TransformationPredictor.predictTimeline(user);
    res.json(prediction);
  });

  // --- API ROUTES: SUBSCRIPTIONS ---
  app.get("/api/subscription/status", authenticate, (req: AuthRequest, res: express.Response) => {
    const user = req.user;
    const status = SymeSaaS.getSubscriptionStatus(user);
    res.json(status);
  });

  app.post("/api/subscription/webhook", async (req, res) => {
    const success = await SymeSaaS.handleWebhook(req.body);
    res.json({ success });
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Syme Production API is running" });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Syme Production Server running on http://localhost:${PORT}`);
  });
}

startServer();
