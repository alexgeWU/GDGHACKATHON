import axios from 'axios';
import { rateLimiter } from '../utils/rateLimiter';

interface Store {
  name: string;
  vicinity: string;
  location: string;
  rating: number;
  place_id: string;
}

interface RouteInfo {
  store: Store;
  distance: number;
  duration: string;
}

interface OptimizationResponse {
  recommendation: string;
  shoppingList: any[];
  ingredientsHave: any[];
  costBreakdown: {
    stores: any[];
    summary: {
      totalCost: string;
      budgetComparison: string;
      savingsTips: string[];
    };
  };
  shoppingStrategy: {
    routes: any[];
    tips: string[];
  };
  recipeModifications: {
    recipes: any[];
    generalTips: string[];
  };
  ingredientSubstitutions: {
    substitutions: any[];
    generalTips: string[];
  };
  recipes: any[];
}

interface Recipe {
  name: string;
  ingredients: {
    name: string;
    quantity: string;
    checked: boolean;
  }[];
  seasonings: {
    name: string;
    checked: boolean;
  }[];
  instructions: string;
  servings: number;
  desiredServings: number;
}

const API_BASE_URL = 'http://localhost:3000/api/maps';

export const searchStores = async (ingredients: string[], location: string) => {
  if (!rateLimiter.checkLimit('storeSearch')) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/places`, {
      params: {
        location,
        radius: 5000
      }
    });
    return response.data.results.map((store: Store) => ({
      name: store.name,
      location: `${store.vicinity}`,
      rating: store.rating,
      place_id: store.place_id
    }));
  } catch (error) {
    console.error('Error searching stores:', error);
    throw error;
  }
};

export const calculateGasCost = async (location: string, stores: Store[]): Promise<RouteInfo[]> => {
  if (!rateLimiter.checkLimit('routeCalculation')) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/routes`, {
      origin: location,
      destinations: stores.map(store => store.location)
    });
    
    return stores.map((store, index) => ({
      store,
      distance: response.data[index].distance_miles,
      duration: response.data[index].duration
    }));
  } catch (error) {
    console.error('Error calculating routes:', error);
    throw error;
  }
};

export const analyzeShoppingOptions = async (storeResults: any[]) => {
  if (!rateLimiter.checkLimit('shoppingAnalysis')) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze-shopping`, { storeResults });
    return response.data.recommendation;
  } catch (error) {
    console.error('Error analyzing shopping options:', error);
    throw error;
  }
};

export const optimizeMealPlan = async (recipes: any[], location: string, budget: number) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize`, {
      recipes,
      location,
      budget
    });
    return response.data;
  } catch (error) {
    console.error('Error optimizing meal plan:', error);
    throw error;
  }
}; 