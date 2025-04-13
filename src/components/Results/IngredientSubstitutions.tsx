import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

interface IngredientSubstitutionsProps {
  analysis: {
    substitutions: Array<{
      original: string;
      alternatives: Array<{
        name: string;
        reason: string;
        notes?: string;
      }>;
    }>;
    generalTips: string[];
  };
}

const IngredientSubstitutions = ({ analysis }: IngredientSubstitutionsProps) => {
  if (!analysis) return null;

  return (
    <Box>
      <Typography variant="h6" color="primary" gutterBottom>
        Ingredient Substitutions
      </Typography>
      
      <List>
        {analysis.substitutions.map((sub, index) => (
          <Box key={index}>
            <ListItem>
              <ListItemText
                primary={sub.original}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            
            <List sx={{ pl: 4 }}>
              {sub.alternatives.map((alt, altIndex) => (
                <ListItem key={altIndex}>
                  <ListItemText
                    primary={alt.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {alt.reason}
                        </Typography>
                        {alt.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Note: {alt.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            
            {index < analysis.substitutions.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
      </List>

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

export default IngredientSubstitutions; 