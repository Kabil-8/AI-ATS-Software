import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Grid, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, Pagination, Skeleton,
  useTheme, alpha, Button, Chip, ToggleButton, ToggleButtonGroup,
  Slider, Collapse, IconButton, Divider, Avatar, Card, CardContent,
  Tooltip,
} from '@mui/material';
import {
  Search, FilterList, LocationOn, GridView, ViewList, Tune,
  Close, Star, TrendingUp, WorkOutline, AttachMoney, Sort,
  Bolt, Psychology, ChevronRight, AutoAwesome,
} from '@mui/icons-material';
import JobCard from '../components/JobCard';
import { useJobs } from '../hooks/useJobs';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship'];
const LEVELS = ['entry', 'mid', 'senior', 'lead', 'manager'];
const SORT_OPTIONS = [
  { value: '-createdAt',       label: 'Newest First' },
  { value: 'createdAt',        label: 'Oldest First' },
  { value: '-views',           label: 'Most Popular' },
  { value: '-applicationCount',label: 'Most Applied' },
];
const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Finance', 'HR', 'Operations', 'Legal', 'Customer Success',
];

// ─── Compact list row card ─────────────────────────────────────────────────────
const TYPE_COLORS = {
  'full-time': '#7B6FFF', 'part-time': '#60A5FA', 'remote': '#34D399',
  'contract': '#FCD34D', 'internship': '#F472B6',
};
const AVATAR_PALETTE = ['#5B4FCF', '#3B82F6', '#059669', '#D97706', '#8B5CF6', '#EC4899', '#06B6D4'];

function JobListRow({ job }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const typeColor = TYPE_COLORS[job.type] || '#7B6FFF';
  const company = job.postedBy?.company || 'Company';
  const initial = company[0]?.toUpperCase();
  const avatarBg = AVATAR_PALETTE[company.charCodeAt(0) % AVATAR_PALETTE.length];
  const salary = job.salary?.isVisible && job.salary?.min
    ? `$${(job.salary.min / 1000).toFixed(0)}k – $${(job.salary.max / 1000).toFixed(0)}k`
    : null;

  return (
    <Card
      onClick={() => navigate(`/jobs/${job._id}`)}
      sx={{
        cursor: 'pointer',
        mb: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        transition: 'all 0.2s ease',
        borderLeft: `3px solid ${alpha(typeColor, 0.7)}`,
        '&:hover': {
          transform: 'translateX(4px)',
          boxShadow: theme.shadows[8],
          borderLeftColor: typeColor,
        },
      }}
    >
      <Avatar sx={{
        width: 44, height: 44, flexShrink: 0,
        background: `linear-gradient(135deg, ${avatarBg}, ${alpha(avatarBg, 0.7)})`,
        fontWeight: 800, fontSize: '1rem', borderRadius: '11px',
        boxShadow: `0 4px 12px ${alpha(avatarBg, 0.4)}`,
      }}>
        {initial}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
          <Typography variant="body1" fontWeight={700} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.title}
          </Typography>
          {job.isFeatured && (
            <Chip label="Featured" size="small" sx={{
              height: 18, fontSize: '0.6rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
              color: '#fff', border: 'none',
            }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>{company}</Typography>
          {job.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <LocationOn sx={{ fontSize: 12, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">{job.location}</Typography>
            </Box>
          )}
          {salary && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <AttachMoney sx={{ fontSize: 12, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">{salary}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75, flexShrink: 0 }}>
        <Chip
          label={job.type?.replace('-', ' ')}
          size="small"
          sx={{
            bgcolor: alpha(typeColor, isDark ? 0.18 : 0.1),
            color: typeColor, fontWeight: 700, fontSize: '0.7rem',
            border: `1px solid ${alpha(typeColor, 0.25)}`,
            borderRadius: 99, height: 22, textTransform: 'capitalize',
          }}
        />
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
          {dayjs(job.createdAt).fromNow()}
        </Typography>
      </Box>
    </Card>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedStat({ label, value, color }) {
  const theme = useTheme();
  return (
    <Box sx={{ textAlign: 'center', px: 3 }}>
      <Typography sx={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.4rem' },
        color, lineHeight: 1.1,
      }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function JobBoard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('');
  const [level, setLevel] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [salaryMin, setSalaryMin] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams = {
    search: debouncedSearch || undefined,
    type: type || undefined,
    experienceLevel: level || undefined,
    department: department || undefined,
    location: location || undefined,
    sort,
    page,
    limit: 12,
  };

  const { data, isLoading } = useJobs(queryParams);
  const jobs = data?.data || [];
  const pagination = data?.pagination;

  // Featured jobs (top 3)
  const featuredJobs = jobs.filter((j) => j.isFeatured).slice(0, 3);
  const regularJobs = jobs.filter((j) => !j.isFeatured || featuredJobs.includes(j));

  // Active filter count
  const activeFilters = [type, level, department, location, salaryMin > 0].filter(Boolean).length;

  const clearFilters = () => {
    setType(''); setLevel(''); setDepartment(''); setLocation(''); setSalaryMin(0);
    setDebouncedSearch(''); setSearch(''); setPage(1);
  };

  const handleTypeClick = (t) => { setType(type === t ? '' : t); setPage(1); };
  const handleLevelClick = (l) => { setLevel(level === l ? '' : l); setPage(1); };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <Box sx={{
        pt: { xs: 6, md: 9 }, pb: { xs: 4, md: 6 },
        textAlign: 'center',
        background: isDark
          ? `radial-gradient(ellipse at 50% 0%, ${alpha('#7B6FFF', 0.18)} 0%, transparent 65%), ${alpha('#0B0D15', 0)}`
          : `radial-gradient(ellipse at 50% 0%, ${alpha('#5B4FCF', 0.08)} 0%, transparent 65%)`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <Box sx={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          top: -200, left: '20%',
          background: `radial-gradient(circle, ${alpha('#7B6FFF', 0.08)}, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          top: -100, right: '15%',
          background: `radial-gradient(circle, ${alpha('#34D399', 0.06)}, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          {/* Badge */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.75,
            px: 2, py: 0.75, borderRadius: 99, mb: 3,
            bgcolor: alpha('#7B6FFF', isDark ? 0.15 : 0.08),
            border: `1px solid ${alpha('#7B6FFF', 0.25)}`,
          }}>
            <AutoAwesome sx={{ fontSize: 13, color: '#7B6FFF' }} />
            <Typography variant="caption" sx={{ color: '#7B6FFF', fontWeight: 700, fontSize: '0.78rem' }}>
              AI-Powered Job Matching
            </Typography>
          </Box>

          <Typography variant="h1" sx={{
            mb: 2, fontWeight: 800,
            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' },
            letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            Find Your Next{' '}
            <Box component="span" sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, #34D399)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Dream Role
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
            Discover opportunities matched to your skills using our AI scoring engine — apply with one click.
          </Typography>

          {/* Search bar */}
          <Box sx={{
            display: 'flex', gap: 1.5, maxWidth: 680, mx: 'auto',
            bgcolor: 'background.paper',
            p: 1.25, borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.4)' : '0 8px 40px rgba(11,13,21,0.1)',
          }}>
            <TextField
              fullWidth
              placeholder="Job title, skills, keywords…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}><Close sx={{ fontSize: 16 }} /></IconButton>
                  </InputAdornment>
                ) : null,
                sx: { fontSize: '0.95rem', px: 1 },
              }}
            />
            <TextField
              placeholder="Location…"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: 'text.disabled', fontSize: 18 }} />
                  </InputAdornment>
                ),
                sx: { fontSize: '0.95rem', px: 1, minWidth: 130 },
              }}
            />
            <Button
              variant="contained" size="large"
              sx={{
                borderRadius: 2, px: 3, flexShrink: 0,
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                boxShadow: `0 4px 18px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': { boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.55)}` },
              }}
            >
              Search
            </Button>
          </Box>

          {/* Hero stats */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, mt: 5, flexWrap: 'wrap' }}>
            {[
              { label: 'Open positions', value: `${pagination?.total ?? '—'}`, color: theme.palette.primary.main },
              null,
              { label: 'Companies hiring', value: '500+', color: '#34D399' },
              null,
              { label: 'AI-matched daily', value: '2k+', color: '#60A5FA' },
            ].map((item, i) =>
              item === null ? (
                <Divider key={i} orientation="vertical" flexItem sx={{ mx: 2, height: 40, alignSelf: 'center' }} />
              ) : (
                <AnimatedStat key={item.label} {...item} />
              )
            )}
          </Box>
        </Container>
      </Box>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ mt: 2 }}>

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <Box sx={{
          mb: 3, p: 2.5, borderRadius: 3,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(11,13,21,0.06)',
        }}>
          {/* Type filters */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
              <FilterList sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary">Type:</Typography>
            </Box>
            <Chip
              label="All" clickable
              onClick={() => { setType(''); setPage(1); }}
              variant={!type ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, height: 28, ...(!type && { bgcolor: 'primary.main', color: 'white' }) }}
            />
            {TYPES.map((t) => (
              <Chip
                key={t}
                label={t.replace('-', ' ')}
                clickable
                onClick={() => handleTypeClick(t)}
                variant={type === t ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 600, height: 28, textTransform: 'capitalize',
                  ...(type === t && { bgcolor: 'primary.main', color: 'white' }),
                }}
              />
            ))}
          </Box>

          {/* Level + controls row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mr: 0.5 }}>Level:</Typography>
            {LEVELS.map((l) => (
              <Chip
                key={l}
                label={l}
                clickable
                size="small"
                onClick={() => handleLevelClick(l)}
                variant={level === l ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 600, height: 24, textTransform: 'capitalize',
                  ...(level === l && { bgcolor: alpha('#A78BFA', 0.9), color: 'white', border: 'none' }),
                }}
              />
            ))}

            {/* Spacer */}
            <Box sx={{ flex: 1 }} />

            {/* Advanced filters toggle */}
            <Button
              size="small"
              startIcon={<Tune />}
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant={showAdvanced ? 'contained' : 'outlined'}
              sx={{ borderRadius: 2, fontSize: '0.78rem' }}
            >
              Advanced {activeFilters > 0 && `(${activeFilters})`}
            </Button>

            {/* Sort */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                startAdornment={<Sort sx={{ fontSize: 16, mr: 0.75, color: 'text.disabled' }} />}
                sx={{ borderRadius: 2, fontSize: '0.82rem' }}
              >
                {SORT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.82rem' }}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* View toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
              sx={{ '& .MuiToggleButton-root': { px: 1.25, border: `1px solid ${theme.palette.divider}` } }}
            >
              <ToggleButton value="grid"><GridView sx={{ fontSize: 18 }} /></ToggleButton>
              <ToggleButton value="list"><ViewList sx={{ fontSize: 18 }} /></ToggleButton>
            </ToggleButtonGroup>

            {/* Clear filters */}
            {activeFilters > 0 && (
              <Button
                size="small"
                startIcon={<Close />}
                onClick={clearFilters}
                sx={{ borderRadius: 2, fontSize: '0.78rem', color: 'error.main' }}
              >
                Clear
              </Button>
            )}
          </Box>

          {/* Advanced filters */}
          <Collapse in={showAdvanced}>
            <Divider sx={{ mt: 2, mb: 2 }} />
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.85rem' }}>Department</InputLabel>
                  <Select
                    value={department}
                    label="Department"
                    onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                    sx={{ borderRadius: 2, fontSize: '0.85rem' }}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {DEPARTMENTS.map((d) => (
                      <MenuItem key={d} value={d} sx={{ fontSize: '0.85rem' }}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      Min. Salary
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="primary.main">
                      {salaryMin > 0 ? `$${(salaryMin / 1000).toFixed(0)}k+` : 'Any'}
                    </Typography>
                  </Box>
                  <Slider
                    value={salaryMin}
                    onChange={(_, v) => { setSalaryMin(v); setPage(1); }}
                    min={0} max={200000} step={10000}
                    sx={{
                      color: 'primary.main',
                      '& .MuiSlider-thumb': { width: 16, height: 16 },
                      '& .MuiSlider-rail': { opacity: 0.25 },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </Box>

        {/* Results count + featured label */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          {!isLoading && (
            <Typography variant="body2" color="text.secondary">
              <Box component="span" fontWeight={700} color="text.primary">{pagination?.total ?? 0}</Box>{' '}
              jobs found{debouncedSearch && ` for "${debouncedSearch}"`}
            </Typography>
          )}
          {pagination?.page && pagination?.pages > 1 && (
            <Typography variant="caption" color="text.disabled">
              Page {pagination.page} of {pagination.pages}
            </Typography>
          )}
        </Box>

        {/* Featured jobs section */}
        {!isLoading && featuredJobs.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Star sx={{ fontSize: 16, color: '#F59E0B' }} />
              <Typography variant="body2" fontWeight={700} color="text.primary">Featured Opportunities</Typography>
            </Box>
            <Grid container spacing={2.5}>
              {featuredJobs.map((job) => (
                <Grid item xs={12} sm={6} md={4} key={job._id}>
                  <Box sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute', inset: -1,
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${alpha('#F59E0B', 0.5)}, ${alpha('#7B6FFF', 0.3)})`,
                      zIndex: 0,
                    },
                  }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <JobCard job={job} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Job grid / list */}
        {viewMode === 'grid' ? (
          <Grid container spacing={2.5}>
            {isLoading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <Grid item xs={12} sm={6} lg={4} key={i}>
                    <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))
              : jobs.length > 0
              ? jobs.map((job) => (
                  <Grid item xs={12} sm={6} lg={4} key={job._id}>
                    <JobCard job={job} />
                  </Grid>
                ))
              : (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 12 }}>
                      <Box sx={{
                        width: 80, height: 80, borderRadius: '22px', mx: 'auto', mb: 3,
                        background: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.06),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <WorkOutline sx={{ fontSize: 36, color: 'text.disabled' }} />
                      </Box>
                      <Typography variant="h4" color="text.secondary" sx={{ mb: 1 }}>No jobs found</Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                        Try adjusting your filters or search terms
                      </Typography>
                      {activeFilters > 0 && (
                        <Button variant="outlined" onClick={clearFilters} startIcon={<Close />} sx={{ borderRadius: 2.5 }}>
                          Clear all filters
                        </Button>
                      )}
                    </Box>
                  </Grid>
                )}
          </Grid>
        ) : (
          <Box>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} height={80} sx={{ borderRadius: 2, mb: 1.5 }} />
                ))
              : jobs.length > 0
              ? jobs.map((job) => <JobListRow key={job._id} job={job} />)
              : (
                  <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography variant="h4" color="text.secondary" sx={{ mb: 1 }}>No jobs found</Typography>
                    <Typography variant="body2" color="text.disabled">Try adjusting your filters or search terms</Typography>
                  </Box>
                )}
          </Box>
        )}

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={pagination.pages}
              page={page}
              onChange={(_, p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              color="primary"
              size="large"
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': { borderRadius: 2 },
                '& .Mui-selected': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main}) !important`,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            />
          </Box>
        )}

        {/* Bottom CTA for recruiters */}
        <Box sx={{
          mt: 8, p: { xs: 3, md: 5 }, borderRadius: 4, textAlign: 'center',
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#7B6FFF', 0.12)}, ${alpha('#34D399', 0.08)})`
            : `linear-gradient(135deg, ${alpha('#7B6FFF', 0.06)}, ${alpha('#34D399', 0.04)})`,
          border: `1px solid ${alpha('#7B6FFF', 0.15)}`,
        }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '14px', mx: 'auto', mb: 2.5,
            background: `linear-gradient(135deg, #7B6FFF, #5B4FCF)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${alpha('#7B6FFF', 0.4)}`,
          }}>
            <Bolt sx={{ fontSize: 26, color: '#fff' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Hiring great talent?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: 'auto' }}>
            Post your job listings and let our AI find the best candidates automatically.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ChevronRight />}
            onClick={() => navigate('/register')}
            sx={{
              borderRadius: 3, px: 4, py: 1.25,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              boxShadow: `0 4px 18px ${alpha(theme.palette.primary.main, 0.4)}`,
            }}
          >
            Post a Job Free
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
