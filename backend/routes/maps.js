import express from 'express';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'node:fs';
import mime from 'mime-types';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const router = express.Router();

// Initialize API keys
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error('GOOGLE_MAPS_API_KEY is not set in environment variables');
}

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Function to scrape Google Shopping
const scrapeGoogleShopping = async (query, location) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Set viewport to ensure we get desktop version
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Enable JavaScript
    await page.setJavaScriptEnabled(true);
    
    // Add random delay between requests
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Navigate to Google Shopping directly
    await page.goto(`https://shopping.google.com/search?q=${encodeURIComponent(query)}&near=${encodeURIComponent(location)}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the page to be fully loaded
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    }, { timeout: 10000 });

    // Wait for either shopping results or no results message
    try {
      await Promise.race([
        page.waitForSelector('.sh-dgr__content, .sh-dgr__grid-result, .sh-dgr__grid-result__content, .sh-dgr__grid-result__content-wrapper', { timeout: 10000 }),
        page.waitForSelector('.sh-dgr__no-results', { timeout: 10000 }),
        page.waitForSelector('#search', { timeout: 10000 }) // Main search container
      ]);
    } catch (error) {
      console.log(`No shopping results found for query: ${query}`);
      return [];
    }

    // Check if we got no results
    const noResults = await page.$('.sh-dgr__no-results');
    if (noResults) {
      console.log(`No results found for query: ${query}`);
      return [];
    }

    // Extract product information with multiple selector attempts
    const products = await page.evaluate(() => {
      const items = [];
      
      // Try multiple possible selectors for product containers
      const selectors = [
        '.sh-dgr__content',
        '.sh-dgr__grid-result',
        '.sh-dgr__grid-result__content',
        '.sh-dgr__grid-result__content-wrapper'
      ];
      
      let productElements = [];
      for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        if (elements.length > 0) {
          productElements = elements;
          break;
        }
      }

      productElements.forEach(element => {
        // Try multiple possible selectors for each field
        const name = element.querySelector('.tAxDx, .sh-dgr__content-title, .sh-dgr__grid-result__title, .sh-dgr__grid-result__title-link')?.textContent || '';
        const price = element.querySelector('.a8Pemb, .sh-dgr__grid-result__price, .sh-dgr__grid-result__price-value')?.textContent || '';
        const store = element.querySelector('.aULzUe, .sh-dgr__grid-result__merchant, .sh-dgr__grid-result__merchant-name')?.textContent || '';
        const link = element.querySelector('a')?.href || '';
        const image = element.querySelector('img')?.src || '';
        const unitPrice = element.querySelector('.a8Pemb, .sh-dgr__grid-result__price, .sh-dgr__grid-result__price-value')?.nextElementSibling?.textContent || '';
        
        if (name && price) {
          items.push({
            name,
            price: price.replace(/[^0-9.]/g, ''),
            unitPrice,
            store,
            link,
            image
          });
        }
      });

      return items;
    });

    // Filter out any items without prices and sort by price
    return products
      .filter(product => product.price)
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      .slice(0, 20); // Return top 20 cheapest options

  } catch (error) {
    console.error('Error scraping Google Shopping:', error);
    return [];
  } finally {
    await browser.close();
  }
};

// Function to find nearby stores using Google Maps
const findNearbyStores = async (location) => {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: location,
          radius: 5000,
          type: 'grocery_or_supermarket',
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );
    return response.data.results;
  } catch (error) {
    console.error('Error finding nearby stores:', error);
    return [];
  }
};

// Function to get product prices from nearby stores
const getProductPrices = async (ingredients, location) => {
  const stores = await findNearbyStores(location);
  if (stores.length === 0) return {};

  const productPrices = {};
  
  for (const ingredient of ingredients) {
    const products = await scrapeGoogleShopping(ingredient, location);
    productPrices[ingredient] = products;
  }

  return {
    stores,
    products: productPrices
  };
};

// Test endpoint for specific address
router.get('/test-address', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    console.log('Testing address:', address);

    // First, use Find Place API to get exact place details
    const findPlaceResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: address,
          inputtype: 'textquery',
          fields: 'formatted_address,geometry,name,place_id',
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );

    console.log('Find Place response:', findPlaceResponse.data);

    if (!findPlaceResponse.data.candidates || findPlaceResponse.data.candidates.length === 0) {
      throw new Error('No results found for address');
    }

    const place = findPlaceResponse.data.candidates[0];
    const location = place.geometry.location;
    console.log('Found place:', place);
    console.log('Location:', location);

    // Then search for nearby places
    const placesResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${location.lat},${location.lng}`,
          radius: 5000,
          type: 'supermarket',
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );

    console.log('Places response:', placesResponse.data);

    const stores = placesResponse.data.results.map(place => ({
      name: place.name,
      address: place.vicinity,
      location: place.geometry.location,
      rating: place.rating,
      userRatingCount: place.user_ratings_total,
      types: place.types
    }));

    res.json({
      inputAddress: address,
      foundPlace: {
        name: place.name,
        formattedAddress: place.formatted_address,
        placeId: place.place_id,
        location: place.geometry.location
      },
      nearbyStores: stores
    });
  } catch (error) {
    console.error('Error testing address:', error);
    res.status(500).json({ 
      error: 'Failed to test address',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Search for nearby stores
router.get('/places', async (req, res) => {
  try {
    const { location, radius = 500, name } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const [latitude, longitude] = location.split(',').map(Number);

    const requestBody = {
      includedTypes: ["supermarket"],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: {
            latitude,
            longitude
          },
          radius: Number(radius)
        }
      }
    };

    if (name) {
      requestBody.textQuery = name;
    }

    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchNearby',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.location'
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Google Places API error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to search places', details: err?.response?.data || err.message });
  }
});

// Calculate routes between locations
router.post('/routes', async (req, res) => {
  try {
    const { origin, destinations } = req.body;
    
    if (!origin || !destinations || !Array.isArray(destinations)) {
      return res.status(400).json({ error: 'Origin and destinations array are required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: origin,
        destinations: destinations.join('|'),
        key: GOOGLE_MAPS_API_KEY
      }
    });

    // Format the response to include only necessary data
    const formattedResults = response.data.rows[0].elements.map((element, index) => ({
      destination: destinations[index],
      distance_miles: element.distance ? parseFloat(element.distance.text.split(' ')[0]) : 0,
      duration: element.duration?.text || 'N/A'
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Error calculating routes:', error);
    res.status(500).json({ error: 'Failed to calculate routes' });
  }
});

// Process all meal planning and optimization
router.post('/optimize', async (req, res) => {
  try {
    const { recipes, location, budget } = req.body;
    console.log('Received optimization request:', { recipes, location, budget });

    if (!recipes || !location || !budget) {
      const missingFields = [];
      if (!recipes) missingFields.push('recipes');
      if (!location) missingFields.push('location');
      if (!budget) missingFields.push('budget');
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Separate ingredients into "to buy" and "already have" lists
    const ingredientsToBuy = [];
    const ingredientsHave = [];

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        if (ingredient.checked) {
          ingredientsToBuy.push({
            name: ingredient.name,
            quantity: ingredient.quantity,
            servings: recipe.servings,
            desiredServings: recipe.desiredServings,
            recipeName: recipe.name
          });
        } else {
          ingredientsHave.push({
            name: ingredient.name,
            quantity: ingredient.quantity,
            servings: recipe.servings,
            desiredServings: recipe.desiredServings,
            recipeName: recipe.name
          });
        }
      });
    });

    console.log('Starting web scraping for ingredients...');
    // Search for each ingredient using web scraping
    const shoppingList = await Promise.all(ingredientsToBuy.map(async ingredient => {
      console.log(`Scraping options for: ${ingredient.name}`);
      const products = await scrapeGoogleShopping(ingredient.name, location);
      console.log(`Found ${products.length} options for ${ingredient.name}`);
      
      return {
        name: ingredient.name,
        quantity: ingredient.quantity,
        servings: ingredient.servings,
        desiredServings: ingredient.desiredServings,
        recipeName: ingredient.recipeName,
        products: products
      };
    }));

    console.log('Starting Gemini analyses...');

    // Get cost breakdown analysis
    console.log('Getting cost breakdown...');
    const costBreakdownPrompt = `Analyze this shopping list and provide a detailed cost breakdown:
    Items to Buy:
    ${shoppingList.map(item => 
      `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)
       Available Options:
       ${item.products.map(product => 
         `  * ${product.store}: ${product.name} - $${product.price} (${product.unitPrice || 'N/A'})`
       ).join('\n')}`
    ).join('\n')}

    Items Already Have:
    ${ingredientsHave.map(item => 
      `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)
       Recipe: ${item.recipeName}`
    ).join('\n')}

    Total Cost: $${shoppingList.reduce((sum, item) => 
      sum + (item.products[0] ? parseFloat(item.products[0].price) : 0), 0
    )}
    Budget: $${budget}`;

    const costBreakdownResponse = await ai.generateContent(costBreakdownPrompt);
    const costBreakdownText = costBreakdownResponse.response.text();

    // Get shopping strategy
    console.log('Getting shopping strategy...');
    const shoppingStrategyPrompt = `Based on this shopping list and location, provide an optimal shopping strategy:
    Shopping List:
    ${shoppingList.map(item => 
      `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)
       Store: ${item.products[0]?.store || 'N/A'}`
    ).join('\n')}

    Location: ${location}`;

    const shoppingStrategyResponse = await ai.generateContent(shoppingStrategyPrompt);
    const shoppingStrategyText = shoppingStrategyResponse.response.text();

    // Get recipe modifications
    console.log('Getting recipe modifications...');
    const recipeModificationsPrompt = `Analyze these recipes and provide modified instructions:
    ${recipes.map(recipe => 
      `Recipe: ${recipe.name}
       Original Servings: ${recipe.servings}
       Desired Servings: ${recipe.desiredServings}
       Instructions: ${recipe.instructions}`
    ).join('\n\n')}`;

    const recipeModificationsResponse = await ai.generateContent(recipeModificationsPrompt);
    const recipeModificationsText = recipeModificationsResponse.response.text();

    // Get ingredient substitutions
    console.log('Getting ingredient substitutions...');
    const ingredientSubstitutionsPrompt = `Suggest ingredient substitutions and alternatives:
    Items to Buy:
    ${shoppingList.map(item => 
      `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)
       Price: $${item.products[0]?.price || 'N/A'}`
    ).join('\n')}

    Items Already Have:
    ${ingredientsHave.map(item => 
      `- ${item.name} (${item.quantity} for ${item.desiredServings} servings)`
    ).join('\n')}`;

    const ingredientSubstitutionsResponse = await ai.generateContent(ingredientSubstitutionsPrompt);
    const ingredientSubstitutionsText = ingredientSubstitutionsResponse.response.text();

    // Generate overall recommendation
    const recommendationPrompt = `Based on the following analyses, provide a concise overall recommendation:
    Cost Breakdown: ${costBreakdownText}
    Shopping Strategy: ${shoppingStrategyText}
    Recipe Modifications: ${recipeModificationsText}
    Ingredient Substitutions: ${ingredientSubstitutionsText}

    Provide a brief, actionable recommendation that summarizes the key points.`;

    const recommendationResponse = await ai.generateContent(recommendationPrompt);
    const recommendationText = recommendationResponse.response.text();

    // Return the results
    res.json({
      recommendation: recommendationText,
      costBreakdown: costBreakdownText,
      shoppingStrategy: shoppingStrategyText,
      recipeModifications: recipeModificationsText,
      ingredientSubstitutions: ingredientSubstitutionsText
    });

  } catch (error) {
    console.error('Error optimizing meal plan:', error);
    res.status(500).json({ 
      error: 'Failed to optimize meal plan',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test Gemini prompt
router.post('/test-gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Testing Gemini with prompt:', prompt);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt
    });
    
    res.json({
      response: response.text
    });
  } catch (error) {
    console.error('Error testing Gemini:', error);
    res.status(500).json({ error: 'Failed to test Gemini', details: error.message });
  }
});

// Generate flash cards using Gemini
router.post('/flash-cards', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    console.log('Generating flash cards for topic:', topic);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: `Create 5 flash cards for studying ${topic}. 
For each card provide:
1. A clear, concise question
2. A detailed but focused answer
3. A difficulty level (Easy, Medium, Hard)

Format each card as:
Q: [Question]
A: [Answer]
Level: [Difficulty]

Make the questions progressively more challenging.`
    });
    
    res.json({
      flashCards: response.text.split('\n').map(card => ({ type: 'text', content: card }))
    });
  } catch (error) {
    console.error('Error generating flash cards:', error);
    res.status(500).json({ error: 'Failed to generate flash cards', details: error.message });
  }
});

// Add new scrape endpoint
router.get('/scrape', async (req, res) => {
  try {
    const { query, location } = req.query;
    
    if (!query || !location) {
      return res.status(400).json({ error: 'Query and location are required' });
    }

    console.log('Scraping Google Shopping for:', query, 'in', location);
    const products = await scrapeGoogleShopping(query, location);
    console.log(`Found ${products.length} products for ${query}`);

    res.json(products);
  } catch (error) {
    console.error('Error scraping products:', error);
    res.status(500).json({ 
      error: 'Failed to scrape products',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;