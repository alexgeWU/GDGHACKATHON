import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';

interface MealPlannerProps {
  setMealPlan: (plan: any) => void;
  setOptimizationResults: (results: any) => void;
}

const MealPlanner = ({ setMealPlan, setOptimizationResults }: MealPlannerProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mealsPerDay: 3,
    daysPerWeek: 7,
    dietaryRestrictions: '',
    location: '',
    budget: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Gemini API call and grocery store API integration
    // For now, we'll just navigate to results with dummy data
    setMealPlan(formData);
    setOptimizationResults({
      totalCost: 150,
      gasCost: 20,
      stores: [
        { name: 'Walmart', distance: 5, totalCost: 120 },
        { name: 'Kroger', distance: 3, totalCost: 130 },
      ],
    });
    navigate('/results');
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Plan Your Meals
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Meals per Day</InputLabel>
              <Select
                value={formData.mealsPerDay}
                onChange={(e) => setFormData({ ...formData, mealsPerDay: Number(e.target.value) })}
                label="Meals per Day"
              >
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Days per Week</InputLabel>
              <Select
                value={formData.daysPerWeek}
                onChange={(e) => setFormData({ ...formData, daysPerWeek: Number(e.target.value) })}
                label="Days per Week"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={7}>7</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dietary Restrictions"
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              placeholder="e.g., Vegetarian, Gluten-Free"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter your zip code or address"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Budget"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="Enter your weekly budget"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" color="primary" size="large">
                Find Optimal Plan
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default MealPlanner; 