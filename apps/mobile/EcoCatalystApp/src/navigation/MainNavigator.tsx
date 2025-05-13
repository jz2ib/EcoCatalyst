import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList } from './types';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/main/HomeScreen';
import ScannerScreen from '../screens/main/ScannerScreen';
import FootprintScreen from '../screens/main/FootprintScreen';
import FootprintAnalyticsScreen from '../screens/main/FootprintAnalyticsScreen';
import GoalSettingScreen from '../screens/main/GoalSettingScreen';
import DietScreen from '../screens/main/DietScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AlternativeProductsScreen from '../screens/main/AlternativeProductsScreen';
import AlternativeDetailsScreen from '../screens/main/AlternativeDetailsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainTabParamList>();

const ScannerStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ScannerMain" component={ScannerScreen} />
      <Stack.Screen name="AlternativeProducts" component={AlternativeProductsScreen} />
      <Stack.Screen name="AlternativeDetails" component={AlternativeDetailsScreen} />
    </Stack.Navigator>
  );
};

const FootprintStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FootprintMain" component={FootprintScreen} />
      <Stack.Screen name="FootprintAnalytics" component={FootprintAnalyticsScreen} />
      <Stack.Screen name="GoalSetting" component={GoalSettingScreen} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerStackNavigator} 
        options={{
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="qr-code-scanner" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Footprint" 
        component={FootprintStackNavigator} 
        options={{
          tabBarLabel: 'Footprint',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="eco" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Diet" 
        component={DietScreen} 
        options={{
          tabBarLabel: 'Diet',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
