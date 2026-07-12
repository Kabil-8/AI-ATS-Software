import React from 'react';
import { Chip, useTheme, alpha } from '@mui/material';

const STATUS_MAP = {
  applied:   { label: 'Applied',   color: '#3B82F6', bg: '#DBEAFE', darkBg: '#1E3A5F' },
  screening: { label: 'Screening', color: '#8B5CF6', bg: '#EDE9FE', darkBg: '#2D1F6E' },
  interview: { label: 'Interview', color: '#5B4FCF', bg: '#EDE9FE', darkBg: '#2D1F6E' },
  offered:   { label: 'Offered',   color: '#059669', bg: '#D1FAE5', darkBg: '#0A2E1A' },
  hired:     { label: 'Hired ✓',   color: '#047857', bg: '#ECFDF5', darkBg: '#052E16' },
  rejected:  { label: 'Rejected',  color: '#DC2626', bg: '#FEE2E2', darkBg: '#2D0A0A' },
  active:    { label: 'Active',    color: '#059669', bg: '#D1FAE5', darkBg: '#0A2E1A' },
  archived:  { label: 'Archived',  color: '#6B6F80', bg: '#F3F4F6', darkBg: '#1C2030' },
  draft:     { label: 'Draft',     color: '#D97706', bg: '#FEF3C7', darkBg: '#3D2A00' },
};

export default function StatusBadge({ status, size = 'small', sx = {} }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cfg = STATUS_MAP[status?.toLowerCase()] || STATUS_MAP.applied;

  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={{
        backgroundColor: isDark ? alpha(cfg.color, 0.18) : cfg.bg,
        color: isDark ? alpha(cfg.color, 0.95) : cfg.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.72rem' : '0.8rem',
        border: `1px solid ${alpha(cfg.color, isDark ? 0.3 : 0.2)}`,
        borderRadius: '8px',
        height: size === 'small' ? 24 : 28,
        ...(status === 'interview' && isDark && {
          boxShadow: `0 0 8px ${alpha(cfg.color, 0.35)}`,
        }),
        ...sx,
      }}
    />
  );
}
