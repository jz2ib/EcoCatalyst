import React, { createContext, useState, useEffect, useContext } from 'react';
import { database } from '../../services/firebase';
import { ref, onValue, set, push, remove, get, query, orderByChild, limitToLast, equalTo } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../AuthContext';
import { usePreferences } from '../preferences/PreferencesContext';

export interface CarbonFootprintEntry {
  id: string;
  userId: string;
  date: string; // ISO date string
  timestamp: number;
  category: FootprintCategory;
  activityType: string;
  carbonAmount: number; // in kg CO2e
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export type FootprintCategory = 
  | 'transportation' 
  | 'food' 
  | 'housing' 
  | 'products' 
  | 'services' 
  | 'other';

export interface FootprintSummary {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  byCategory: Record<FootprintCategory, number>;
  totalSaved: number;
  averagePerDay: number;
}

export interface CarbonGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date string
  category: FootprintCategory | 'all';
  isCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

interface FootprintContextType {
  entries: CarbonFootprintEntry[];
  goals: CarbonGoal[];
  summary: FootprintSummary;
  isLoading: boolean;
  error: string | null;
  addFootprintEntry: (entry: Omit<CarbonFootprintEntry, 'id' | 'userId' | 'timestamp'>) => Promise<void>;
  updateFootprintEntry: (id: string, updates: Partial<Omit<CarbonFootprintEntry, 'id' | 'userId'>>) => Promise<void>;
  deleteFootprintEntry: (id: string) => Promise<void>;
  getFootprintByDateRange: (startDate: string, endDate: string) => Promise<CarbonFootprintEntry[]>;
  getFootprintByCategory: (category: FootprintCategory) => CarbonFootprintEntry[];
  calculateSummary: () => FootprintSummary;
  addGoal: (goal: Omit<CarbonGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Omit<CarbonGoal, 'id' | 'userId'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  clearError: () => void;
}

const FOOTPRINT_ENTRIES_STORAGE_KEY = 'ecocatalyst_footprint_entries';
const FOOTPRINT_GOALS_STORAGE_KEY = 'ecocatalyst_footprint_goals';

const defaultSummary: FootprintSummary = {
  daily: 0,
  weekly: 0,
  monthly: 0,
  yearly: 0,
  byCategory: {
    transportation: 0,
    food: 0,
    housing: 0,
    products: 0,
    services: 0,
    other: 0
  },
  totalSaved: 0,
  averagePerDay: 0
};

export const FootprintContext = createContext<FootprintContextType>({
  entries: [],
  goals: [],
  summary: defaultSummary,
  isLoading: true,
  error: null,
  addFootprintEntry: async () => {},
  updateFootprintEntry: async () => {},
  deleteFootprintEntry: async () => {},
  getFootprintByDateRange: async () => [],
  getFootprintByCategory: () => [],
  calculateSummary: () => defaultSummary,
  addGoal: async () => {},
  updateGoal: async () => {},
  deleteGoal: async () => {},
  clearError: () => {},
});

export const useFootprint = () => useContext(FootprintContext);

export const FootprintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<CarbonFootprintEntry[]>([]);
  const [goals, setGoals] = useState<CarbonGoal[]>([]);
  const [summary, setSummary] = useState<FootprintSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useContext(AuthContext);
  const { preferences } = usePreferences();
  
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedEntries = await AsyncStorage.getItem(FOOTPRINT_ENTRIES_STORAGE_KEY);
        if (cachedEntries) {
          const parsedEntries = JSON.parse(cachedEntries);
          setEntries(parsedEntries);
          
          const calculatedSummary = calculateSummaryFromEntries(parsedEntries);
          setSummary(calculatedSummary);
        }
        
        const cachedGoals = await AsyncStorage.getItem(FOOTPRINT_GOALS_STORAGE_KEY);
        if (cachedGoals) {
          const parsedGoals = JSON.parse(cachedGoals);
          setGoals(parsedGoals);
        }
      } catch (error) {
        console.error('Failed to load cached footprint data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCachedData();
  }, []);
  
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    const userFootprintRef = ref(database, `footprints/${user.uid}`);
    const userGoalsRef = ref(database, `goals/${user.uid}`);
    
    const entriesUnsubscribe = onValue(userFootprintRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const entriesList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          entriesList.sort((a, b) => b.timestamp - a.timestamp);
          
          setEntries(entriesList);
          
          const calculatedSummary = calculateSummaryFromEntries(entriesList);
          setSummary(calculatedSummary);
          
          AsyncStorage.setItem(FOOTPRINT_ENTRIES_STORAGE_KEY, JSON.stringify(entriesList))
            .catch(err => console.error('Failed to cache footprint entries:', err));
        } else {
          setEntries([]);
          setSummary(defaultSummary);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching footprint entries:', error);
        setError('Failed to fetch footprint data. Please try again later.');
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Database error:', error);
      setError('Database connection error. Please check your internet connection.');
      setIsLoading(false);
    });
    
    const goalsUnsubscribe = onValue(userGoalsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const goalsList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          goalsList.sort((a, b) => b.createdAt - a.createdAt);
          
          setGoals(goalsList);
          
          AsyncStorage.setItem(FOOTPRINT_GOALS_STORAGE_KEY, JSON.stringify(goalsList))
            .catch(err => console.error('Failed to cache footprint goals:', err));
        } else {
          setGoals([]);
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
        setError('Failed to fetch goals data. Please try again later.');
      }
    });
    
    return () => {
      entriesUnsubscribe();
      goalsUnsubscribe();
    };
  }, [user]);
  
  const calculateSummaryFromEntries = (entriesList: CarbonFootprintEntry[]): FootprintSummary => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000).getTime();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
    
    const categoryTotals: Record<FootprintCategory, number> = {
      transportation: 0,
      food: 0,
      housing: 0,
      products: 0,
      services: 0,
      other: 0
    };
    
    let dailyTotal = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    let totalSaved = 0; // This would be calculated based on improvements over time
    
    entriesList.forEach(entry => {
      const entryTimestamp = entry.timestamp;
      
      categoryTotals[entry.category] += entry.carbonAmount;
      
      if (entryTimestamp >= today) {
        dailyTotal += entry.carbonAmount;
      }
      
      if (entryTimestamp >= oneWeekAgo) {
        weeklyTotal += entry.carbonAmount;
      }
      
      if (entryTimestamp >= oneMonthAgo) {
        monthlyTotal += entry.carbonAmount;
      }
      
      if (entryTimestamp >= oneYearAgo) {
        yearlyTotal += entry.carbonAmount;
      }
    });
    
    const daysInMonth = 30; // Approximation
    const averagePerDay = monthlyTotal > 0 ? monthlyTotal / daysInMonth : 0;
    
    return {
      daily: dailyTotal,
      weekly: weeklyTotal,
      monthly: monthlyTotal,
      yearly: yearlyTotal,
      byCategory: categoryTotals,
      totalSaved,
      averagePerDay
    };
  };
  
  const addFootprintEntry = async (entry: Omit<CarbonFootprintEntry, 'id' | 'userId' | 'timestamp'>): Promise<void> => {
    try {
      const timestamp = Date.now();
      
      if (!user) {
        const newEntry: CarbonFootprintEntry = {
          id: `local_${timestamp}`,
          userId: 'anonymous',
          timestamp,
          ...entry
        };
        
        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);
        
        const calculatedSummary = calculateSummaryFromEntries(updatedEntries);
        setSummary(calculatedSummary);
        
        await AsyncStorage.setItem(FOOTPRINT_ENTRIES_STORAGE_KEY, JSON.stringify(updatedEntries));
        return;
      }
      
      const userFootprintRef = ref(database, `footprints/${user.uid}`);
      const newEntryRef = push(userFootprintRef);
      
      const entryData: Omit<CarbonFootprintEntry, 'id'> = {
        userId: user.uid,
        timestamp,
        ...entry
      };
      
      await set(newEntryRef, entryData);
    } catch (error) {
      console.error('Error adding footprint entry:', error);
      setError('Failed to save footprint entry. Please try again.');
    }
  };
  
  const updateFootprintEntry = async (id: string, updates: Partial<Omit<CarbonFootprintEntry, 'id' | 'userId'>>): Promise<void> => {
    try {
      if (!user) {
        const updatedEntries = entries.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        );
        
        setEntries(updatedEntries);
        
        const calculatedSummary = calculateSummaryFromEntries(updatedEntries);
        setSummary(calculatedSummary);
        
        await AsyncStorage.setItem(FOOTPRINT_ENTRIES_STORAGE_KEY, JSON.stringify(updatedEntries));
        return;
      }
      
      const entryRef = ref(database, `footprints/${user.uid}/${id}`);
      
      const snapshot = await get(entryRef);
      const currentData = snapshot.val();
      
      if (!currentData) {
        throw new Error('Entry not found');
      }
      
      await set(entryRef, {
        ...currentData,
        ...updates
      });
    } catch (error) {
      console.error('Error updating footprint entry:', error);
      setError('Failed to update footprint entry. Please try again.');
    }
  };
  
  const deleteFootprintEntry = async (id: string): Promise<void> => {
    try {
      if (!user) {
        const updatedEntries = entries.filter(entry => entry.id !== id);
        
        setEntries(updatedEntries);
        
        const calculatedSummary = calculateSummaryFromEntries(updatedEntries);
        setSummary(calculatedSummary);
        
        await AsyncStorage.setItem(FOOTPRINT_ENTRIES_STORAGE_KEY, JSON.stringify(updatedEntries));
        return;
      }
      
      const entryRef = ref(database, `footprints/${user.uid}/${id}`);
      await remove(entryRef);
    } catch (error) {
      console.error('Error deleting footprint entry:', error);
      setError('Failed to delete footprint entry. Please try again.');
    }
  };
  
  const getFootprintByDateRange = async (startDate: string, endDate: string): Promise<CarbonFootprintEntry[]> => {
    try {
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1); // End of the day
      
      return entries.filter(entry => 
        entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp
      );
    } catch (error) {
      console.error('Error getting footprint by date range:', error);
      setError('Failed to get footprint data for the selected date range.');
      return [];
    }
  };
  
  const getFootprintByCategory = (category: FootprintCategory): CarbonFootprintEntry[] => {
    return entries.filter(entry => entry.category === category);
  };
  
  const calculateSummary = (): FootprintSummary => {
    return calculateSummaryFromEntries(entries);
  };
  
  const addGoal = async (goal: Omit<CarbonGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isCompleted'>): Promise<void> => {
    try {
      const timestamp = Date.now();
      
      if (!user) {
        const newGoal: CarbonGoal = {
          id: `local_${timestamp}`,
          userId: 'anonymous',
          createdAt: timestamp,
          updatedAt: timestamp,
          isCompleted: false,
          ...goal
        };
        
        const updatedGoals = [newGoal, ...goals];
        setGoals(updatedGoals);
        
        await AsyncStorage.setItem(FOOTPRINT_GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
        return;
      }
      
      const userGoalsRef = ref(database, `goals/${user.uid}`);
      const newGoalRef = push(userGoalsRef);
      
      const goalData: Omit<CarbonGoal, 'id'> = {
        userId: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
        isCompleted: false,
        ...goal
      };
      
      await set(newGoalRef, goalData);
    } catch (error) {
      console.error('Error adding goal:', error);
      setError('Failed to save goal. Please try again.');
    }
  };
  
  const updateGoal = async (id: string, updates: Partial<Omit<CarbonGoal, 'id' | 'userId'>>): Promise<void> => {
    try {
      if (!user) {
        const updatedGoals = goals.map(goal => 
          goal.id === id ? { ...goal, ...updates, updatedAt: Date.now() } : goal
        );
        
        setGoals(updatedGoals);
        
        await AsyncStorage.setItem(FOOTPRINT_GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
        return;
      }
      
      const goalRef = ref(database, `goals/${user.uid}/${id}`);
      
      const snapshot = await get(goalRef);
      const currentData = snapshot.val();
      
      if (!currentData) {
        throw new Error('Goal not found');
      }
      
      await set(goalRef, {
        ...currentData,
        ...updates,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update goal. Please try again.');
    }
  };
  
  const deleteGoal = async (id: string): Promise<void> => {
    try {
      if (!user) {
        const updatedGoals = goals.filter(goal => goal.id !== id);
        
        setGoals(updatedGoals);
        
        await AsyncStorage.setItem(FOOTPRINT_GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
        return;
      }
      
      const goalRef = ref(database, `goals/${user.uid}/${id}`);
      await remove(goalRef);
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal. Please try again.');
    }
  };
  
  const clearError = () => {
    setError(null);
  };
  
  const value = {
    entries,
    goals,
    summary,
    isLoading,
    error,
    addFootprintEntry,
    updateFootprintEntry,
    deleteFootprintEntry,
    getFootprintByDateRange,
    getFootprintByCategory,
    calculateSummary,
    addGoal,
    updateGoal,
    deleteGoal,
    clearError,
  };
  
  return (
    <FootprintContext.Provider value={value}>
      {children}
    </FootprintContext.Provider>
  );
};
