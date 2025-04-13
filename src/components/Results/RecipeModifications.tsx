import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

interface RecipeModificationsProps {
  analysis: {
    recipes: Array<{
      name: string;
      originalServings: number;
      desiredServings: number;
      ingredientAdjustments: Array<{
        name: string;
        originalAmount: string;
        adjustedAmount: string;
      }>;
      adjustedCookingTime: string;
      modifiedInstructions: string[];
    }>;
    generalTips: string[];
  } | null;
}

const RecipeModifications = ({ analysis }: RecipeModificationsProps) => {
  if (!analysis) return null;

  return (
    <Box>
      <Typography variant="h6" color="primary" gutterBottom>
        Recipe Adjustments
      </Typography>
      {analysis.recipes.map((recipe, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {recipe.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjusting from {recipe.originalServings} to {recipe.desiredServings} servings
          </Typography>
          
          <List>
            {recipe.ingredientAdjustments.map((adjustment, adjIndex) => (
              <ListItem key={adjIndex}>
                <ListItemText
                  primary={adjustment.name}
                  secondary={`${adjustment.originalAmount} → ${adjustment.adjustedAmount}`}
                />
              </ListItem>
            ))}
          </List>

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Adjusted Cooking Time: {recipe.adjustedCookingTime}
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Modified Instructions:
          </Typography>
          <List>
            {recipe.modifiedInstructions.map((instruction, instIndex) => (
              <ListItem key={instIndex}>
                <ListItemText primary={`• ${instruction}`} />
              </ListItem>
            ))}
          </List>

          {index < analysis.recipes.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          General Tips
        </Typography>
        <List>
          {analysis.generalTips.map((tip, index) => (
            <ListItem key={index}>
              <ListItemText primary={`• ${tip}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default RecipeModifications; 