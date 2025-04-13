import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface ShoppingAnalysisProps {
  analysis: string;
}

const ShoppingAnalysis: React.FC<ShoppingAnalysisProps> = ({ analysis }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Shopping Analysis
      </Typography>
      <Box sx={{ whiteSpace: 'pre-wrap' }}>
        {analysis}
      </Box>
    </Paper>
  );
};

export default ShoppingAnalysis; 