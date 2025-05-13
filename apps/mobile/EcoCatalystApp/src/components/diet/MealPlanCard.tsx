import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DietPlan } from '../../contexts/diet/DietContext';

interface MealPlanCardProps {
  plan: DietPlan;
  onPress?: () => void;
}

const MealPlanCard: React.FC<MealPlanCardProps> = ({ plan, onPress }) => {
  const daysRemaining = () => {
    const endDate = new Date(plan.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{plan.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{plan.dietType}</Text>
        </View>
      </View>
      
      <Text style={styles.description}>{plan.description}</Text>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <MaterialIcons name="calendar-today" size={16} color="#4CAF50" />
          <Text style={styles.infoText}>{daysRemaining()} days remaining</Text>
        </View>
        
        <View style={styles.infoItem}>
          <MaterialIcons name="local-fire-department" size={16} color="#4CAF50" />
          <Text style={styles.infoText}>{plan.calorieTarget} cal/day</Text>
        </View>
      </View>
      
      {plan.restrictions && plan.restrictions.length > 0 && (
        <View style={styles.tagsContainer}>
          {plan.restrictions.map((restriction, index) => (
            <View key={`restriction-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>{restriction}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#689F38',
    fontSize: 12,
  },
});

export default MealPlanCard;
