import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Optimize shopping list
router.post('/shopping-list', async (req, res) => {
  try {
    const { items, location, preferences } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this shopping list and provide optimization recommendations:

Items to Buy:
${items.map(item => 
  `- ${item.name} (${item.quantity} ${item.unit})
   Options:
   ${item.options.map(opt => 
     `  * ${opt.store}: $${opt.price} (${opt.quantity} ${opt.unit})`
   ).join('\n')}`
).join('\n')}

Location: ${location || 'Not specified'}
Preferences: ${preferences || 'None specified'}

Please provide:
1. Cost breakdown by store
2. Recommended store order for efficiency
3. Potential savings opportunities
4. Any bulk purchase recommendations
5. Alternative options for expensive items`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      recommendation: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error optimizing shopping list:', error);
    res.status(500).json({ error: 'Failed to optimize shopping list' });
  }
});

// Get cost breakdown
router.post('/cost-breakdown', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze these items and provide a detailed cost breakdown:

${items.map(item => 
  `- ${item.name} (${item.quantity} ${item.unit})
   Price: $${item.price}
   Store: ${item.store}`
).join('\n')}

Please provide:
1. Total cost
2. Cost per unit for each item
3. Potential savings with bulk purchases
4. Alternative cheaper options`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      analysis: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating cost breakdown:', error);
    res.status(500).json({ error: 'Failed to generate cost breakdown' });
  }
});

export default router; 