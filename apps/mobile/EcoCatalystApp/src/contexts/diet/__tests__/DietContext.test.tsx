import React from 'react';
import { render, act } from '@testing-library/react-native';
import { DietContext, DietProvider } from '../DietContext';

declare const jest: any;
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;
declare const beforeEach: (fn: () => void) => void;

const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const mockRef = jest.fn(() => ({}));
const mockOnValue = jest.fn((ref, callback) => {
  callback({
    val: () => null,
  });
  return jest.fn(); // Return unsubscribe function
});
const mockSet = jest.fn(() => Promise.resolve());
const mockPush = jest.fn(() => ({ key: 'mock-key' }));
const mockRemove = jest.fn(() => Promise.resolve());
const mockGet = jest.fn(() => Promise.resolve({
  val: () => null,
}));
const mockQuery = jest.fn(() => ({}));
const mockOrderByChild = jest.fn(() => ({}));
const mockLimitToLast = jest.fn(() => ({}));
const mockEqualTo = jest.fn(() => ({}));
const mockStartAt = jest.fn(() => ({}));

jest.mock('firebase/database', () => ({
  ref: mockRef,
  onValue: mockOnValue,
  set: mockSet,
  push: mockPush,
  remove: mockRemove,
  get: mockGet,
  query: mockQuery,
  orderByChild: mockOrderByChild,
  limitToLast: mockLimitToLast,
  equalTo: mockEqualTo,
  startAt: mockStartAt
}));

jest.mock('../../../services/firebase', () => ({
  auth: {},
  database: {},
  app: {},
  storage: {},
  analytics: {}
}));

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User'
};

const mockSetState = () => {};
const mockUseState = (initialValue) => [initialValue, mockSetState];
const mockUseEffect = (fn) => fn();

jest.mock('react', () => ({
  createContext: function() {
    return {
      Provider: function(props) { return props.children; },
      Consumer: function(props) { return props.children({}); },
    };
  },
  useState: mockUseState,
  useEffect: mockUseEffect,
  useContext: function(context) {
    if (String(context).includes('AuthContext')) {
      return { user: mockUser, isAuthenticated: true };
    }
    return { preferences: mockPreferences };
  },
  createElement: function(type, props, ...children) {
    return {
      type,
      props: { ...props, children },
    };
  },
}));

jest.mock('../../AuthContext', () => ({
  AuthContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children({ user: mockUser, isAuthenticated: true }),
  },
}));

const mockPreferences = {
  theme: 'light',
  notifications: true,
  language: 'en',
};

jest.mock('../../preferences/PreferencesContext', () => ({
  usePreferences: () => ({ preferences: mockPreferences }),
}));

describe('DietContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial diet state', () => {
    let contextValue;
    
    render(
      <DietProvider>
        <DietContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </DietContext.Consumer>
      </DietProvider>
    );
    
    expect(contextValue).toBeDefined();
    expect(contextValue.currentPlan).toBeNull();
    expect(contextValue.mealEntries).toEqual([]);
    expect(contextValue.chatHistory).toEqual([]);
    expect(contextValue.isLoading).toBe(false);
    expect(contextValue.error).toBeNull();
    expect(typeof contextValue.createDietPlan).toBe('function');
    expect(typeof contextValue.updateDietPlan).toBe('function');
    expect(typeof contextValue.deleteDietPlan).toBe('function');
    expect(typeof contextValue.addMealEntry).toBe('function');
    expect(typeof contextValue.updateMealEntry).toBe('function');
    expect(typeof contextValue.deleteMealEntry).toBe('function');
    expect(typeof contextValue.getMealsByDate).toBe('function');
    expect(typeof contextValue.getMealsByDateRange).toBe('function');
    expect(typeof contextValue.sendChatMessage).toBe('function');
    expect(typeof contextValue.clearChatHistory).toBe('function');
    expect(typeof contextValue.generateMealSuggestion).toBe('function');
    expect(typeof contextValue.clearError).toBe('function');
  });
  
  it('creates a diet plan', async () => {
    let contextValue;
    
    render(
      <DietProvider>
        <DietContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </DietContext.Consumer>
      </DietProvider>
    );
    
    const newPlan = {
      name: 'Test Diet Plan',
      description: 'A test diet plan',
      startDate: '2025-05-01',
      endDate: '2025-05-31',
      dietType: 'vegetarian',
      calorieTarget: 2000,
      proteinTarget: 100,
      carbTarget: 250,
      fatTarget: 70,
      restrictions: ['gluten'],
      preferences: ['high-protein'],
    };
    
    await act(async () => {
      await contextValue.createDietPlan(newPlan);
    });
    
    expect(mockPush).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalled();
  });
  
  it('gets meals by date', () => {
    let contextValue;
    
    render(
      <DietProvider>
        <DietContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </DietContext.Consumer>
      </DietProvider>
    );
    
    const meals = contextValue.getMealsByDate('2025-05-13');
    expect(Array.isArray(meals)).toBe(true);
  });
});
