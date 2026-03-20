/**
 * SYME AI Service (Production Bridge)
 * This service acts as a bridge between the frontend and the production-ready backend.
 * In a real SaaS, the frontend should not call GenAI directly to protect API keys 
 * and enforce subscription gating.
 */

const getAuthToken = () => localStorage.getItem("syme_token");

export const generateWorkoutPlan = async (userProfile: any) => {
  const response = await fetch("/api/workouts/generate", {
    headers: { 
      "Authorization": `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData.message || errorData.error || "Failed to generate workout plan";
    throw new Error(`${response.status}: ${message}`);
  }
  
  return response.json();
};

export const analyzeFoodImage = async (base64Image: string) => {
  // In a production environment:
  // 1. Upload image to S3
  // 2. Send S3 URL to backend
  // 3. Backend adds job to SQS
  // 4. Worker processes image via Vision API and updates DB
  
  const response = await fetch("/api/nutrition/analyze", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ foodName: "Paneer Tikka" }) // Mocking the AI Vision output for this demo
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData.message || errorData.error || "Failed to analyze food";
    throw new Error(`${response.status}: ${message}`);
  }

  const macros = await response.json();
  return [{ 
    name: "Paneer Tikka", 
    portion: "1 plate", 
    ...macros, 
    confidence: 0.95 
  }];
};

export const getAITransformationInsights = async (userProfile: any) => {
  const response = await fetch("/api/predict-transformation", {
    headers: { 
      "Authorization": `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData.message || errorData.error || "Failed to get transformation insights";
    throw new Error(`${response.status}: ${message}`);
  }

  const prediction = await response.json();
  
  return {
    timelineDescription: prediction.timelineDescription,
    milestones: [
      { week: 4, expectation: "Initial metabolic adaptation and neurological strength gains." },
      { week: 8, expectation: "Visible changes in body composition and improved insulin sensitivity." },
      { week: 12, expectation: "Significant transformation milestone reached." }
    ],
    proTips: [
      "Prioritize protein (1.8g/kg) to preserve lean mass during fat loss.",
      "Focus on compound movements (Squats, Deadlifts, Bench) for maximum metabolic demand.",
      "Ensure 7-9 hours of quality sleep for optimal hormonal recovery and muscle protein synthesis."
    ]
  };
};
