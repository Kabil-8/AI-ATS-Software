import React from 'react';
import { Box, Typography, Avatar, Chip, useTheme, alpha } from '@mui/material';
import { Psychology, CheckCircle, RocketLaunch, WorkOutline, Cancel } from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const EVENT_CONFIG = {
  applied:   { icon: WorkOutline,    color: '#3B82F6', label: 'Applied' },
  screening: { icon: Psychology,     color: '#8B5CF6', label: 'Under Review' },
  interview: { icon: CheckCircle,    color: '#5B4FCF', label: 'Interview Scheduled' },
  offered:   { icon: RocketLaunch,   color: '#059669', label: 'Offer Extended' },
  hired:     { icon: CheckCircle,    color: '#047857', label: 'Hired' },
  rejected:  { icon: Cancel,         color: '#DC2626', label: 'Rejected' },
  ai:        { icon: Psychology,     color: '#7B6FFF', label: 'AI Analysis Complete' },
};

export default function ActivityFeed({ events = [], maxItems = 8 }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const displayEvents = events.slice(0, maxItems);

  if (!displayEvents.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.disabled">No recent activity</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {displayEvents.map((event, i) => {
        const cfg = EVENT_CONFIG[event.status || event.type] || EVENT_CONFIG.applied;
        const Icon = cfg.icon;
        const isLast = i === displayEvents.length - 1;

        return (
          <Box key={i} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
            {/* Timeline line */}
            {!isLast && (
              <Box sx={{
                position: 'absolute', left: 16, top: 36, bottom: 0, width: 1,
                bgcolor: theme.palette.divider, zIndex: 0,
              }} />
            )}

            {/* Icon */}
            <Box sx={{ zIndex: 1, flexShrink: 0 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '50%',
                bgcolor: isDark ? alpha(cfg.color, 0.18) : alpha(cfg.color, 0.1),
                border: `2px solid ${alpha(cfg.color, 0.3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon sx={{ fontSize: 14, color: cfg.color }} />
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, pb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                <Typography variant="body2" fontWeight={600}>
                  {event.applicantName || `Candidate ${String.fromCharCode(65 + i)}`}
                </Typography>
                <Chip
                  label={cfg.label}
                  size="small"
                  sx={{
                    height: 18, fontSize: '0.65rem', fontWeight: 600,
                    bgcolor: alpha(cfg.color, isDark ? 0.18 : 0.1),
                    color: cfg.color,
                    border: `1px solid ${alpha(cfg.color, 0.25)}`,
                    borderRadius: 1,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {event.jobTitle || 'Job Position'}
                </Typography>
                <Typography variant="caption" color="text.disabled">·</Typography>
                <Typography variant="caption" color="text.disabled">
                  {dayjs(event.updatedAt || event.createdAt).fromNow()}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
