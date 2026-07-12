import React from 'react';
import { Box, LinearProgress, Typography, useTheme, alpha } from '@mui/material';

const getScoreColor = (score, theme) => {
  if (score >= 80) return theme.palette.success.main;
  if (score >= 60) return theme.palette.warning.main;
  return theme.palette.error.main;
};

export default function AIScoreBar({ score, showLabel = true, height = 8, sx = {} }) {
  const theme = useTheme();
  const color = getScoreColor(score, theme);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ...sx }}>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          flex: 1,
          height,
          borderRadius: 99,
          backgroundColor: alpha(color, 0.12),
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${alpha(color, 0.7)}, ${color})`,
            borderRadius: 99,
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      />
      {showLabel && (
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color, minWidth: 36, textAlign: 'right', fontFamily: '"Space Grotesk", sans-serif' }}
        >
          {score}%
        </Typography>
      )}
    </Box>
  );
}
