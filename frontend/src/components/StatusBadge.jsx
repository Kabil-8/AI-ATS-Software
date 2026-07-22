import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';

const STATUS_CONFIG = {
  applied:   { label: 'Applied',    color: '#60A5FA', dot: true },
  screening: { label: 'Screening',  color: '#A78BFA', dot: true },
  interview: { label: 'Interview',  color: '#7B6FFF', dot: true, glow: true },
  offered:   { label: 'Offered',    color: '#34D399', dot: true },
  hired:     { label: 'Hired ✓',    color: '#10B981', dot: true },
  rejected:  { label: 'Rejected',   color: '#F87171', dot: false },
  withdrawn: { label: 'Withdrawn',  color: '#9CA3AF', dot: false },
  active:    { label: 'Active',     color: '#34D399', dot: true },
  archived:  { label: 'Archived',   color: '#6B7280', dot: false },
  draft:     { label: 'Draft',      color: '#FCD34D', dot: true },
  closed:    { label: 'Closed',     color: '#9CA3AF', dot: false },
};

export default function StatusBadge({ status, size = 'small', sx = {} }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.applied;

  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: size === 'small' ? 1 : 1.25,
      py: size === 'small' ? 0.3 : 0.5,
      borderRadius: 99,
      bgcolor: alpha(cfg.color, isDark ? 0.15 : 0.1),
      border: `1px solid ${alpha(cfg.color, isDark ? 0.35 : 0.25)}`,
      ...(cfg.glow && isDark && {
        boxShadow: `0 0 10px ${alpha(cfg.color, 0.3)}`,
      }),
      ...sx,
    }}>
      {cfg.dot && (
        <Box sx={{
          width: 6, height: 6, borderRadius: '50%',
          bgcolor: cfg.color,
          flexShrink: 0,
          ...(cfg.glow && {
            boxShadow: `0 0 6px ${cfg.color}`,
            animation: 'statusPulse 2s ease-in-out infinite',
          }),
        }} />
      )}
      <Typography sx={{
        fontSize: size === 'small' ? '0.7rem' : '0.78rem',
        fontWeight: 700,
        color: isDark ? alpha(cfg.color, 0.95) : cfg.color,
        lineHeight: 1,
        letterSpacing: '0.02em',
      }}>
        {cfg.label}
      </Typography>
      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
}
