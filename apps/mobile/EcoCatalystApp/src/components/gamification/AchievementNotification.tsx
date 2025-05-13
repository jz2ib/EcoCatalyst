import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Achievement } from '../../contexts/gamification/GamificationContext';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  onPress?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievement, 
  onClose, 
  onPress,
  autoClose = true,
  duration = 5000
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scanner':
        return '#4CAF50'; // Green
      case 'footprint':
        return '#2196F3'; // Blue
      case 'diet':
        return '#FF9800'; // Orange
      case 'community':
        return '#9C27B0'; // Purple
      case 'streak':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };
  
  const categoryColor = getCategoryColor(achievement.category);
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY }],
          opacity,
          borderLeftColor: categoryColor,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.content}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{achievement.icon}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Achievement Unlocked!</Text>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.points}>+{achievement.points} points</Text>
        </View>
        
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <MaterialIcons name="close" size={20} color="#757575" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 6,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  points: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
});

export default AchievementNotification;
