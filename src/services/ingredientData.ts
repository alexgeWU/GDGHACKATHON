import axios from 'axios';
import { rateLimiter } from '../utils/rateLimiter';

interface StoreData {
  name: string;
  price: number;
  unit: string;
}

interface PackageData {
  size: number;
  unit: string;
  price: number;
}

interface IngredientData {
  name: string;
  averagePrice: number;
  unit: string;
  commonPackages: PackageData[];
  substitutes: string[];
  stores: StoreData[];
}

interface CachedIngredientData extends IngredientData {
  timestamp: number;
}

class IngredientDataService {
  private cache: Map<string, CachedIngredientData>;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.cache = new Map();
  }

  private async scrapeIngredientData(ingredientName: string): Promise<IngredientData> {
    if (!rateLimiter.checkLimit('ingredientScrape')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      // Scrape data from various sources
      const [walmartData, targetData, krogerData] = await Promise.all([
        this.scrapeWalmart(ingredientName),
        this.scrapeTarget(ingredientName),
        this.scrapeKroger(ingredientName)
      ]);

      // Combine and process data
      const stores: StoreData[] = [
        ...walmartData,
        ...targetData,
        ...krogerData
      ];

      const averagePrice = stores.reduce((sum, store) => sum + store.price, 0) / stores.length;

      const data: IngredientData = {
        name: ingredientName,
        averagePrice,
        unit: stores[0]?.unit || 'unit',
        commonPackages: this.calculateCommonPackages(stores),
        substitutes: await this.getSubstitutes(ingredientName),
        stores
      };

      // Cache the data
      this.cache.set(ingredientName, {
        ...data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error scraping data for ${ingredientName}:`, error);
      throw error;
    }
  }

  private async scrapeWalmart(ingredientName: string): Promise<StoreData[]> {
    // Implement Walmart scraping logic
    return [];
  }

  private async scrapeTarget(ingredientName: string): Promise<StoreData[]> {
    // Implement Target scraping logic
    return [];
  }

  private async scrapeKroger(ingredientName: string): Promise<StoreData[]> {
    // Implement Kroger scraping logic
    return [];
  }

  private calculateCommonPackages(stores: StoreData[]): PackageData[] {
    // Implement package size calculation logic
    return [];
  }

  private async getSubstitutes(ingredientName: string): Promise<string[]> {
    // Implement substitute finding logic
    return [];
  }

  public async getIngredientData(ingredientName: string): Promise<IngredientData> {
    const cachedData = this.cache.get(ingredientName);
    
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
      const { timestamp, ...data } = cachedData;
      return data;
    }

    return this.scrapeIngredientData(ingredientName);
  }

  public async getBulkIngredientData(ingredients: string[]): Promise<Map<string, IngredientData>> {
    const results = new Map<string, IngredientData>();
    
    await Promise.all(
      ingredients.map(async (ingredient) => {
        try {
          const data = await this.getIngredientData(ingredient);
          results.set(ingredient, data);
        } catch (error) {
          console.error(`Error getting data for ${ingredient}:`, error);
        }
      })
    );

    return results;
  }
}

export const ingredientDataService = new IngredientDataService(); 