import React, { useState } from 'react';
import { Box, Container, Typography, Grid, TextField, MenuItem, Select, FormControl, InputLabel, Button, Card, CardContent, Divider, Alert, Chip, IconButton, useTheme, alpha } from '@mui/material';
import { Add, Remove, WorkOutline, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateJob, useUpdateJob, useJob } from '../hooks/useJobs';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Data Science', 'Legal'];
const TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship'];
const LEVELS = ['entry', 'mid', 'senior', 'lead', 'manager'];

const DEFAULT_FORM = {
  title: '', description: '', department: '', type: 'full-time', experienceLevel: 'mid',
  location: '', skills: [], requirements: [], salary: { min: '', max: '', currency: 'USD', isVisible: true },
};

export default function PostJob() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data: existingJob } = useJob(id);
  const navigate = useNavigate();
  const theme = useTheme();

  const [form, setForm] = useState(existingJob || DEFAULT_FORM);
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [error, setError] = useState('');

  const { mutateAsync: createJob, isPending: creating } = useCreateJob();
  const { mutateAsync: updateJob, isPending: updating } = useUpdateJob();
  const isLoading = creating || updating;

  React.useEffect(() => {
    if (existingJob) setForm({ ...DEFAULT_FORM, ...existingJob });
  }, [existingJob]);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const updateSalary = (field) => (e) => setForm(f => ({ ...f, salary: { ...f.salary, [field]: e.target.value } }));

  const addSkill = () => {
    const s = skillInput.trim().toLowerCase();
    if (s && !form.skills.includes(s)) {
      setForm(f => ({ ...f, skills: [...f.skills, s] }));
    }
    setSkillInput('');
  };

  const addRequirement = () => {
    const r = reqInput.trim();
    if (r) setForm(f => ({ ...f, requirements: [...f.requirements, r] }));
    setReqInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.department || !form.type) {
      setError('Please fill in all required fields'); return;
    }
    setError('');
    try {
      if (isEdit) {
        await updateJob({ id, ...form });
        toast.success('Job updated successfully');
      } else {
        await createJob(form);
        toast.success('Job posted successfully!');
      }
      navigate('/recruiter');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job');
    }
  };

  const inputSx = { borderRadius: 2 };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5 }}>
          <IconButton onClick={() => navigate('/recruiter')} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
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

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Info */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>Basic Information</Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField label="Job Title *" fullWidth value={form.title} onChange={update('title')} placeholder="e.g. Senior Frontend Engineer" />
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
                  <TextField label="Location" fullWidth value={form.location} onChange={update('location')} placeholder="e.g. Remote / New York, NY" />
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
              </Grid>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>Job Description *</Typography>
              <TextField
                multiline rows={8} fullWidth required
                value={form.description} onChange={update('description')}
                placeholder="Describe the role, responsibilities, what the team works on, and what success looks like…"
                helperText={`${form.description.length} characters — be detailed to improve AI matching accuracy`}
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 1 }}>Required Skills</Typography>
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
                  <Chip key={s} label={s} onDelete={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))}
                    sx={{ fontWeight: 500, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', textTransform: 'capitalize' }} />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Requirements */}
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
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>{r}</Typography>
                    <IconButton size="small" onClick={() => setForm(f => ({ ...f, requirements: f.requirements.filter((_, j) => j !== i) }))}>
                      <Remove fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Salary */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 2.5 }}>Salary Range (optional)</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label="Min Salary" type="number" fullWidth value={form.salary.min} onChange={updateSalary('min')} InputProps={{ startAdornment: '$' }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Max Salary" type="number" fullWidth value={form.salary.max} onChange={updateSalary('max')} InputProps={{ startAdornment: '$' }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select value={form.salary.currency} onChange={updateSalary('currency')} label="Currency">
                      {['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/recruiter')} sx={{ borderRadius: 2, px: 3 }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading} startIcon={<Save />} sx={{ borderRadius: 2, px: 4 }}>
              {isLoading ? (isEdit ? 'Saving…' : 'Publishing…') : (isEdit ? 'Save Changes' : 'Publish Job')}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
