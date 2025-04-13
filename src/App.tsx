import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import Header from './components/Header';
import MealPlanner from './components/MealPlanner';
import Results from './components/Results';
import RecipeRecommendations from './components/RecipeRecommendations';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#f57c00',
    },
  },
});

function App() {
  const [mealPlan, setMealPlan] = React.useState<any>(null);
  const [optimizationResults, setOptimizationResults] = React.useState<any>(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
            <Routes>
              <Route path="/" element={<RecipeRecommendations />} />
              <Route 
                path="/meal-planner" 
                element={
                  <MealPlanner 
                    setMealPlan={setMealPlan}
                    setOptimizationResults={setOptimizationResults}
                  />
                } 
              />
              <Route 
                path="/results" 
                element={
                  <Results 
                    optimizationResults={optimizationResults}
                  />
                } 
              />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 