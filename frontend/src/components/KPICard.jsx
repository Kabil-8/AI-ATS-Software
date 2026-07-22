import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton, useTheme, alpha } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color, loading = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardColor = color || theme.palette.primary.main;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : TrendingFlat;
  const trendColor = trend === 'up'
    ? theme.palette.success.main
    : trend === 'down'
    ? theme.palette.error.main
    : theme.palette.text.disabled;

  return (
    <Card sx={{
      background: isDark
        ? `linear-gradient(140deg, ${alpha(cardColor, 0.14)} 0%, ${alpha('#0F1120', 0.9)} 60%)`
        : `linear-gradient(140deg, ${alpha(cardColor, 0.07)} 0%, #FFFFFF 60%)`,
      border: `1px solid ${alpha(cardColor, isDark ? 0.22 : 0.14)}`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle glow in top-right corner */}
      <Box sx={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(cardColor, isDark ? 0.3 : 0.15)}, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <CardContent sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{
            width: 46, height: 46, borderRadius: '13px',
            background: `linear-gradient(135deg, ${cardColor}, ${alpha(cardColor, 0.75)})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 16px ${alpha(cardColor, 0.4)}`,
          }}>
            <Icon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>

          {trendValue !== undefined && !loading && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.4,
              px: 1, py: 0.4, borderRadius: 99,
              bgcolor: alpha(trendColor, isDark ? 0.15 : 0.1),
              border: `1px solid ${alpha(trendColor, 0.2)}`,
            }}>
              <TrendIcon sx={{ fontSize: 13, color: trendColor }} />
              <Typography variant="caption" sx={{ color: trendColor, fontWeight: 700, fontSize: '0.72rem', lineHeight: 1 }}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>

        {loading ? (
          <Box>
            <Skeleton height={38} sx={{ borderRadius: 1, mb: 0.5 }} />
            <Skeleton height={16} width="55%" sx={{ borderRadius: 1 }} />
          </Box>
        ) : (
          <>
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: 1.1,
                mb: 0.5,
                color: 'text.primary',
                letterSpacing: '-0.03em',
              }}
            >
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.82rem' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
