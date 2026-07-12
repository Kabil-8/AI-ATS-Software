import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Chip, Menu, MenuItem, Skeleton, useTheme, alpha, Divider } from '@mui/material';
import { Add, MoreVert, Edit, Archive, Visibility, BarChart, People, WorkOutline, TrendingUp, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRecruiterStats, useMyJobs, useArchiveJob } from '../hooks/useJobs';
import KPICard from '../components/KPICard';
import ActivityFeed from '../components/ActivityFeed';
import StatusBadge from '../components/StatusBadge';
import AIScoreBar from '../components/AIScoreBar';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RecruiterDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useRecruiterStats();
  const { data: jobsData, isLoading: jobsLoading, refetch } = useMyJobs({ limit: 8 });
  const { mutateAsync: archiveJob } = useArchiveJob();
  const [menuState, setMenuState] = useState({ anchor: null, job: null });

  const jobs = jobsData?.data || [];

  const handleArchive = async () => {
    const job = menuState.job;
    setMenuState({ anchor: null, job: null });
    try {
      await archiveJob(job._id);
      toast.success('Job archived');
      refetch();
    } catch { toast.error('Failed to archive'); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ mb: 0.5 }}>{greeting}, {user?.name?.split(' ')[0]} 👋</Typography>
            <Typography variant="body1" color="text.secondary">Here's what's happening with your recruitment pipeline.</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/jobs/new')}
            sx={{ borderRadius: 2.5, px: 3, py: 1.25, fontSize: '0.95rem' }}>
            Post New Job
          </Button>
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[
            { title: 'Open Positions', value: statsLoading ? '—' : stats?.openJobs ?? 0, icon: WorkOutline, color: '#5B4FCF', trend: 'up', trendValue: '+2 this week' },
            { title: 'Active Applications', value: statsLoading ? '—' : stats?.totalApplications ?? 0, icon: People, color: '#3B82F6', trend: 'up', trendValue: '+18 today' },
            { title: 'Avg AI Match Score', value: statsLoading ? '—' : `${stats?.avgMatchScore ?? 0}%`, icon: BarChart, color: '#059669', trend: 'up', trendValue: '+3% vs last week' },
            { title: 'Time to Fill (avg)', value: '18 days', icon: AccessTime, color: '#D97706', trend: 'down', trendValue: '-2 days' },
          ].map(kpi => (
            <Grid item xs={12} sm={6} lg={3} key={kpi.title}>
              <KPICard {...kpi} loading={statsLoading} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Jobs table */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h4">My Job Listings</Typography>
                  <Button size="small" onClick={() => navigate('/jobs/new')} startIcon={<Add />} sx={{ borderRadius: 2 }}>New Job</Button>
                </Box>
                <Divider />
                {jobsLoading ? (
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={48} sx={{ borderRadius: 1 }} />)}
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>JOB TITLE</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>APPLICATIONS</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>AVG MATCH</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>STATUS</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>POSTED</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map(job => (
                        <TableRow key={job._id} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{job.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{job.department}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={job.applicationCount || 0} size="small"
                              sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
                          </TableCell>
                          <TableCell sx={{ minWidth: 120 }}>
                            {job.avgMatchScore != null
                              ? <AIScoreBar score={job.avgMatchScore} height={6} />
                              : <Typography variant="caption" color="text.disabled">No analysis yet</Typography>}
                          </TableCell>
                          <TableCell><StatusBadge status={job.status} /></TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">{dayjs(job.createdAt).format('MMM D')}</Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={e => setMenuState({ anchor: e.currentTarget, job })}>
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {jobs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="body2" color="text.disabled">No jobs posted yet</Typography>
                            <Button onClick={() => navigate('/jobs/new')} sx={{ mt: 1 }}>Post your first job</Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Activity feed */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>Recent Activity</Typography>
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
          </Grid>
        </Grid>

        {/* Quick actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<WorkOutline />} onClick={() => navigate('/pipeline')} sx={{ borderRadius: 2 }}>
            View Kanban Pipeline
          </Button>
          <Button variant="outlined" startIcon={<BarChart />} onClick={() => navigate('/rankings')} sx={{ borderRadius: 2 }}>
            Candidate Rankings
          </Button>
        </Box>
      </Container>

      {/* Job context menu */}
      <Menu anchorEl={menuState.anchor} open={Boolean(menuState.anchor)}
        onClose={() => setMenuState({ anchor: null, job: null })}
        PaperProps={{ sx: { minWidth: 180, borderRadius: 2 } }}>
        <MenuItem onClick={() => { setMenuState({ anchor: null, job: null }); navigate(`/jobs/${menuState.job?._id}/edit`); }} sx={{ gap: 1.5 }}>
          <Edit fontSize="small" /> Edit Job
        </MenuItem>
        <MenuItem onClick={() => { setMenuState({ anchor: null, job: null }); navigate(`/pipeline?job=${menuState.job?._id}`); }} sx={{ gap: 1.5 }}>
          <Visibility fontSize="small" /> View Pipeline
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleArchive} sx={{ gap: 1.5, color: 'warning.main' }}>
          <Archive fontSize="small" /> Archive Job
        </MenuItem>
      </Menu>
    </Box>
  );
}
