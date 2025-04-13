import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';

interface CostBreakdownProps {
  analysis: {
    stores: Array<{
      name: string;
      items: Array<{
        name: string;
        price: number | string;
        quantity: string;
      }>;
      total: number | string;
    }>;
    summary: {
      totalCost: number | string;
      budgetComparison: string;
      savingsTips: string[];
    };
  } | null;
}

const formatCurrency = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numValue);
};

const CostBreakdown = ({ analysis }: CostBreakdownProps) => {
  if (!analysis) return null;

  const markdownComponents = {
    p: ({ children }: any) => <Typography variant="body1" sx={{ my: 1 }}>{children}</Typography>,
    ul: ({ children }: any) => <Box component="ul" sx={{ pl: 4, my: 1 }}>{children}</Box>,
    li: ({ children }: any) => <Box component="li" sx={{ mb: 1 }}>{children}</Box>,
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="primary">
        Cost Breakdown
      </Typography>

      {analysis.stores.map((store, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            {store.name}
          </Typography>
          <List dense>
            {store.items.map((item, itemIndex) => (
              <ListItem key={itemIndex}>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      {item.name}
                      <Typography component="span" color="text.secondary">
                        {item.quantity ? ` (${item.quantity})` : ''}
                      </Typography>
                    </Typography>
                  }
                  secondary={formatCurrency(item.price)}
                />
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="bold">
                    Store Total
                  </Typography>
                }
                secondary={
                  <Typography variant="body1" color="primary" fontWeight="bold">
                    {formatCurrency(store.total)}
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </Box>
      ))}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Summary
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="subtitle1" fontWeight="bold">
                  Total Cost
                </Typography>
              }
              secondary={
                <Typography variant="body1" color="primary" fontWeight="bold">
                  {formatCurrency(analysis.summary.totalCost)}
                </Typography>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Budget Comparison"
              secondary={
                <Box sx={{ mt: 1 }}>
                  <ReactMarkdown components={markdownComponents}>
                    {analysis.summary.budgetComparison}
                  </ReactMarkdown>
                </Box>
              }
            />
          </ListItem>
          <Divider sx={{ my: 2 }} />
          <ListItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Savings Tips:
              </Typography>
              <List dense>
                {analysis.summary.savingsTips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <ReactMarkdown components={markdownComponents}>
                          {tip}
                        </ReactMarkdown>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default CostBreakdown; 