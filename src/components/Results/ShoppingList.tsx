import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox, Chip, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';

interface ShoppingItem {
  name: string;
  quantity: string;
  servings: string;
  recipeName: string;
  product: {
    name: string;
    price: number;
    pricePerUnit: string;
    link: string;
    image: string;
  };
}

interface ShoppingListProps {
  items: ShoppingItem[];
  onItemCheck: (index: number) => void;
  checkedItems: number[];
  ingredientData: Map<string, any>;
}

const ShoppingList = ({ items, onItemCheck, checkedItems, ingredientData }: ShoppingListProps) => {
  if (!items || items.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">No items to purchase</Typography>
      </Box>
    );
  }

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartIcon sx={{ mr: 1 }} />
          <Typography>Shopping List</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {items.map((item, index) => {
            const data = ingredientData.get(item.name);
            return (
              <ListItem
                key={index}
                divider
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  textDecoration: checkedItems.includes(index) ? 'line-through' : 'none',
                  opacity: checkedItems.includes(index) ? 0.5 : 1
                }}
              >
                <Checkbox
                  edge="start"
                  checked={checkedItems.includes(index)}
                  onChange={() => onItemCheck(index)}
                  sx={{ mr: 1 }}
                />
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{item.name}</Typography>
                      <Chip
                        label={item.quantity}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        For: {item.recipeName}
                      </Typography>
                      {data && (
                        <Typography variant="body2" color="text.secondary">
                          Avg. Price: ${data.averagePrice.toFixed(2)} per {data.unit}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default ShoppingList; 