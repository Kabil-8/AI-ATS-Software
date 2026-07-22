import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Button, Card, CardContent,
  IconButton, Chip, Menu, MenuItem, Skeleton, useTheme, alpha, Divider, Avatar,
} from '@mui/material';
import {
  Add, MoreVert, Edit, Archive, Visibility, BarChart, People, Psychology,
  TrendingUp, ContentCopy, CloudUpload, CloudOff, RocketLaunch, ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRecruiterStats, useMyJobs, useArchiveJob, usePublishJob, useDuplicateJob } from '../hooks/useJobs';
import KPICard from '../components/KPICard';
import ActivityFeed from '../components/ActivityFeed';
import StatusBadge from '../components/StatusBadge';
import AIScoreBar from '../components/AIScoreBar';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const QUICK_ACTIONS = [
  { label: 'Kanban Pipeline', icon: RocketLaunch, path: '/pipeline', color: '#7B6FFF' },
  { label: 'Candidate Rankings', icon: BarChart, path: '/rankings', color: '#34D399' },
];

export default function RecruiterDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useRecruiterStats();
  const { data: jobsData, isLoading: jobsLoading, refetch } = useMyJobs({ limit: 8 });
  const { mutateAsync: archiveJob } = useArchiveJob();
  const { mutateAsync: publishJob } = usePublishJob();
  const { mutateAsync: duplicateJob } = useDuplicateJob();
  const [menuState, setMenuState] = useState({ anchor: null, job: null });

  const jobs = jobsData?.data || [];

  const handleArchive = async () => {
    const job = menuState.job;
    setMenuState({ anchor: null, job: null });
    try { await archiveJob(job._id); toast.success('Job archived'); refetch(); }
    catch { toast.error('Failed to archive'); }
  };

  const handlePublishToggle = async () => {
    const job = menuState.job;
    setMenuState({ anchor: null, job: null });
    try {
      await publishJob(job._id);
      toast.success(job.status === 'active' ? 'Job moved to draft' : 'Job published!');
      refetch();
    } catch { toast.error('Failed to update job status'); }
  };

  const handleDuplicate = async () => {
    const job = menuState.job;
    setMenuState({ anchor: null, job: null });
    try { await duplicateJob(job._id); toast.success('Job duplicated as draft'); refetch(); }
    catch { toast.error('Failed to duplicate'); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'R';

  const kpiCards = [
    { title: 'Open Positions', value: statsLoading ? '—' : stats?.openJobs ?? 0, icon: Psychology, color: '#7B6FFF', trend: 'up', trendValue: '+2 this week' },
    { title: 'Draft Jobs', value: statsLoading ? '—' : stats?.draftJobs ?? 0, icon: TrendingUp, color: '#F59E0B', trend: null, trendValue: 'Unpublished' },
    { title: 'Applications', value: statsLoading ? '—' : stats?.totalApplications ?? 0, icon: People, color: '#60A5FA', trend: 'up', trendValue: '+18 today' },
    { title: 'Avg AI Match', value: statsLoading ? '—' : `${stats?.avgMatchScore ?? 0}%`, icon: BarChart, color: '#34D399', trend: 'up', trendValue: '+3% this week' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          mb: 6, flexWrap: 'wrap', gap: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              width: 52, height: 52, borderRadius: '14px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              fontSize: '1.1rem', fontWeight: 700,
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h2" sx={{ mb: 0.25, fontWeight: 700 }}>
                {greeting}, {user?.name?.split(' ')[0]} 👋
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Here's what's happening with your recruitment pipeline today.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/jobs/new')}
            sx={{
              borderRadius: 2.5, px: 3, py: 1.25, fontSize: '0.9rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
              boxShadow: `0 4px 18px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': { boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.55)}` },
            }}
          >
            Post New Job
          </Button>
        </Box>

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {kpiCards.map(kpi => (
            <Grid item xs={12} sm={6} lg={3} key={kpi.title}>
              <KPICard {...kpi} loading={statsLoading} />
            </Grid>
          ))}
        </Grid>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <Grid container spacing={3}>

          {/* Jobs table */}
          <Grid item xs={12} md={8}>
            <Card sx={{ overflow: 'hidden' }}>
              {/* Table header */}
              <Box sx={{
                px: 3, py: 2.5,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.25 }}>My Job Listings</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {jobs.length} job{jobs.length !== 1 ? 's' : ''} · Manage your postings
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate('/jobs/new')}
                  variant="outlined"
                  sx={{ borderRadius: 2, fontSize: '0.8rem' }}
                >
                  New Job
                </Button>
              </Box>

              {/* Table body */}
              {jobsLoading ? (
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} height={56} sx={{ borderRadius: 2 }} />
                  ))}
                </Box>
              ) : jobs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10, px: 3 }}>
                  <Box sx={{
                    width: 64, height: 64, borderRadius: '18px', mx: 'auto', mb: 2.5,
                    background: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.07),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Psychology sx={{ fontSize: 28, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h4" color="text.secondary" sx={{ mb: 1 }}>No jobs posted yet</Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                    Create your first job posting to start receiving applications
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/jobs/new')} startIcon={<Add />} sx={{ borderRadius: 2.5 }}>
                    Post Your First Job
                  </Button>
                </Box>
              ) : (
                <Box>
                  {/* Column headers */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 130px 90px 70px 40px',
                    px: 3, py: 1.5,
                    bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}>
                    {['JOB TITLE', 'APPS', 'AI MATCH', 'STATUS', 'POSTED', ''].map(h => (
                      <Typography key={h} variant="caption" sx={{
                        fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em',
                        color: 'text.disabled',
                      }}>
                        {h}
                      </Typography>
                    ))}
                  </Box>

                  {jobs.map((job, idx) => (
                    <Box
                      key={job._id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 80px 130px 90px 70px 40px',
                        alignItems: 'center',
                        px: 3, py: 2,
                        borderBottom: idx < jobs.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.6)}` : 'none',
                        transition: 'background-color 0.15s ease',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.05 : 0.02) },
                      }}
                    >
                      {/* Title */}
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1,
                        }}>
                          {job.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{job.department}</Typography>
                      </Box>

                      {/* Applications count */}
                      <Box>
                        <Chip
                          label={job.applicationCount || 0}
                          size="small"
                          sx={{
                            fontWeight: 700, height: 22, fontSize: '0.75rem',
                            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08),
                            color: 'primary.main',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          }}
                        />
                      </Box>

                      {/* AI Score */}
                      <Box sx={{ pr: 1 }}>
                        {job.avgMatchScore != null
                          ? <AIScoreBar score={job.avgMatchScore} height={5} />
                          : <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>No data yet</Typography>}
                      </Box>

                      {/* Status */}
                      <Box><StatusBadge status={job.status} /></Box>

                      {/* Date */}
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {dayjs(job.createdAt).format('MMM D')}
                      </Typography>

                      {/* Actions */}
                      <IconButton
                        size="small"
                        onClick={e => setMenuState({ anchor: e.currentTarget, job })}
                        sx={{
                          width: 28, height: 28, borderRadius: '8px',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                        }}
                      >
                        <MoreVert sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Grid>

          {/* Right sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Activity Feed */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Recent Activity</Typography>
                  <ActivityFeed
                    events={(stats?.recentActivity || []).map(a => ({
                      status: a.status,
                      applicantName: a.applicant?.name?.split(' ')[0] || 'Candidate',
                      jobTitle: a.job?.title,
                      updatedAt: a.updatedAt,
                    }))}
                  />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2.5 }}>Quick Actions</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {QUICK_ACTIONS.map(({ label, icon: Icon, path, color }) => (
                      <Box
                        key={label}
                        onClick={() => navigate(path)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 2,
                          p: 1.75, borderRadius: 2.5, cursor: 'pointer',
                          border: `1px solid ${alpha(color, isDark ? 0.2 : 0.12)}`,
                          background: isDark
                            ? alpha(color, 0.06)
                            : alpha(color, 0.03),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: alpha(color, 0.5),
                            background: alpha(color, isDark ? 0.12 : 0.06),
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Box sx={{
                          width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                          background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: `0 4px 12px ${alpha(color, 0.35)}`,
                        }}>
                          <Icon sx={{ fontSize: 18, color: '#fff' }} />
                        </Box>
                        <Typography variant="body2" fontWeight={600}>{label}</Typography>
                        <ArrowForward sx={{ fontSize: 16, color: 'text.disabled', ml: 'auto' }} />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Job context menu */}
      <Menu
        anchorEl={menuState.anchor}
        open={Boolean(menuState.anchor)}
        onClose={() => setMenuState({ anchor: null, job: null })}
        PaperProps={{
          sx: {
            minWidth: 190, borderRadius: 2.5,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(123,111,255,0.1)'
              : '0 8px 32px rgba(11,13,21,0.15)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => { setMenuState({ anchor: null, job: null }); navigate(`/jobs/${menuState.job?._id}/edit`); }}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, fontSize: '0.875rem' }}
        >
          <Edit fontSize="small" /> Edit Job
        </MenuItem>
        <MenuItem
          onClick={() => { setMenuState({ anchor: null, job: null }); navigate(`/pipeline?job=${menuState.job?._id}`); }}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, fontSize: '0.875rem' }}
        >
          <Visibility fontSize="small" /> View Pipeline
        </MenuItem>
        <MenuItem
          onClick={handlePublishToggle}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, fontSize: '0.875rem' }}
        >
          {menuState.job?.status === 'active'
            ? <><CloudOff fontSize="small" /> Unpublish (Draft)</>
            : <><CloudUpload fontSize="small" /> Publish Job</>}
        </MenuItem>
        <MenuItem
          onClick={handleDuplicate}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, fontSize: '0.875rem' }}
        >
          <ContentCopy fontSize="small" /> Duplicate
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={handleArchive}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, color: 'warning.main', fontSize: '0.875rem' }}
        >
          <Archive fontSize="small" /> Archive Job
        </MenuItem>
      </Menu>
    </Box>
  );
}
