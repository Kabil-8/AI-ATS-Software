import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, IconButton, Tooltip, Chip, useTheme, alpha } from '@mui/material';
import { MoreVert, Psychology } from '@mui/icons-material';
import AIScoreRing from './AIScoreRing';
import StatusBadge from './StatusBadge';

const AVATAR_COLORS = ['#5B4FCF','#3B82F6','#059669','#D97706','#8B5CF6','#EC4899','#0891B2'];

export default function CandidateCard({ application, index = 0, onMenuClick, compact = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const initials = application.applicant?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];

  const score = application.aiAnalysis?.matchScore;
  const isAnalyzed = application.aiAnalysis?.isAnalyzed;
  const isAnalyzing = application.aiAnalysis?.isAnalyzing;
  const skills = application.aiAnalysis?.skillsMatched || [];

  return (
    <Card sx={{ mb: 1.5, cursor: 'default' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Avatar */}
          <Avatar sx={{ width: 36, height: 36, bgcolor: avatarBg, fontWeight: 700, fontSize: '0.8rem', flexShrink: 0, borderRadius: 1.5 }}>
            {initials}
          </Avatar>

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              Candidate {String.fromCharCode(65 + index)}
            </Typography>
            <StatusBadge status={application.status} sx={{ mt: 0.25 }} />
          </Box>

          {/* AI Score */}
          {isAnalyzed && score !== undefined ? (
            <AIScoreRing score={score} size={52} strokeWidth={5} />
          ) : isAnalyzing ? (
            <Box sx={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Psychology sx={{ color: 'primary.main', fontSize: 28, animation: 'pulse 1.5s infinite' }} />
            </Box>
          ) : (
            <Box sx={{
              width: 52, height: 52, borderRadius: '50%',
              border: `2px dashed ${theme.palette.divider}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography variant="caption" color="text.disabled">N/A</Typography>
            </Box>
          )}

          {onMenuClick && (
            <IconButton size="small" onClick={(e) => onMenuClick(e, application)} sx={{ flexShrink: 0 }}>
              <MoreVert fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Skills */}
        {skills.length > 0 && !compact && (
          <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {skills.slice(0, 3).map(s => (
              <Chip key={s} label={s} size="small"
                sx={{ fontSize: '0.68rem', height: 20, bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08), color: 'primary.main', borderRadius: 1 }}
              />
            ))}
            {skills.length > 3 && (
              <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center' }}>+{skills.length - 3}</Typography>
            )}
          </Box>
        )}
      </CardContent>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.95)} }`}</style>
    </Card>
  );
}
