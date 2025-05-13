import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CarbonFootprintEntry } from '../../contexts/footprint/FootprintContext';

interface CarbonGoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: string;
    isCompleted: boolean;
  };
  onPress?: () => void;
}

const CarbonGoalCard: React.FC<CarbonGoalCardProps> = ({ goal, onPress }) => {
  const progress = Math.min(goal.currentAmount / goal.targetAmount, 1);
  const progressPercentage = Math.round(progress * 100);
  const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
  
  const getStatusColor = () => {
    if (goal.isCompleted) return '#4CAF50'; // Green
    
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return '#F44336'; // Red - overdue
    if (daysRemaining < 7) return '#FF9800'; // Orange - due soon
    return '#2196F3'; // Blue - on track
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, goal.isCompleted && styles.completedContainer]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{goal.title}</Text>
        {goal.isCompleted ? (
          <View style={styles.completedBadge}>
            <MaterialIcons name="check-circle" size={16} color="white" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {new Date(goal.deadline).toLocaleDateString()}
          </Text>
        )}
      </View>
      
      <Text style={styles.description}>{goal.description}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%`, backgroundColor: getStatusColor() }]} />
        </View>
        <Text style={styles.progressText}>{progressPercentage}%</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Target:</Text>
          <Text style={styles.detailValue}>{goal.targetAmount} kg CO₂e</Text>
        </View>
        
        {!goal.isCompleted && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Remaining:</Text>
            <Text style={styles.detailValue}>{remainingAmount} kg CO₂e</Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>{goal.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  completedContainer: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    width: 40,
    textAlign: 'right',
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    marginRight: 15,
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
    marginRight: 5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CarbonGoalCard;
