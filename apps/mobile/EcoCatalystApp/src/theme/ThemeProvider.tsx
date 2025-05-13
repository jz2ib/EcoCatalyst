import React, { createContext, useContext } from 'react';
import { useColorScheme, Dimensions } from 'react-native';
import { Theme, lightTheme, darkTheme } from './theme';
import { usePreferences } from '../contexts/preferences/PreferencesContext';
import { 
  horizontalScale, 
  verticalScale, 
  moderateScale, 
  fontScale,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice
} from './responsive';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  horizontalScale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  fontScale: (size: number) => number;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  screenWidth: number;
  screenHeight: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  horizontalScale,
  verticalScale,
  moderateScale,
  fontScale,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  screenWidth,
  screenHeight
});

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = usePreferences();
  const systemColorScheme = useColorScheme();
  
  const isDark = 
    preferences.themeMode === 'dark' || 
    (preferences.themeMode === 'system' && systemColorScheme === 'dark');
  
  const theme = isDark ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDark,
      horizontalScale,
      verticalScale,
      moderateScale,
      fontScale,
      isSmallDevice,
      isMediumDevice,
      isLargeDevice,
      screenWidth,
      screenHeight
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
