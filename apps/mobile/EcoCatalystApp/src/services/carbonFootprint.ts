import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from './firebase';
import { ref, set, push, get, query, orderByChild, limitToLast } from 'firebase/database';

export interface CarbonActivity {
  id: string;
  type: 'food' | 'transportation' | 'energy' | 'product';
  description: string;
  date: number; // timestamp
  carbonAmount: number; // in kg CO2e
  category: string;
  subcategory?: string;
  metadata?: Record<string, any>;
}

export interface CarbonGoal {
  id: string;
  targetAmount: number; // in kg CO2e
  startDate: number; // timestamp
  endDate: number; // timestamp
  title: string;
  description?: string;
  category?: 'food' | 'transportation' | 'energy' | 'product' | 'total';
  isCompleted: boolean;
  progress: number; // 0-100
}

export interface FootprintSummary {
  total: number; // in kg CO2e
  byCategory: {
    food: number;
    transportation: number;
    energy: number;
    product: number;
  };
  timePeriod: {
    start: number; // timestamp
    end: number; // timestamp
  };
  comparisonToAverage: number; // percentage difference from average
}

const EMISSION_FACTORS = {
  food: {
    beef: 27.0, // kg CO2e per kg
    lamb: 39.2,
    pork: 12.1,
    chicken: 6.9,
    fish: 6.1,
    dairy: 1.9,
    eggs: 4.8,
    rice: 2.7,
    grains: 1.4,
    vegetables: 0.4,
    fruits: 0.5,
    processed: 5.8
  },
  transportation: {
    car: 0.192, // kg CO2e per km
    bus: 0.105,
    train: 0.041,
    plane: 0.255,
    motorcycle: 0.103,
    bicycle: 0,
    walking: 0
  },
  energy: {
    electricity: 0.233, // kg CO2e per kWh
    naturalGas: 0.184, // kg CO2e per kWh
    heating: 0.27,
    cooling: 0.19
  },
  product: {
    clothing: 15, // kg CO2e per item (average)
    electronics: 45,
    furniture: 90,
    appliances: 100
  }
};

const AVERAGE_FOOTPRINTS = {
  daily: 22.6, // kg CO2e
  weekly: 158.2,
  monthly: 685.5,
  yearly: 8300 // ~8.3 tons CO2e per year
};

export const calculateFoodFootprint = (
  foodType: string,
  quantity: number // in kg
): number => {
  const factor = EMISSION_FACTORS.food[foodType as keyof typeof EMISSION_FACTORS.food] || 2.0;
  return factor * quantity;
};

export const calculateTransportationFootprint = (
  transportType: string,
  distance: number // in km
): number => {
  const factor = EMISSION_FACTORS.transportation[transportType as keyof typeof EMISSION_FACTORS.transportation] || 0.15;
  return factor * distance;
};

export const calculateEnergyFootprint = (
  energyType: string,
  amount: number // in kWh or appropriate unit
): number => {
  const factor = EMISSION_FACTORS.energy[energyType as keyof typeof EMISSION_FACTORS.energy] || 0.2;
  return factor * amount;
};

export const calculateProductFootprint = (
  productType: string,
  quantity: number = 1
): number => {
  const factor = EMISSION_FACTORS.product[productType as keyof typeof EMISSION_FACTORS.product] || 30;
  return factor * quantity;
};

export const saveActivity = async (
  activity: Omit<CarbonActivity, 'id'>,
  userId?: string
): Promise<CarbonActivity | null> => {
  try {
    const newActivity = {
      ...activity,
      date: activity.date || Date.now()
    };
    
    if (userId) {
      const activityRef = push(ref(database, `users/${userId}/activities`));
      await set(activityRef, newActivity);
      return { id: activityRef.key!, ...newActivity };
    } else {
      const storedActivities = await AsyncStorage.getItem('carbonActivities');
      const activities: CarbonActivity[] = storedActivities ? JSON.parse(storedActivities) : [];
      
      const newActivityWithId = {
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ...newActivity
      };
      
      activities.push(newActivityWithId);
      await AsyncStorage.setItem('carbonActivities', JSON.stringify(activities));
      
      return newActivityWithId;
    }
  } catch (error) {
    console.error('Error saving carbon activity:', error);
    return null;
  }
};

export const getActivities = async (
  userId?: string,
  startDate?: number,
  endDate?: number
): Promise<CarbonActivity[]> => {
  try {
    let activities: CarbonActivity[] = [];
    
    if (userId) {
      const activitiesQuery = query(
        ref(database, `users/${userId}/activities`),
        orderByChild('date'),
        limitToLast(100) // Limit to recent activities
      );
      
      const snapshot = await get(activitiesQuery);
      if (snapshot.exists()) {
        const data = snapshot.val();
        activities = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
    } else {
      const storedActivities = await AsyncStorage.getItem('carbonActivities');
      activities = storedActivities ? JSON.parse(storedActivities) : [];
    }
    
    if (startDate || endDate) {
      activities = activities.filter(activity => {
        if (startDate && activity.date < startDate) return false;
        if (endDate && activity.date > endDate) return false;
        return true;
      });
    }
    
    return activities.sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error('Error getting carbon activities:', error);
    return [];
  }
};

export const saveGoal = async (
  goal: Omit<CarbonGoal, 'id' | 'progress' | 'isCompleted'>,
  userId?: string
): Promise<CarbonGoal | null> => {
  try {
    const newGoal = {
      ...goal,
      startDate: goal.startDate || Date.now(),
      progress: 0,
      isCompleted: false
    };
    
    if (userId) {
      const goalRef = push(ref(database, `users/${userId}/goals`));
      await set(goalRef, newGoal);
      return { id: goalRef.key!, ...newGoal };
    } else {
      const storedGoals = await AsyncStorage.getItem('carbonGoals');
      const goals: CarbonGoal[] = storedGoals ? JSON.parse(storedGoals) : [];
      
      const newGoalWithId = {
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ...newGoal
      };
      
      goals.push(newGoalWithId);
      await AsyncStorage.setItem('carbonGoals', JSON.stringify(goals));
      
      return newGoalWithId;
    }
  } catch (error) {
    console.error('Error saving carbon goal:', error);
    return null;
  }
};

export const getGoals = async (
  userId?: string,
  includeCompleted: boolean = true
): Promise<CarbonGoal[]> => {
  try {
    let goals: CarbonGoal[] = [];
    
    if (userId) {
      const goalsQuery = query(
        ref(database, `users/${userId}/goals`)
      );
      
      const snapshot = await get(goalsQuery);
      if (snapshot.exists()) {
        const data = snapshot.val();
        goals = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
    } else {
      const storedGoals = await AsyncStorage.getItem('carbonGoals');
      goals = storedGoals ? JSON.parse(storedGoals) : [];
    }
    
    if (!includeCompleted) {
      goals = goals.filter(goal => !goal.isCompleted);
    }
    
    return goals.sort((a, b) => a.endDate - b.endDate);
  } catch (error) {
    console.error('Error getting carbon goals:', error);
    return [];
  }
};

export const updateGoalProgress = async (
  goalId: string,
  progress: number,
  userId?: string
): Promise<boolean> => {
  try {
    const isCompleted = progress >= 100;
    
    if (userId) {
      await set(ref(database, `users/${userId}/goals/${goalId}/progress`), progress);
      await set(ref(database, `users/${userId}/goals/${goalId}/isCompleted`), isCompleted);
    } else {
      const storedGoals = await AsyncStorage.getItem('carbonGoals');
      if (storedGoals) {
        const goals: CarbonGoal[] = JSON.parse(storedGoals);
        const goalIndex = goals.findIndex(g => g.id === goalId);
        
        if (goalIndex >= 0) {
          goals[goalIndex].progress = progress;
          goals[goalIndex].isCompleted = isCompleted;
          await AsyncStorage.setItem('carbonGoals', JSON.stringify(goals));
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return false;
  }
};

export const calculateFootprintSummary = async (
  startDate: number,
  endDate: number,
  userId?: string
): Promise<FootprintSummary> => {
  try {
    const activities = await getActivities(userId, startDate, endDate);
    
    const summary: FootprintSummary = {
      total: 0,
      byCategory: {
        food: 0,
        transportation: 0,
        energy: 0,
        product: 0
      },
      timePeriod: {
        start: startDate,
        end: endDate
      },
      comparisonToAverage: 0
    };
    
    activities.forEach(activity => {
      summary.total += activity.carbonAmount;
      summary.byCategory[activity.type] += activity.carbonAmount;
    });
    
    const daysInPeriod = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const averageForPeriod = AVERAGE_FOOTPRINTS.daily * daysInPeriod;
    
    summary.comparisonToAverage = ((summary.total - averageForPeriod) / averageForPeriod) * 100;
    
    return summary;
  } catch (error) {
    console.error('Error calculating footprint summary:', error);
    return {
      total: 0,
      byCategory: { food: 0, transportation: 0, energy: 0, product: 0 },
      timePeriod: { start: startDate, end: endDate },
      comparisonToAverage: 0
    };
  }
};

export const getCarbonReductionTips = (
  footprintSummary: FootprintSummary
): { title: string; description: string; potentialSaving: number }[] => {
  const tips: { title: string; description: string; potentialSaving: number }[] = [];
  
  if (footprintSummary.byCategory.food > 0) {
    tips.push({
      title: 'Eat more plant-based meals',
      description: 'Reducing meat consumption by 50% can lower your food carbon footprint by up to 40%.',
      potentialSaving: footprintSummary.byCategory.food * 0.4
    });
    
    tips.push({
      title: 'Buy local and seasonal produce',
      description: 'Local food travels shorter distances, reducing transportation emissions by up to 25%.',
      potentialSaving: footprintSummary.byCategory.food * 0.25
    });
  }
  
  if (footprintSummary.byCategory.transportation > 0) {
    tips.push({
      title: 'Use public transportation',
      description: 'Taking the bus instead of driving can reduce your transportation emissions by up to 60%.',
      potentialSaving: footprintSummary.byCategory.transportation * 0.6
    });
    
    tips.push({
      title: 'Carpool or rideshare',
      description: 'Sharing rides can cut your transportation carbon footprint by up to 50%.',
      potentialSaving: footprintSummary.byCategory.transportation * 0.5
    });
  }
  
  if (footprintSummary.byCategory.energy > 0) {
    tips.push({
      title: 'Switch to LED lighting',
      description: 'LED bulbs use up to 80% less energy than traditional incandescent bulbs.',
      potentialSaving: footprintSummary.byCategory.energy * 0.1
    });
    
    tips.push({
      title: 'Adjust your thermostat',
      description: 'Lowering your thermostat by 1°C can reduce heating emissions by about 8%.',
      potentialSaving: footprintSummary.byCategory.energy * 0.08
    });
  }
  
  if (footprintSummary.byCategory.product > 0) {
    tips.push({
      title: 'Buy second-hand items',
      description: 'Purchasing used products instead of new can reduce your product footprint by up to 70%.',
      potentialSaving: footprintSummary.byCategory.product * 0.7
    });
    
    tips.push({
      title: 'Repair instead of replace',
      description: 'Extending product life through repair can reduce emissions by up to 50%.',
      potentialSaving: footprintSummary.byCategory.product * 0.5
    });
  }
  
  return tips.sort((a, b) => b.potentialSaving - a.potentialSaving);
};
