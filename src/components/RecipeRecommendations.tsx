import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Recipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string;
  strYoutube: string;
  ingredients: Array<{
    ingredient: string;
    measure: string;
  }>;
}

const RecipeRecommendations = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchRecipes = async (query: string = '') => {
    try {
      setLoading(true);
      let recipePromises;

      if (query) {
        // Search for recipes
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();
        if (!data.meals) {
          setRecipes([]);
          return;
        }
        recipePromises = data.meals.slice(0, 6).map((meal: any) => {
          const ingredients: Array<{ ingredient: string; measure: string }> = [];
          for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
              ingredients.push({
                ingredient,
                measure
              });
            }
          }
          return {
            ...meal,
            ingredients
          };
        });
      } else {
        // Fetch 6 random recipes
        recipePromises = Array(6).fill(null).map(() => 
          fetch('https://www.themealdb.com/api/json/v1/1/random.php')
            .then(res => res.json())
            .then(data => {
              const meal = data.meals[0];
              const ingredients: Array<{ ingredient: string; measure: string }> = [];
              for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== '') {
                  ingredients.push({
                    ingredient,
                    measure
                  });
                }
              }
              return {
                ...meal,
                ingredients
              };
            })
        );
      }
      
      const results = await Promise.all(recipePromises);
      setRecipes(results);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    fetchRecipes(searchQuery);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate('/meal-planner', { state: { selectedRecipe: recipe } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Recipe Search
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit" disabled={searchLoading}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {searchLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <CircularProgress />
        </Box>
      )}

      {!searchLoading && recipes.length === 0 && (
        <Typography variant="h6" align="center" color="text.secondary">
          No recipes found. Try a different search term.
        </Typography>
      )}

      <Grid container spacing={4}>
        {recipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={`${recipe.idMeal}-${recipe.strMeal}`}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
              onClick={() => handleRecipeClick(recipe)}
            >
              <CardMedia
                component="img"
                height="200"
                image={recipe.strMealThumb}
                alt={recipe.strMeal}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {recipe.strMeal}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip label={recipe.strCategory} size="small" />
                  <Chip label={recipe.strArea} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {recipe.ingredients.length} ingredients
                </Typography>
                {recipe.strTags && (
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    {recipe.strTags.split(',').map((tag, index) => (
                      <Chip 
                        key={`${recipe.idMeal}-tag-${index}`} 
                        label={tag.trim()} 
                        size="small" 
                        variant="outlined" 
                      />
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecipeRecommendations; 