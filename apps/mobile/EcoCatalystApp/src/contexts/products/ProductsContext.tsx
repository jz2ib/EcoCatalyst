import React, { createContext, useState, useEffect, useContext } from 'react';
import { database } from '../../services/firebase';
import { ref, onValue, set, push, remove, get, query, orderByChild, limitToLast, equalTo } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../AuthContext';
import { getProductByBarcode as fetchProductFromAPI, calculateSustainabilityScore, OpenFoodFactsProduct } from '../../services/api/openFoodFacts';
import { getAlternativeProducts, submitRecommendationFeedback, RecommendationCriteria, AlternativeProduct as ApiAlternativeProduct } from '../../services/api/productAlternatives';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  sustainabilityScore: number; // 0-100
  carbonFootprint: number; // in kg CO2e
  waterUsage: number; // in liters
  recyclable: boolean;
  biodegradable: boolean;
  packaging: string;
  ingredients: string[];
  certifications: string[];
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProductScan {
  id: string;
  productId: string;
  userId: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface AlternativeProduct {
  id: string;
  originalProductId: string;
  alternativeProductId: string;
  sustainabilityImprovement: number; // percentage improvement
  reason: string;
  product?: ApiAlternativeProduct; // The actual alternative product data
}

interface ProductsContextType {
  products: Product[];
  recentScans: ProductScan[];
  alternativeProducts: Record<string, AlternativeProduct[]>;
  isLoading: boolean;
  error: string | null;
  scanProduct: (barcode: string) => Promise<Product | null>;
  getProductById: (id: string) => Promise<Product | null>;
  getProductByBarcode: (barcode: string) => Promise<Product | null>;
  getAlternativesForProduct: (productId: string, criteria?: RecommendationCriteria) => Promise<AlternativeProduct[]>;
  submitAlternativeFeedback: (productId: string, alternativeId: string, feedback: { helpful: boolean; reason?: string; purchased?: boolean }) => Promise<boolean>;
  addProductScan: (productId: string, location?: { latitude: number; longitude: number }) => Promise<void>;
  clearRecentScans: () => Promise<void>;
  clearError: () => void;
}

const RECENT_SCANS_STORAGE_KEY = 'ecocatalyst_recent_scans';
const PRODUCTS_STORAGE_KEY = 'ecocatalyst_cached_products';

export const ProductsContext = createContext<ProductsContextType>({
  products: [],
  recentScans: [],
  alternativeProducts: {},
  isLoading: true,
  error: null,
  scanProduct: async () => null,
  getProductById: async () => null,
  getProductByBarcode: async () => null,
  getAlternativesForProduct: async () => [],
  submitAlternativeFeedback: async () => false,
  addProductScan: async () => {},
  clearRecentScans: async () => {},
  clearError: () => {},
});

export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentScans, setRecentScans] = useState<ProductScan[]>([]);
  const [alternativeProducts, setAlternativeProducts] = useState<Record<string, AlternativeProduct[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedProducts = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (cachedProducts) {
          setProducts(JSON.parse(cachedProducts));
        }
        
        const cachedScans = await AsyncStorage.getItem(RECENT_SCANS_STORAGE_KEY);
        if (cachedScans) {
          setRecentScans(JSON.parse(cachedScans));
        }
      } catch (error) {
        console.error('Failed to load cached product data:', error);
      }
    };
    
    loadCachedData();
  }, []);
  
  useEffect(() => {
    setIsLoading(true);
    
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const productsList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          setProducts(productsList);
          
          AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsList))
            .catch(err => console.error('Failed to cache products:', err));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products. Please try again later.');
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Database error:', error);
      setError('Database connection error. Please check your internet connection.');
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!user) return;
    
    const userScansRef = query(
      ref(database, `userScans/${user.uid}`),
      orderByChild('timestamp'),
      limitToLast(10)
    );
    
    const unsubscribe = onValue(userScansRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const scansList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          scansList.sort((a, b) => b.timestamp - a.timestamp);
          
          setRecentScans(scansList);
          
          AsyncStorage.setItem(RECENT_SCANS_STORAGE_KEY, JSON.stringify(scansList))
            .catch(err => console.error('Failed to cache recent scans:', err));
        }
      } catch (error) {
        console.error('Error fetching user scans:', error);
      }
    });
    
    return () => unsubscribe();
  }, [user]);
  
  const scanProduct = async (barcode: string): Promise<Product | null> => {
    try {
      setIsLoading(true);
      
      let product = products.find(p => p.barcode === barcode) || null;
      
      if (!product) {
        const productQuery = query(
          ref(database, 'products'),
          orderByChild('barcode'),
          equalTo(barcode)
        );
        
        const snapshot = await get(productQuery);
        const data = snapshot.val();
        
        if (data) {
          const key = Object.keys(data)[0];
          product = {
            id: key,
            ...data[key]
          };
        } else {
          const openFoodFactsProduct = await fetchProductFromAPI(barcode);
          
          if (openFoodFactsProduct) {
            const sustainabilityData = calculateSustainabilityScore(openFoodFactsProduct);
            
            const newProduct: Omit<Product, 'id'> = {
              barcode: openFoodFactsProduct.code,
              name: openFoodFactsProduct.product.product_name || 'Unknown Product',
              brand: openFoodFactsProduct.product.brands || 'Unknown Brand',
              category: openFoodFactsProduct.product.categories || 'Grocery',
              sustainabilityScore: sustainabilityData.score,
              carbonFootprint: sustainabilityData.carbonFootprint,
              waterUsage: sustainabilityData.waterUsage,
              recyclable: sustainabilityData.recyclable,
              biodegradable: sustainabilityData.biodegradable,
              packaging: sustainabilityData.packaging,
              ingredients: sustainabilityData.ingredients,
              certifications: sustainabilityData.certifications,
              imageUrl: openFoodFactsProduct.product.image_url,
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            
            if (user) {
              const newProductRef = push(ref(database, 'products'));
              await set(newProductRef, newProduct);
              product = { id: newProductRef.key!, ...newProduct };
            } else {
              product = { id: `local_${Date.now()}`, ...newProduct };
            }
          }
        }
        
        if (product) {
          setProducts(prev => {
            const updated = [...prev];
            const index = updated.findIndex(p => p.id === product!.id);
            if (index >= 0) {
              updated[index] = product!;
            } else {
              updated.push(product!);
            }
            return updated;
          });
        }
      }
      
      return product;
    } catch (error) {
      console.error('Error scanning product:', error);
      setError('Failed to scan product. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getProductById = async (id: string): Promise<Product | null> => {
    try {
      let product = products.find(p => p.id === id) || null;
      
      if (!product) {
        const productRef = ref(database, `products/${id}`);
        const snapshot = await get(productRef);
        const data = snapshot.val();
        
        if (data) {
          product = {
            id,
            ...data
          };
          
          setProducts(prev => {
            const updated = [...prev];
            const index = updated.findIndex(p => p.id === id);
            if (index >= 0) {
              updated[index] = product!;
            } else {
              updated.push(product!);
            }
            return updated;
          });
        }
      }
      
      return product;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      setError('Failed to get product details. Please try again.');
      return null;
    }
  };
  
  const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
    try {
      let product = products.find(p => p.barcode === barcode) || null;
      
      if (!product) {
        const productQuery = query(
          ref(database, 'products'),
          orderByChild('barcode'),
          equalTo(barcode)
        );
        
        const snapshot = await get(productQuery);
        const data = snapshot.val();
        
        if (data) {
          const key = Object.keys(data)[0];
          product = {
            id: key,
            ...data[key]
          };
          
          setProducts(prev => {
            const updated = [...prev];
            const index = updated.findIndex(p => p.id === product!.id);
            if (index >= 0) {
              updated[index] = product!;
            } else {
              updated.push(product!);
            }
            return updated;
          });
        }
      }
      
      return product;
    } catch (error) {
      console.error('Error getting product by barcode:', error);
      setError('Failed to get product details. Please try again.');
      return null;
    }
  };
  
  const getAlternativesForProduct = async (productId: string, criteria?: RecommendationCriteria): Promise<AlternativeProduct[]> => {
    try {
      if (alternativeProducts[productId]) {
        return alternativeProducts[productId];
      }
      
      // Check Firebase for stored alternatives
      const alternativesRef = ref(database, `alternatives/${productId}`);
      const snapshot = await get(alternativesRef);
      const data = snapshot.val();
      
      if (data) {
        const alternatives = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        setAlternativeProducts(prev => ({
          ...prev,
          [productId]: alternatives
        }));
        
        return alternatives;
      }
      
      const product = await getProductById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      const apiAlternatives = await getAlternativeProducts(
        productId,
        product.barcode,
        product.category,
        criteria
      );
      
      if (apiAlternatives.length > 0) {
        const alternatives: AlternativeProduct[] = apiAlternatives.map(alt => {
          const improvementPercentage = 
            ((alt.sustainabilityScore - product.sustainabilityScore) / product.sustainabilityScore) * 100;
          
          return {
            id: alt.id,
            originalProductId: productId,
            alternativeProductId: alt.id,
            sustainabilityImprovement: Math.max(0, improvementPercentage), // Ensure positive value
            reason: getImprovementReason(product, alt),
            product: alt
          };
        });
        
        const betterAlternatives = alternatives.filter(
          alt => alt.sustainabilityImprovement > 0
        );
        
        if (user && betterAlternatives.length > 0) {
          const alternativesRef = ref(database, `alternatives/${productId}`);
          
          const alternativesData = betterAlternatives.reduce((acc, alt) => {
            const { product, ...altWithoutProduct } = alt;
            acc[alt.id] = altWithoutProduct;
            return acc;
          }, {} as Record<string, Omit<AlternativeProduct, 'product'>>);
          
          await set(alternativesRef, alternativesData);
        }
        
        setAlternativeProducts(prev => ({
          ...prev,
          [productId]: betterAlternatives
        }));
        
        return betterAlternatives;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting alternative products:', error);
      setError('Failed to get eco-friendly alternatives. Please try again.');
      return [];
    }
  };
  
  const getImprovementReason = (
    originalProduct: Product, 
    alternativeProduct: ApiAlternativeProduct
  ): string => {
    const reasons: string[] = [];
    
    if (alternativeProduct.sustainabilityScore > originalProduct.sustainabilityScore) {
      reasons.push(`${Math.round(alternativeProduct.sustainabilityScore - originalProduct.sustainabilityScore)} points higher sustainability score`);
    }
    
    if (alternativeProduct.recyclable && !originalProduct.recyclable) {
      reasons.push('recyclable packaging');
    }
    
    if (alternativeProduct.biodegradable && !originalProduct.biodegradable) {
      reasons.push('biodegradable materials');
    }
    
    if (alternativeProduct.carbonFootprint < originalProduct.carbonFootprint) {
      reasons.push(`${Math.round((1 - alternativeProduct.carbonFootprint / originalProduct.carbonFootprint) * 100)}% lower carbon footprint`);
    }
    
    if (alternativeProduct.waterUsage < originalProduct.waterUsage) {
      reasons.push(`${Math.round((1 - alternativeProduct.waterUsage / originalProduct.waterUsage) * 100)}% less water usage`);
    }
    
    if (alternativeProduct.certifications.length > originalProduct.certifications.length) {
      const uniqueCertifications = alternativeProduct.certifications.filter(
        cert => !originalProduct.certifications.includes(cert)
      );
      
      if (uniqueCertifications.length > 0) {
        reasons.push(`additional certifications: ${uniqueCertifications.join(', ')}`);
      }
    }
    
    return reasons.length > 0 
      ? `Better alternative with ${reasons.join(', ')}`
      : 'More sustainable alternative';
  };
  
  const addProductScan = async (productId: string, location?: { latitude: number; longitude: number }): Promise<void> => {
    try {
      if (!user) {
        const newScan: ProductScan = {
          id: `local_${Date.now()}`,
          productId,
          userId: 'anonymous',
          timestamp: Date.now(),
          location
        };
        
        const updatedScans = [newScan, ...recentScans.slice(0, 9)];
        setRecentScans(updatedScans);
        
        await AsyncStorage.setItem(RECENT_SCANS_STORAGE_KEY, JSON.stringify(updatedScans));
        return;
      }
      
      const userScansRef = ref(database, `userScans/${user.uid}`);
      const newScanRef = push(userScansRef);
      
      const scanData: Omit<ProductScan, 'id'> = {
        productId,
        userId: user.uid,
        timestamp: Date.now(),
        location
      };
      
      await set(newScanRef, scanData);
    } catch (error) {
      console.error('Error adding product scan:', error);
      setError('Failed to save scan. Please try again.');
    }
  };
  
  const clearRecentScans = async (): Promise<void> => {
    try {
      setRecentScans([]);
      await AsyncStorage.removeItem(RECENT_SCANS_STORAGE_KEY);
      
      if (user) {
        const userScansRef = ref(database, `userScans/${user.uid}`);
        await remove(userScansRef);
      }
    } catch (error) {
      console.error('Error clearing recent scans:', error);
      setError('Failed to clear scan history. Please try again.');
    }
  };
  
  const clearError = () => {
    setError(null);
  };
  
  const submitAlternativeFeedback = async (
    productId: string, 
    alternativeId: string, 
    feedback: { helpful: boolean; reason?: string; purchased?: boolean }
  ): Promise<boolean> => {
    try {
      const result = await submitRecommendationFeedback(productId, alternativeId, feedback);
      
      if (user && result) {
        const feedbackRef = ref(database, `feedback/${user.uid}/${productId}/${alternativeId}`);
        await set(feedbackRef, {
          ...feedback,
          timestamp: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting alternative feedback:', error);
      setError('Failed to submit feedback. Please try again.');
      return false;
    }
  };
  
  const value = {
    products,
    recentScans,
    alternativeProducts,
    isLoading,
    error,
    scanProduct,
    getProductById,
    getProductByBarcode,
    getAlternativesForProduct,
    submitAlternativeFeedback,
    addProductScan,
    clearRecentScans,
    clearError,
  };
  
  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};
