import React, { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Grid, Button, Card, CardContent,
  IconButton, Chip, Menu, MenuItem, Skeleton, useTheme, alpha,
  Divider, Avatar, TextField, InputAdornment, Tabs, Tab,
  Checkbox, Collapse, Tooltip, Badge,
} from '@mui/material';
import {
  Add, MoreVert, Edit, Archive, Visibility, BarChart, People, Psychology,
  TrendingUp, ContentCopy, CloudUpload, CloudOff, RocketLaunch, ArrowForward,
  Search, Sort, CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBox,
  FilterList, Close, Inventory2, WorkOff, LockClock, OpenInNew, Refresh,
  Analytics, EmojiEvents, TrendingDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useRecruiterStats, useMyJobs, useArchiveJob, usePublishJob,
  useDuplicateJob, useCloseJob, useJobAnalytics, useBulkJobAction,
} from '../hooks/useJobs';
import KPICard from '../components/KPICard';
import ActivityFeed from '../components/ActivityFeed';
import StatusBadge from '../components/StatusBadge';
import AIScoreBar from '../components/AIScoreBar';
import FunnelChart from '../components/FunnelChart';
import JobAnalyticsChart from '../components/JobAnalyticsChart';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
dayjs.extend(relativeTime);

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: 'all',      label: 'All Jobs',  icon: Inventory2 },
  { value: 'active',   label: 'Active',    icon: CloudUpload },
  { value: 'draft',    label: 'Draft',     icon: WorkOff },
  { value: 'closed',   label: 'Closed',    icon: LockClock },
  { value: 'archived', label: 'Archived',  icon: Archive },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt',  label: 'Oldest First' },
  { value: '-applicationCount', label: 'Most Applications' },
  { value: '-views',     label: 'Most Views' },
  { value: 'title',      label: 'Title A→Z' },
];

const QUICK_ACTIONS = [
  { label: 'Kanban Pipeline', icon: RocketLaunch, path: '/pipeline', color: '#7B6FFF' },
  { label: 'Candidate Rankings', icon: BarChart, path: '/rankings', color: '#34D399' },
];

const BULK_ACTION_OPTIONS = [
  { action: 'publish',  label: 'Publish Selected',  color: '#34D399', icon: CloudUpload },
  { action: 'draft',    label: 'Move to Draft',     color: '#FCD34D', icon: WorkOff },
  { action: 'close',    label: 'Close Selected',    color: '#F59E0B', icon: LockClock },
  { action: 'archive',  label: 'Archive Selected',  color: '#F87171', icon: Archive },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatSummaryPill({ label, value, color }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75,
      px: 1.5, py: 0.5, borderRadius: 99,
      bgcolor: alpha(color, isDark ? 0.15 : 0.08),
      border: `1px solid ${alpha(color, 0.25)}`,
    }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="caption" fontWeight={700} sx={{ color, fontSize: '0.72rem' }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RecruiterDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data
  const { data: stats, isLoading: statsLoading } = useRecruiterStats();
  const { data: analytics, isLoading: analyticsLoading } = useJobAnalytics();

  // Table state
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [page] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [menuState, setMenuState] = useState({ anchor: null, job: null });

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const jobParams = useMemo(() => ({
    status: activeTab,
    search: debouncedSearch || undefined,
    sort,
    limit: 15,
    page,
  }), [activeTab, debouncedSearch, sort, page]);

  const { data: jobsData, isLoading: jobsLoading, refetch } = useMyJobs(jobParams);
  const jobs = jobsData?.data || [];

  // Mutations
  const { mutateAsync: archiveJob } = useArchiveJob();
  const { mutateAsync: publishJob } = usePublishJob();
  const { mutateAsync: duplicateJob } = useDuplicateJob();
  const { mutateAsync: closeJob } = useCloseJob();
  const { mutateAsync: bulkAction, isPending: bulkPending } = useBulkJobAction();

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'R';

  // KPI cards
  const kpiCards = [
    {
      title: 'Open Positions', icon: Psychology, color: '#7B6FFF', trend: 'up', trendValue: 'Live now',
      value: statsLoading ? '—' : stats?.openJobs ?? 0,
    },
    {
      title: 'Draft Jobs', icon: TrendingUp, color: '#F59E0B', trend: null, trendValue: 'Unpublished',
      value: statsLoading ? '—' : stats?.draftJobs ?? 0,
    },
    {
      title: 'Applications', icon: People, color: '#60A5FA', trend: 'up', trendValue: 'Total received',
      value: statsLoading ? '—' : stats?.totalApplications ?? 0,
    },
    {
      title: 'Avg AI Match', icon: BarChart, color: '#34D399', trend: 'up', trendValue: 'All candidates',
      value: statsLoading ? '—' : `${stats?.avgMatchScore ?? 0}%`,
    },
  ];

  // Selection helpers
  const allSelected = jobs.length > 0 && jobs.every((j) => selectedIds.has(j._id));
  const someSelected = jobs.some((j) => selectedIds.has(j._id)) && !allSelected;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(jobs.map((j) => j._id)));
    }
  };
  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  // Action handlers
  const handleMenuClose = () => setMenuState({ anchor: null, job: null });

  const handleArchive = async () => {
    const job = menuState.job;
    handleMenuClose();
    try { await archiveJob(job._id); toast.success('Job archived'); refetch(); }
    catch { toast.error('Failed to archive'); }
  };

  const handlePublishToggle = async () => {
    const job = menuState.job;
    handleMenuClose();
    try {
      await publishJob(job._id);
      toast.success(job.status === 'active' ? 'Job moved to draft' : 'Job published!');
      refetch();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDuplicate = async () => {
    const job = menuState.job;
    handleMenuClose();
    try { await duplicateJob(job._id); toast.success('Job duplicated as draft'); refetch(); }
    catch { toast.error('Failed to duplicate'); }
  };

  const handleCloseJob = async () => {
    const job = menuState.job;
    handleMenuClose();
    try { await closeJob(job._id); toast.success('Job closed'); refetch(); }
    catch { toast.error('Failed to close job'); }
  };

  const handleBulkAction = async (action) => {
    const ids = [...selectedIds];
    try {
      const res = await bulkAction({ jobIds: ids, action });
      toast.success(`${res.data?.modifiedCount || ids.length} jobs updated`);
      setSelectedIds(new Set());
      refetch();
    } catch { toast.error('Bulk action failed'); }
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Sort';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="xl" sx={{ py: 5 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          mb: 5, flexWrap: 'wrap', gap: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              width: 54, height: 54, borderRadius: '14px',
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                {!statsLoading && [
                  { label: 'active jobs', value: stats?.openJobs ?? 0, color: '#34D399' },
                  { label: 'drafts', value: stats?.draftJobs ?? 0, color: '#F59E0B' },
                  { label: 'total apps', value: stats?.totalApplications ?? 0, color: '#60A5FA' },
                ].map((s) => <StatSummaryPill key={s.label} {...s} />)}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              sx={{ borderRadius: 2.5, px: 2.5 }}
            >
              Refresh
            </Button>
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
        </Box>

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {kpiCards.map((kpi) => (
            <Grid item xs={12} sm={6} lg={3} key={kpi.title}>
              <KPICard {...kpi} loading={statsLoading} />
            </Grid>
          ))}
        </Grid>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <Grid container spacing={3}>

          {/* ── Left: Jobs table ─────────────────────────────────────────── */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ overflow: 'visible' }}>

              {/* Table header with tabs */}
              <Box sx={{ px: 3, pt: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>My Job Listings</Typography>
                  <Button
                    size="small" startIcon={<Add />}
                    onClick={() => navigate('/jobs/new')}
                    variant="outlined"
                    sx={{ borderRadius: 2, fontSize: '0.8rem' }}
                  >
                    New Job
                  </Button>
                </Box>

                {/* Tabs */}
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => { setActiveTab(v); setSelectedIds(new Set()); }}
                  sx={{
                    minHeight: 36,
                    '& .MuiTab-root': { minHeight: 36, fontSize: '0.8rem', fontWeight: 600, px: 1.5, py: 0 },
                    '& .MuiTabs-indicator': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      height: 2.5,
                    },
                  }}
                >
                  {STATUS_TABS.map(({ value, label }) => (
                    <Tab key={value} value={value} label={label} disableRipple />
                  ))}
                </Tabs>
              </Box>

              {/* Search + Sort bar */}
              <Box sx={{
                px: 3, py: 1.75,
                display: 'flex', gap: 1.5, alignItems: 'center',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              }}>
                <TextField
                  size="small"
                  placeholder="Search jobs…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 17, color: 'text.disabled' }} /></InputAdornment>,
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch('')}><Close sx={{ fontSize: 15 }} /></IconButton>
                      </InputAdornment>
                    ) : null,
                    sx: { fontSize: '0.85rem', bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02) },
                  }}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button
                  size="small"
                  startIcon={<Sort />}
                  onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                  variant="outlined"
                  sx={{ borderRadius: 2, whiteSpace: 'nowrap', fontSize: '0.8rem', minWidth: 130 }}
                >
                  {currentSortLabel}
                </Button>
                <Menu
                  anchorEl={sortMenuAnchor}
                  open={Boolean(sortMenuAnchor)}
                  onClose={() => setSortMenuAnchor(null)}
                  PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      selected={sort === opt.value}
                      onClick={() => { setSort(opt.value); setSortMenuAnchor(null); }}
                      sx={{ fontSize: '0.85rem', gap: 1, borderRadius: 1, mx: 0.5, my: 0.25 }}
                    >
                      {sort === opt.value && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                      {opt.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              {/* Bulk actions bar */}
              <Collapse in={selectedIds.size > 0}>
                <Box sx={{
                  px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
                  bgcolor: isDark ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  flexWrap: 'wrap',
                }}>
                  <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mr: 0.5 }}>
                    {selectedIds.size} selected
                  </Typography>
                  {BULK_ACTION_OPTIONS.map(({ action, label, color, icon: Icon }) => (
                    <Button
                      key={action}
                      size="small"
                      startIcon={<Icon sx={{ fontSize: '15px !important' }} />}
                      onClick={() => handleBulkAction(action)}
                      disabled={bulkPending}
                      sx={{
                        borderRadius: 2, fontSize: '0.78rem', fontWeight: 600,
                        color, border: `1px solid ${alpha(color, 0.3)}`,
                        bgcolor: alpha(color, isDark ? 0.1 : 0.05),
                        '&:hover': { bgcolor: alpha(color, isDark ? 0.18 : 0.1) },
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                  <IconButton size="small" sx={{ ml: 'auto' }} onClick={() => setSelectedIds(new Set())}>
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Collapse>

              {/* Column headers */}
              {!jobsLoading && jobs.length > 0 && (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 90px 140px 90px 80px 40px',
                  px: 3, py: 1.5,
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  alignItems: 'center',
                }}>
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleSelectAll}
                    sx={{ p: 0 }}
                  />
                  {['JOB TITLE', 'APPS', 'AI MATCH', 'STATUS', 'POSTED', ''].map((h) => (
                    <Typography key={h} variant="caption" sx={{
                      fontWeight: 700, fontSize: '0.68rem',
                      letterSpacing: '0.06em', color: 'text.disabled',
                    }}>
                      {h}
                    </Typography>
                  ))}
                </Box>
              )}

              {/* Table body */}
              {jobsLoading ? (
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} height={60} sx={{ borderRadius: 2 }} />
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
                  <Typography variant="h4" color="text.secondary" sx={{ mb: 1 }}>
                    {search ? `No results for "${search}"` : 'No jobs in this category'}
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                    {search ? 'Try different keywords' : 'Create your first job posting to get started'}
                  </Typography>
                  {!search && (
                    <Button variant="contained" onClick={() => navigate('/jobs/new')} startIcon={<Add />} sx={{ borderRadius: 2.5 }}>
                      Post Your First Job
                    </Button>
                  )}
                </Box>
              ) : (
                <Box>
                  {jobs.map((job, idx) => {
                    const isSelected = selectedIds.has(job._id);
                    const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
                    return (
                      <Box
                        key={job._id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr 90px 140px 90px 80px 40px',
                          alignItems: 'center',
                          px: 3, py: 1.75,
                          borderBottom: idx < jobs.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                          transition: 'background-color 0.15s ease',
                          bgcolor: isSelected ? alpha(theme.palette.primary.main, isDark ? 0.06 : 0.03) : 'transparent',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.05 : 0.02) },
                        }}
                      >
                        {/* Checkbox */}
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => toggleSelect(job._id)}
                          sx={{ p: 0 }}
                        />

                        {/* Title */}
                        <Box sx={{ minWidth: 0, pr: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body2" fontWeight={600}
                              onClick={() => navigate(`/jobs/${job._id}`)}
                              sx={{
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                              }}
                            >
                              {job.title}
                            </Typography>
                            {isExpired && job.status === 'active' && (
                              <Chip label="Expired" size="small" sx={{
                                height: 18, fontSize: '0.6rem', fontWeight: 700,
                                bgcolor: alpha('#F87171', 0.15), color: '#F87171', border: `1px solid ${alpha('#F87171', 0.3)}`,
                              }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {job.department} {job.location && `· ${job.location}`}
                          </Typography>
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
                            : <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>No data yet</Typography>}
                        </Box>

                        {/* Status */}
                        <Box><StatusBadge status={job.status} /></Box>

                        {/* Date */}
                        <Tooltip title={dayjs(job.createdAt).format('MMMM D, YYYY')} placement="top">
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', cursor: 'default' }}>
                            {dayjs(job.createdAt).fromNow()}
                          </Typography>
                        </Tooltip>

                        {/* Actions */}
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuState({ anchor: e.currentTarget, job })}
                          sx={{
                            width: 28, height: 28, borderRadius: '8px',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                          }}
                        >
                          <MoreVert sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Card>
          </Grid>

          {/* ── Right sidebar ────────────────────────────────────────────── */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Pipeline Funnel */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>Hiring Funnel</Typography>
                    <Box sx={{
                      px: 1.25, py: 0.4, borderRadius: 99,
                      bgcolor: alpha('#7B6FFF', isDark ? 0.15 : 0.08),
                      border: `1px solid ${alpha('#7B6FFF', 0.2)}`,
                    }}>
                      <Typography variant="caption" sx={{ color: '#7B6FFF', fontWeight: 700, fontSize: '0.7rem' }}>
                        All jobs
                      </Typography>
                    </Box>
                  </Box>
                  <FunnelChart funnel={analytics?.funnel || []} loading={analyticsLoading} />
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Recent Activity</Typography>
                  <ActivityFeed
                    events={(stats?.recentActivity || []).map((a) => ({
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
                          background: isDark ? alpha(color, 0.06) : alpha(color, 0.03),
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

          {/* ── Analytics Row ────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.25 }}>Job Performance Analytics</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Applications & views per listing — click bars to drill down
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {!analyticsLoading && analytics?.totals && (
                      <>
                        <StatSummaryPill label="total views" value={analytics.totals.views} color="#34D399" />
                        <StatSummaryPill label="total apps" value={analytics.totals.applications} color="#60A5FA" />
                      </>
                    )}
                  </Box>
                </Box>
                <JobAnalyticsChart
                  data={analytics?.jobStats || []}
                  loading={analyticsLoading}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ── Job context menu ─────────────────────────────────────────────── */}
      <Menu
        anchorEl={menuState.anchor}
        open={Boolean(menuState.anchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 200, borderRadius: 2.5,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(123,111,255,0.1)'
              : '0 8px 32px rgba(11,13,21,0.15)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => { handleMenuClose(); navigate(`/jobs/${menuState.job?._id}/edit`); }}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, fontSize: '0.875rem' }}
        >
          <Edit fontSize="small" /> Edit Job
        </MenuItem>
        <MenuItem
          onClick={() => { handleMenuClose(); navigate(`/jobs/${menuState.job?._id}`); }}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, fontSize: '0.875rem' }}
        >
          <OpenInNew fontSize="small" /> View Public Post
        </MenuItem>
        <MenuItem
          onClick={() => { handleMenuClose(); navigate(`/pipeline?job=${menuState.job?._id}`); }}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, fontSize: '0.875rem' }}
        >
          <Visibility fontSize="small" /> View Pipeline
        </MenuItem>
        <MenuItem
          onClick={() => { handleMenuClose(); navigate(`/rankings?job=${menuState.job?._id}`); }}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, fontSize: '0.875rem' }}
        >
          <EmojiEvents fontSize="small" /> Candidate Rankings
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
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
        {menuState.job?.status !== 'closed' && (
          <MenuItem
            onClick={handleCloseJob}
            sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, fontSize: '0.875rem', color: 'warning.main' }}
          >
            <LockClock fontSize="small" /> Close Job
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={handleArchive}
          sx={{ gap: 1.5, mx: 0.75, my: 0.25, borderRadius: 1.5, color: 'error.main', fontSize: '0.875rem' }}
        >
          <Archive fontSize="small" /> Archive Job
        </MenuItem>
      </Menu>
    </Box>
  );
}
