import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface RecommendationsProps {
  shoppingStrategy: string[];
  costSavingTips: string[];
}

const Recommendations: React.FC<RecommendationsProps> = ({ shoppingStrategy, costSavingTips }) => {
  if ((!shoppingStrategy || shoppingStrategy.length === 0) && (!costSavingTips || costSavingTips.length === 0)) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">No recommendations available</Typography>
      </Box>
    );
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LightbulbIcon sx={{ mr: 1 }} />
          <Typography>Recommendations</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {shoppingStrategy && shoppingStrategy.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Shopping Strategy</Typography>
            <List dense>
              {shoppingStrategy.map((strategy, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2">{strategy}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {costSavingTips && costSavingTips.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Cost Saving Tips</Typography>
            <List dense>
              {costSavingTips.map((tip, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2">{tip}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default Recommendations; 