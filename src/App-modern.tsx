import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Zap, Flame, Dumbbell, Camera, TrendingUp, LogOut,
  Menu, X, Moon, Sun, Heart, Trophy, Users, BarChart3, Settings,
  ChevronRight, ArrowUpRight, Check, AlertCircle
} from 'lucide-react';

type Theme = 'light' | 'dark';
type Page = 'landing' | 'auth' | 'dashboard' | 'workout' | 'nutrition' | 'progress' | 'profile';
type AuthMode = 'login' | 'register';

interface UserProfile {
  name: string;
  email: string;
  weight: number;
  height: number;
  targetWeight: number;
  goal: string;
  experience: string;
  age: number;
}

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [page, setPage] = useState<Page>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('syme_token'));
  const [token, setToken] = useState(localStorage.getItem('syme_token') || '');
  const [profile, setProfile] = useState<UserProfile>({
    name: 'User',
    email: '',
    weight: 75,
    height: 178,
    targetWeight: 80,
    goal: 'muscle_gain',
    experience: 'intermediate',
    age: 28,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const showMsg = (msg: string, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  };

  const fetchFromAPI = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');
      return data;
    } catch (err: any) {
      showMsg(`Error: ${err.message}`);
      throw err;
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string || 'User';

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = authMode === 'login' ? { email, password } : { name, email, password };
      const result = await fetchFromAPI(endpoint, { method: 'POST', body: JSON.stringify(payload) });

      setToken(result.token);
      localStorage.setItem('syme_token', result.token);
      setProfile({ ...profile, name: result.user?.name || 'User', email: result.user?.email });
      setIsLoggedIn(true);
      setPage('dashboard');
      showMsg('Authentication successful!');
    } catch (err) {
      showMsg('Auth failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('syme_token');
    setIsLoggedIn(false);
    setPage('landing');
    showMsg('Logged out');
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      await fetchFromAPI('/api/profile/update', {
        method: 'POST',
        body: JSON.stringify({ weight: profile.weight, goal: profile.goal }),
      });
      showMsg('Profile updated!');
    } catch {
      showMsg('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const generateWorkout = async () => {
    setLoading(true);
    try {
      const result = await fetchFromAPI('/api/workouts/generate', {
        method: 'POST',
        body: JSON.stringify(profile),
      });
      setWorkoutPlan(result.plan);
      showMsg('Workout generated!');
    } catch {
      showMsg('Workout generation failed');
    } finally {
      setLoading(false);
    }
  };

  const logWorkout = async () => {
    if (!workoutPlan) return;
    setLoading(true);
    try {
      const result = await fetchFromAPI('/api/workouts/log', {
        method: 'POST',
        body: JSON.stringify({ exercises: workoutPlan.exercises || [] }),
      });
      setWorkoutLogs((prev) => [result.log, ...prev]);
      showMsg('Workout logged!');
    } catch {
      showMsg('Workout log failed');
    } finally {
      setLoading(false);
    }
  };

  const predictTransformation = async () => {
    setLoading(true);
    try {
      const result = await fetchFromAPI('/api/progress/predictions');
      showMsg(`Prediction: ${result.prediction?.weeksToGoal} weeks to goal`);
    } catch {
      showMsg('Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFood = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      setLoading(true);
      try {
        const result = await fetchFromAPI('/api/nutrition/analyze', {
          method: 'POST',
          body: JSON.stringify({ imageUrl: reader.result }),
        });
        showMsg(`Scan complete: ${result.analysis?.items?.length || 0} items detected`);
      } catch {
        showMsg('Food analysis failed');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const bgClass = theme === 'dark' 
    ? 'bg-[#0a0e27] text-white' 
    : 'bg-white text-gray-900';
  
  const cardClass = theme === 'dark'
    ? 'bg-[#1a1f3a] border-[#2d3a5c]'
    : 'bg-gray-50 border-gray-200';
  
  const accentClass = 'from-blue-600 to-purple-600';

  // Landing Page
  if (page === 'landing' && !isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgClass} flex flex-col`}>
        {/* Nav */}
        <nav className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-gray-800">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">SYME</h1>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-gray-800">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-4">AI Fitness Architect</h2>
          <p className="text-gray-400 max-w-2xl mb-8 text-lg">Generate personalized workouts, analyze nutrition via AI, and predict body transformations with precision.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl my-12">
            <div className={`p-6 rounded-2xl border ${cardClass}`}>
              <Dumbbell className="w-10 h-10 mb-3 text-blue-500" />
              <h3 className="font-bold mb-2">AI Workouts</h3>
              <p className="text-sm text-gray-500">Personalized training plans based on your profile</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardClass}`}>
              <Camera className="w-10 h-10 mb-3 text-purple-500" />
              <h3 className="font-bold mb-2">Food Analysis</h3>
              <p className="text-sm text-gray-500">Scan meals for instant macro breakdown</p>
            </div>
            <div className={`p-6 rounded-2xl border ${cardClass}`}>
              <TrendingUp className="w-10 h-10 mb-3 text-pink-500" />
              <h3 className="font-bold mb-2">Predictions</h3>
              <p className="text-sm text-gray-500">Timeline to your fitness goal with ML</p>
            </div>
          </div>

          <button onClick={() => setPage('auth')} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition">
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Auth Page
  if (page === 'auth' && !isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center px-6`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border ${cardClass}`}>
          <h2 className="text-3xl font-black mb-2">{authMode === 'login' ? 'Login' : 'Register'}</h2>
          <p className="text-gray-500 mb-6">Access your SYME fitness profile</p>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <input type="text" name="name" placeholder="Full Name" className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-[#0a0e27] border-[#2d3a5c]' : 'bg-white border-gray-200'}`} />
            )}
            <input type="email" name="email" placeholder="Email" required className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-[#0a0e27] border-[#2d3a5c]' : 'bg-white border-gray-200'}`} />
            <input type="password" name="password" placeholder="Password" required className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-[#0a0e27] border-[#2d3a5c]' : 'bg-white border-gray-200'}`} />
            
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold">
              {loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full mt-4 text-blue-500 hover:underline">
            {authMode === 'login' ? 'Create Account' : 'Already have account?'}
          </button>
        </div>
      </div>
    );
  }

  // Dashboard
  if (isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgClass}`}>
        {/* Header */}
        <header className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black">SYME Dashboard</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-gray-800">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-900 text-red-500"><LogOut size={20} /></button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {['dashboard', 'workout', 'nutrition', 'progress', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setPage(tab as Page)}
                className={`px-4 py-2 rounded-lg font-bold transition ${page === tab ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'hover:bg-gray-800'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {page === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black">Welcome, {profile.name}!</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-6 rounded-xl border ${cardClass}`}>
                  <Activity className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-500">Current Weight</p>
                  <p className="text-2xl font-black">{profile.weight}kg</p>
                </div>
                <div className={`p-6 rounded-xl border ${cardClass}`}>
                  <Target className="w-8 h-8 text-purple-500 mb-2" />
                  <p className="text-sm text-gray-500">Target Weight</p>
                  <p className="text-2xl font-black">{profile.targetWeight}kg</p>
                </div>
                <div className={`p-6 rounded-xl border ${cardClass}`}>
                  <Heart className="w-8 h-8 text-pink-500 mb-2" />
                  <p className="text-sm text-gray-500">Goal</p>
                  <p className="text-lg font-black capitalize">{profile.goal.replace('_', ' ')}</p>
                </div>
                <div className={`p-6 rounded-xl border ${cardClass}`}>
                  <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                  <p className="text-sm text-gray-500">Streak</p>
                  <p className="text-2xl font-black">12 days</p>
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${cardClass}`}>
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={generateWorkout} disabled={loading} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold">
                    {loading ? 'Generating...' : 'Generate Workout'}
                  </button>
                  <button onClick={logWorkout} disabled={!workoutPlan || loading} className="px-6 py-3 bg-gray-700 text-white rounded-lg font-bold">
                    Log Workout
                  </button>
                  <button onClick={predictTransformation} disabled={loading} className="px-6 py-3 bg-gray-700 text-white rounded-lg font-bold">
                    Predict Transformation
                  </button>
                </div>
              </div>

              {workoutPlan && (
                <div className={`p-6 rounded-xl border ${cardClass}`}>
                  <h3 className="text-xl font-bold mb-4">Current Workout Plan</h3>
                  <p className="mb-3">{workoutPlan.name || 'Personalized Plan'}</p>
                  <div className="space-y-2">
                    {(workoutPlan.exercises || []).slice(0, 5).map((ex: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{ex.name}</span>
                        <span className="text-gray-500">{ex.sets}x{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {page === 'nutrition' && (
            <div className={`p-6 rounded-xl border ${cardClass} space-y-6`}>
              <h2 className="text-3xl font-black">Nutrition Analyzer</h2>
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <Camera size={48} className="mx-auto mb-4 text-gray-500" />
                <p className="mb-4">Scan your meal for instant macro analysis</p>
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && analyzeFood(e.target.files[0])} />
                <button onClick={() => fileRef.current?.click()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                  Open Camera
                </button>
              </div>
            </div>
          )}

          {page === 'progress' && (
            <div className={`p-6 rounded-xl border ${cardClass}`}>
              <h2 className="text-3xl font-black mb-6">Progress & Predictions</h2>
              <div className="space-y-4">
                <p className="text-gray-500">Weeks to goal: Calculate based on current pace</p>
                <p className="text-gray-500">Recent logs: {workoutLogs.length}</p>
              </div>
            </div>
          )}

          {page === 'profile' && (
            <div className={`p-6 rounded-xl border ${cardClass} space-y-6`}>
              <h2 className="text-3xl font-black">Profile Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Weight (kg)</label>
                  <input type="number" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })} className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-[#0a0e27] border-[#2d3a5c]' : 'bg-white border-gray-200'}`} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Target Weight (kg)</label>
                  <input type="number" value={profile.targetWeight} onChange={(e) => setProfile({ ...profile, targetWeight: Number(e.target.value) })} className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-[#0a0e27] border-[#2d3a5c]' : 'bg-white border-gray-200'}`} />
                </div>
                <button onClick={updateProfile} disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold">
                  {loading ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return null;
}

// Import Target icon if not already imported
import { Target } from 'lucide-react';
