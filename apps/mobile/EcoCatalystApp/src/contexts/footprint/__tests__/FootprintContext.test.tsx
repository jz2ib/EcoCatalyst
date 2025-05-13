import React from 'react';
import { render, act } from '@testing-library/react-native';
import { FootprintContext, FootprintProvider } from '../FootprintContext';

declare const jest: any;
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;
declare const beforeEach: (fn: () => void) => void;

const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const mockDatabase = {
  ref: jest.fn(),
  onValue: jest.fn(),
  set: jest.fn(),
  push: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  limitToLast: jest.fn(),
  equalTo: jest.fn(),
};

jest.mock('firebase/database', () => mockDatabase);

const mockFirebaseService = {
  database: {},
  auth: {},
  app: {},
  storage: {},
  analytics: {},
};

jest.mock('../../../services/firebase', () => mockFirebaseService);

describe('FootprintContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial footprint state', () => {
    let contextValue;
    
    render(
      <FootprintProvider>
        <FootprintContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </FootprintContext.Consumer>
      </FootprintProvider>
    );
    
    expect(contextValue.entries).toEqual([]);
    expect(contextValue.summary).toBeDefined();
    expect(typeof contextValue.addFootprintEntry).toBe('function');
    expect(typeof contextValue.calculateSummary).toBe('function');
  });
  
  it('adds footprint entry correctly', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    let contextValue;
    
    render(
      <FootprintProvider>
        <FootprintContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </FootprintContext.Consumer>
      </FootprintProvider>
    );
    
    const newEntry = {
      category: 'transportation' as const,
      activityType: 'car',
      carbonAmount: 10,
      date: new Date().toISOString(),
    };
    
    await act(async () => {
      await contextValue.addFootprintEntry(newEntry);
    });
    
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
  
  it('calculates footprint summary correctly', () => {
    let contextValue;
    
    render(
      <FootprintProvider>
        <FootprintContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </FootprintContext.Consumer>
      </FootprintProvider>
    );
    
    const summary = contextValue.calculateSummary();
    
    expect(summary).toBeDefined();
    expect(summary).toHaveProperty('daily');
    expect(summary).toHaveProperty('weekly');
    expect(summary).toHaveProperty('monthly');
    expect(summary).toHaveProperty('yearly');
    expect(summary).toHaveProperty('byCategory');
  });
});
