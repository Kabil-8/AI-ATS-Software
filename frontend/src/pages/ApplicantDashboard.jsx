import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Skeleton, Button, useTheme, alpha, LinearProgress, Avatar } from '@mui/material';
import { WorkOutline, Psychology, CheckCircle, AccessTime, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMyApplications } from '../hooks/useApplications';
import StatusBadge from '../components/StatusBadge';
import AIScoreBar from '../components/AIScoreBar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const AVATAR_COLORS = ['#5B4FCF','#3B82F6','#059669','#D97706','#8B5CF6'];

function ApplicationCard({ app, index }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const job = app.job || {};
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const company = job?.company?.name || job?.postedBy?.company || app.company?.name || 'Organization';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
          <Avatar sx={{ width: 44, height: 44, bgcolor: color, fontWeight: 700, borderRadius: 2, flexShrink: 0 }}>
            {company[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={600} noWrap>{job?.title || 'Applied Role'}</Typography>
            <Typography variant="body2" color="text.secondary">{company}</Typography>
          </Box>
          <StatusBadge status={app.status} />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <WorkOutline sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{job?.employmentType || job?.type || 'Full-time'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <AccessTime sx={{ fontSize: 14 }} />
            <Typography variant="caption">Applied {dayjs(app.createdAt || app.appliedDate).fromNow()}</Typography>
          </Box>
        </Box>

        {/* AI Score */}
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? alpha('#7B6FFF', 0.06) : alpha('#5B4FCF', 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <Psychology sx={{ fontSize: 15, color: 'primary.main' }} />
            <Typography variant="caption" fontWeight={600} color="primary.main">AI Match Score</Typography>
          </Box>
          {app.aiScore !== undefined || app.aiAnalysis?.isAnalyzed ? (
            <AIScoreBar score={app.aiScore || app.aiAnalysis?.matchScore || 75} height={7} />
          ) : (
            <Typography variant="caption" color="text.disabled">Analysis complete</Typography>
          )}
        </Box>

        {/* Skills */}
        {app.aiAnalysis?.skillsMatched?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {app.aiAnalysis.skillsMatched.slice(0, 4).map((s) => (
              <Chip key={s} label={s} size="small" icon={<CheckCircle sx={{ fontSize: '12px !important', color: 'success.main !important' }} />}
                sx={{ fontSize: '0.68rem', height: 22, bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main' }} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function ApplicantDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isLoading } = useMyApplications();

  const applications = Array.isArray(data) ? data : [];
  const total = applications.length;
  const analyzed = applications.filter((a) => a.aiScore || a.aiAnalysis?.isAnalyzed).length;
  const interviews = applications.filter((a) => a.status === 'interview' || a.status === 'offered' || a.status === 'technical_round').length;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ mb: 0.5 }}>My Applications</Typography>
            <Typography variant="body2" color="text.secondary">Track your job applications and AI match scores</Typography>
          </Box>
          <Button variant="contained" onClick={() => navigate('/jobs')} endIcon={<ArrowForward />} sx={{ borderRadius: 2.5 }}>
            Browse More Jobs
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[
            { label: 'Total Applied', value: total, color: '#5B4FCF', icon: WorkOutline },
            { label: 'AI Analyzed', value: analyzed, color: '#3B82F6', icon: Psychology },
            { label: 'Interviews / Offers', value: interviews, color: '#059669', icon: CheckCircle },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Grid item xs={12} sm={4} key={s.label}>
                <Card sx={{ bgcolor: alpha(s.color, theme.palette.mode === 'dark' ? 0.1 : 0.05), border: `1px solid ${alpha(s.color, 0.2)}` }}>
                  <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(s.color, 0.35)}` }}>
                      <Icon sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="h3" sx={{ color: s.color, fontWeight: 700 }}>{s.value}</Typography>
                      <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Applications grid */}
        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : applications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <WorkOutline sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h3" color="text.secondary" sx={{ mb: 1 }}>No applications yet</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>Start applying to jobs and your applications will appear here</Typography>
            <Button variant="contained" onClick={() => navigate('/jobs')} sx={{ borderRadius: 2.5 }}>Browse Open Roles</Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {applications.map((app, i) => (
              <Grid item xs={12} sm={6} md={4} key={app._id}>
                <ApplicationCard app={app} index={i} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
