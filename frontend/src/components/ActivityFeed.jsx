import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import {
  Psychology, CheckCircle, RocketLaunch, WorkOutline, Cancel,
  HourglassBottom, LocalOffer, EmojiEvents,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const EVENT_CONFIG = {
  applied:   { icon: WorkOutline,     color: '#60A5FA', label: 'Applied' },
  screening: { icon: HourglassBottom, color: '#A78BFA', label: 'Under Review' },
  interview: { icon: Psychology,      color: '#7B6FFF', label: 'Interview' },
  offered:   { icon: LocalOffer,      color: '#34D399', label: 'Offer Extended' },
  hired:     { icon: EmojiEvents,     color: '#10B981', label: 'Hired 🎉' },
  rejected:  { icon: Cancel,          color: '#F87171', label: 'Rejected' },
  ai:        { icon: Psychology,      color: '#7B6FFF', label: 'AI Complete' },
};

export default function ActivityFeed({ events = [], maxItems = 8 }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const displayEvents = events.slice(0, maxItems);

  if (!displayEvents.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: '14px', mx: 'auto', mb: 2,
          background: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.06),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <WorkOutline sx={{ fontSize: 24, color: 'text.disabled' }} />
        </Box>
        <Typography variant="body2" color="text.disabled">No recent activity yet</Typography>
        <Typography variant="caption" color="text.disabled">
          Applications will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {displayEvents.map((event, i) => {
        const cfg = EVENT_CONFIG[event.status || event.type] || EVENT_CONFIG.applied;
        const Icon = cfg.icon;
        const isLast = i === displayEvents.length - 1;

        return (
          <Box key={i} sx={{ display: 'flex', gap: 1.75, position: 'relative' }}>
            {/* Timeline connector */}
            {!isLast && (
              <Box sx={{
                position: 'absolute',
                left: 15, top: 34, bottom: 0, width: 1.5,
                background: isDark
                  ? `linear-gradient(180deg, ${alpha(cfg.color, 0.3)}, ${theme.palette.divider})`
                  : `linear-gradient(180deg, ${alpha(cfg.color, 0.2)}, ${theme.palette.divider})`,
                zIndex: 0,
              }} />
            )}

            {/* Icon dot */}
            <Box sx={{ zIndex: 1, flexShrink: 0, pt: 0.25 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '50%',
                background: isDark
                  ? `radial-gradient(circle, ${alpha(cfg.color, 0.2)}, ${alpha(cfg.color, 0.08)})`
                  : alpha(cfg.color, 0.1),
                border: `1.5px solid ${alpha(cfg.color, isDark ? 0.45 : 0.3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 0 3px ${alpha(cfg.color, isDark ? 0.08 : 0.05)}`,
              }}>
                <Icon sx={{ fontSize: 14, color: cfg.color }} />
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, pb: 2.5, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {event.applicantName || `Candidate ${String.fromCharCode(65 + i)}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {event.jobTitle || 'Job Position'}
                  </Typography>
                </Box>
                <Box sx={{ flexShrink: 0 }}>
                  <Box sx={{
                    px: 0.875, py: 0.25, borderRadius: 99,
                    bgcolor: alpha(cfg.color, isDark ? 0.15 : 0.08),
                    border: `1px solid ${alpha(cfg.color, 0.2)}`,
                  }}>
                    <Typography variant="caption" sx={{
                      color: cfg.color, fontWeight: 700,
                      fontSize: '0.65rem', whiteSpace: 'nowrap',
                    }}>
                      {cfg.label}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'right', mt: 0.25, fontSize: '0.65rem' }}>
                    {dayjs(event.updatedAt || event.createdAt).fromNow()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
