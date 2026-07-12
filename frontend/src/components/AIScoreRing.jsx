import React, { useEffect, useRef } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';

const getScoreColor = (score, theme) => {
  if (score >= 80) return theme.palette.success.main;
  if (score >= 60) return theme.palette.warning.main;
  return theme.palette.error.main;
};

export default function AIScoreRing({ score, size = 80, strokeWidth = 7, showLabel = true, animate = true }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const circleRef = useRef(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score, theme);
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = circumference;
    const t = requestAnimationFrame(() => {
      if (circleRef.current) circleRef.current.style.strokeDashoffset = offset;
    });
    return () => cancelAnimationFrame(t);
  }, [score, offset, circumference, animate]);

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={isDark ? alpha(color, 0.15) : alpha(color, 0.12)}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
          style={{
            transition: animate ? 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            filter: isDark ? `drop-shadow(0 0 6px ${alpha(color, 0.5)})` : 'none',
          }}
        />
      </svg>
      {showLabel && (
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: size * 0.22, fontWeight: 700, color, lineHeight: 1, fontFamily: '"Space Grotesk", sans-serif' }}>
            {score}
          </Typography>
          <Typography sx={{ fontSize: size * 0.13, color: 'text.disabled', fontWeight: 500 }}>%</Typography>
        </Box>
      )}
    </Box>
  );
}
