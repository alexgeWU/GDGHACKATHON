import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface ResultsProps {
  optimizationResults: {
    recommendation: string;
    costBreakdown: string;
    shoppingStrategy: string;
    recipeModifications: string;
    ingredientSubstitutions: string;
  } | null;
}

const Results = ({ optimizationResults }: ResultsProps) => {
  if (!optimizationResults) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">No results to show yet. Please submit a meal plan for analysis.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Meal Plan Analysis
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recommendation
        </Typography>
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
          {optimizationResults.recommendation}
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Cost Breakdown
        </Typography>
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
          {optimizationResults.costBreakdown}
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Shopping Strategy
        </Typography>
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
          {optimizationResults.shoppingStrategy}
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recipe Modifications
        </Typography>
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
          {optimizationResults.recipeModifications}
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Ingredient Substitutions
        </Typography>
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
          {optimizationResults.ingredientSubstitutions}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Results; 