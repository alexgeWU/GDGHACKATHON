import axios from 'axios';
import { calculatePriceInfo, formatPriceInfo } from '../utils/priceCalculator';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface StoreItem {
  name: string;
  price: number;
  store: string;
  priceInfo?: {
    totalPrice: number;
    unitPrice: number | null;
    quantity: number;
    unit: string;
  };
}

interface StoreResult {
  store: string;
  distance_miles: number;
  duration: string;
  items: { [key: string]: StoreItem };
}

interface GoogleStore {
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating: number;
  place_id: string;
}

interface ScrapedProduct {
  name: string;
  price: string;
  store: string;
  unitPrice: string;
  link: string;
  image: string;
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const API_BASE_URL = 'http://localhost:3000/api/maps';

export const searchStores = async (ingredients: string[], location: string) => {
  try {
    // First, get nearby stores
    const storesResponse = await axios.get(`${API_BASE_URL}/places`, {
      params: {
        location,
        radius: 5000
      }
    });

    const stores = storesResponse.data.results.map((store: GoogleStore) => ({
      name: store.name,
      address: store.vicinity,
      location: store.geometry.location,
      rating: store.rating,
      place_id: store.place_id
    }));

    // Then get product prices for each ingredient
    const productPrices = await Promise.all(
      ingredients.map(async (ingredient) => {
        const response = await axios.get(`${API_BASE_URL}/scrape`, {
          params: {
            query: ingredient,
            location
          }
        });
        return {
          ingredient,
          products: response.data as ScrapedProduct[]
        };
      })
    );

    // Format the results
    const results = stores.map((store: GoogleStore) => {
      const items: { [key: string]: StoreItem } = {};
      
      productPrices.forEach(({ ingredient, products }) => {
        const product = products.find((p: ScrapedProduct) => p.store === store.name);
        if (product) {
          const priceInfo = calculatePriceInfo(product.name, parseFloat(product.price));
          if (priceInfo) {
            items[ingredient] = {
              name: product.name,
              price: parseFloat(product.price),
              store: product.store,
              priceInfo
            };
          }
        }
      });

      return {
        store: store.name,
        distance_miles: 0, // Will be updated with actual distance
        duration: 'N/A',
        items
      };
    });

    // Get actual distances
    const distances = await axios.post(`${API_BASE_URL}/routes`, {
      origin: location,
      destinations: stores.map((store: GoogleStore) => store.vicinity)
    });

    // Update results with actual distances
    return results.map((result: StoreResult, index: number) => ({
      ...result,
      distance_miles: distances.data[index].distance_miles,
      duration: distances.data[index].duration
    }));
  } catch (error) {
    console.error('Error searching stores:', error);
    throw error;
  }
};

export const analyzeShoppingOptions = async (storeResults: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze these grocery store options and provide a shopping recommendation:
    ${JSON.stringify(storeResults, null, 2)}
    
    Consider:
    1. Price differences
    2. Distance to stores
    3. Overall value
    4. Shopping convenience
    
    Provide a concise recommendation on where to shop and why.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing shopping options:', error);
    return "Unable to generate shopping recommendation at this time.";
  }
};

export function formatForGemini(results: StoreResult[]): string {
  let prompt = `Analyze these grocery shopping options and provide a detailed recommendation. 
For each item, the price information includes:
- Total price for the package
- Price per unit (e.g., per ounce, per pound)
- Quantity and unit of measurement

Here are the available items and their prices at different stores:\n\n`;

  results.forEach(store => {
    prompt += `Store: ${store.store} (${store.distance_miles} miles away)\n`;
    prompt += 'Items:\n';
    
    Object.entries(store.items).forEach(([itemName, item]) => {
      if (item.priceInfo) {
        prompt += `- ${itemName}: ${formatPriceInfo(item.priceInfo)}\n`;
      }
    });
    
    prompt += '\n';
  });

  prompt += `\nPlease analyze these options and provide a detailed shopping recommendation that considers:
1. Price per unit comparison between stores for each item
2. Total cost including driving distance
3. Whether bulk purchases would be more cost-effective
4. Any notable price differences between stores
5. The most cost-effective combination of stores to visit

Format your response with:
- A clear recommendation of which store(s) to visit
- Specific items to buy at each store
- Total estimated cost including driving
- Any bulk purchase recommendations
- Any notable savings opportunities`;

  return prompt;
} 