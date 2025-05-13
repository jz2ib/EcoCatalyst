import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem } from '../contexts/diet/DietContext';
import { calculateFoodSustainabilityScore } from './openai';

const NUTRITION_CACHE_KEY = 'ecocatalyst_nutrition_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const NUTRITION_API_URL = 'https://api.edamam.com/api/food-database/v2/parser';
const NUTRITION_API_APP_ID = 'YOUR_EDAMAM_APP_ID'; // Replace with actual ID in production
const NUTRITION_API_APP_KEY = 'YOUR_EDAMAM_APP_KEY'; // Replace with actual key in production

interface NutritionCache {
  [foodName: string]: {
    data: FoodItem;
    timestamp: number;
  };
}

/**
 * Get nutrition information for a food item
 * @param foodName Name of the food
 * @returns Food item with nutrition information
 */
export const getNutritionInfo = async (foodName: string): Promise<FoodItem | null> => {
  try {
    const cachedData = await getCachedNutritionInfo(foodName);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axios.get(NUTRITION_API_URL, {
      params: {
        app_id: NUTRITION_API_APP_ID,
        app_key: NUTRITION_API_APP_KEY,
        ingr: foodName,
        nutrition_type: 'cooking'
      }
    });
    
    if (!response.data.hints || response.data.hints.length === 0) {
      return await createFallbackNutritionInfo(foodName);
    }
    
    const foodData = response.data.hints[0].food;
    const nutrients = foodData.nutrients || {};
    
    const sustainabilityScore = await calculateFoodSustainabilityScore(foodName);
    
    const foodItem: FoodItem = {
      id: `food_${Date.now()}`,
      name: foodName,
      servingSize: '100g',
      calories: Math.round(nutrients.ENERC_KCAL || 0),
      protein: Math.round(nutrients.PROCNT || 0),
      carbs: Math.round(nutrients.CHOCDF || 0),
      fat: Math.round(nutrients.FAT || 0),
      sustainabilityScore,
      carbonFootprint: calculateEstimatedCarbonFootprint(foodName, sustainabilityScore)
    };
    
    await cacheNutritionInfo(foodName, foodItem);
    
    return foodItem;
  } catch (error) {
    console.error('Error fetching nutrition info:', error);
    return createFallbackNutritionInfo(foodName);
  }
};

/**
 * Get cached nutrition information
 * @param foodName Name of the food
 * @returns Cached food item or null if not found
 */
const getCachedNutritionInfo = async (foodName: string): Promise<FoodItem | null> => {
  try {
    const cacheData = await AsyncStorage.getItem(NUTRITION_CACHE_KEY);
    if (!cacheData) return null;
    
    const cache: NutritionCache = JSON.parse(cacheData);
    const cachedItem = cache[foodName.toLowerCase()];
    
    if (!cachedItem) return null;
    
    if (Date.now() - cachedItem.timestamp > CACHE_EXPIRY) {
      return null;
    }
    
    return cachedItem.data;
  } catch (error) {
    console.error('Error reading nutrition cache:', error);
    return null;
  }
};

/**
 * Cache nutrition information
 * @param foodName Name of the food
 * @param foodItem Food item with nutrition information
 */
const cacheNutritionInfo = async (foodName: string, foodItem: FoodItem): Promise<void> => {
  try {
    const cacheData = await AsyncStorage.getItem(NUTRITION_CACHE_KEY);
    const cache: NutritionCache = cacheData ? JSON.parse(cacheData) : {};
    
    cache[foodName.toLowerCase()] = {
      data: foodItem,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(NUTRITION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching nutrition info:', error);
  }
};

/**
 * Create fallback nutrition information when API fails
 * @param foodName Name of the food
 * @returns Food item with estimated nutrition information
 */
const createFallbackNutritionInfo = async (foodName: string): Promise<FoodItem> => {
  const lowerName = foodName.toLowerCase();
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  
  if (lowerName.includes('fruit') || lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('orange')) {
    calories = 60;
    protein = 1;
    carbs = 15;
    fat = 0;
  } else if (lowerName.includes('vegetable') || lowerName.includes('broccoli') || lowerName.includes('carrot') || lowerName.includes('spinach')) {
    calories = 30;
    protein = 2;
    carbs = 5;
    fat = 0;
  } else if (lowerName.includes('meat') || lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork')) {
    calories = 200;
    protein = 25;
    carbs = 0;
    fat = 10;
  } else if (lowerName.includes('fish') || lowerName.includes('salmon') || lowerName.includes('tuna')) {
    calories = 180;
    protein = 22;
    carbs = 0;
    fat = 8;
  } else if (lowerName.includes('dairy') || lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) {
    calories = 120;
    protein = 8;
    carbs = 10;
    fat = 5;
  } else if (lowerName.includes('grain') || lowerName.includes('bread') || lowerName.includes('rice') || lowerName.includes('pasta')) {
    calories = 150;
    protein = 5;
    carbs = 30;
    fat = 1;
  } else if (lowerName.includes('nut') || lowerName.includes('seed') || lowerName.includes('almond') || lowerName.includes('peanut')) {
    calories = 180;
    protein = 6;
    carbs = 5;
    fat = 15;
  } else {
    calories = 100;
    protein = 5;
    carbs = 10;
    fat = 5;
  }
  
  const sustainabilityScore = await calculateFoodSustainabilityScore(foodName);
  
  return {
    id: `food_${Date.now()}`,
    name: foodName,
    servingSize: '100g',
    calories,
    protein,
    carbs,
    fat,
    sustainabilityScore,
    carbonFootprint: calculateEstimatedCarbonFootprint(foodName, sustainabilityScore)
  };
};

/**
 * Calculate estimated carbon footprint based on food name and sustainability score
 * @param foodName Name of the food
 * @param sustainabilityScore Sustainability score (0-100)
 * @returns Estimated carbon footprint in kg CO2e
 */
const calculateEstimatedCarbonFootprint = (foodName: string, sustainabilityScore: number): number => {
  const lowerName = foodName.toLowerCase();
  
  let baseCarbonFootprint = 0;
  
  if (lowerName.includes('beef') || lowerName.includes('lamb')) {
    baseCarbonFootprint = 27; // kg CO2e per kg
  } else if (lowerName.includes('pork')) {
    baseCarbonFootprint = 12;
  } else if (lowerName.includes('chicken') || lowerName.includes('turkey')) {
    baseCarbonFootprint = 6;
  } else if (lowerName.includes('fish') || lowerName.includes('seafood')) {
    baseCarbonFootprint = 5;
  } else if (lowerName.includes('cheese')) {
    baseCarbonFootprint = 13;
  } else if (lowerName.includes('milk') || lowerName.includes('yogurt')) {
    baseCarbonFootprint = 3;
  } else if (lowerName.includes('egg')) {
    baseCarbonFootprint = 4.5;
  } else if (lowerName.includes('rice')) {
    baseCarbonFootprint = 2.7;
  } else if (lowerName.includes('tofu') || lowerName.includes('soy')) {
    baseCarbonFootprint = 2;
  } else if (lowerName.includes('vegetable') || lowerName.includes('fruit')) {
    baseCarbonFootprint = 0.5;
  } else if (lowerName.includes('nut') || lowerName.includes('legume')) {
    baseCarbonFootprint = 1.5;
  } else {
    baseCarbonFootprint = 2; // Default value
  }
  
  const adjustmentFactor = (100 - sustainabilityScore) / 100;
  
  return parseFloat((baseCarbonFootprint * adjustmentFactor / 10).toFixed(2));
};

/**
 * Get sustainability information for a food item
 * @param foodName Name of the food
 * @returns Sustainability information
 */
export const getSustainabilityInfo = async (foodName: string): Promise<{
  sustainabilityScore: number;
  carbonFootprint: number;
  waterUsage: number;
  landUse: number;
  sustainabilityTips: string[];
}> => {
  try {
    const sustainabilityScore = await calculateFoodSustainabilityScore(foodName);
    
    const carbonFootprint = calculateEstimatedCarbonFootprint(foodName, sustainabilityScore);
    const waterUsage = estimateWaterUsage(foodName, sustainabilityScore);
    const landUse = estimateLandUse(foodName, sustainabilityScore);
    
    const sustainabilityTips = await generateSustainabilityTips(foodName);
    
    return {
      sustainabilityScore,
      carbonFootprint,
      waterUsage,
      landUse,
      sustainabilityTips
    };
  } catch (error) {
    console.error('Error getting sustainability info:', error);
    
    return {
      sustainabilityScore: 50,
      carbonFootprint: 2,
      waterUsage: 500,
      landUse: 3,
      sustainabilityTips: [
        'Choose locally grown, seasonal produce when possible.',
        'Consider reducing consumption of resource-intensive foods.',
        'Look for sustainability certifications when shopping.'
      ]
    };
  }
};

/**
 * Estimate water usage based on food name and sustainability score
 * @param foodName Name of the food
 * @param sustainabilityScore Sustainability score (0-100)
 * @returns Estimated water usage in liters per kg
 */
const estimateWaterUsage = (foodName: string, sustainabilityScore: number): number => {
  const lowerName = foodName.toLowerCase();
  
  let baseWaterUsage = 0;
  
  if (lowerName.includes('beef')) {
    baseWaterUsage = 15400;
  } else if (lowerName.includes('lamb')) {
    baseWaterUsage = 10400;
  } else if (lowerName.includes('pork')) {
    baseWaterUsage = 5990;
  } else if (lowerName.includes('chicken')) {
    baseWaterUsage = 4330;
  } else if (lowerName.includes('cheese')) {
    baseWaterUsage = 5060;
  } else if (lowerName.includes('egg')) {
    baseWaterUsage = 3300;
  } else if (lowerName.includes('rice')) {
    baseWaterUsage = 2500;
  } else if (lowerName.includes('bread')) {
    baseWaterUsage = 1600;
  } else if (lowerName.includes('milk')) {
    baseWaterUsage = 1020;
  } else if (lowerName.includes('apple')) {
    baseWaterUsage = 820;
  } else if (lowerName.includes('banana')) {
    baseWaterUsage = 790;
  } else if (lowerName.includes('potato')) {
    baseWaterUsage = 290;
  } else if (lowerName.includes('vegetable')) {
    baseWaterUsage = 300;
  } else {
    baseWaterUsage = 1000; // Default value
  }
  
  const adjustmentFactor = (100 - sustainabilityScore) / 100;
  
  return Math.round(baseWaterUsage * adjustmentFactor / 10);
};

/**
 * Estimate land use based on food name and sustainability score
 * @param foodName Name of the food
 * @param sustainabilityScore Sustainability score (0-100)
 * @returns Estimated land use in m² per kg
 */
const estimateLandUse = (foodName: string, sustainabilityScore: number): number => {
  const lowerName = foodName.toLowerCase();
  
  let baseLandUse = 0;
  
  if (lowerName.includes('beef')) {
    baseLandUse = 164;
  } else if (lowerName.includes('lamb')) {
    baseLandUse = 185;
  } else if (lowerName.includes('pork')) {
    baseLandUse = 11;
  } else if (lowerName.includes('chicken')) {
    baseLandUse = 7.1;
  } else if (lowerName.includes('cheese')) {
    baseLandUse = 41;
  } else if (lowerName.includes('egg')) {
    baseLandUse = 6;
  } else if (lowerName.includes('rice')) {
    baseLandUse = 2.7;
  } else if (lowerName.includes('bread')) {
    baseLandUse = 3.8;
  } else if (lowerName.includes('fruit')) {
    baseLandUse = 0.9;
  } else if (lowerName.includes('vegetable')) {
    baseLandUse = 0.3;
  } else {
    baseLandUse = 5; // Default value
  }
  
  const adjustmentFactor = (100 - sustainabilityScore) / 100;
  
  return parseFloat((baseLandUse * adjustmentFactor / 10).toFixed(1));
};

/**
 * Generate sustainability tips for a specific food
 * @param foodName Name of the food
 * @returns List of sustainability tips
 */
const generateSustainabilityTips = async (foodName: string): Promise<string[]> => {
  try {
    const prompt = `Provide 3 specific sustainability tips for consuming "${foodName}" in an environmentally friendly way.
Each tip should be concise (1-2 sentences) and focus on reducing environmental impact.
Format your response as a JSON array of strings containing only the tips.`;

    const requestData = {
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a sustainability expert focused on food systems.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    };

    const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const responseText = response.data.choices[0].message.content;
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse tips JSON');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating sustainability tips:', error);
    
    return [
      `Choose locally grown ${foodName} when possible to reduce transportation emissions.`,
      `Look for sustainably produced ${foodName} with eco-friendly certifications.`,
      `Store ${foodName} properly to extend its shelf life and reduce food waste.`
    ];
  }
};
