import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserStats } from '../../contexts/gamification/GamificationContext';

interface LevelProgressCardProps {
  userStats: UserStats;
}

const LevelProgressCard: React.FC<LevelProgressCardProps> = ({ userStats }) => {
  const { level, totalPoints } = userStats;
  
  const pointsForCurrentLevel = (level - 1) * 100;
  const pointsForNextLevel = level * 100;
  const pointsInCurrentLevel = totalPoints - pointsForCurrentLevel;
  const progressPercentage = Math.min(100, (pointsInCurrentLevel / 100) * 100);
  
  return (
    <View style={styles.container}>
      <View style={styles.levelBadge}>
        <Text style={styles.levelNumber}>{level}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Level {level}</Text>
          <Text style={styles.points}>{totalPoints} points</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {pointsInCurrentLevel}/{pointsForNextLevel - pointsForCurrentLevel}
          </Text>
        </View>
        
        <Text style={styles.nextLevelText}>
          {pointsForNextLevel - totalPoints} points to Level {level + 1}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    minWidth: 50,
    textAlign: 'right',
  },
  nextLevelText: {
    fontSize: 14,
    color: '#666',
  },
});

export default LevelProgressCard;
