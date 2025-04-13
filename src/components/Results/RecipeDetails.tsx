import React, { useMemo } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Box,
  Divider,
} from '@mui/material';

interface Recipe {
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  ingredients: Record<string, string>;
}

interface IngredientData {
  averagePrice: number;
  unit: string;
}

interface RecipeDetailsProps {
  recipe: {
    name: string;
    ingredients: Array<{
      name: string;
      quantity: string;
    }>;
    seasonings: any[];
    instructions: string;
    originalServings: number;
    desiredServings: number;
    strCategory?: string;
    strArea?: string;
    strInstructions?: string;
  };
  ingredientData: Map<string, any>;
}

const RecipeDetails = ({ recipe, ingredientData }: RecipeDetailsProps) => {
  const parsedInstructions = useMemo(() => {
    if (Array.isArray(recipe.strInstructions)) {
      return recipe.strInstructions;
    }
    if (typeof recipe.strInstructions === 'string') {
      return recipe.strInstructions.split('\n').filter(Boolean);
    }
    return [];
  }, [recipe.strInstructions]);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {recipe.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {recipe.originalServings} servings → {recipe.desiredServings} servings
      </Typography>
      
      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        Ingredients:
      </Typography>
      <List dense>
        {recipe.ingredients.map((ingredient, index) => {
          const data = ingredientData.get(ingredient.name);
          return (
            <ListItem key={index}>
              <ListItemText
                primary={ingredient.name}
                secondary={
                  <Box>
                    <Typography variant="body2">
                      Quantity: {ingredient.quantity}
                    </Typography>
                    {data && (
                      <Typography variant="body2" color="text.secondary">
                        Avg. Price: ${data.averagePrice.toFixed(2)} per {data.unit}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        Instructions:
      </Typography>
      <Typography variant="body2" paragraph>
        {recipe.instructions}
      </Typography>
    </Paper>
  );
};

export default RecipeDetails; 