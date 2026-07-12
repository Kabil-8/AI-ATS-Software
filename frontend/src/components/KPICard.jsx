import React from 'react';
import { Card, CardContent, Box, Typography, useTheme, alpha } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color, loading = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardColor = color || theme.palette.primary.main;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : TrendingFlat;
  const trendColor = trend === 'up' ? theme.palette.success.main : trend === 'down' ? theme.palette.error.main : theme.palette.text.disabled;

  return (
    <Card sx={{
      background: isDark
        ? `linear-gradient(135deg, ${alpha(cardColor, 0.12)}, ${alpha(cardColor, 0.04)})`
        : `linear-gradient(135deg, ${alpha(cardColor, 0.05)}, #fff)`,
      border: `1px solid ${alpha(cardColor, isDark ? 0.25 : 0.15)}`,
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            background: `linear-gradient(135deg, ${cardColor}, ${alpha(cardColor, 0.7)})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(cardColor, 0.35)}`,
          }}>
            <Icon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          {trendValue !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
              <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>{trendValue}</Typography>
            </Box>
          )}
        </Box>

        {loading ? (
          <Box>
            <Box sx={{ height: 36, borderRadius: 1, bgcolor: alpha(cardColor, 0.1), mb: 1, animation: 'shimmer 1.5s infinite' }} />
            <Box sx={{ height: 16, borderRadius: 1, bgcolor: alpha(cardColor, 0.06), width: '60%', animation: 'shimmer 1.5s infinite' }} />
          </Box>
        ) : (
          <>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
            {subtitle && <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>{subtitle}</Typography>}
          </>
        )}
      </CardContent>
      <style>{`@keyframes shimmer{0%{opacity:0.6}50%{opacity:1}100%{opacity:0.6}}`}</style>
    </Card>
  );
}
