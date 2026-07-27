import React from 'react';
import { Box, Typography, useTheme, alpha, Skeleton } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      border: `1px solid`,
      borderColor: 'divider',
      borderRadius: 2,
      p: 1.5,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      minWidth: 140,
    }}>
      <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.75, color: 'text.primary' }}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Box key={entry.dataKey} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {entry.name}
          </Typography>
          <Typography variant="caption" fontWeight={700} color="text.primary">
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default function JobAnalyticsChart({ data = [], loading = false, view = 'applications' }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const primaryColor = theme.palette.primary.main;   // #7B6FFF-ish
  const secondaryColor = '#34D399';
  const gridColor = isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06);

  if (loading) {
    return (
      <Box sx={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: 1, px: 1 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            sx={{ flex: 1, borderRadius: 2, height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </Box>
    );
  }

  if (!data.length) {
    return (
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.disabled">
          No job data to chart yet
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -16 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="title"
          tick={{ fill: theme.palette.text.disabled, fontSize: 11, fontFamily: '"Inter", sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: theme.palette.text.disabled, fontSize: 11, fontFamily: '"Inter", sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(primaryColor, 0.05), radius: 6 }} />
        <Legend
          wrapperStyle={{ fontSize: '12px', fontFamily: '"Inter", sans-serif', paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="applications"
          name="Applications"
          radius={[5, 5, 0, 0]}
          maxBarSize={36}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-apps-${index}`}
              fill={primaryColor}
              fillOpacity={entry.status === 'active' ? 1 : 0.45}
            />
          ))}
        </Bar>
        <Bar
          dataKey="views"
          name="Views"
          radius={[5, 5, 0, 0]}
          maxBarSize={36}
          fill={secondaryColor}
          fillOpacity={0.7}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
