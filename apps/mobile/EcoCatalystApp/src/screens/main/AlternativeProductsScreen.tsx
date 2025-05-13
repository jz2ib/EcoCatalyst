import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProducts } from '../../contexts/products/ProductsContext';
import AlternativeProductCard from '../../components/alternatives/AlternativeProductCard';
import { RecommendationCriteria } from '../../services/api/productAlternatives';

type AlternativeProductsRouteParams = {
  productId: string;
  productName: string;
};

const AlternativeProductsScreen: React.FC = () => {
  const route = useRoute<RouteProp<Record<string, AlternativeProductsRouteParams>, string>>();
  const navigation = useNavigation();
  const { productId, productName } = route.params;
  
  const { 
    getAlternativesForProduct, 
    getProductById,
    isLoading, 
    error 
  } = useProducts();
  
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [originalProduct, setOriginalProduct] = useState<any>(null);
  const [filterCriteria, setFilterCriteria] = useState<RecommendationCriteria>({
    minSustainabilityScore: 60,
    preferRecyclable: true,
    preferBiodegradable: true
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const product = await getProductById(productId);
        if (product) {
          setOriginalProduct(product);
          
          const alternativeProducts = await getAlternativesForProduct(productId, filterCriteria);
          setAlternatives(alternativeProducts);
        }
      } catch (err) {
        console.error('Error loading alternatives:', err);
      }
    };
    
    loadData();
  }, [productId, filterCriteria]);
  
  const handleSelectAlternative = (alternative: any) => {
    navigation.navigate('AlternativeDetails', {
      alternativeId: alternative.id,
      originalProductId: productId,
      alternative: alternative
    });
  };
  
  const handleFilterChange = (newCriteria: Partial<RecommendationCriteria>) => {
    setFilterCriteria(prev => ({
      ...prev,
      ...newCriteria
    }));
  };
  
  const renderFilterChip = (
    label: string, 
    value: boolean | undefined, 
    criteriaKey: keyof RecommendationCriteria
  ) => (
    <TouchableOpacity
      style={[styles.filterChip, value ? styles.activeFilterChip : {}]}
      onPress={() => handleFilterChange({ [criteriaKey]: !value })}
    >
      <Text style={[styles.filterChipText, value ? styles.activeFilterChipText : {}]}>
        {label}
      </Text>
      {value && <MaterialIcons name="check" size={16} color="white" style={styles.checkIcon} />}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Eco-Friendly Alternatives</Text>
        <Text style={styles.subtitle}>for {productName}</Text>
      </View>
      
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by:</Text>
        <View style={styles.chipContainer}>
          {renderFilterChip('High Eco-Score', filterCriteria.minSustainabilityScore === 60, 'minSustainabilityScore')}
          {renderFilterChip('Recyclable', filterCriteria.preferRecyclable, 'preferRecyclable')}
          {renderFilterChip('Biodegradable', filterCriteria.preferBiodegradable, 'preferBiodegradable')}
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding eco-friendly alternatives...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : alternatives.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="eco" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>No eco-friendly alternatives found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters or check back later</Text>
        </View>
      ) : (
        <FlatList
          data={alternatives}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlternativeProductCard
              alternative={item}
              onSelect={handleSelectAlternative}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 14,
    color: '#757575',
  },
  activeFilterChipText: {
    color: 'white',
  },
  checkIcon: {
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
});

export default AlternativeProductsScreen;
