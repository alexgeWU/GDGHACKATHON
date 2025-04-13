import express from 'express';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const THEMEALDB_API = 'https://www.themealdb.com/api/json/v1/1';

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${THEMEALDB_API}/lookup.php?i=${id}`);
    
    if (!response.data.meals || response.data.meals.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = response.data.meals[0];
    
    // Extract ingredients and measurements
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient,
          measure: measure,
          checked: false
        });
      }
    }

    const formattedRecipe = {
      id: recipe.idMeal,
      name: recipe.strMeal,
      category: recipe.strCategory,
      area: recipe.strArea,
      instructions: recipe.strInstructions,
      image: recipe.strMealThumb,
      tags: recipe.strTags ? recipe.strTags.split(',') : [],
      ingredients,
      servings: 4, // Default servings
      desiredServings: 4 // Default desired servings
    };

    res.json(formattedRecipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Search recipes
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const response = await axios.get(`${THEMEALDB_API}/search.php?s=${term}`);
    
    if (!response.data.meals) {
      return res.json([]);
    }

    const recipes = response.data.meals.map(recipe => ({
      id: recipe.idMeal,
      name: recipe.strMeal,
      category: recipe.strCategory,
      area: recipe.strArea,
      image: recipe.strMealThumb
    }));

    res.json(recipes);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ error: 'Failed to search recipes' });
  }
});

export default router; 