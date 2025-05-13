import axios from 'axios';
import { OpenFoodFactsProduct } from './openFoodFacts';

export interface AlternativeProduct {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  sustainabilityScore: number;
  carbonFootprint: number;
  waterUsage: number;
  recyclable: boolean;
  biodegradable: boolean;
  packaging: string;
  ingredients: string[];
  certifications: string[];
  imageUrl?: string;
  price?: number;
  availability?: string;
  similarityScore?: number;
}

export interface RecommendationCriteria {
  minSustainabilityScore?: number;
  preferredBrands?: string[];
  preferredCertifications?: string[];
  maxPrice?: number;
  excludeIngredients?: string[];
  preferRecyclable?: boolean;
  preferBiodegradable?: boolean;
}

export const getAlternativeProducts = async (
  productId: string,
  barcode: string,
  category: string,
  criteria?: RecommendationCriteria
): Promise<AlternativeProduct[]> => {
  try {
    
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v2/search?categories_tags=${encodeURIComponent(category)}&sort_by=ecoscore_score&fields=code,product_name,brands,categories,image_url,ecoscore_grade,ecoscore_score,labels,packaging,ingredients,nutriments&page_size=10`
    );
    
    if (response.data.count === 0) {
      return [];
    }
    
    const alternatives: AlternativeProduct[] = response.data.products
      .filter((product: any) => product.code !== barcode) // Exclude the original product
      .map((product: any) => {
        const similarityScore = Math.random() * 100; // Placeholder
        
        if (
          criteria?.minSustainabilityScore && 
          (!product.ecoscore_score || product.ecoscore_score < criteria.minSustainabilityScore)
        ) {
          return null;
        }
        
        if (
          criteria?.preferredBrands?.length && 
          !criteria.preferredBrands.some(brand => 
            product.brands?.toLowerCase().includes(brand.toLowerCase())
          )
        ) {
          similarityScore * 0.8;
        }
        
        return {
          id: `alt_${product.code}`,
          barcode: product.code,
          name: product.product_name || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          category: product.categories || category,
          sustainabilityScore: product.ecoscore_score || 50,
          carbonFootprint: Math.floor(Math.random() * 10) + 1, // Placeholder
          waterUsage: Math.floor(Math.random() * 1000) + 100, // Placeholder
          recyclable: product.packaging?.toLowerCase().includes('recyclable') || false,
          biodegradable: product.packaging?.toLowerCase().includes('biodegradable') || false,
          packaging: product.packaging || 'Unknown',
          ingredients: product.ingredients_text ? product.ingredients_text.split(',').map((i: string) => i.trim()) : [],
          certifications: product.labels ? product.labels.split(',').map((l: string) => l.trim()) : [],
          imageUrl: product.image_url,
          price: Math.floor(Math.random() * 10) + 1, // Placeholder
          availability: Math.random() > 0.3 ? 'In Stock' : 'Limited Availability', // Placeholder
          similarityScore
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a: AlternativeProduct, b: AlternativeProduct) => 
        b.sustainabilityScore - a.sustainabilityScore
      );
    
    return alternatives;
  } catch (error) {
    console.error('Error fetching alternative products:', error);
    return [];
  }
};

export const submitRecommendationFeedback = async (
  productId: string,
  alternativeId: string,
  feedback: {
    helpful: boolean;
    reason?: string;
    purchased?: boolean;
  }
): Promise<boolean> => {
  try {
    console.log('Recommendation feedback:', {
      productId,
      alternativeId,
      feedback
    });
    
    return true;
  } catch (error) {
    console.error('Error submitting recommendation feedback:', error);
    return false;
  }
};

export const getUserPreferences = async (): Promise<RecommendationCriteria> => {
  return {
    minSustainabilityScore: 60,
    preferredBrands: [],
    preferredCertifications: ['organic', 'fair trade'],
    maxPrice: 0, // No limit
    excludeIngredients: [],
    preferRecyclable: true,
    preferBiodegradable: true
  };
};

export const updateUserPreferences = async (
  preferences: RecommendationCriteria
): Promise<boolean> => {
  try {
    console.log('Updated user preferences:', preferences);
    
    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
};
