import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { searchStores, analyzeShoppingOptions } from '../services/storeSearch';
import { optimizeMealPlan } from '../services/api';

interface Recipe {
  name: string;
  ingredients: { name: string; quantity: string; checked: boolean }[];
  seasonings: { name: string; checked: boolean }[];
  instructions: string;
  servings: number;
  desiredServings: number;
}

interface MealPlannerProps {
  setMealPlan: (plan: any) => void;
  setOptimizationResults: (results: any) => void;
}

const MealPlanner = ({ setMealPlan, setOptimizationResults }: MealPlannerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = React.useState<'single' | 'multiple'>('single');
  const [loading, setLoading] = React.useState(false);
  const [locationInput, setLocationInput] = React.useState(() => {
    return localStorage.getItem('savedLocation') || '';
  });
  const [budget, setBudget] = React.useState(() => {
    return localStorage.getItem('savedBudget') || '';
  });
  const [recipes, setRecipes] = React.useState<Recipe[]>([
    {
      name: '',
      ingredients: [{ name: '', quantity: '', checked: true }],
      seasonings: [{ name: '', checked: true }],
      instructions: '',
      servings: 4,
      desiredServings: 4
    }
  ]);

  // Save to localStorage when values change
  React.useEffect(() => {
    localStorage.setItem('savedLocation', locationInput);
  }, [locationInput]);

  React.useEffect(() => {
    localStorage.setItem('savedBudget', budget);
  }, [budget]);

  // Handle selected recipe from homepage
  useEffect(() => {
    if (location.state?.selectedRecipe) {
      const selectedRecipe = location.state.selectedRecipe;
      const ingredients: { name: string; quantity: string; checked: boolean }[] = [];
      const seasonings: { name: string; checked: boolean }[] = [];
      
      // Process ingredients and seasonings
      selectedRecipe.ingredients.forEach((ing: any) => {
        const quantity = ing.measure.trim();
        if (!isNaN(Number(quantity.replace(/[^0-9.]/g, '')))) {
          ingredients.push({
            name: ing.ingredient,
            quantity: quantity,
            checked: false
          });
        } else {
          seasonings.push({
            name: `${ing.ingredient} ${quantity}`,
            checked: false
          });
        }
      });

      setRecipes([{
        name: selectedRecipe.strMeal,
        ingredients,
        seasonings,
        instructions: selectedRecipe.strInstructions,
        servings: 4, // Default servings
        desiredServings: 4 // Default desired servings
      }]);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format the data for the backend and invert checked status
      const formattedRecipes = recipes.map(recipe => ({
        name: recipe.name,
        ingredients: recipe.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          checked: !ing.checked // Invert checked status
        })),
        seasonings: recipe.seasonings.map(seasoning => ({
          name: seasoning.name,
          checked: !seasoning.checked // Invert checked status
        })),
        instructions: recipe.instructions,
        servings: recipe.servings,
        desiredServings: recipe.desiredServings
      }));

      const result = await optimizeMealPlan(
        formattedRecipes,
        locationInput,
        parseFloat(budget)
      );
      
      setMealPlan({
        mode,
        recipes: formattedRecipes,
        location: locationInput,
        budget
      });
      
      // Set the optimization results with the raw string responses
      setOptimizationResults({
        recommendation: result.recommendation || "No recommendation available",
        costBreakdown: result.costBreakdown || "No cost breakdown available",
        shoppingStrategy: result.shoppingStrategy || "No shopping strategy available",
        recipeModifications: result.recipeModifications || "No recipe modifications available",
        ingredientSubstitutions: result.ingredientSubstitutions || "No ingredient substitutions available"
      });
      
      navigate('/results');
    } catch (error) {
      console.error('Error optimizing meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRecipeCost = (recipe: Recipe, storeResults: any[]) => {
    // Calculate the cost of a recipe based on the cheapest available ingredients
    return recipe.ingredients.reduce((total, ingredient) => {
      const ingredientName = ingredient.name.toLowerCase();
      const cheapestPrice = storeResults.reduce((min, store) => {
        const item = store.items[ingredientName];
        if (item && item.priceInfo) {
          return Math.min(min, item.priceInfo.totalPrice);
        }
        return min;
      }, Infinity);
      return total + (cheapestPrice === Infinity ? 0 : cheapestPrice);
    }, 0);
  };

  const addRecipe = () => {
    setRecipes([...recipes, {
      name: '',
      ingredients: [{ name: '', quantity: '', checked: true }],
      seasonings: [{ name: '', checked: true }],
      instructions: '',
      servings: 4,
      desiredServings: 4
    }]);
  };

  const removeRecipe = (index: number) => {
    setRecipes(recipes.filter((_, i) => i !== index));
  };

  const updateRecipe = (index: number, field: keyof Recipe, value: any) => {
    const newRecipes = [...recipes];
    if (field === 'ingredients') {
      // Ensure checked property is preserved when updating ingredients
      newRecipes[index].ingredients = value.map((ing: any) => ({
        ...ing,
        checked: ing.checked !== undefined ? ing.checked : true
      }));
    } else if (field === 'seasonings') {
      // Ensure checked property is preserved when updating seasonings
      newRecipes[index].seasonings = value.map((seasoning: any) => ({
        ...seasoning,
        checked: seasoning.checked !== undefined ? seasoning.checked : true
      }));
    } else {
      newRecipes[index] = { ...newRecipes[index], [field]: value };
    }
    setRecipes(newRecipes);
  };

  const addIngredient = (recipeIndex: number) => {
    const newRecipes = [...recipes];
    newRecipes[recipeIndex].ingredients.push({ 
      name: '', 
      quantity: '', 
      checked: true 
    });
    setRecipes(newRecipes);
  };

  const removeIngredient = (recipeIndex: number, ingredientIndex: number) => {
    const newRecipes = [...recipes];
    newRecipes[recipeIndex].ingredients = newRecipes[recipeIndex].ingredients.filter((_, i) => i !== ingredientIndex);
    setRecipes(newRecipes);
  };

  const addSeasoning = (recipeIndex: number) => {
    const newRecipes = [...recipes];
    newRecipes[recipeIndex].seasonings.push({ 
      name: '', 
      checked: true 
    });
    setRecipes(newRecipes);
  };

  const removeSeasoning = (recipeIndex: number, seasoningIndex: number) => {
    const newRecipes = [...recipes];
    newRecipes[recipeIndex].seasonings = newRecipes[recipeIndex].seasonings.filter((_, i) => i !== seasoningIndex);
    setRecipes(newRecipes);
  };

  const handleServingsChange = (recipeIndex: number, field: 'servings' | 'desiredServings', value: string) => {
    const numValue = parseInt(value) || 1; // Default to 1 if invalid
    updateRecipe(recipeIndex, field, numValue);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Plan Your Meals</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="h6" gutterBottom>Store Selection Mode</Typography>
              <RadioGroup
                value={mode}
                onChange={(e) => setMode(e.target.value as 'single' | 'multiple')}
              >
                <FormControlLabel
                  value="single"
                  control={<Radio />}
                  label="Single Store (Cheapest overall)"
                />
                <FormControlLabel
                  value="multiple"
                  control={<Radio />}
                  label="Multiple Stores (Cheaper with driving)"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {recipes.map((recipe, recipeIndex) => (
            <Grid item xs={12} key={recipeIndex}>
              <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Recipe {recipeIndex + 1}</Typography>
                  <IconButton onClick={() => removeRecipe(recipeIndex)} color="error">
                    <RemoveIcon />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  label="Recipe Name"
                  value={recipe.name}
                  onChange={(e) => updateRecipe(recipeIndex, 'name', e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Original Servings"
                      type="number"
                      value={recipe.servings || 1}
                      onChange={(e) => handleServingsChange(recipeIndex, 'servings', e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Desired Servings"
                      type="number"
                      value={recipe.desiredServings || 1}
                      onChange={(e) => handleServingsChange(recipeIndex, 'desiredServings', e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" gutterBottom>Ingredients</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Check the items you already have. Only unchecked items will be included in the shopping analysis.
                </Typography>
                {recipe.ingredients.map((ingredient, ingredientIndex) => (
                  <Box key={ingredientIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Checkbox
                      checked={ingredient.checked}
                      onChange={(e) => {
                        const newIngredients = [...recipe.ingredients];
                        newIngredients[ingredientIndex].checked = e.target.checked;
                        updateRecipe(recipeIndex, 'ingredients', newIngredients);
                      }}
                    />
                    <TextField
                      label="Ingredient"
                      value={ingredient.name}
                      onChange={(e) => {
                        const newIngredients = [...recipe.ingredients];
                        newIngredients[ingredientIndex].name = e.target.value;
                        updateRecipe(recipeIndex, 'ingredients', newIngredients);
                      }}
                    />
                    <TextField
                      label="Quantity"
                      value={ingredient.quantity}
                      onChange={(e) => {
                        const newIngredients = [...recipe.ingredients];
                        newIngredients[ingredientIndex].quantity = e.target.value;
                        updateRecipe(recipeIndex, 'ingredients', newIngredients);
                      }}
                    />
                    <IconButton onClick={() => removeIngredient(recipeIndex, ingredientIndex)} color="error">
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => addIngredient(recipeIndex)}
                  sx={{ mb: 2 }}
                >
                  Add Ingredient
                </Button>

                <Typography variant="subtitle1" gutterBottom>Seasonings</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Check the seasonings you already have. Only unchecked items will be included in the shopping analysis.
                </Typography>
                {recipe.seasonings.map((seasoning, seasoningIndex) => (
                  <Box key={seasoningIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Checkbox
                      checked={seasoning.checked}
                      onChange={(e) => {
                        const newSeasonings = [...recipe.seasonings];
                        newSeasonings[seasoningIndex].checked = e.target.checked;
                        updateRecipe(recipeIndex, 'seasonings', newSeasonings);
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Seasoning"
                      value={seasoning.name}
                      onChange={(e) => {
                        const newSeasonings = [...recipe.seasonings];
                        newSeasonings[seasoningIndex].name = e.target.value;
                        updateRecipe(recipeIndex, 'seasonings', newSeasonings);
                      }}
                    />
                    <IconButton onClick={() => removeSeasoning(recipeIndex, seasoningIndex)} color="error">
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => addSeasoning(recipeIndex)}
                  sx={{ mb: 2 }}
                >
                  Add Seasoning
                </Button>

                <TextField
                  fullWidth
                  label="Instructions"
                  multiline
                  rows={4}
                  value={recipe.instructions}
                  onChange={(e) => updateRecipe(recipeIndex, 'instructions', e.target.value)}
                />
              </Paper>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button
              startIcon={<AddIcon />}
              onClick={addRecipe}
              sx={{ mb: 2 }}
            >
              Add Another Recipe
            </Button>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location (Full Address)"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              required
              helperText="Enter your full address (e.g., 123 Main St, City, State ZIP)"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Find Optimal Plan'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default MealPlanner; 