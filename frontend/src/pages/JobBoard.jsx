import React, { useState } from 'react';
import { Box, Container, Typography, Grid, TextField, InputAdornment, ToggleButton, ToggleButtonGroup, MenuItem, Select, FormControl, InputLabel, Pagination, Skeleton, useTheme, alpha, Button, Chip } from '@mui/material';
import { Search, FilterList, LocationOn } from '@mui/icons-material';
import JobCard from '../components/JobCard';
import { useJobs } from '../hooks/useJobs';

const TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship'];
const LEVELS = ['entry', 'mid', 'senior', 'lead', 'manager'];

export default function JobBoard() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading } = useJobs({ search: debouncedSearch, type, experienceLevel: level, page, limit: 12 });
  const jobs = data?.data || [];
  const pagination = data?.pagination;

  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleType = (_, v) => { setType(v); setPage(1); };
  const handleLevel = (_, v) => { setLevel(v); setPage(1); };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      {/* Header */}
      <Box sx={{
        py: { xs: 5, md: 8 }, textAlign: 'center',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(180deg, ${alpha('#7B6FFF', 0.1)} 0%, transparent 100%)`
          : `linear-gradient(180deg, ${alpha('#5B4FCF', 0.04)} 0%, transparent 100%)`,
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ mb: 1.5, fontWeight: 700 }}>Find Your Next Role</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Discover opportunities matched to your skills — apply with one click.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, bgcolor: 'background.paper', p: 1.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[3] }}>
            <TextField
              fullWidth placeholder="Search jobs, skills, companies…"
              value={search} onChange={e => setSearch(e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.disabled' }} /></InputAdornment>,
                sx: { fontSize: '1rem', px: 1 },
              }}
            />
            <Button variant="contained" size="large" sx={{ borderRadius: 2, px: 3, flexShrink: 0 }}>Search</Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList fontSize="small" sx={{ color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Filter by type:</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label="All types" clickable
              onClick={() => { setType(''); setPage(1); }}
              variant={!type ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, ...((!type) && { bgcolor: 'primary.main', color: 'white' }) }}
            />
            {TYPES.map(t => (
              <Chip key={t} label={t.replace('-', ' ')} clickable
                onClick={() => { setType(type === t ? '' : t); setPage(1); }}
                variant={type === t ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, textTransform: 'capitalize', ...(type === t && { bgcolor: 'primary.main', color: 'white' }) }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ alignSelf: 'center', mr: 0.5 }}>Level:</Typography>
            {LEVELS.map(l => (
              <Chip key={l} label={l} clickable size="small"
                onClick={() => { setLevel(level === l ? '' : l); setPage(1); }}
                variant={level === l ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, textTransform: 'capitalize', ...(level === l && { bgcolor: alpha(theme.palette.secondary.main, 0.9), color: 'white' }) }}
              />
            ))}
          </Box>
        </Box>

        {/* Results count */}
        {!isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {pagination?.total || 0} jobs found{search && ` for "${search}"`}
          </Typography>
        )}

        {/* Job grid */}
        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
                  <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
                </Grid>
              ))
            : jobs.length > 0
              ? jobs.map(job => (
                  <Grid item xs={12} sm={6} lg={4} key={job._id}>
                    <JobCard job={job} />
                  </Grid>
                ))
              : (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                      <Typography variant="h4" color="text.secondary" sx={{ mb: 1 }}>No jobs found</Typography>
                      <Typography variant="body2" color="text.disabled">Try adjusting your filters or search terms</Typography>
                    </Box>
                  </Grid>
                )}
        </Grid>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination count={pagination.pages} page={page} onChange={(_, p) => setPage(p)}
              color="primary" size="large" shape="rounded" />
          </Box>
        )}
      </Container>
    </Box>
  );
}
