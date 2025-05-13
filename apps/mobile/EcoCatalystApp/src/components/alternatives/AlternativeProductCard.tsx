import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AlternativeProduct } from '../../contexts/products/ProductsContext';

interface AlternativeProductCardProps {
  alternative: AlternativeProduct;
  onSelect: (alternative: AlternativeProduct) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#8BC34A'; // Light Green
  if (score >= 40) return '#FFEB3B'; // Yellow
  if (score >= 20) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

const AlternativeProductCard: React.FC<AlternativeProductCardProps> = ({ 
  alternative, 
  onSelect 
}) => {
  if (!alternative.product) return null;
  
  const { product } = alternative;
  const scoreColor = getScoreColor(product.sustainabilityScore);
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onSelect(alternative)}
    >
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image 
            source={{ uri: product.imageUrl }} 
            style={styles.productImage} 
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="image" size={40} color="#CCCCCC" />
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.brandName} numberOfLines={1}>
          {product.brand}
        </Text>
        
        <View style={styles.scoreRow}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {Math.round(product.sustainabilityScore)}
            </Text>
          </View>
          
          <View style={styles.improvementContainer}>
            <Text style={styles.improvementLabel}>Improvement</Text>
            <Text style={styles.improvementValue}>
              +{Math.round(alternative.sustainabilityImprovement)}%
            </Text>
          </View>
        </View>
        
        <Text style={styles.reasonText} numberOfLines={2}>
          {alternative.reason}
        </Text>
      </View>
      
      <MaterialIcons name="chevron-right" size={24} color="#757575" style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  improvementContainer: {
    flexDirection: 'column',
  },
  improvementLabel: {
    fontSize: 12,
    color: '#757575',
  },
  improvementValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  reasonText: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  chevron: {
    alignSelf: 'center',
  },
});

export default AlternativeProductCard;
