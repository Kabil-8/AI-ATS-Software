import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Chip, Button, useTheme, alpha } from '@mui/material';
import { LocationOn, WorkOutline, AccessTime, AttachMoney, Star, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const TYPE_COLORS = {
  'full-time': '#7B6FFF',
  'part-time': '#60A5FA',
  'remote':    '#34D399',
  'contract':  '#FCD34D',
  'internship':'#F472B6',
};

const AVATAR_PALETTE = ['#5B4FCF', '#3B82F6', '#059669', '#D97706', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function JobCard({ job, showApply = true }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const typeColor = TYPE_COLORS[job.type] || '#7B6FFF';

  const company = job.postedBy?.company || 'Company';
  const initial = company[0]?.toUpperCase();
  const avatarBg = AVATAR_PALETTE[company.charCodeAt(0) % AVATAR_PALETTE.length];

  const salary = job.salary?.isVisible && job.salary?.min
    ? `$${(job.salary.min / 1000).toFixed(0)}k – $${(job.salary.max / 1000).toFixed(0)}k`
    : null;

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      '&:hover .apply-btn': { opacity: 1, transform: 'translateX(0)' },
    }}>
      {/* Featured badge */}
      {job.isFeatured && (
        <Box sx={{
          position: 'absolute', top: 0, right: 0,
          background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
          px: 1.5, py: 0.4, borderBottomLeftRadius: 10,
          display: 'flex', alignItems: 'center', gap: 0.5,
          boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
        }}>
          <Star sx={{ fontSize: 11, color: '#fff' }} />
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
            FEATURED
          </Typography>
        </Box>
      )}

      {/* Top accent line */}
      <Box sx={{
        height: 3,
        background: `linear-gradient(90deg, ${typeColor}, ${alpha(typeColor, 0.3)})`,
      }} />

      <CardContent sx={{ flex: 1, p: 2.75, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
          <Avatar sx={{
            width: 46, height: 46,
            background: `linear-gradient(135deg, ${avatarBg}, ${alpha(avatarBg, 0.7)})`,
            fontWeight: 800, fontSize: '1.1rem', borderRadius: '12px', flexShrink: 0,
            boxShadow: `0 4px 12px ${alpha(avatarBg, 0.4)}`,
          }}>
            {initial}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{
              fontWeight: 700, mb: 0.25,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontSize: '0.95rem',
            }}>
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {company}
            </Typography>
          </Box>
        </Box>

        {/* Meta info */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
          {job.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <LocationOn sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">{job.location}</Typography>
            </Box>
          )}
          {job.department && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <WorkOutline sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">{job.department}</Typography>
            </Box>
          )}
          {salary && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <AttachMoney sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">{salary}</Typography>
            </Box>
          )}
        </Box>

        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          <Chip
            label={job.type?.replace('-', ' ')}
            size="small"
            sx={{
              bgcolor: alpha(typeColor, isDark ? 0.18 : 0.1),
              color: typeColor,
              fontWeight: 700,
              fontSize: '0.7rem',
              border: `1px solid ${alpha(typeColor, 0.25)}`,
              borderRadius: 99,
              height: 22,
              textTransform: 'capitalize',
            }}
          />
          <Chip
            label={job.experienceLevel}
            size="small"
            sx={{
              bgcolor: 'transparent',
              border: `1px solid ${theme.palette.divider}`,
              color: 'text.secondary',
              fontSize: '0.7rem',
              borderRadius: 99,
              height: 22,
              textTransform: 'capitalize',
            }}
          />
          {(job.skills || []).slice(0, 2).map(skill => (
            <Chip key={skill} label={skill} size="small"
              sx={{
                bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                color: 'text.secondary',
                border: `1px solid ${theme.palette.divider}`,
                fontSize: '0.68rem',
                borderRadius: 99,
                height: 22,
                textTransform: 'capitalize',
              }}
            />
          ))}
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Footer */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <AccessTime sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
              {dayjs(job.createdAt).fromNow()}
            </Typography>
          </Box>

          {showApply && (
            <Button
              className="apply-btn"
              variant="contained"
              size="small"
              endIcon={<ArrowForward sx={{ fontSize: '14px !important' }} />}
              onClick={() => navigate(`/jobs/${job._id}`)}
              sx={{
                borderRadius: 99, px: 2, py: 0.625, fontSize: '0.78rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.35)}`,
                opacity: 0.9,
                transform: 'translateX(4px)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                  opacity: 1,
                  transform: 'translateX(0)',
                },
              }}
            >
              Apply Now
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
