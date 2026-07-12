import React, { useState } from 'react';
import { Box, Container, Typography, Chip, Button, Grid, TextField, Alert, Card, CardContent, Divider, Skeleton, useTheme, alpha, LinearProgress } from '@mui/material';
import { LocationOn, WorkOutline, AttachMoney, AccessTime, CheckCircle, Psychology, Send } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '../hooks/useJobs';
import { useSubmitApplication } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import ResumeUploader from '../components/ResumeUploader';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function JobDetail() {
  const { id } = useParams();
  const { data: job, isLoading } = useJob(id);
  const { user, isApplicant } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const { mutateAsync: submit, isPending } = useSubmitApplication();

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!file) { toast.error('Please upload your resume'); return; }

    const formData = new FormData();
    formData.append('jobId', id);
    formData.append('resume', file);
    if (coverLetter) formData.append('coverLetter', coverLetter);

    try {
      await submit(formData);
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}><Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} /></Grid>
          <Grid item xs={12} md={4}><Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} /></Grid>
        </Grid>
      </Container>
    );
  }

  if (!job) return <Box sx={{ textAlign: 'center', py: 10 }}><Typography>Job not found</Typography></Box>;

  if (step === 'success') {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 480 }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.4)}`,
            animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <CheckCircle sx={{ color: 'white', fontSize: 42 }} />
          </Box>
          <Typography variant="h2" sx={{ mb: 1.5 }}>Application Submitted!</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Our AI engine is now analyzing your resume against the job requirements.
          </Typography>
          <Card sx={{ mb: 3, bgcolor: isDark ? alpha('#7B6FFF', 0.08) : alpha('#5B4FCF', 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Psychology sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>AI Analysis in Progress</Typography>
                <Typography variant="caption" color="text.secondary">Estimated time: ~2 minutes</Typography>
                <LinearProgress sx={{ mt: 1, height: 4, borderRadius: 99 }} />
              </Box>
            </CardContent>
          </Card>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mr: 1.5, borderRadius: 2 }}>
            View My Applications
          </Button>
          <Button variant="outlined" onClick={() => navigate('/jobs')} sx={{ borderRadius: 2 }}>
            Browse More Jobs
          </Button>
          <style>{`@keyframes popIn{0%{transform:scale(0)}100%{transform:scale(1)}}`}</style>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          {/* Job details */}
          <Grid item xs={12} md={7}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: 2, flexShrink: 0,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 700, color: 'primary.main',
                  }}>
                    {(job.postedBy?.company || 'C')[0]}
                  </Box>
                  <Box>
                    <Typography variant="h2" sx={{ mb: 0.5 }}>{job.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{job.postedBy?.company} · {job.department}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                    <LocationOn fontSize="small" /> <Typography variant="body2">{job.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                    <WorkOutline fontSize="small" /> <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{job.type?.replace('-', ' ')}</Typography>
                  </Box>
                  {job.salary?.min && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                      <AttachMoney fontSize="small" /> <Typography variant="body2">${job.salary.min.toLocaleString()} – ${job.salary.max?.toLocaleString()} {job.salary.currency}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                    <AccessTime fontSize="small" /> <Typography variant="body2">Posted {dayjs(job.createdAt).fromNow()}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip label={job.type} size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 600 }} />
                  <Chip label={job.experienceLevel} size="small" variant="outlined" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
                </Box>

                <Divider sx={{ mb: 3 }} />
                <Typography variant="h4" sx={{ mb: 2 }}>About this role</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, mb: 3 }}>
                  {job.description}
                </Typography>

                {job.requirements?.length > 0 && (
                  <>
                    <Typography variant="h4" sx={{ mb: 2 }}>Requirements</Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 3, '& li': { color: 'text.secondary', mb: 0.75 } }}>
                      {job.requirements.map((r, i) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                    </Box>
                  </>
                )}

                {job.skills?.length > 0 && (
                  <>
                    <Typography variant="h4" sx={{ mb: 2 }}>Required Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {job.skills.map(s => (
                        <Chip key={s} label={s} variant="outlined" size="small"
                          sx={{ fontWeight: 500, textTransform: 'capitalize', borderColor: alpha(theme.palette.primary.main, 0.3), color: 'primary.main' }} />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Application form */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 90 }}>
              {(!user || isApplicant) ? (
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>Apply for this role</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Our AI will analyze your resume instantly.
                    </Typography>
                    <Box component="form" onSubmit={handleApply} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <ResumeUploader file={file} onFileChange={setFile} uploading={isPending} />
                      <TextField
                        label="Cover Letter (optional)" multiline rows={4} fullWidth
                        placeholder="Tell us why you're a great fit…"
                        value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                        inputProps={{ maxLength: 3000 }}
                        helperText={`${coverLetter.length}/3000`}
                      />
                      <Button
                        type="submit" variant="contained" fullWidth size="large" disabled={isPending}
                        startIcon={isPending ? null : <Send />}
                        sx={{ borderRadius: 2.5, py: 1.5, fontSize: '1rem' }}
                      >
                        {isPending ? 'Submitting…' : user ? 'Submit Application' : 'Login to Apply'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Recruiters cannot apply to jobs. Switch to a candidate account.
                  </Typography>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
