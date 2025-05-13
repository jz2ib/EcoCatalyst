import axios from 'axios';
import { DietType, MealType, FoodItem } from '../contexts/diet/DietContext';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

const DIET_ASSISTANT_PROMPT = `You are EcoDiet Assistant, an AI specialized in sustainable and healthy diet planning. 
Your goal is to help users make environmentally conscious food choices while meeting their nutritional needs.

Key responsibilities:
1. Provide evidence-based nutrition advice
2. Recommend eco-friendly food choices with low carbon footprints
3. Create personalized meal plans based on dietary preferences and restrictions
4. Educate users about the environmental impact of different foods
5. Suggest sustainable alternatives to high-impact foods

Always consider both health and environmental sustainability in your recommendations.
Be specific, practical, and supportive in your responses.`;

interface OpenAIRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature: number;
  max_tokens: number;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Generate a response from the EcoDiet Assistant
 * @param userMessage User's message
 * @param chatHistory Previous chat history
 * @returns AI response
 */
export const generateDietResponse = async (
  userMessage: string,
  chatHistory: { content: string; sender: 'user' | 'ai' }[]
): Promise<string> => {
  try {
    const messages = [
      { role: 'system', content: DIET_ASSISTANT_PROMPT },
      ...chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const requestData: OpenAIRequest = {
      model: 'gpt-4-turbo',
      messages: messages as { role: 'system' | 'user' | 'assistant'; content: string; }[],
      temperature: 0.7,
      max_tokens: 500
    };

    const response = await axios.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating diet response:', error);
    return 'I apologize, but I encountered an issue processing your request. Please try again later.';
  }
};

/**
 * Generate a meal suggestion based on user preferences
 * @param mealType Type of meal (breakfast, lunch, dinner, snack)
 * @param dietType User's diet type
 * @param restrictions Dietary restrictions
 * @param preferences Food preferences
 * @returns Suggested meal with nutritional information
 */
export const generateMealSuggestion = async (
  mealType: MealType,
  dietType: DietType,
  restrictions: string[] = [],
  preferences: string[] = []
): Promise<{
  name: string;
  description: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  sustainabilityScore: number;
}> => {
  try {
    const prompt = `Generate a sustainable ${mealType} recipe for a ${dietType} diet.
${restrictions.length > 0 ? `Dietary restrictions: ${restrictions.join(', ')}` : ''}
${preferences.length > 0 ? `Food preferences: ${preferences.join(', ')}` : ''}

Please provide the recipe in the following JSON format:
{
  "name": "Recipe Name",
  "description": "Brief description of the meal",
  "foods": [
    {
      "id": "unique_id_1",
      "name": "Ingredient 1",
      "servingSize": "amount in grams or standard measure",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "sustainabilityScore": 0,
      "carbonFootprint": 0
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "sustainabilityScore": 0
}

For the sustainabilityScore, use a scale of 0-100 where:
- 0-20: Very high environmental impact
- 21-40: High environmental impact
- 41-60: Moderate environmental impact
- 61-80: Low environmental impact
- 81-100: Very low environmental impact

Base the sustainability score on factors like:
- Carbon footprint of ingredients
- Water usage
- Land use
- Seasonality
- Local availability
- Processing requirements

Ensure all nutritional values are realistic and the sustainability scores are evidence-based.`;

    const requestData: OpenAIRequest = {
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: DIET_ASSISTANT_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    const response = await axios.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    const responseText = response.data.choices[0].message.content;
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse meal suggestion JSON');
    }
    
    const mealData = JSON.parse(jsonMatch[0]);
    
    mealData.foods = mealData.foods.map((food: any, index: number) => ({
      ...food,
      id: food.id || `food_${Date.now()}_${index}`
    }));
    
    return mealData;
  } catch (error) {
    console.error('Error generating meal suggestion:', error);
    
    return {
      name: `Suggested ${mealType}`,
      description: 'A balanced meal with sustainable ingredients',
      foods: [
        {
          id: `food_${Date.now()}`,
          name: 'Mixed vegetables',
          servingSize: '100g',
          calories: 65,
          protein: 3,
          carbs: 12,
          fat: 0.5,
          sustainabilityScore: 85
        }
      ],
      totalCalories: 65,
      totalProtein: 3,
      totalCarbs: 12,
      totalFat: 0.5,
      sustainabilityScore: 85
    };
  }
};

/**
 * Calculate sustainability score for a food item
 * @param foodName Name of the food
 * @returns Sustainability score (0-100)
 */
export const calculateFoodSustainabilityScore = async (foodName: string): Promise<number> => {
  try {
    const prompt = `Calculate the sustainability score (0-100) for "${foodName}" based on:
- Carbon footprint
- Water usage
- Land use
- Processing requirements
- Transportation impact
- Packaging
- Seasonality

Where:
- 0-20: Very high environmental impact
- 21-40: High environmental impact
- 41-60: Moderate environmental impact
- 61-80: Low environmental impact
- 81-100: Very low environmental impact

Provide only the numeric score as your answer.`;

    const requestData: OpenAIRequest = {
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: DIET_ASSISTANT_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 10
    };

    const response = await axios.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    const scoreText = response.data.choices[0].message.content.trim();
    const score = parseInt(scoreText, 10);
    
    if (isNaN(score) || score < 0 || score > 100) {
      throw new Error('Invalid sustainability score');
    }
    
    return score;
  } catch (error) {
    console.error('Error calculating sustainability score:', error);
    
    return 50;
  }
};

/**
 * Generate sustainable diet tips based on user's current diet
 * @param currentDiet Description of user's current diet
 * @returns List of sustainable diet tips
 */
export const generateSustainableDietTips = async (currentDiet: string): Promise<string[]> => {
  try {
    const prompt = `Based on this description of a user's current diet: "${currentDiet}", 
provide 5 specific, actionable tips to make their diet more environmentally sustainable.
Each tip should be concise (1-2 sentences) and focus on reducing environmental impact while maintaining nutritional quality.
Format your response as a JSON array of strings containing only the tips.`;

    const requestData: OpenAIRequest = {
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: DIET_ASSISTANT_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    const response = await axios.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    const responseText = response.data.choices[0].message.content;
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse tips JSON');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating sustainable diet tips:', error);
    
    return [
      'Try to incorporate more plant-based meals into your weekly routine.',
      'Choose locally grown, seasonal produce to reduce transportation emissions.',
      'Reduce food waste by planning meals and properly storing leftovers.',
      'Limit red meat consumption to once or twice a week to lower your carbon footprint.',
      'Choose sustainably sourced seafood certified by organizations like MSC or ASC.'
    ];
  }
};

/**
 * Generate a complete diet plan for a specified duration
 * @param dietType Type of diet
 * @param durationDays Duration in days
 * @param restrictions Dietary restrictions
 * @param preferences Food preferences
 * @returns Complete diet plan with meals
 */
export const generateDietPlan = async (
  dietType: DietType,
  durationDays: number,
  restrictions: string[] = [],
  preferences: string[] = []
): Promise<{
  name: string;
  description: string;
  mealPlan: Array<{
    day: number;
    meals: Array<{
      mealType: MealType;
      name: string;
      description: string;
      foods: FoodItem[];
    }>;
  }>;
  sustainabilityScore: number;
  sustainabilityTips: string[];
}> => {
  try {
    const days = Math.min(durationDays, 7);
    
    const prompt = `Create a ${days}-day sustainable ${dietType} diet plan.
${restrictions.length > 0 ? `Dietary restrictions: ${restrictions.join(', ')}` : ''}
${preferences.length > 0 ? `Food preferences: ${preferences.join(', ')}` : ''}

Include breakfast, lunch, dinner, and an optional snack for each day.
Focus on environmentally sustainable food choices with low carbon footprints.

Please provide the diet plan in the following JSON format:
{
  "name": "Plan Name",
  "description": "Brief description of the diet plan",
  "mealPlan": [
    {
      "day": 1,
      "meals": [
        {
          "mealType": "breakfast",
          "name": "Meal Name",
          "description": "Brief description",
          "foods": [
            {
              "id": "unique_id",
              "name": "Food Name",
              "servingSize": "amount",
              "calories": 0,
              "protein": 0,
              "carbs": 0,
              "fat": 0,
              "sustainabilityScore": 0
            }
          ]
        }
      ]
    }
  ],
  "sustainabilityScore": 0,
  "sustainabilityTips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ]
}

Ensure all nutritional values are realistic and the sustainability scores are evidence-based.`;

    const requestData: OpenAIRequest = {
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: DIET_ASSISTANT_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    const response = await axios.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    const responseText = response.data.choices[0].message.content;
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse diet plan JSON');
    }
    
    const planData = JSON.parse(jsonMatch[0]);
    
    planData.mealPlan.forEach((day: any) => {
      day.meals.forEach((meal: any) => {
        meal.foods = meal.foods.map((food: any, index: number) => ({
          ...food,
          id: food.id || `food_${Date.now()}_${day.day}_${meal.mealType}_${index}`
        }));
      });
    });
    
    return planData;
  } catch (error) {
    console.error('Error generating diet plan:', error);
    
    return {
      name: `${dietType.charAt(0).toUpperCase() + dietType.slice(1)} Diet Plan`,
      description: 'A balanced and sustainable diet plan',
      mealPlan: Array.from({ length: Math.min(durationDays, 7) }, (_, i) => ({
        day: i + 1,
        meals: [
          {
            mealType: 'breakfast' as MealType,
            name: 'Simple Breakfast',
            description: 'A nutritious start to your day',
            foods: [
              {
                id: `food_${Date.now()}_${i}_breakfast`,
                name: 'Oatmeal with fruit',
                servingSize: '1 bowl',
                calories: 250,
                protein: 8,
                carbs: 45,
                fat: 5,
                sustainabilityScore: 85
              }
            ]
          },
          {
            mealType: 'lunch' as MealType,
            name: 'Balanced Lunch',
            description: 'A satisfying midday meal',
            foods: [
              {
                id: `food_${Date.now()}_${i}_lunch`,
                name: 'Vegetable soup with bread',
                servingSize: '1 bowl',
                calories: 350,
                protein: 12,
                carbs: 50,
                fat: 8,
                sustainabilityScore: 80
              }
            ]
          },
          {
            mealType: 'dinner' as MealType,
            name: 'Light Dinner',
            description: 'A nutritious evening meal',
            foods: [
              {
                id: `food_${Date.now()}_${i}_dinner`,
                name: 'Vegetable stir-fry',
                servingSize: '1 plate',
                calories: 400,
                protein: 15,
                carbs: 45,
                fat: 12,
                sustainabilityScore: 75
              }
            ]
          }
        ]
      })),
      sustainabilityScore: 80,
      sustainabilityTips: [
        'Choose locally grown, seasonal produce to reduce transportation emissions.',
        'Reduce food waste by planning meals and properly storing leftovers.',
        'Limit animal product consumption to lower your carbon footprint.'
      ]
    };
  }
};
