import { useEffect, useMemo, useState } from "react";

type Category = "குழம்பு" | "பொரியல்" | "கூட்டு" | "சாம்பார்";
type MealType = "காலை" | "மதியம்" | "இரவு" | "எப்போதும்";

interface Dish {
  id: string;
  name: string;
  category: Category;
  vegetarian: boolean;
  mealType: MealType;
  cookingTime: string;
  ingredients: string[];
  steps: string[];
}

interface HistoryItem {
  dishId: string;
  date: string;
}

const HISTORY_KEY = "tamil_cooking_history_v1";
const DAILY_KEY = "tamil_daily_pick_v1";

const DISHES: Dish[] = [
  { id: "d1", name: "முருங்கைக்காய் சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "30 நிமிடம்", ingredients: ["துவரம்பருப்பு – 1/2 கப்", "முருங்கைக்காய் – 1", "சாம்பார் பொடி – 2 டீஸ்பூன்", "புளி – சிறிது", "உப்பு, எண்ணெய்"], steps: ["பருப்பை வேக வைத்து மசிக்கவும்.", "முருங்கைக்காயை துண்டு செய்து வேகவைக்கவும்.", "புளித்தண்ணீர், சாம்பார் பொடி சேர்த்து கொதிக்க விடவும்.", "பருப்பு சேர்த்து 5 நிமிடம் சிம்மரில் வைத்துத் இறக்கவும்."] },
  { id: "d2", name: "வெண்டைக்காய் சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "25 நிமிடம்", ingredients: ["துவரம்பருப்பு", "வெண்டைக்காய்", "புளி", "சாம்பார் பொடி", "கடுகு"], steps: ["பருப்பை வேகவைத்து வைத்துக்கொள்ளவும்.", "வெண்டைக்காயை லேசாக வதக்கவும்.", "புளித்தண்ணீரில் சாம்பார் பொடி சேர்த்து கொதிக்கவைத்து பருப்பு சேர்க்கவும்.", "தாளித்து மேலே ஊற்றவும்."] },
  { id: "d3", name: "கீரை சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "20 நிமிடம்", ingredients: ["அரைக்கீரை", "துவரம்பருப்பு", "சின்ன வெங்காயம்", "மிளகாய் தூள்", "உப்பு"], steps: ["கீரையை நன்றாக கழுவி நறுக்கவும்.", "பருப்பை வேகவைக்கவும்.", "வெங்காயம் வதக்கி கீரை சேர்த்து சமைக்கவும்.", "பருப்பு கலந்து உப்பு சேர்த்து இறக்கவும்."] },
  { id: "d4", name: "வெங்காய சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "25 நிமிடம்", ingredients: ["சின்ன வெங்காயம்", "துவரம்பருப்பு", "புளி", "சாம்பார் பொடி", "கருவேப்பிலை"], steps: ["சின்ன வெங்காயத்தை தோல் நீக்கவும்.", "வெங்காயத்தை எண்ணெயில் வதக்கவும்.", "புளித்தண்ணீர் மற்றும் சாம்பார் பொடி சேர்க்கவும்.", "பருப்பு சேர்த்து கொதித்ததும் இறக்கவும்."] },
  { id: "d5", name: "முள்ளங்கி சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "30 நிமிடம்", ingredients: ["முள்ளங்கி", "துவரம்பருப்பு", "புளி", "சாம்பார் பொடி", "உப்பு"], steps: ["முள்ளங்கியை வட்டமாக நறுக்கவும்.", "பருப்பு மற்றும் முள்ளங்கி வேகவைக்கவும்.", "புளித்தண்ணீர், பொடி சேர்த்து கலக்கவும்.", "கொதித்ததும் தாளித்து இறக்கவும்."] },
  { id: "d6", name: "பூசணிக்காய் சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "25 நிமிடம்", ingredients: ["வெள்ளை பூசணிக்காய்", "துவரம்பருப்பு", "புளி", "சாம்பார் பொடி", "மஞ்சள்"], steps: ["பூசணிக்காயை சதுரமாக நறுக்கவும்.", "பருப்பு வேகவைத்து வைக்கவும்.", "புளித்தண்ணீரில் பூசணிக்காய் சேர்த்து வேகவைக்கவும்.", "பருப்பு கலந்து இறக்கவும்."] },
  { id: "d7", name: "கத்தரிக்காய் சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "30 நிமிடம்", ingredients: ["கத்தரிக்காய்", "துவரம்பருப்பு", "புளி", "சாம்பார் பொடி", "உப்பு"], steps: ["கத்தரிக்காயை நீளமாக நறுக்கவும்.", "எண்ணெயில் வதக்கி வைக்கவும்.", "புளித்தண்ணீர், பொடி சேர்த்து கொதிக்கவைக்கவும்.", "பருப்பு சேர்த்து சிம்மரில் வைத்து இறக்கவும்."] },
  { id: "d8", name: "பரங்கிக்காய் சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "22 நிமிடம்", ingredients: ["பரங்கிக்காய்", "துவரம்பருப்பு", "புளி", "சாம்பார் பொடி", "தாளிக்க பொருட்கள்"], steps: ["பரங்கிக்காயை தோல் நீக்கி நறுக்கவும்.", "பருப்பு வேகவைக்கவும்.", "புளித்தண்ணீரில் காய் வேகவைத்து பருப்பு சேர்க்கவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d9", name: "கோஸ் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "இரவு", cookingTime: "15 நிமிடம்", ingredients: ["கோஸ்", "கடுகு", "உளுத்தம்பருப்பு", "தேங்காய் துருவல்", "உப்பு"], steps: ["கோஸை நறுக்கவும்.", "தாளித்து கோஸ் சேர்த்து வதக்கவும்.", "சிறிது தண்ணீர் தெளித்து வேகவைக்கவும்.", "தேங்காய் சேர்த்து இறக்கவும்."] },
  { id: "d10", name: "பீன்ஸ் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "இரவு", cookingTime: "18 நிமிடம்", ingredients: ["பீன்ஸ்", "வெங்காயம்", "கடுகு", "மிளகாய்", "தேங்காய்"], steps: ["பீன்ஸ் நறுக்கவும்.", "வெங்காயம் வதக்கி பீன்ஸ் சேர்க்கவும்.", "உப்பு சேர்த்து மூடி வேகவைக்கவும்.", "தேங்காய் தூவி இறக்கவும்."] },
  { id: "d11", name: "கேரட் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "காலை", cookingTime: "12 நிமிடம்", ingredients: ["கேரட்", "கடுகு", "பச்சை மிளகாய்", "தேங்காய்", "உப்பு"], steps: ["கேரட் துருவி எடுக்கவும்.", "தாளித்து கேரட் சேர்க்கவும்.", "சிறிது நேரம் மட்டுமே வதக்கவும்.", "தேங்காய் சேர்த்து இறக்கவும்."] },
  { id: "d12", name: "பீட்ரூட் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "காலை", cookingTime: "15 நிமிடம்", ingredients: ["பீட்ரூட்", "கடுகு", "கருவேப்பிலை", "தேங்காய்", "உப்பு"], steps: ["பீட்ரூட் துருவி எடுக்கவும்.", "தாளித்து பீட்ரூட் சேர்க்கவும்.", "மூடி 8 நிமிடம் சமைக்கவும்.", "தேங்காய் சேர்த்து இறக்கவும்."] },
  { id: "d13", name: "உருளைக்கிழங்கு பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "மதியம்", cookingTime: "20 நிமிடம்", ingredients: ["உருளைக்கிழங்கு", "மிளகாய் தூள்", "கடுகு", "எண்ணெய்", "உப்பு"], steps: ["உருளைக்கிழங்கை வேக வைத்து துண்டு செய்யவும்.", "தாளித்து உருளைக்கிழங்கு சேர்க்கவும்.", "மிளகாய் தூள், உப்பு சேர்த்து வறுக்கவும்.", "மொறு மொறுப்பாக வந்தால் இறக்கவும்."] },
  { id: "d14", name: "வாழைக்காய் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "மதியம்", cookingTime: "20 நிமிடம்", ingredients: ["வாழைக்காய்", "மஞ்சள்", "மிளகாய்", "கடுகு", "உப்பு"], steps: ["வாழைக்காயை தோல் நீக்கி நறுக்கவும்.", "மசாலா சேர்த்து கலந்து வைக்கவும்.", "தாளித்து மெதுவாக வறுக்கவும்.", "வெந்ததும் இறக்கவும்."] },
  { id: "d15", name: "கோவைக்காய் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "மதியம்", cookingTime: "18 நிமிடம்", ingredients: ["கோவைக்காய்", "வெங்காயம்", "கடுகு", "மிளகாய் தூள்", "உப்பு"], steps: ["கோவைக்காய் நீளமாக நறுக்கவும்.", "வெங்காயத்துடன் வதக்கவும்.", "உப்பு, மிளகாய் சேர்த்து கிளறவும்.", "மென்மையாக வந்ததும் இறக்கவும்."] },
  { id: "d16", name: "அவரைக்காய் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "இரவு", cookingTime: "16 நிமிடம்", ingredients: ["அவரைக்காய்", "கடுகு", "உளுத்தம்பருப்பு", "தேங்காய்", "உப்பு"], steps: ["அவரைக்காய் நறுக்கவும்.", "தாளித்து காய் சேர்க்கவும்.", "மூடி வேகவைக்கவும்.", "தேங்காய் சேர்த்து இறக்கவும்."] },
  { id: "d17", name: "சுரைக்காய் கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "இரவு", cookingTime: "20 நிமிடம்", ingredients: ["சுரைக்காய்", "பாசிப்பருப்பு", "தேங்காய் விழுது", "சீரகம்", "உப்பு"], steps: ["பாசிப்பருப்பை மென்மையாக வேகவைக்கவும்.", "சுரைக்காய் துண்டுகளை வேகவைக்கவும்.", "தேங்காய் விழுது சேர்த்து கலக்கவும்.", "கொதித்ததும் தாளித்து இறக்கவும்."] },
  { id: "d18", name: "பீர்க்கங்காய் கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "இரவு", cookingTime: "18 நிமிடம்", ingredients: ["பீர்க்கங்காய்", "பாசிப்பருப்பு", "தேங்காய்", "சீரகம்", "உப்பு"], steps: ["பீர்க்கங்காயை தோல் நீக்கி நறுக்கவும்.", "பருப்பு வேகவைக்கவும்.", "காய், பருப்பு, விழுது சேர்த்து வேகவைக்கவும்.", "தாளித்து பரிமாறவும்."] },
  { id: "d19", name: "பூசணிக்காய் கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "காலை", cookingTime: "18 நிமிடம்", ingredients: ["வெள்ளை பூசணி", "கடலைபருப்பு", "தேங்காய்", "பச்சை மிளகாய்", "உப்பு"], steps: ["கடலைபருப்பை ஊறவைத்து வேகவைக்கவும்.", "பூசணியை மென்மையாக வேகவைக்கவும்.", "தேங்காய் விழுது சேர்த்து கலக்கவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d20", name: "சௌசௌ கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "காலை", cookingTime: "20 நிமிடம்", ingredients: ["சௌசௌ", "பாசிப்பருப்பு", "தேங்காய்", "சீரகம்", "உப்பு"], steps: ["சௌசௌ தோல் நீக்கி நறுக்கவும்.", "பருப்பு வேகவைக்கவும்.", "இரண்டையும் சேர்த்து விழுது சேர்க்கவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d21", name: "கீரை கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "இரவு", cookingTime: "15 நிமிடம்", ingredients: ["முளைக்கீரை", "பாசிப்பருப்பு", "தேங்காய்", "பூண்டு", "உப்பு"], steps: ["கீரை கழுவி நறுக்கவும்.", "பருப்பு வேகவைக்கவும்.", "கீரை, பருப்பு சேர்த்து சமைக்கவும்.", "தேங்காய் விழுது சேர்த்து இறக்கவும்."] },
  { id: "d22", name: "வாழைத்தண்டு கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "மதியம்", cookingTime: "22 நிமிடம்", ingredients: ["வாழைத்தண்டு", "பாசிப்பருப்பு", "தேங்காய்", "சீரகம்", "உப்பு"], steps: ["வாழைத்தண்டை நறுக்கி மோரில் வைக்கவும்.", "பருப்பு வேகவைக்கவும்.", "வாழைத்தண்டு வேகவைத்து சேர்க்கவும்.", "விழுது சேர்த்து தாளித்து இறக்கவும்."] },
  { id: "d23", name: "பட்டாணி கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "மதியம்", cookingTime: "20 நிமிடம்", ingredients: ["பட்டாணி", "உருளைக்கிழங்கு", "தேங்காய்", "சீரகம்", "உப்பு"], steps: ["பட்டாணியை வேகவைக்கவும்.", "உருளைக்கிழங்கை நறுக்கி சேர்க்கவும்.", "தேங்காய் விழுது சேர்த்து கொதிக்க விடவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d24", name: "கடலை கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "மதியம்", cookingTime: "30 நிமிடம்", ingredients: ["கொண்டைக்கடலை", "வெங்காயம்", "தேங்காய்", "சீரகம்", "உப்பு"], steps: ["கொண்டைக்கடலையை ஊறவைத்து வேகவைக்கவும்.", "வெங்காயம் வதக்கவும்.", "கடலை மற்றும் விழுது சேர்க்கவும்.", "கொதித்ததும் இறக்கவும்."] },
  { id: "d25", name: "வத்தக்குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "மதியம்", cookingTime: "25 நிமிடம்", ingredients: ["சுண்டைக்காய் வத்தல்", "புளி", "குழம்பு பொடி", "வெந்தயம்", "உப்பு"], steps: ["புளித்தண்ணீர் எடுக்கவும்.", "வத்தலை எண்ணெயில் வறுக்கவும்.", "புளித்தண்ணீர், பொடி சேர்த்து கொதிக்கவைக்கவும்.", "எண்ணெய் மேலே மிதந்தால் இறக்கவும்."] },
  { id: "d26", name: "மோர் குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "காலை", cookingTime: "15 நிமிடம்", ingredients: ["புளிப்பான மோர்", "தேங்காய் விழுது", "சீரகம்", "பச்சை மிளகாய்", "உப்பு"], steps: ["தேங்காய், சீரகம் அரைக்கவும்.", "மோரில் விழுது கலந்து கிளறவும்.", "மிதமான சூட்டில் மட்டுமே காய்ச்சவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d27", name: "பூண்டு குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "மதியம்", cookingTime: "20 நிமிடம்", ingredients: ["பூண்டு பல்", "புளி", "மிளகாய் தூள்", "வெங்காயம்", "உப்பு"], steps: ["பூண்டு, வெங்காயம் வதக்கவும்.", "புளித்தண்ணீர் சேர்க்கவும்.", "மசாலா தூள் சேர்த்து கொதிக்கவைக்கவும்.", "சிறிது கெட்டியாக வந்ததும் இறக்கவும்."] },
  { id: "d28", name: "எள்ளு குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "மதியம்", cookingTime: "22 நிமிடம்", ingredients: ["எள்ளு", "புளி", "மிளகாய்", "வெங்காயம்", "உப்பு"], steps: ["எள்ளை வறுத்து அரைக்கவும்.", "வெங்காயம் வதக்கவும்.", "புளித்தண்ணீர் சேர்த்து கொதிக்கவைக்கவும்.", "எள்ளு விழுது சேர்த்து இறக்கவும்."] },
  { id: "d29", name: "பருப்பு உருண்டை குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "மதியம்", cookingTime: "35 நிமிடம்", ingredients: ["துவரம்பருப்பு", "புளி", "குழம்பு பொடி", "தேங்காய்", "உப்பு"], steps: ["பருப்பை ஊற வைத்து அரைத்து உருண்டை செய்யவும்.", "புளித்தண்ணீரில் குழம்பு அடிப்படை தயார் செய்யவும்.", "உருண்டைகளை மெதுவாக போடவும்.", "10 நிமிடம் சிம்மரில் வைத்து இறக்கவும்."] },
  { id: "d30", name: "தக்காளி குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "இரவு", cookingTime: "15 நிமிடம்", ingredients: ["தக்காளி", "வெங்காயம்", "பூண்டு", "மிளகாய் தூள்", "உப்பு"], steps: ["தக்காளி, வெங்காயம் வதக்கவும்.", "மசாலா தூள் சேர்க்கவும்.", "சிறிது தண்ணீர் சேர்த்து கொதிக்கவைக்கவும்.", "மிதமான கெட்டியாக வந்ததும் இறக்கவும்."] },
  { id: "d31", name: "கார சுண்டைக்காய் குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "மதியம்", cookingTime: "24 நிமிடம்", ingredients: ["சுண்டைக்காய்", "புளி", "சாம்பார் தூள்", "வெங்காயம்", "உப்பு"], steps: ["சுண்டைக்காயை லேசாக நசுக்கவும்.", "எண்ணெயில் வதக்கவும்.", "புளித்தண்ணீர் சேர்த்து கொதிக்கவைக்கவும்.", "காரம் சரி பார்த்து இறக்கவும்."] },
  { id: "d32", name: "மிளகு குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "இரவு", cookingTime: "18 நிமிடம்", ingredients: ["மிளகு", "சீரகம்", "பூண்டு", "புளி", "உப்பு"], steps: ["மிளகு, சீரகம் அரைக்கவும்.", "பூண்டு வதக்கி புளித்தண்ணீர் சேர்க்கவும்.", "அரைச்சதை சேர்த்து கொதிக்கவைக்கவும்.", "சூடாக பரிமாறவும்."] },
  { id: "d33", name: "முட்டைகோஸ் கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "இரவு", cookingTime: "18 நிமிடம்", ingredients: ["முட்டைகோஸ்", "பாசிப்பருப்பு", "தேங்காய்", "சீரகம்", "உப்பு"], steps: ["கோஸை நறுக்கவும்.", "பருப்பு வேகவைக்கவும்.", "கோஸ், பருப்பு, விழுது சேர்த்து சமைக்கவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d34", name: "செனைக்கிழங்கு பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "மதியம்", cookingTime: "25 நிமிடம்", ingredients: ["செனைக்கிழங்கு", "மிளகாய் தூள்", "எண்ணெய்", "கடுகு", "உப்பு"], steps: ["செனைக்கிழங்கை வேகவைத்து துண்டாக்கவும்.", "தாளித்து சேர்த்து வறுக்கவும்.", "மசாலா சேர்த்து கிளறவும்.", "வறுத்த நிறம் வந்ததும் இறக்கவும்."] },
  { id: "d35", name: "பரங்கிக்காய் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "காலை", cookingTime: "12 நிமிடம்", ingredients: ["பரங்கிக்காய்", "கடுகு", "மிளகாய்", "தேங்காய்", "உப்பு"], steps: ["பரங்கிக்காயை நறுக்கவும்.", "தாளித்து காய் சேர்க்கவும்.", "மூடி 6 நிமிடம் வேகவைக்கவும்.", "தேங்காய் சேர்த்து இறக்கவும்."] },
  { id: "d36", name: "புடலங்காய் கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "இரவு", cookingTime: "17 நிமிடம்", ingredients: ["புடலங்காய்", "பாசிப்பருப்பு", "தேங்காய்", "சீரகம்", "உப்பு"], steps: ["புடலங்காய் நறுக்கவும்.", "பருப்பை வேகவைக்கவும்.", "இரண்டையும் சேர்த்து விழுது கலக்கவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d37", name: "மணத்தக்காளி குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "மதியம்", cookingTime: "20 நிமிடம்", ingredients: ["மணத்தக்காளி", "புளி", "வெங்காயம்", "மிளகாய் தூள்", "உப்பு"], steps: ["மணத்தக்காளி சுத்தம் செய்யவும்.", "வெங்காயத்துடன் வதக்கவும்.", "புளித்தண்ணீர் சேர்த்து கொதிக்கவைக்கவும்.", "சுவை சரி பார்த்து இறக்கவும்."] },
  { id: "d38", name: "பசலைக்கீரை கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "காலை", cookingTime: "14 நிமிடம்", ingredients: ["பசலைக்கீரை", "பாசிப்பருப்பு", "தேங்காய்", "பூண்டு", "உப்பு"], steps: ["கீரை நறுக்கவும்.", "பருப்பை மென்மையாக வேகவைக்கவும்.", "கீரை சேர்த்து 5 நிமிடம் சமைக்கவும்.", "தேங்காய் விழுது சேர்த்து இறக்கவும்."] },
  { id: "d39", name: "தக்காளி சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "20 நிமிடம்", ingredients: ["தக்காளி", "துவரம்பருப்பு", "சாம்பார் பொடி", "புளி", "உப்பு"], steps: ["பருப்பு வேகவைக்கவும்.", "தக்காளி வதக்கவும்.", "புளித்தண்ணீர் மற்றும் பொடி சேர்க்கவும்.", "பருப்பு சேர்த்து கொதிக்கவைத்து இறக்கவும்."] },
  { id: "d40", name: "மாங்காய் சாம்பார்", category: "சாம்பார்", vegetarian: true, mealType: "மதியம்", cookingTime: "25 நிமிடம்", ingredients: ["புளிப்பான மாங்காய்", "துவரம்பருப்பு", "சாம்பார் பொடி", "மஞ்சள்", "உப்பு"], steps: ["மாங்காயை துண்டாக்கவும்.", "பருப்பை வேகவைக்கவும்.", "மாங்காய் மற்றும் பொடி சேர்த்து சமைக்கவும்.", "பருப்பு சேர்த்து இறக்கவும்."] },
  { id: "d41", name: "எலுமிச்சை ரசம்-குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "இரவு", cookingTime: "10 நிமிடம்", ingredients: ["எலுமிச்சை சாறு", "தக்காளி", "மிளகு", "சீரகம்", "உப்பு"], steps: ["தக்காளியை நசுக்கி தண்ணீரில் சேர்க்கவும்.", "மிளகு சீரகம் பொடி சேர்க்கவும்.", "ஒரு கொதி வந்ததும் அடுப்பை அணைக்கவும்.", "எலுமிச்சை சாறு இறுதியில் சேர்க்கவும்."] },
  { id: "d42", name: "சிக்கன் குழம்பு", category: "குழம்பு", vegetarian: false, mealType: "மதியம்", cookingTime: "35 நிமிடம்", ingredients: ["சிக்கன்", "வெங்காயம்", "தக்காளி", "மசாலா தூள்", "உப்பு"], steps: ["சிக்கனை சுத்தம் செய்து மசாலாவில் ஊறவைக்கவும்.", "வெங்காயம் தக்காளி வதக்கவும்.", "சிக்கன் சேர்த்து வேகவைக்கவும்.", "கெட்டியாக வந்ததும் இறக்கவும்."] },
  { id: "d43", name: "முட்டை குழம்பு", category: "குழம்பு", vegetarian: false, mealType: "இரவு", cookingTime: "20 நிமிடம்", ingredients: ["வேகவைத்த முட்டை", "வெங்காயம்", "தக்காளி", "மிளகாய் தூள்", "உப்பு"], steps: ["முட்டையை வேகவைத்து தோல் நீக்கவும்.", "வெங்காயம் தக்காளி வதக்கவும்.", "குழம்பு பதத்தில் கொண்டு வந்து முட்டை சேர்க்கவும்.", "5 நிமிடம் சிம்மரில் வைத்து இறக்கவும்."] },
  { id: "d44", name: "மீன் குழம்பு", category: "குழம்பு", vegetarian: false, mealType: "மதியம்", cookingTime: "30 நிமிடம்", ingredients: ["மீன் துண்டுகள்", "புளி", "வெங்காயம்", "மிளகாய் தூள்", "உப்பு"], steps: ["மீனை சுத்தம் செய்யவும்.", "புளித்தண்ணீரில் மசாலா சேர்த்து கொதிக்கவைக்கவும்.", "மீன் துண்டுகளை மெதுவாக போடவும்.", "10 நிமிடம் சமைத்து இறக்கவும்."] },
  { id: "d45", name: "கொத்தவரங்காய் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "இரவு", cookingTime: "15 நிமிடம்", ingredients: ["கொத்தவரங்காய்", "கடுகு", "மிளகாய்", "தேங்காய்", "உப்பு"], steps: ["கொத்தவரங்காயை நறுக்கவும்.", "தாளித்து காய் சேர்க்கவும்.", "மூடி வேகவைக்கவும்.", "தேங்காய் சேர்த்து இறக்கவும்."] },
  { id: "d46", name: "பாகற்காய் பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "மதியம்", cookingTime: "20 நிமிடம்", ingredients: ["பாகற்காய்", "மஞ்சள்", "மிளகாய் தூள்", "எண்ணெய்", "உப்பு"], steps: ["பாகற்காயை வட்டமாக நறுக்கவும்.", "உப்பு தடவி 10 நிமிடம் வைக்கவும்.", "பிழிந்து வறுக்கவும்.", "மொறு மொறுப்பாக வந்ததும் இறக்கவும்."] },
  { id: "d47", name: "வெண்டைக்காய் மோர் குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "காலை", cookingTime: "18 நிமிடம்", ingredients: ["வெண்டைக்காய்", "மோர்", "தேங்காய் விழுது", "சீரகம்", "உப்பு"], steps: ["வெண்டைக்காயை வதக்கி வைக்கவும்.", "மோர் மற்றும் விழுது கலந்து கொள்ளவும்.", "வெண்டைக்காய் சேர்த்து மிதமான சூட்டில் காய்ச்சவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d48", name: "சுண்டல் கூட்டு", category: "கூட்டு", vegetarian: true, mealType: "காலை", cookingTime: "20 நிமிடம்", ingredients: ["கொண்டைக்கடலை", "தேங்காய்", "சீரகம்", "பச்சை மிளகாய்", "உப்பு"], steps: ["கடலையை ஊறவைத்து வேகவைக்கவும்.", "தேங்காய் விழுது அரைக்கவும்.", "இரண்டையும் சேர்த்து கொதிக்கவைக்கவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d49", name: "கருணைக்கிழங்கு மசாலா பொரியல்", category: "பொரியல்", vegetarian: true, mealType: "மதியம்", cookingTime: "25 நிமிடம்", ingredients: ["கருணைக்கிழங்கு", "மசாலா தூள்", "கடுகு", "எண்ணெய்", "உப்பு"], steps: ["கருணைக்கிழங்கை வேகவைத்து தோல் நீக்கவும்.", "துண்டுகளாக்கி தாளிப்பில் சேர்க்கவும்.", "மசாலா சேர்த்து மெதுவாக வறுக்கவும்.", "வறுத்த நறுமணம் வந்ததும் இறக்கவும்."] },
  { id: "d50", name: "பருப்பு கீரை குழம்பு", category: "குழம்பு", vegetarian: true, mealType: "இரவு", cookingTime: "18 நிமிடம்", ingredients: ["துவரம்பருப்பு", "கீரை", "பூண்டு", "மிளகு", "உப்பு"], steps: ["பருப்பை வேகவைக்கவும்.", "கீரை, பூண்டு சேர்த்து சமைக்கவும்.", "பருப்பு சேர்த்து கலக்கவும்.", "தாளித்து இறக்கவும்."] },
  { id: "d51", name: "மட்டன் குழம்பு", category: "குழம்பு", vegetarian: false, mealType: "மதியம்", cookingTime: "45 நிமிடம்", ingredients: ["மட்டன்", "வெங்காயம்", "தக்காளி", "மசாலா", "உப்பு"], steps: ["மட்டனை சுத்தம் செய்து கழுவவும்.", "வெங்காயம் தக்காளி வதக்கவும்.", "மட்டன் மற்றும் மசாலா சேர்த்து வேகவைக்கவும்.", "எண்ணெய் பிரியும் வரை சமைக்கவும்."] },
  { id: "d52", name: "இறால் குழம்பு", category: "குழம்பு", vegetarian: false, mealType: "இரவு", cookingTime: "25 நிமிடம்", ingredients: ["இறால்", "வெங்காயம்", "புளி", "மிளகாய் தூள்", "உப்பு"], steps: ["இறாலை சுத்தம் செய்யவும்.", "வெங்காயம் வதக்கி புளித்தண்ணீர் சேர்க்கவும்.", "கொதித்ததும் இறால் சேர்க்கவும்.", "8 நிமிடம் சமைத்து இறக்கவும்."] },
];

const periodFromTime = () : MealType => {
  const hour = new Date().getHours();
  if (hour < 11) return "காலை";
  if (hour < 17) return "மதியம்";
  return "இரவு";
};

const tamilDate = () => new Date().toISOString().slice(0, 10);

function getStoredHistory(): HistoryItem[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as HistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-60)));
}

function pickDish(options: Dish[], history: HistoryItem[]): Dish {
  const recentIds = new Set(history.slice(-7).map((item) => item.dishId));
  const filtered = options.filter((dish) => !recentIds.has(dish.id));
  const pool = filtered.length > 0 ? filtered : options;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export default function App() {
  const [vegetarianOnly, setVegetarianOnly] = useState(true);
  const [todayDish, setTodayDish] = useState<Dish | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  const currentPeriod = useMemo(() => periodFromTime(), []);

  const filteredDishes = useMemo(() => {
    return DISHES.filter((dish) => {
      const vegMatch = vegetarianOnly ? dish.vegetarian : true;
      const periodMatch = dish.mealType === "எப்போதும்" || dish.mealType === currentPeriod;
      return vegMatch && periodMatch;
    });
  }, [vegetarianOnly, currentPeriod]);

  const speakRecipe = (dish: Dish) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const recipeText = `இன்றைய சமையல் பரிந்துரை ${dish.name}. சமைக்கும் நேரம் ${dish.cookingTime}. பொருட்கள் ${dish.ingredients.join(" , ")}. செய்முறை ${dish.steps.map((s, i) => `படி ${i + 1}, ${s}`).join(" ")}`;
    const utterance = new SpeechSynthesisUtterance(recipeText);
    utterance.lang = "ta-IN";
    utterance.rate = 0.8;
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  const saveDailyPick = (dish: Dish) => {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ date: tamilDate(), dishId: dish.id, vegetarianOnly }));
  };

  const addToHistory = (dish: Dish) => {
    const next = [...history, { dishId: dish.id, date: tamilDate() }];
    setHistory(next);
    saveHistory(next);
  };

  const suggestDish = (isManual = false) => {
    if (filteredDishes.length === 0) return;
    const selected = pickDish(filteredDishes, history);
    setTodayDish(selected);
    if (isManual) {
      addToHistory(selected);
      saveDailyPick(selected);
    }
  };

  useEffect(() => {
    const loadedHistory = getStoredHistory();
    setHistory(loadedHistory);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const rawDaily = localStorage.getItem(DAILY_KEY);
    const today = tamilDate();
    if (rawDaily) {
      try {
        const parsed = JSON.parse(rawDaily) as { date: string; dishId: string; vegetarianOnly: boolean };
        if (parsed.date === today && parsed.vegetarianOnly === vegetarianOnly) {
          const sameDish = DISHES.find((d) => d.id === parsed.dishId);
          if (sameDish) {
            setTodayDish(sameDish);
            return;
          }
        }
      } catch {
        // ignore
      }
    }

    if (filteredDishes.length === 0) return;
    const selected = pickDish(filteredDishes, history);
    setTodayDish(selected);
    saveDailyPick(selected);
    addToHistory(selected);
  }, [initialized, vegetarianOnly, filteredDishes, history]);

  const categoryLabel = todayDish?.category ?? "-";

  return (
    <main className="app">
      <section className="card">
        <h1>இன்றைய தமிழ் சமையல் உதவி</h1>
        <p className="subtitle">வீட்டுக்கு எளிய தினசரி குழம்பு / பொரியல் / கூட்டு பரிந்துரை</p>

        <div className="toolbar">
          <label className="toggle">
            <input
              type="checkbox"
              checked={vegetarianOnly}
              onChange={(e) => setVegetarianOnly(e.target.checked)}
            />
            சைவம் மட்டும்
          </label>
          <p className="period">நேரம்: {currentPeriod}</p>
        </div>

        {todayDish ? (
          <article>
            <div className="dishHead">
              <h2>{todayDish.name}</h2>
              <span>{categoryLabel}</span>
            </div>
            <p className="time">சமைக்கும் நேரம்: {todayDish.cookingTime}</p>

            <h3>பொருட்கள்</h3>
            <ul>
              {todayDish.ingredients.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3>செய்முறை</h3>
            <ol>
              {todayDish.steps.map((step, idx) => (
                <li key={step}>{idx + 1}. {step}</li>
              ))}
            </ol>
          </article>
        ) : (
          <p>இந்த நேரத்திற்கான உணவு கிடைக்கவில்லை.</p>
        )}

        <div className="buttons">
          <button
            className="primary"
            type="button"
            onClick={() => todayDish && speakRecipe(todayDish)}
            disabled={!todayDish}
          >
            🔊 கேளுங்கள்
          </button>
          <button className="secondary" type="button" onClick={() => suggestDish(true)}>
            அடுத்த பரிந்துரை
          </button>
        </div>
      </section>
    </main>
  );
}
