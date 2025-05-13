import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { PreferencesProvider } from './src/contexts/preferences/PreferencesContext';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { ProductsProvider } from './src/contexts/products/ProductsContext';
import { FootprintProvider } from './src/contexts/footprint/FootprintContext';
import { DietProvider } from './src/contexts/diet/DietContext';
import { GamificationProvider } from './src/contexts/gamification/GamificationContext';
import ErrorBoundary from './src/components/feedback/ErrorBoundary';
import errorHandler from './src/services/errorHandling';
import networkManager from './src/services/networkManager';
import securityManager from './src/services/securityManager';

const initializeServices = async () => {
  try {
    await errorHandler.initialize();
    await networkManager.initialize();
    await securityManager.initialize();
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
};

export default function App() {
  useEffect(() => {
    initializeServices();
    
    return () => {
      networkManager.cleanup();
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PreferencesProvider>
          <ThemeProvider>
            <AuthProvider>
              <ProductsProvider>
                <FootprintProvider>
                  <DietProvider>
                    <GamificationProvider>
                      <RootNavigator />
                      <StatusBar style="auto" />
                    </GamificationProvider>
                  </DietProvider>
                </FootprintProvider>
              </ProductsProvider>
            </AuthProvider>
          </ThemeProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
