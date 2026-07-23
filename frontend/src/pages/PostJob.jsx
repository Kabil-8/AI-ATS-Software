import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, TextField, MenuItem, Select,
  FormControl, InputLabel, Button, Card, CardContent, Divider, Alert,
  Chip, IconButton, useTheme, alpha, Switch, FormControlLabel, Tooltip,
} from '@mui/material';
import { Add, Remove, WorkOutline, Save, ArrowBack, Publish, DraftsTwoTone, InfoOutlined } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateJob, useUpdateJob, useJob } from '../hooks/useJobs';
import toast from 'react-hot-toast';
// const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Data Science', 'Legal'];
// const TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship'];
// const LEVELS = ['entry', 'mid', 'senior', 'lead', 'manager'];
// const BENEFITS = ['Health Insurance', 'Remote Work', 'Flexible Hours', 'Stock Options', 'Learning Budget', '401k / Pension', 'Unlimited PTO', 'Gym Membership'];


const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Data Science', 'Legal'];
const TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship'];
const LEVELS = ['entry', 'mid', 'senior', 'lead', 'manager'];
const BENEFITS = ['Health Insurance', 'Remote Work', 'Flexible Hours', 'Stock Options', 'Learning Budget', '401k / Pension', 'Unlimited PTO', 'Gym Membership'];

const DEFAULT_FORM = {
  title: '', description: '', department: '', type: 'full-time', experienceLevel: 'mid',
  location: '', skills: [], requirements: [], benefits: [],
  salary: { min: '', max: '', currency: 'USD', isVisible: true, period: 'annual' },
  applicationDeadline: '',
  status: 'draft',
};

export default function PostJob() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data: existingJob } = useJob(id);
  const navigate = useNavigate();
  const theme = useTheme();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [error, setError] = useState('');

  const { mutateAsync: createJob, isPending: creating } = useCreateJob();
  const { mutateAsync: updateJob, isPending: updating } = useUpdateJob();
  const isLoading = creating || updating;

  useEffect(() => {
    if (existingJob) {
      setForm({
        ...DEFAULT_FORM,
        ...existingJob,
        salary: { ...DEFAULT_FORM.salary, ...existingJob.salary },
        applicationDeadline: existingJob.applicationDeadline
          ? new Date(existingJob.applicationDeadline).toISOString().split('T')[0]
          : '',
      });
    }
  }, [existingJob]);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const updateSalary = (field) => (e) => setForm(f => ({ ...f, salary: { ...f.salary, [field]: e.target.value } }));

  const addSkill = () => {
    const s = skillInput.trim().toLowerCase();
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput('');
  };

  const addRequirement = () => {
    const r = reqInput.trim();
    if (r) setForm(f => ({ ...f, requirements: [...f.requirements, r] }));
    setReqInput('');
  };

  const toggleBenefit = (benefit) => {
    setForm(f => ({
      ...f,
      benefits: f.benefits.includes(benefit)
        ? f.benefits.filter(b => b !== benefit)
        : [...f.benefits, benefit],
    }));
  };

  const handleSubmit = async (status) => {
    if (!form.title || !form.description || !form.department || !form.type) {
      setError('Please fill in all required fields (title, description, department, job type)');
      return;
    }
    if (form.description.length < 50) {
      setError('Job description must be at least 50 characters');
      return;
    }
    setError('');
    try {
      const payload = { ...form, status };
      if (isEdit) {
        await updateJob({ id, ...payload });
        toast.success(status === 'active' ? 'Job published!' : 'Job saved as draft');
      } else {
        await createJob(payload);
        toast.success(status === 'active' ? 'Job posted and live!' : 'Job saved as draft');
      }
      navigate('/recruiter');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job');
    }
  };

  const descLength = form.description?.length || 0;
  const descColor = descLength < 50 ? 'error' : descLength < 200 ? 'warning.main' : 'success.main';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="md" sx={{ py: 5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5 }}>
          <IconButton
            onClick={() => navigate('/recruiter')}
            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h2">{isEdit ? 'Edit Job' : 'Post a New Job'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Update your job listing details' : 'Fill in the details to attract the right candidates'}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>Basic Information</Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    label="Job Title *" fullWidth
                    value={form.title} onChange={update('title')}
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Department *</InputLabel>
                    <Select value={form.department} onChange={update('department')} label="Department *">
                      {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location" fullWidth
                    value={form.location} onChange={update('location')}
                    placeholder="e.g. Remote / New York, NY"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Job Type *</InputLabel>
                    <Select value={form.type} onChange={update('type')} label="Job Type *">
                      {TYPES.map(t => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t.replace('-', ' ')}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Experience Level *</InputLabel>
                    <Select value={form.experienceLevel} onChange={update('experienceLevel')} label="Experience Level *">
                      {LEVELS.map(l => <MenuItem key={l} value={l} sx={{ textTransform: 'capitalize' }}>{l}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Application Deadline"
                    type="date" fullWidth
                    value={form.applicationDeadline}
                    onChange={update('applicationDeadline')}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    helperText="Leave blank for no deadline"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ── Description ────────────────────────────────────────────── */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>Job Description *</Typography>
              <TextField
                multiline rows={8} fullWidth required
                value={form.description} onChange={update('description')}
                placeholder="Describe the role, responsibilities, what the team works on, and what success looks like…"
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="caption" sx={{ color: descColor }}>
                  {descLength} characters
                </Typography>
                {descLength < 50 && (
                  <Typography variant="caption" color="error">
                    (minimum 50 required)
                  </Typography>
                )}
                {descLength >= 50 && (
                  <Typography variant="caption" color="text.disabled">
                    — detailed descriptions improve AI matching accuracy
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* ── Skills ─────────────────────────────────────────────────── */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h4">Required Skills</Typography>
                <Tooltip title="Skills are used by the AI to match and score candidates. Be specific.">
                  <InfoOutlined sx={{ fontSize: 16, color: 'text.disabled' }} />
                </Tooltip>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                These skills are used by the AI to score candidates. Be specific.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <TextField
                  value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  placeholder="e.g. React, TypeScript, AWS…"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  size="small" sx={{ flex: 1 }}
                />
                <Button variant="outlined" onClick={addSkill} startIcon={<Add />} sx={{ borderRadius: 2, flexShrink: 0 }}>Add</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {form.skills.map(s => (
                  <Chip key={s} label={s}
                    onDelete={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))}
                    sx={{ fontWeight: 500, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', textTransform: 'capitalize' }}
                  />
                ))}
                {form.skills.length === 0 && (
                  <Typography variant="caption" color="text.disabled">No skills added yet</Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* ── Requirements ───────────────────────────────────────────── */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 2.5 }}>Requirements</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <TextField
                  value={reqInput} onChange={e => setReqInput(e.target.value)}
                  placeholder="e.g. 5+ years of experience in React…"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  size="small" sx={{ flex: 1 }}
                />
                <Button variant="outlined" onClick={addRequirement} startIcon={<Add />} sx={{ borderRadius: 2, flexShrink: 0 }}>Add</Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {form.requirements.map((r, i) => (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 1, p: 1.5,
                    borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default',
                  }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>{r}</Typography>
                    <IconButton size="small" onClick={() => setForm(f => ({ ...f, requirements: f.requirements.filter((_, j) => j !== i) }))}>
                      <Remove fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* ── Benefits ───────────────────────────────────────────────── */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>Benefits & Perks</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {BENEFITS.map(b => {
                  const selected = form.benefits.includes(b);
                  return (
                    <Chip
                      key={b} label={b}
                      onClick={() => toggleBenefit(b)}
                      variant={selected ? 'filled' : 'outlined'}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: selected ? alpha(theme.palette.success.main, 0.12) : 'transparent',
                        color: selected ? 'success.main' : 'text.secondary',
                        borderColor: selected ? 'success.main' : 'divider',
                        fontWeight: selected ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>

          {/* ── Salary ─────────────────────────────────────────────────── */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Typography variant="h4">Salary Range</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.salary.isVisible}
                      onChange={e => setForm(f => ({ ...f, salary: { ...f.salary, isVisible: e.target.checked } }))}
                      size="small"
                    />
                  }
                  label={<Typography variant="caption">Show to candidates</Typography>}
                  labelPlacement="start"
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Min Salary" type="number" fullWidth
                    value={form.salary.min} onChange={updateSalary('min')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Max Salary" type="number" fullWidth
                    value={form.salary.max} onChange={updateSalary('max')}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select value={form.salary.currency} onChange={updateSalary('currency')} label="Currency">
                      {['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Period</InputLabel>
                    <Select value={form.salary.period} onChange={updateSalary('period')} label="Period">
                      {['hourly', 'monthly', 'annual'].map(p => <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ── Actions ────────────────────────────────────────────────── */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                <strong>Save as Draft</strong> — only visible to you, not searchable by candidates. <br />
                <strong>Publish</strong> — makes the job live and visible in the public job board immediately.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/recruiter')} sx={{ borderRadius: 2, px: 3 }}>
                  Cancel
                </Button>
                <Button
                  id="save-draft-btn"
                  variant="outlined" disabled={isLoading}
                  startIcon={<DraftsTwoTone />}
                  onClick={() => handleSubmit('draft')}
                  sx={{
                    borderRadius: 2, px: 3,
                    borderColor: 'warning.main', color: 'warning.main',
                    '&:hover': { borderColor: 'warning.dark', bgcolor: alpha(theme.palette.warning.main, 0.06) },
                  }}
                >
                  {isLoading ? 'Saving…' : 'Save as Draft'}
                </Button>
                <Button
                  id="publish-job-btn"
                  variant="contained" disabled={isLoading}
                  startIcon={<Publish />}
                  onClick={() => handleSubmit('active')}
                  sx={{
                    borderRadius: 2, px: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                  }}
                >
                  {isLoading ? 'Publishing…' : isEdit ? 'Save & Publish' : 'Publish Job'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
