import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ResultsProps {
  mealPlan: any;
  optimizationResults: any;
}

const Results = ({ mealPlan, optimizationResults }: ResultsProps) => {
  const navigate = useNavigate();

  if (!optimizationResults) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" gutterBottom>
          No results available
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Planning
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Optimization Results
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Meal Plan
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Meals per Day"
                  secondary={mealPlan.mealsPerDay}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Days per Week"
                  secondary={mealPlan.daysPerWeek}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Dietary Restrictions"
                  secondary={mealPlan.dietaryRestrictions || 'None'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cost Breakdown
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Total Food Cost"
                  secondary={`$${optimizationResults.totalCost}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Estimated Gas Cost"
                  secondary={`$${optimizationResults.gasCost}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Total Cost"
                  secondary={`$${optimizationResults.totalCost + optimizationResults.gasCost}`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recommended Stores
            </Typography>
            <List>
              {optimizationResults.stores.map((store: any, index: number) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={store.name}
                    secondary={`Distance: ${store.distance} miles | Total Cost: $${store.totalCost}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" onClick={() => navigate('/')}>
              Plan Another Week
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Results; 