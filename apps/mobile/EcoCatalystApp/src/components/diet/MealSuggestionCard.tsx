import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MealEntry } from '../../contexts/diet/DietContext';

interface MealSuggestionCardProps {
  meal: MealEntry;
}

const MealSuggestionCard: React.FC<MealSuggestionCardProps> = ({ meal }) => {
  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#8BC34A'; // Light Green
    if (score >= 40) return '#FFEB3B'; // Yellow
    if (score >= 20) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getAverageSustainabilityScore = () => {
    if (!meal.foods || meal.foods.length === 0) return 0;
    
    const totalScore = meal.foods.reduce((sum, food) => sum + (food.sustainabilityScore || 0), 0);
    return Math.round(totalScore / meal.foods.length);
  };

  const averageScore = getAverageSustainabilityScore();
  const sustainabilityColor = getSustainabilityColor(averageScore);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{meal.name}</Text>
      
      {meal.description && (
        <Text style={styles.description}>{meal.description}</Text>
      )}
      
      <View style={styles.nutritionContainer}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.totalCalories}</Text>
          <Text style={styles.nutritionLabel}>Calories</Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.totalProtein}g</Text>
          <Text style={styles.nutritionLabel}>Protein</Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.totalCarbs}g</Text>
          <Text style={styles.nutritionLabel}>Carbs</Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.totalFat}g</Text>
          <Text style={styles.nutritionLabel}>Fat</Text>
        </View>
      </View>
      
      <View style={styles.sustainabilityContainer}>
        <Text style={styles.sectionTitle}>Sustainability Score</Text>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: sustainabilityColor }]}>
            <Text style={[styles.scoreValue, { color: sustainabilityColor }]}>{averageScore}</Text>
          </View>
          <View style={styles.scoreLabels}>
            <Text style={styles.scoreLabel}>
              {averageScore >= 80 ? 'Excellent' : 
               averageScore >= 60 ? 'Good' : 
               averageScore >= 40 ? 'Average' : 
               averageScore >= 20 ? 'Poor' : 'Very Poor'}
            </Text>
            <Text style={styles.scoreDescription}>
              {averageScore >= 80 ? 'Very low environmental impact' : 
               averageScore >= 60 ? 'Low environmental impact' : 
               averageScore >= 40 ? 'Moderate environmental impact' : 
               averageScore >= 20 ? 'High environmental impact' : 'Very high environmental impact'}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Ingredients</Text>
      <ScrollView style={styles.ingredientsContainer}>
        {meal.foods && meal.foods.map((food, index) => (
          <View key={food.id || index} style={styles.ingredientItem}>
            <View style={styles.ingredientInfo}>
              <Text style={styles.ingredientName}>{food.name}</Text>
              <Text style={styles.ingredientServing}>{food.servingSize}</Text>
            </View>
            <View style={[styles.sustainabilityDot, { backgroundColor: getSustainabilityColor(food.sustainabilityScore || 0) }]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sustainabilityContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreLabels: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreDescription: {
    fontSize: 12,
    color: '#666',
  },
  ingredientsContainer: {
    maxHeight: 200,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    color: '#333',
  },
  ingredientServing: {
    fontSize: 12,
    color: '#999',
  },
  sustainabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default MealSuggestionCard;
