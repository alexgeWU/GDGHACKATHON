import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

// Grocery store API endpoints (placeholder - replace with actual API endpoints)
const GROCERY_API_BASE_URL = 'https://api.grocery-stores.com/v1';

export const generateMealPlan = async (preferences: any) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Generate a meal plan for ${preferences.mealsPerDay} meals per day for ${preferences.daysPerWeek} days.
    Dietary restrictions: ${preferences.dietaryRestrictions || 'none'}
    Budget: ${preferences.budget}
    Please provide a detailed meal plan with ingredients and quantities.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
};

export const getStorePrices = async (location: string, ingredients: string[]) => {
  try {
    // This is a placeholder - replace with actual API calls to grocery store APIs
    const response = await axios.get(`${GROCERY_API_BASE_URL}/prices`, {
      params: {
        location,
        ingredients: ingredients.join(','),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching store prices:', error);
    throw error;
  }
};

export const calculateGasCost = async (location: string, stores: any[]) => {
  try {
    // This is a placeholder - replace with actual distance calculation API
    const response = await axios.get(`${GROCERY_API_BASE_URL}/distance`, {
      params: {
        origin: location,
        destinations: stores.map(store => store.location).join('|'),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating gas cost:', error);
    throw error;
  }
}; 