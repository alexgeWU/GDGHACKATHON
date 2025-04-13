import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import DirectionsIcon from '@mui/icons-material/Directions';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface ShoppingStrategyProps {
  analysis: {
    routes: Array<{
      store: string;
      distance: string;
      duration: string;
      items: string[];
    }>;
    tips: string[];
  } | null;
}

const ShoppingStrategy = ({ analysis }: ShoppingStrategyProps) => {
  if (!analysis) return null;

  const markdownComponents = {
    p: ({ children }: any) => <Typography variant="body1" sx={{ my: 1 }}>{children}</Typography>,
    ul: ({ children }: any) => <Box component="ul" sx={{ pl: 4, my: 1 }}>{children}</Box>,
    li: ({ children }: any) => <Box component="li" sx={{ mb: 1 }}>{children}</Box>,
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DirectionsIcon />
        Shopping Strategy
      </Typography>

      <List>
        {analysis.routes.map((route, index) => (
          <Paper key={index} elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
            <ListItem sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <ListItemText
                primary={
                  <Typography variant="h6" color="inherit">
                    {route.store}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
                    {route.distance} • {route.duration}
                  </Typography>
                }
              />
            </ListItem>
            <List component="div" dense>
              {route.items.map((item, itemIndex) => (
                <ListItem key={itemIndex} sx={{ pl: 4 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingCartIcon fontSize="small" color="action" />
                        <ReactMarkdown components={markdownComponents}>
                          {item}
                        </ReactMarkdown>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ))}
      </List>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Shopping Tips
        </Typography>
        <Paper elevation={1} sx={{ p: 2 }}>
          <List dense>
            {analysis.tips.map((tip, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Typography variant="body1" component="span" color="primary" sx={{ minWidth: '1.5em' }}>
                        {index + 1}.
                      </Typography>
                      <ReactMarkdown components={markdownComponents}>
                        {tip}
                      </ReactMarkdown>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default ShoppingStrategy; 