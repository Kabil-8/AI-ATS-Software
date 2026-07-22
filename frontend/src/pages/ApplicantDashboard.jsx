import React from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Chip,
  Skeleton, Button, useTheme, alpha, LinearProgress, Avatar,
} from '@mui/material';
import {
  WorkOutline, Psychology, CheckCircle, AccessTime, ArrowForward,
  RocketLaunch, AutoAwesome, TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMyApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import AIScoreBar from '../components/AIScoreBar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const AVATAR_COLORS = ['#5B4FCF', '#3B82F6', '#059669', '#D97706', '#8B5CF6', '#EC4899'];

function ApplicationCard({ app, index }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const job = app.job;
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const company = job?.postedBy?.company || 'Company';

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top accent */}
      <Box sx={{
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`,
      }} />

      <CardContent sx={{ flex: 1, p: 2.75, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
          <Avatar sx={{
            width: 46, height: 46, flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
            fontWeight: 800, fontSize: '1.1rem', borderRadius: '12px',
            boxShadow: `0 4px 14px ${alpha(color, 0.4)}`,
          }}>
            {company[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700} noWrap sx={{ fontSize: '0.95rem' }}>
              {job?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{company}</Typography>
          </Box>
          <StatusBadge status={app.status} />
        </Box>

        {/* Meta */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: 'text.secondary' }}>
            <WorkOutline sx={{ fontSize: 13 }} />
            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
              {job?.type?.replace('-', ' ')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: 'text.secondary' }}>
            <AccessTime sx={{ fontSize: 13 }} />
            <Typography variant="caption">Applied {dayjs(app.createdAt).fromNow()}</Typography>
          </Box>
        </Box>

        {/* AI Score panel */}
        <Box sx={{
          p: 2, borderRadius: 2.5,
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#7B6FFF', 0.08)}, ${alpha('#0F1120', 0.5)})`
            : `linear-gradient(135deg, ${alpha('#5B4FCF', 0.04)}, ${alpha('#F4F5FF', 0.8)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.15 : 0.1)}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
            <Box sx={{
              width: 24, height: 24, borderRadius: '7px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Psychology sx={{ fontSize: 13, color: '#fff' }} />
            </Box>
            <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontSize: '0.75rem' }}>
              AI Match Score
            </Typography>
          </Box>

          {app.aiAnalysis?.isAnalyzed ? (
            <AIScoreBar score={app.aiAnalysis.matchScore} height={7} />
          ) : app.aiAnalysis?.isAnalyzing ? (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>
                Analyzing your resume…
              </Typography>
              <LinearProgress sx={{ height: 5, borderRadius: 99 }} />
            </Box>
          ) : (
            <Typography variant="caption" color="text.disabled">
              Analysis pending — check back shortly
            </Typography>
          )}
        </Box>

        {/* Matched skills */}
        {app.aiAnalysis?.skillsMatched?.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.disabled" sx={{ mb: 0.75, display: 'block', fontWeight: 600 }}>
              MATCHED SKILLS
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {app.aiAnalysis.skillsMatched.slice(0, 4).map(s => (
                <Chip
                  key={s} label={s} size="small"
                  icon={<CheckCircle sx={{ fontSize: '11px !important', color: `${theme.palette.success.main} !important` }} />}
                  sx={{
                    fontSize: '0.68rem', height: 22, borderRadius: 99,
                    bgcolor: alpha(theme.palette.success.main, isDark ? 0.12 : 0.08),
                    color: 'success.main',
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function ApplicantDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: applications, isLoading } = useMyApplications();

  const total = applications?.length || 0;
  const analyzed = applications?.filter(a => a.aiAnalysis?.isAnalyzed).length || 0;
  const interviews = applications?.filter(a => ['interview', 'offered', 'hired'].includes(a.status)).length || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Total Applied', value: total, color: '#7B6FFF', icon: WorkOutline },
    { label: 'AI Analyzed', value: analyzed, color: '#60A5FA', icon: AutoAwesome },
    { label: 'Interviews / Offers', value: interviews, color: '#34D399', icon: RocketLaunch },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>

        {/* Header */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          mb: 6, flexWrap: 'wrap', gap: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              width: 52, height: 52, borderRadius: '14px',
              background: `linear-gradient(135deg, #34D399, #60A5FA)`,
              fontSize: '1.1rem', fontWeight: 700,
              boxShadow: `0 6px 20px ${alpha('#34D399', 0.4)}`,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h2" sx={{ mb: 0.25, fontWeight: 700 }}>
                {greeting}, {user?.name?.split(' ')[0]} 👋
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your applications and AI match scores
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/jobs')}
            sx={{
              borderRadius: 2.5, px: 3, py: 1.25, fontSize: '0.9rem',
              background: `linear-gradient(135deg, #34D399, #60A5FA)`,
              boxShadow: `0 4px 18px ${alpha('#34D399', 0.4)}`,
              '&:hover': { boxShadow: `0 8px 28px ${alpha('#34D399', 0.55)}` },
            }}
          >
            Browse Jobs
          </Button>
        </Box>

        {/* Stats row */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <Grid item xs={12} sm={4} key={s.label}>
                <Card sx={{
                  background: isDark
                    ? `linear-gradient(140deg, ${alpha(s.color, 0.14)}, ${alpha('#0F1120', 0.9)})`
                    : `linear-gradient(140deg, ${alpha(s.color, 0.07)}, #FFFFFF)`,
                  border: `1px solid ${alpha(s.color, isDark ? 0.22 : 0.14)}`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <Box sx={{
                    position: 'absolute', top: -20, right: -20,
                    width: 80, height: 80, borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(s.color, isDark ? 0.3 : 0.15)}, transparent 70%)`,
                  }} />
                  <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{
                      width: 46, height: 46, borderRadius: '13px',
                      background: `linear-gradient(135deg, ${s.color}, ${alpha(s.color, 0.75)})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 16px ${alpha(s.color, 0.4)}`, flexShrink: 0,
                    }}>
                      <Icon sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 800, fontSize: '2rem', lineHeight: 1,
                        color: 'text.primary', letterSpacing: '-0.03em', mb: 0.25,
                      }}>
                        {s.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.82rem' }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Applications section header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>My Applications</Typography>
          <Typography variant="body2" color="text.secondary">
            {total > 0 ? `${total} application${total !== 1 ? 's' : ''} · ${analyzed} AI-analyzed` : 'Start applying to see your applications here'}
          </Typography>
        </Box>

        {/* Applications grid */}
        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : applications?.length === 0 ? (
          <Box sx={{
            textAlign: 'center', py: 12,
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 4,
          }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '20px', mx: 'auto', mb: 3,
              background: isDark ? alpha('#7B6FFF', 0.1) : alpha('#5B4FCF', 0.06),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <WorkOutline sx={{ fontSize: 34, color: 'text.disabled' }} />
            </Box>
            <Typography variant="h3" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              No applications yet
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 4, maxWidth: 340, mx: 'auto', lineHeight: 1.8 }}>
              Browse open roles and start applying — your applications will appear here with AI match scores.
            </Typography>
            <Button
              variant="contained" onClick={() => navigate('/jobs')}
              startIcon={<RocketLaunch />}
              sx={{
                borderRadius: 3, px: 4, py: 1.25,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                boxShadow: `0 4px 18px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              Browse Open Roles
            </Button>
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
