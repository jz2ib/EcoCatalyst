import axios from 'axios';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

export interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name: string;
    brands: string;
    categories: string;
    image_url: string;
    ingredients_text: string;
    nutriments: Record<string, any>;
    packaging: string;
    ecoscore_grade?: string;
    ecoscore_score?: number;
    labels?: string;
    ingredients: Array<{
      id: string;
      text: string;
      vegan?: string;
      vegetarian?: string;
      percent_estimate?: number;
    }>;
  };
}

export interface SustainabilityData {
  score: number; // 0-100
  carbonFootprint: number;
  waterUsage: number;
  recyclable: boolean;
  biodegradable: boolean;
  packaging: string;
  ingredients: string[];
  certifications: string[];
}

export const getProductByBarcode = async (barcode: string): Promise<OpenFoodFactsProduct | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/product/${barcode}.json`);
    if (response.data.status === 1) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product data:', error);
    return null;
  }
};

export const calculateSustainabilityScore = (product: OpenFoodFactsProduct): SustainabilityData => {
  const defaultData: SustainabilityData = {
    score: 50,
    carbonFootprint: 0,
    waterUsage: 0,
    recyclable: false,
    biodegradable: false,
    packaging: product.product.packaging || 'Unknown',
    ingredients: product.product.ingredients?.map(i => i.text) || [],
    certifications: product.product.labels?.split(',').map(l => l.trim()) || [],
  };
  
  if (product.product.ecoscore_score) {
    defaultData.score = product.product.ecoscore_score;
  } else {
    let score = 50; // Start with neutral score
    
    if (product.product.labels && 
        (product.product.labels.toLowerCase().includes('organic') || 
         product.product.labels.toLowerCase().includes('bio'))) {
      score += 15;
    }
    
    if (product.product.packaging) {
      const packaging = product.product.packaging.toLowerCase();
      if (packaging.includes('plastic')) {
        score -= 10;
        defaultData.recyclable = packaging.includes('recyclable');
      } else if (packaging.includes('paper') || packaging.includes('cardboard')) {
        score += 10;
        defaultData.recyclable = true;
        defaultData.biodegradable = true;
      } else if (packaging.includes('glass')) {
        score += 5;
        defaultData.recyclable = true;
      }
    }
    
    defaultData.score = Math.max(0, Math.min(100, score));
  }
  
  if (product.product.categories) {
    const categories = product.product.categories.toLowerCase();
    
    if (categories.includes('meat')) {
      defaultData.carbonFootprint = 15;
      defaultData.waterUsage = 4000;
    } else if (categories.includes('dairy')) {
      defaultData.carbonFootprint = 6;
      defaultData.waterUsage = 1000;
    } else if (categories.includes('vegetables') || categories.includes('fruits')) {
      defaultData.carbonFootprint = 2;
      defaultData.waterUsage = 300;
    } else if (categories.includes('beverage')) {
      defaultData.carbonFootprint = 3;
      defaultData.waterUsage = 500;
    }
  }
  
  return defaultData;
};
