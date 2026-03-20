import React, { useState, useEffect, useRef } from "react";
import { 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  Camera, 
  ChevronRight, 
  ChevronDown,
  Plus, 
  CheckCircle2,
  User,
  Zap,
  Flame,
  Target,
  Calendar,
  ArrowUpRight,
  Info,
  LogOut,
  Trophy,
  Users,
  History,
  Activity,
  Award,
  Clock,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  Cell
} from "recharts";
import { generateWorkoutPlan, analyzeFoodImage, getAITransformationInsights } from "./services/ai";

// --- Mock Data for Charts ---
const weightTrendData = [
  { date: "Mar 13", weight: 82.4 },
  { date: "Mar 14", weight: 82.1 },
  { date: "Mar 15", weight: 82.3 },
  { date: "Mar 16", weight: 81.9 },
  { date: "Mar 17", weight: 81.7 },
  { date: "Mar 18", weight: 81.8 },
  { date: "Mar 19", weight: 81.5 },
];

const calorieBalanceData = [
  { day: "Mon", intake: 2400, burned: 2100 },
  { day: "Tue", intake: 2200, burned: 2500 },
  { day: "Wed", intake: 2600, burned: 2200 },
  { day: "Thu", intake: 2100, burned: 2400 },
  { day: "Fri", intake: 2300, burned: 2300 },
  { day: "Sat", intake: 2800, burned: 2000 },
  { day: "Sun", intake: 2200, burned: 1900 },
];

const consistencyData = [
  { week: "Week 1", sessions: 4 },
  { week: "Week 2", sessions: 5 },
  { week: "Week 3", sessions: 3 },
  { week: "Week 4", sessions: 5 },
];

const workoutHistory = [
  { id: 1, date: "Today", name: "Heavy Pull Session", duration: "65 min", calories: 420, focus: "Back & Biceps" },
  { id: 2, date: "Yesterday", name: "Leg Day Architect", duration: "75 min", calories: 580, focus: "Quads & Glutes" },
  { id: 3, date: "Mar 18", name: "Push Foundation", duration: "60 min", calories: 380, focus: "Chest & Shoulders" },
];

const achievements = [
  { id: 1, name: "Early Bird", icon: <Clock size={16} />, description: "5 workouts before 7 AM", color: "text-amber-400" },
  { id: 2, name: "Iron Architect", icon: <Dumbbell size={16} />, description: "1000kg total volume in one session", color: "text-emerald-400" },
  { id: 3, name: "Consistency King", icon: <Calendar size={16} />, description: "30 day workout streak", color: "text-blue-400" },
];

const communityFeed = [
  { id: 1, user: "Arjun K.", action: "completed", target: "Leg Day Architect", time: "2h ago", likes: 24 },
  { id: 2, user: "Priya S.", action: "hit a PR", target: "80kg Squat", time: "4h ago", likes: 42 },
  { id: 3, user: "Rahul M.", action: "shared", target: "Transformation Progress", time: "6h ago", likes: 18 },
];

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Types ---
interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  overload?: any;
}

interface WorkoutDay {
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// --- Components ---
const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-emerald-500 scale-110' : 'text-white/30 hover:text-white/60'}`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, subValue, progress, color }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-white/20 transition-all">
    <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-black">
      <div className={`${color} opacity-80`}>{icon}</div>
      {label}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black tracking-tighter">{value}</span>
      <span className="text-white/20 text-xs font-bold">{subValue}</span>
    </div>
    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className={`${color.replace('text-', 'bg-')} h-full shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
      />
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("syme_token"));
  const [isRegistering, setIsRegistering] = useState(true);
  const [authError, setAuthError] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>({
    name: "",
    age: 28,
    weight: 75,
    height: 178,
    targetWeight: 82,
    gender: "male",
    activityLevel: 1.55,
    goal: "hypertrophy",
    experience: "intermediate",
    equipment: ["barbell", "dumbbells", "bench", "rack"],
    injuries: []
  });
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState<FoodItem[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchSubscriptionStatus();
      handlePredictTransformation(userProfile);
    }
  }, [isLoggedIn]);

  const fetchSubscriptionStatus = async () => {
    const token = localStorage.getItem("syme_token");
    if (!token) return;
    try {
      const response = await fetch("/api/subscription/status", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to fetch subscription status", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const body = isRegistering 
      ? { name: userProfile.name, email: `${userProfile.name.toLowerCase().replace(/\s/g, "")}@example.com`, password: "password123" }
      : { email: `${userProfile.name.toLowerCase().replace(/\s/g, "")}@example.com`, password: "password123" };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Authentication failed" }));
        throw new Error(errorData.error || "Authentication failed");
      }
      const data = await response.json();
      localStorage.setItem("syme_token", data.token);
      setUserProfile((prev: any) => ({ ...prev, ...(data.user.profile || {}), name: data.user.name }));
      setIsLoggedIn(true);
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("syme_token");
    setIsLoggedIn(false);
    setWorkoutPlan(null);
    setFoodAnalysis(null);
    setPrediction(null);
    setAiInsights(null);
    setUserProfile({
      name: "",
      age: 28,
      weight: 75,
      height: 178,
      targetWeight: 82,
      gender: "male",
      activityLevel: 1.55,
      goal: "hypertrophy",
      experience: "intermediate",
      equipment: ["barbell", "dumbbells", "bench", "rack"],
      injuries: []
    });
  };

  const handleUpdateProfile = async (profile: any) => {
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("syme_token")}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(profile)
      });
      if (!response.ok) throw new Error("Failed to update profile");
      handlePredictTransformation(profile);
      setSuccessMessage("Profile synchronized with AI Architect.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError("Failed to sync profile. Please try again.");
    }
  };

  const calculateSuggestedCalories = (profile: any) => {
    const { weight, height, age, gender, activityLevel, targetWeight } = profile;
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === "male" ? bmr + 5 : bmr - 161;
    const tdee = bmr * activityLevel;
    return targetWeight < weight ? Math.round(tdee - 500) : Math.round(tdee + 500);
  };

  const handlePredictTransformation = async (profile: any) => {
    setIsPredicting(true);
    const stats = {
      currentWeight: profile.weight,
      targetWeight: profile.targetWeight,
      gender: "male",
      age: 28,
      height: 178,
      activityLevel: 1.55,
      adherence: 0.85,
      restingHeartRate: 62, // Granular data point
      sleepQuality: 0.78 // Granular data point
    };

    try {
      const res = await fetch("/api/predict-transformation", {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("syme_token")}`,
          "Content-Type": "application/json" 
        }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPrediction(data);

      const insights = await getAITransformationInsights(profile);
      setAiInsights(insights);
      setError(null);
    } catch (err: any) {
      console.error("Prediction failed:", err);
      setError(err.message || "AI Prediction failed.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const plan = await generateWorkoutPlan(userProfile);
      setWorkoutPlan(plan);
    } catch (err: any) {
      console.error("Failed to generate plan:", err);
      if (err.message.includes("401") || err.message.toLowerCase().includes("log in again")) {
        handleLogout();
      }
      setError(err.message || "Failed to generate workout plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const analysis = await analyzeFoodImage(base64);
        setFoodAnalysis(analysis);
      } catch (err: any) {
        console.error("Analysis failed:", err);
        setError("Food analysis failed. AI service is busy.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-lg relative z-10"
        >
          <div className="space-y-2">
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-7xl font-black tracking-tighter text-emerald-500"
            >
              SYME
            </motion.h1>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40 font-bold">Architect of Your Ambition</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-tight">Precision Fitness.<br/><span className="text-white/40 italic">AI Driven.</span></h2>
            <p className="text-sm text-white/40 leading-relaxed">
              Experience the next evolution of personal training. Tailored workouts, intelligent nutrition, and predictive transformation analytics.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 pt-8">
            <div className="relative group">
              <input 
                type="text" 
                placeholder={isRegistering ? "Full Name" : "Enter Your Name"}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-medium focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/10"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <Zap size={20} className="text-emerald-500" />
              </div>
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            
            <button 
              type="submit"
              className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isRegistering ? "BEGIN TRANSFORMATION" : "LOGIN TO SYME"}
            </button>

            <p className="text-white/40 text-sm">
              {isRegistering ? "Already have an account?" : "New to Syme?"}{" "}
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-emerald-500 font-bold hover:underline"
              >
                {isRegistering ? "Login" : "Register"}
              </button>
            </p>
          </form>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-xs font-bold uppercase tracking-widest"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        <footer className="absolute bottom-12 text-[10px] text-white/20 uppercase tracking-widest font-bold">
          Powered by Gemini 3.1 Pro
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 pb-32">
      {/* Header */}
      <header className="px-6 py-8 flex justify-between items-center bg-black/40 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Zap size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">SYME</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-500 font-black">Architect Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-black">Current Streak</p>
            <p className="text-sm font-black text-orange-500 flex items-center justify-end gap-1">
              <Flame size={14} /> 12 Days
            </p>
          </div>
          <button 
            onClick={() => setActiveTab("profile")}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <User size={20} className="text-white/60" />
          </button>
        </div>
      </header>

      <main className="px-6 pt-8 max-w-2xl mx-auto space-y-10">
        <AnimatePresence mode="wait">
          {successMessage && (
            <motion.div 
              key="success-msg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              {successMessage}
            </motion.div>
          )}
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="space-y-2">
                <h2 className="text-5xl font-black tracking-tighter leading-none">Status Report.</h2>
                <p className="text-sm text-white/40 font-medium italic">Optimization in progress for {userProfile.name}.</p>
              </div>

              {/* Core Stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  icon={<Flame size={14} />}
                  label="Calorie Intake"
                  value="1,850"
                  subValue="/ 2,400"
                  progress={77}
                  color="text-orange-500"
                />
                <StatCard 
                  icon={<Zap size={14} />}
                  label="Workout Volume"
                  value="4,250"
                  subValue="kg"
                  progress={85}
                  color="text-emerald-500"
                />
                <StatCard 
                  icon={<Activity size={14} />}
                  label="Daily Steps"
                  value="8,420"
                  subValue="/ 10,000"
                  progress={84}
                  color="text-blue-500"
                />
                <StatCard 
                  icon={<Utensils size={14} />}
                  label="Water Intake"
                  value="2.4"
                  subValue="L / 3.5L"
                  progress={68}
                  color="text-cyan-500"
                />
              </div>

              {/* AI Daily Tip */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap size={80} className="text-emerald-500" />
                </div>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Info size={14} />
                    Architect's Daily Insight
                  </div>
                  <p className="text-sm font-medium leading-relaxed">
                    "Increasing your protein intake to 2.2g per kg of body weight during this hypertrophy phase will significantly accelerate muscle protein synthesis. Aim for 30g of leucine-rich protein in your post-workout meal."
                  </p>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <button className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Log Water</span>
                </button>
                <button className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Log Weight</span>
                </button>
                <button className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <Utensils size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Log Meal</span>
                </button>
              </div>

              {/* Macro Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">Macro Distribution</h3>
                  <Activity size={16} className="text-emerald-500" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/40 uppercase">Protein</p>
                    <p className="text-xl font-black">142g</p>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[80%]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/40 uppercase">Carbs</p>
                    <p className="text-xl font-black">210g</p>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[65%]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/40 uppercase">Fats</p>
                    <p className="text-xl font-black">58g</p>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[50%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-emerald-500" size={18} />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">Weight Projection</h3>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">-0.9kg Week</span>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightTrendData}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Achievements Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">Achievements</h3>
                  <Award size={16} className="text-amber-500" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {achievements.map((ach) => (
                    <div key={ach.id} className="min-w-[140px] bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                      <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${ach.color}`}>
                        {ach.icon}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-tighter">{ach.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* History Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black">Recent Logs</h3>
                  <History size={16} className="text-blue-500" />
                </div>
                <div className="space-y-3">
                  {workoutHistory.map((log) => (
                    <div key={log.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                          <Dumbbell size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black">{log.name}</p>
                          <p className="text-[10px] text-white/40 font-bold uppercase">{log.date} • {log.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-500">+{log.calories}</p>
                        <p className="text-[9px] text-white/20 font-black uppercase">kcal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "workout" && (
            <motion.div 
              key="workout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter leading-none">Blueprint.</h2>
                <p className="text-sm text-white/40 font-medium italic">AI-generated training protocols.</p>
              </div>

              {!workoutPlan && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-10 text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                    <Zap size={40} className="text-black" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black">No Active Protocol</h3>
                    <p className="text-sm text-white/40">Let the AI architect your next 12 weeks of transformation.</p>
                  </div>
                  <button 
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? "ARCHITECTING..." : "GENERATE PROTOCOL"}
                  </button>
                </div>
              )}

              {workoutPlan && (
                <div className="space-y-6">
                  {workoutPlan?.days?.map((day: WorkoutDay, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-black tracking-tight">{day.dayName}</h3>
                          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">{day.focus}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={20} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        {day.exercises.map((ex, eIdx) => (
                          <div key={eIdx} className="group py-4 border-t border-white/5 first:border-0 flex justify-between items-center">
                            <div className="space-y-1">
                              <p className="text-sm font-black group-hover:text-emerald-500 transition-colors">{ex.name}</p>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">{ex.sets} SETS • {ex.reps} REPS</p>
                            </div>
                            <div className="bg-white/5 px-3 py-1.5 rounded-xl text-[10px] font-black text-white/60 tracking-widest">
                              {ex.rest}s REST
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "community" && (
            <motion.div 
              key="community"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter leading-none">Collective.</h2>
                <p className="text-sm text-white/40 font-medium italic">Connect with fellow architects.</p>
              </div>

              <div className="space-y-4">
                {communityFeed.map((post) => (
                  <div key={post.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 font-black">
                          {post.user[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black">{post.user}</p>
                          <p className="text-[10px] text-white/40 font-bold uppercase">{post.time}</p>
                        </div>
                      </div>
                      <button className="text-white/20 hover:text-red-500 transition-colors">
                        <Heart size={18} />
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed">
                      <span className="text-emerald-500 font-bold">{post.action}</span> {post.target}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-white/20 font-black uppercase">
                      <Users size={12} /> {post.likes} architects cheered
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter leading-none">Identity.</h2>
                <p className="text-sm text-white/40 font-medium italic">Configure your biological parameters.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">Current Mass (kg)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black focus:outline-none focus:border-emerald-500 transition-all"
                      value={userProfile.weight ?? ""}
                      onChange={(e) => setUserProfile({ ...userProfile, weight: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">Target Mass (kg)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black focus:outline-none focus:border-emerald-500 transition-all"
                      value={userProfile.targetWeight ?? ""}
                      onChange={(e) => setUserProfile({ ...userProfile, targetWeight: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">Activity Coefficient</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-6 py-4 text-sm font-black focus:outline-none focus:border-emerald-500 appearance-none uppercase tracking-widest text-white cursor-pointer"
                      value={userProfile.activityLevel}
                      onChange={(e) => setUserProfile({ ...userProfile, activityLevel: Number(e.target.value) })}
                    >
                      <option value={1.2} className="bg-[#1A1A1A] text-white">Sedentary</option>
                      <option value={1.375} className="bg-[#1A1A1A] text-white">Lightly Active</option>
                      <option value={1.55} className="bg-[#1A1A1A] text-white">Moderately Active</option>
                      <option value={1.725} className="bg-[#1A1A1A] text-white">Very Active</option>
                      <option value={1.9} className="bg-[#1A1A1A] text-white">Elite Athlete</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-black">Daily Energy Target</p>
                    <p className="text-4xl font-black tracking-tighter">{calculateSuggestedCalories(userProfile)} <span className="text-sm text-emerald-500/40">KCAL</span></p>
                  </div>
                  <div className="bg-emerald-500 p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <Flame size={32} className="text-black" />
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => handleUpdateProfile(userProfile)}
                    className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Sync Profile with AI
                  </button>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${subscriptionStatus?.plan === 'premium' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'}`}>
                        <Zap size={24} />
                      </div>
                      <div>
                        <p className="font-black uppercase tracking-widest text-sm">Syme {subscriptionStatus?.plan === 'premium' ? 'Premium' : 'Free'}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">{subscriptionStatus?.message}</p>
                      </div>
                    </div>
                    {subscriptionStatus?.plan === 'free' && (
                      <button 
                        onClick={() => window.open('https://razorpay.com/payment-link', '_blank')}
                        className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all"
                  >
                    Terminate Session
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "food" && (
            <motion.div 
              key="food"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter leading-none">Nutrition.</h2>
                <p className="text-sm text-white/40 font-medium italic">AI Vision-based nutrient analysis.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center space-y-8">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={40} className="text-white/20 group-hover:text-emerald-500 transition-colors" />
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 group-hover:border-emerald-500/50 animate-[spin_10s_linear_infinite]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black">Scan Your Meal</h3>
                  <p className="text-sm text-white/40">Snap a photo for instant macro decomposition.</p>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all"
                >
                  OPEN CAMERA
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              {isAnalyzing && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[2.5rem] text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-emerald-500 font-black uppercase tracking-widest animate-pulse">Decomposing Nutrients...</p>
                </div>
              )}

              {foodAnalysis && Array.isArray(foodAnalysis) && (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Analysis Result</h3>
                    <div className="space-y-6">
                      {foodAnalysis.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                          <div className="space-y-1">
                            <p className="text-lg font-black group-hover:text-emerald-500 transition-colors">{item.name}</p>
                            <p className="text-[10px] text-white/40 font-bold uppercase">{item.portion}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-emerald-500">{item.calories} <span className="text-[10px] text-white/20">KCAL</span></p>
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-tighter">P: {item.protein}g • C: {item.carbs}g • F: {item.fats}g</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all">
                      LOG TO ARCHIVE
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-8 left-6 right-6 h-24 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] flex items-center justify-around px-6 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <NavButton 
          active={activeTab === "dashboard"} 
          onClick={() => setActiveTab("dashboard")}
          icon={<Activity size={24} />}
          label="Stats"
        />
        <NavButton 
          active={activeTab === "workout"} 
          onClick={() => setActiveTab("workout")}
          icon={<Dumbbell size={24} />}
          label="Lift"
        />
        <div className="relative -top-12">
          <button 
            onClick={() => setActiveTab("food")}
            className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all duration-500 ${activeTab === 'food' ? 'bg-white text-black rotate-45 scale-110' : 'bg-emerald-500 text-black hover:scale-105'}`}
          >
            <Plus size={36} />
          </button>
        </div>
        <NavButton 
          active={activeTab === "community"} 
          onClick={() => setActiveTab("community")}
          icon={<Users size={24} />}
          label="Social"
        />
        <NavButton 
          active={activeTab === "profile"} 
          onClick={() => setActiveTab("profile")}
          icon={<User size={24} />}
          label="Self"
        />
      </nav>
    </div>
  );
}
