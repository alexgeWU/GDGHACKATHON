import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface IngredientListProps {
  ingredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
}

const IngredientList: React.FC<IngredientListProps> = ({
  ingredients,
  onIngredientsChange
}) => {
  const [newIngredient, setNewIngredient] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('');

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;

    const ingredient: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.trim(),
      quantity: newQuantity.trim(),
      unit: newUnit.trim()
    };

    onIngredientsChange([...ingredients, ingredient]);
    setNewIngredient('');
    setNewQuantity('');
    setNewUnit('');
  };

  const handleRemoveIngredient = (id: string) => {
    onIngredientsChange(ingredients.filter(ing => ing.id !== id));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Shopping List
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Ingredient"
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
          fullWidth
        />
        <TextField
          label="Quantity"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          sx={{ width: '120px' }}
        />
        <TextField
          label="Unit"
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          sx={{ width: '120px' }}
        />
        <Button
          variant="contained"
          onClick={handleAddIngredient}
          startIcon={<AddIcon />}
        >
          Add
        </Button>
      </Box>

      <List>
        {ingredients.map((ingredient) => (
          <React.Fragment key={ingredient.id}>
            <ListItem>
              <ListItemText
                primary={ingredient.name}
                secondary={`${ingredient.quantity} ${ingredient.unit}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveIngredient(ingredient.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default IngredientList; 