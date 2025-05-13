import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Achievement, UserAchievement } from '../../contexts/gamification/GamificationContext';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  onPress?: () => void;
  onShare?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  userAchievement, 
  onPress,
  onShare
}) => {
  const isCompleted = userAchievement?.progress === 100;
  const progress = userAchievement?.progress || 0;
  
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
    <TouchableOpacity 
      style={[
        styles.container, 
        isCompleted ? styles.completedContainer : {}
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.badgeContainer, { borderColor: categoryColor }]}>
        <Text style={styles.badgeIcon}>{achievement.icon}</Text>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.points}>+{achievement.points} pts</Text>
        </View>
        
        <Text style={styles.description}>{achievement.description}</Text>
        
        {!isCompleted && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progress}%`, backgroundColor: categoryColor }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}
        
        {isCompleted && onShare && (
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: categoryColor }]}
            onPress={onShare}
          >
            <MaterialIcons name="share" size={16} color="white" />
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: '#F9FFF9',
  },
  badgeContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F5F5F5',
  },
  badgeIcon: {
    fontSize: 28,
  },
  completedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  points: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 8,
    minWidth: 35,
    textAlign: 'right',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  shareText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default AchievementCard;
