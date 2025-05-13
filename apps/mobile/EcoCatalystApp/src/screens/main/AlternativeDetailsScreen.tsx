import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProducts } from '../../contexts/products/ProductsContext';

type AlternativeDetailsRouteParams = {
  alternativeId: string;
  originalProductId: string;
  alternative: any;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#8BC34A'; // Light Green
  if (score >= 40) return '#FFEB3B'; // Yellow
  if (score >= 20) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

const AlternativeDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<Record<string, AlternativeDetailsRouteParams>, string>>();
  const navigation = useNavigation();
  const { alternativeId, originalProductId, alternative } = route.params;
  
  const { submitAlternativeFeedback } = useProducts();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const product = alternative.product;
  if (!product) return null;
  
  const scoreColor = getScoreColor(product.sustainabilityScore);
  
  const handleFeedback = async (helpful: boolean, purchased: boolean = false) => {
    try {
      const result = await submitAlternativeFeedback(
        originalProductId,
        alternativeId,
        {
          helpful,
          purchased,
          reason: helpful ? 'User found this recommendation helpful' : 'User did not find this recommendation helpful'
        }
      );
      
      if (result) {
        setFeedbackSubmitted(true);
        Alert.alert(
          'Thank You!',
          'Your feedback helps us improve our recommendations.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alternative Details</Text>
      </View>
      
      <View style={styles.productHeader}>
        {product.imageUrl ? (
          <Image 
            source={{ uri: product.imageUrl }} 
            style={styles.productImage} 
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="image" size={60} color="#CCCCCC" />
          </View>
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.brandName}>{product.brand}</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Sustainability Score</Text>
            <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {Math.round(product.sustainabilityScore)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why This Alternative?</Text>
        <View style={styles.improvementCard}>
          <MaterialIcons name="trending-up" size={24} color="#4CAF50" style={styles.improvementIcon} />
          <View style={styles.improvementInfo}>
            <Text style={styles.improvementValue}>
              +{Math.round(alternative.sustainabilityImprovement)}% Improvement
            </Text>
            <Text style={styles.improvementReason}>{alternative.reason}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environmental Impact</Text>
        
        <View style={styles.impactRow}>
          <View style={styles.impactItem}>
            <MaterialIcons name="co2" size={24} color="#757575" />
            <Text style={styles.impactLabel}>Carbon Footprint</Text>
            <Text style={styles.impactValue}>{product.carbonFootprint} kg CO₂e</Text>
          </View>
          
          <View style={styles.impactItem}>
            <MaterialIcons name="water-drop" size={24} color="#757575" />
            <Text style={styles.impactLabel}>Water Usage</Text>
            <Text style={styles.impactValue}>{product.waterUsage} liters</Text>
          </View>
        </View>
        
        <View style={styles.impactRow}>
          <View style={styles.impactItem}>
            <MaterialIcons 
              name={product.recyclable ? "check-circle" : "cancel"} 
              size={24} 
              color={product.recyclable ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.impactLabel}>Recyclable</Text>
            <Text style={styles.impactValue}>{product.recyclable ? "Yes" : "No"}</Text>
          </View>
          
          <View style={styles.impactItem}>
            <MaterialIcons 
              name={product.biodegradable ? "check-circle" : "cancel"} 
              size={24} 
              color={product.biodegradable ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.impactLabel}>Biodegradable</Text>
            <Text style={styles.impactValue}>{product.biodegradable ? "Yes" : "No"}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>{product.category}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Packaging:</Text>
          <Text style={styles.detailValue}>{product.packaging}</Text>
        </View>
        
        {product.price && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>${product.price.toFixed(2)}</Text>
          </View>
        )}
        
        {product.availability && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Availability:</Text>
            <Text style={styles.detailValue}>{product.availability}</Text>
          </View>
        )}
      </View>
      
      {product.ingredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {product.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredientItem}>• {ingredient}</Text>
          ))}
        </View>
      )}
      
      {product.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.certificationsContainer}>
            {product.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationChip}>
                <MaterialIcons name="verified" size={16} color="#4CAF50" />
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {!feedbackSubmitted && (
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Was this recommendation helpful?</Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity 
              style={[styles.feedbackButton, styles.helpfulButton]}
              onPress={() => handleFeedback(true)}
            >
              <MaterialIcons name="thumb-up" size={20} color="white" />
              <Text style={styles.feedbackButtonText}>Yes, Helpful</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.feedbackButton, styles.notHelpfulButton]}
              onPress={() => handleFeedback(false)}
            >
              <MaterialIcons name="thumb-down" size={20} color="white" />
              <Text style={styles.feedbackButtonText}>Not Helpful</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.purchaseButton}
            onPress={() => handleFeedback(true, true)}
          >
            <MaterialIcons name="shopping-cart" size={20} color="white" />
            <Text style={styles.purchaseButtonText}>I'll Buy This Instead</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  productHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  scoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  improvementCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  improvementIcon: {
    marginRight: 12,
  },
  improvementInfo: {
    flex: 1,
  },
  improvementValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  improvementReason: {
    fontSize: 14,
    color: '#757575',
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  impactItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  impactLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  ingredientItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certificationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  certificationText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
  },
  feedbackSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  helpfulButton: {
    backgroundColor: '#4CAF50',
  },
  notHelpfulButton: {
    backgroundColor: '#F44336',
  },
  feedbackButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  purchaseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AlternativeDetailsScreen;
