import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Product } from '../../contexts/products/ProductsContext';
import { MaterialIcons } from '@expo/vector-icons';

interface ScanResultModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onViewAlternatives: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#8BC34A'; // Light Green
  if (score >= 40) return '#FFEB3B'; // Yellow
  if (score >= 20) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

const ScanResultModal: React.FC<ScanResultModalProps> = ({ 
  visible, 
  product, 
  onClose, 
  onViewAlternatives 
}) => {
  if (!product) return null;
  
  const scoreColor = getScoreColor(product.sustainabilityScore);
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.productName}>{product.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            {product.imageUrl && (
              <Image 
                source={{ uri: product.imageUrl }} 
                style={styles.productImage} 
                resizeMode="contain" 
              />
            )}
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Sustainability Score</Text>
              <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>
                  {product.sustainabilityScore}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Product Information</Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Brand: </Text>
                <Text>{product.brand}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Category: </Text>
                <Text>{product.category}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Barcode: </Text>
                <Text>{product.barcode}</Text>
              </Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Environmental Impact</Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Carbon Footprint: </Text>
                <Text>{product.carbonFootprint} kg CO₂e</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Water Usage: </Text>
                <Text>{product.waterUsage} liters</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Recyclable: </Text>
                <Text>{product.recyclable ? 'Yes' : 'No'}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Biodegradable: </Text>
                <Text>{product.biodegradable ? 'Yes' : 'No'}</Text>
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Packaging: </Text>
                <Text>{product.packaging}</Text>
              </Text>
            </View>
            
            {product.ingredients.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                {product.ingredients.map((ingredient, index) => (
                  <Text key={index} style={styles.ingredient}>• {ingredient}</Text>
                ))}
              </View>
            )}
            
            {product.certifications.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Certifications</Text>
                {product.certifications.map((certification, index) => (
                  <Text key={index} style={styles.certification}>• {certification}</Text>
                ))}
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.alternativesButton}
            onPress={onViewAlternatives}
          >
            <Text style={styles.alternativesButtonText}>View Eco-Friendly Alternatives</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  ingredient: {
    marginBottom: 5,
  },
  certification: {
    marginBottom: 5,
  },
  alternativesButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  alternativesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanResultModal;
