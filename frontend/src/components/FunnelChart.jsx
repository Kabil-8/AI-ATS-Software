import React from 'react';
import { Box, Typography, useTheme, alpha, Skeleton } from '@mui/material';

const STAGE_COLORS = {
  applied:   '#60A5FA',
  screening: '#A78BFA',
  interview: '#7B6FFF',
  offered:   '#34D399',
  hired:     '#10B981',
};

const STAGE_LABELS = {
  applied:   'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offered:   'Offered',
  hired:     'Hired',
};

export default function FunnelChart({ funnel = [], loading = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={40} sx={{ borderRadius: 2, width: `${100 - i * 12}%` }} />
        ))}
      </Box>
    );
  }

  const maxCount = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {funnel.map((item, idx) => {
        const color = STAGE_COLORS[item.stage] || '#7B6FFF';
        const label = STAGE_LABELS[item.stage] || item.stage;
        const pct = Math.round((item.count / maxCount) * 100);
        const conversionFromPrev = idx > 0 && funnel[idx - 1].count > 0
          ? Math.round((item.count / funnel[idx - 1].count) * 100)
          : null;

        return (
          <Box key={item.stage}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 8, height: 8, borderRadius: '50%',
                  bgcolor: color,
                  boxShadow: `0 0 6px ${alpha(color, 0.6)}`,
                }} />
                <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary' }}>
                  {label}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {conversionFromPrev !== null && (
                  <Typography variant="caption" sx={{
                    color: alpha(color, 0.8),
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}>
                    ↓ {conversionFromPrev}%
                  </Typography>
                )}
                <Typography variant="caption" fontWeight={700} sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: 'text.primary',
                  minWidth: 24, textAlign: 'right',
                }}>
                  {item.count}
                </Typography>
              </Box>
            </Box>
            <Box sx={{
              height: 8, borderRadius: 99,
              bgcolor: isDark ? alpha(color, 0.1) : alpha(color, 0.07),
              overflow: 'hidden',
            }}>
              <Box sx={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: 99,
                background: `linear-gradient(90deg, ${alpha(color, 0.7)}, ${color})`,
                transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: `0 0 8px ${alpha(color, 0.4)}`,
              }} />
            </Box>
          </Box>
        );
      })}

      {funnel.every((f) => f.count === 0) && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="caption" color="text.disabled">
            No pipeline data yet — start reviewing applications
          </Typography>
        </Box>
      )}
    </Box>
  );
}
