import React, { useState } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow,
  Avatar, Collapse, Chip, Slider, Button, FormControl, InputLabel, Select, MenuItem,
  IconButton, Skeleton, Divider, Grid, useTheme, alpha, Tooltip,
} from '@mui/material';
import {
  KeyboardArrowDown, KeyboardArrowUp, Psychology, CheckCircle, Cancel,
  QuestionAnswer, FilterList, Refresh, Schedule,
} from '@mui/icons-material';
import { useMyJobs } from '../hooks/useJobs';
import { useJobApplications, useUpdateStatus } from '../hooks/useApplications';
import AIScoreBar from '../components/AIScoreBar';
import AIScoreRing from '../components/AIScoreRing';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const AVATAR_COLORS = ['#5B4FCF','#3B82F6','#059669','#D97706','#8B5CF6'];

function CandidateRow({ app, index, jobId, onRefetch }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [open, setOpen] = useState(false);
  const { mutateAsync: updateStatus } = useUpdateStatus();

  const score = app.aiAnalysis?.matchScore;
  const analyzed = app.aiAnalysis?.isAnalyzed;
  const initials = app.applicant?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];

  const handleScheduleInterview = async () => {
    try {
      await updateStatus({ id: app._id, status: 'interview', jobId });
      toast.success('Moved to Interview stage');
      onRefetch();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { border: 0 }, cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 50 }}>
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: avatarBg, fontSize: '0.8rem', fontWeight: 700, borderRadius: 1.5 }}>{initials}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>Candidate {String.fromCharCode(65 + index)}</Typography>
              <Typography variant="caption" color="text.secondary">{app.applicant?.location || 'Unknown location'}</Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell sx={{ minWidth: 160 }}>
          {analyzed ? <AIScoreBar score={score} height={7} /> : (
            <Typography variant="caption" color="text.disabled">
              {app.aiAnalysis?.isAnalyzing ? '⚡ Analyzing…' : 'Not analyzed'}
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(app.aiAnalysis?.skillsMatched || []).slice(0, 3).map(s => (
              <Chip key={s} label={s} size="small"
                sx={{ fontSize: '0.68rem', height: 20, bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08), color: 'primary.main' }} />
            ))}
            {(app.aiAnalysis?.skillsMatched || []).length > 3 && (
              <Typography variant="caption" color="text.disabled">+{app.aiAnalysis.skillsMatched.length - 3}</Typography>
            )}
          </Box>
        </TableCell>
        <TableCell><StatusBadge status={app.status} /></TableCell>
        <TableCell>
          <IconButton size="small">{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
        </TableCell>
      </TableRow>

      {/* Expanded AI details */}
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0, border: 0 }}>
          <Collapse in={open} unmountOnExit>
            <Box sx={{
              mx: 2, mb: 2, p: 3, borderRadius: 2,
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.03),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            }}>
              {analyzed ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <AIScoreRing score={score} size={90} />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>AI Match Score</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={10}>
                    <Typography variant="h5" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Psychology fontSize="small" color="primary" /> AI Analysis Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                      {app.aiAnalysis.summary}
                    </Typography>

                    <Grid container spacing={2.5}>
                      {/* Matched skills */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
                          <CheckCircle fontSize="small" /> Matched Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {(app.aiAnalysis.skillsMatched || []).map(s => (
                            <Chip key={s} label={s} size="small" icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                              sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontSize: '0.72rem' }} />
                          ))}
                        </Box>
                      </Grid>

                      {/* Missing skills */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                          <Cancel fontSize="small" /> Skill Gaps
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {(app.aiAnalysis.skillsMissing || []).map(s => (
                            <Chip key={s} label={s} size="small" icon={<Cancel sx={{ fontSize: '14px !important' }} />}
                              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', fontSize: '0.72rem' }} />
                          ))}
                          {!app.aiAnalysis.skillsMissing?.length && <Typography variant="caption" color="text.disabled">No skill gaps identified</Typography>}
                        </Box>
                      </Grid>

                      {/* Suggested questions */}
                      {app.aiAnalysis.suggestedQuestions?.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <QuestionAnswer fontSize="small" color="primary" /> Suggested Interview Questions
                          </Typography>
                          <Box component="ol" sx={{ pl: 2, m: 0 }}>
                            {app.aiAnalysis.suggestedQuestions.map((q, i) => (
                              <Box component="li" key={i} sx={{ mb: 0.75 }}>
                                <Typography variant="body2" color="text.secondary">{q}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Grid>
                      )}
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
                      <Button variant="contained" size="small" startIcon={<Schedule />} onClick={handleScheduleInterview} sx={{ borderRadius: 2 }}>
                        Schedule Interview
                      </Button>
                      {app.resumeSignedUrl && (
                        <Button variant="outlined" size="small" component="a" href={app.resumeSignedUrl} target="_blank" sx={{ borderRadius: 2 }}>
                          View Resume
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {app.aiAnalysis?.isAnalyzing ? '⚡ AI analysis in progress…' : 'AI analysis not yet run for this candidate'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function CandidateRanking() {
  const theme = useTheme();
  const { data: jobsData } = useMyJobs({ status: 'active', limit: 50 });
  const jobs = jobsData?.data || [];
  const [selectedJobId, setSelectedJobId] = useState('');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [statusFilter, setStatusFilter] = useState('');

  React.useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) setSelectedJobId(jobs[0]._id);
  }, [jobs]);

  const { data: applications, isLoading, refetch } = useJobApplications(selectedJobId, {
    minScore: scoreRange[0] > 0 ? scoreRange[0] : undefined,
    maxScore: scoreRange[1] < 100 ? scoreRange[1] : undefined,
    status: statusFilter || undefined,
  });

  const sorted = [...(applications || [])].sort((a, b) => (b.aiAnalysis?.matchScore || 0) - (a.aiAnalysis?.matchScore || 0));

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h2" sx={{ mb: 0.5 }}>Candidate Rankings</Typography>
          <Typography variant="body2" color="text.secondary">AI-powered objective scoring for bias-free candidate evaluation</Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <FilterList fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={600}>Filter Candidates</Typography>
            </Box>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Job Position</InputLabel>
                  <Select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} label="Job Position">
                    {jobs.map(j => <MenuItem key={j._id} value={j._id}>{j.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Status">
                    <MenuItem value="">All Statuses</MenuItem>
                    {['applied','screening','interview','offered','hired','rejected'].map(s => (
                      <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Match Score: {scoreRange[0]}% – {scoreRange[1]}%
                </Typography>
                <Slider
                  value={scoreRange} onChange={(_, v) => setScoreRange(v)}
                  valueLabelDisplay="auto" size="small"
                  sx={{ color: 'primary.main', mt: 0.5 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Rankings table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4">Ranked Candidates</Typography>
                <Typography variant="caption" color="text.secondary">
                  {sorted.length} candidates — click a row to expand AI analysis
                </Typography>
              </Box>
              <Button startIcon={<Refresh />} onClick={refetch} size="small" sx={{ borderRadius: 2 }}>Refresh</Button>
            </Box>
            <Divider />

            {isLoading ? (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={60} sx={{ borderRadius: 1 }} />)}
              </Box>
            ) : sorted.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Psychology sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h4" color="text.secondary">No candidates found</Typography>
                <Typography variant="body2" color="text.disabled">Try adjusting your filters or run AI analysis from the pipeline view</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem' }}>RANK</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem' }}>CANDIDATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', minWidth: 200 }}>MATCH SCORE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem' }}>TOP SKILLS</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem' }}>STATUS</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sorted.map((app, i) => (
                    <CandidateRow key={app._id} app={app} index={i} jobId={selectedJobId} onRefetch={refetch} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
