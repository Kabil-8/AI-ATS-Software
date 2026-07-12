import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Chip, Button, useTheme, alpha } from '@mui/material';
import { LocationOn, WorkOutline, AccessTime, AttachMoney, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const TYPE_COLORS = {
  'full-time': '#5B4FCF', 'part-time': '#3B82F6',
  'remote': '#059669', 'contract': '#D97706', 'internship': '#8B5CF6',
};

export default function JobCard({ job, showApply = true }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const typeColor = TYPE_COLORS[job.type] || '#5B4FCF';

  const company = job.postedBy?.company || 'Company';
  const initial = company[0]?.toUpperCase();

  const avatarColors = ['#5B4FCF','#3B82F6','#059669','#D97706','#8B5CF6','#EC4899'];
  const avatarBg = avatarColors[company.charCodeAt(0) % avatarColors.length];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
      {job.isFeatured && (
        <Box sx={{
          position: 'absolute', top: -10, right: 16,
          background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
          borderRadius: '6px', px: 1.5, py: 0.25,
          display: 'flex', alignItems: 'center', gap: 0.5,
          boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
        }}>
          <Star sx={{ fontSize: 12, color: '#fff' }} />
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>Featured</Typography>
        </Box>
      )}
      <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: avatarBg, fontWeight: 700, fontSize: '1.2rem', borderRadius: 2, flexShrink: 0 }}>
            {initial}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">{company}</Typography>
          </Box>
        </Box>

        {/* Meta info */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <LocationOn sx={{ fontSize: 14 }} />
            <Typography variant="caption">{job.location || 'Remote'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <WorkOutline sx={{ fontSize: 14 }} />
            <Typography variant="caption">{job.department}</Typography>
          </Box>
          {job.salary?.min && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <AttachMoney sx={{ fontSize: 14 }} />
              <Typography variant="caption">${job.salary.min.toLocaleString()} – ${job.salary.max?.toLocaleString()}</Typography>
            </Box>
          )}
        </Box>

        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          <Chip
            label={job.type?.replace('-', ' ')}
            size="small"
            sx={{ bgcolor: alpha(typeColor, isDark ? 0.18 : 0.1), color: typeColor, fontWeight: 600, border: `1px solid ${alpha(typeColor, 0.25)}`, borderRadius: 1.5 }}
          />
          <Chip
            label={job.experienceLevel}
            size="small"
            sx={{ bgcolor: 'transparent', border: `1px solid ${theme.palette.divider}`, color: 'text.secondary', borderRadius: 1.5 }}
          />
          {(job.skills || []).slice(0, 3).map(skill => (
            <Chip key={skill} label={skill} size="small"
              sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : '#F6F8FC', color: 'text.secondary', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}
            />
          ))}
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}>
            <AccessTime sx={{ fontSize: 13 }} />
            <Typography variant="caption">{dayjs(job.createdAt).fromNow()}</Typography>
          </Box>
          {showApply && (
            <Button
              variant="contained" size="small"
              onClick={() => navigate(`/jobs/${job._id}`)}
              sx={{ borderRadius: 2, px: 2.5, py: 0.75, fontSize: '0.8rem' }}
            >
              Apply Now
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
