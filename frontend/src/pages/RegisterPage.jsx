import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Alert, InputAdornment, IconButton, ToggleButton, ToggleButtonGroup,
  useTheme, alpha, Chip, Stepper, Step, StepLabel, MenuItem, Select,
  FormControl, InputLabel, FormHelperText,
} from '@mui/material';
import {
  Person, Email, Lock, Visibility, VisibilityOff, Business,
  WorkOutline, ArrowForward, ArrowBack, Psychology, Check,
} from '@mui/icons-material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const INDUSTRY_OPTIONS = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Media', 'Consulting', 'Government', 'Other'];
const COMPANY_SIZES = ['startup', 'small', 'medium', 'large', 'enterprise'];
const SKILL_SUGGESTIONS = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'TypeScript', 'Java', 'Go'];

const STEPS_RECRUITER = ['Your Role', 'Credentials', 'Company Profile'];
const STEPS_APPLICANT = ['Your Role', 'Credentials', 'Your Profile'];

// Simple password strength
function StrengthDots({ password }) {
  if (!password) return null;
  const score = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];
  return (
    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, mb: 0.25 }}>
      {[1, 2, 3, 4].map(i => (
        <Box key={i} sx={{ flex: 1, height: 3, borderRadius: 99, bgcolor: i <= score ? colors[score] : 'divider', transition: 'background-color 0.3s' }} />
      ))}
    </Box>
  );
}

export default function RegisterPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();

  const [role, setRole] = useState(params.get('role') || 'applicant');
  const [step, setStep] = useState(0);

  // Step 1: credentials
  const [creds, setCreds] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  // Step 2 — recruiter profile
  const [recruiterProfile, setRecruiterProfile] = useState({
    company: '', jobTitle: '', industry: '', companySize: '',
  });

  // Step 2 — applicant profile
  const [applicantProfile, setApplicantProfile] = useState({
    bio: '', skills: [],
  });
  const [skillInput, setSkillInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = role === 'recruiter' ? STEPS_RECRUITER : STEPS_APPLICANT;

  // ── Validation per step ─────────────────────────────────────────────────────
  const validateStep = () => {
    if (step === 1) {
      if (!creds.name.trim()) { setError('Full name is required'); return false; }
      if (!creds.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creds.email)) { setError('Valid email is required'); return false; }
      if (creds.password.length < 8) { setError('Password must be at least 8 characters'); return false; }
    }
    if (step === 2 && role === 'recruiter') {
      if (!recruiterProfile.company.trim()) { setError('Company name is required'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const handleBack = () => { setError(''); setStep(s => s - 1); };

  const addSkill = (val) => {
    const s = (val || skillInput).trim().toLowerCase();
    if (s && !applicantProfile.skills.includes(s)) {
      setApplicantProfile(p => ({ ...p, skills: [...p.skills, s] }));
    }
    setSkillInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: creds.name,
        email: creds.email,
        password: creds.password,
        role,
        ...(role === 'recruiter' ? recruiterProfile : { bio: applicantProfile.bio, skills: applicantProfile.skills }),
      };
      const u = await register(payload);
      toast.success(`Welcome to ATS Pro, ${u.name.split(' ')[0]}! 🎉`);
      navigate(u.role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('already registered') || msg?.includes('duplicate')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (err.response?.data?.errors?.length) {
        setError(err.response.data.errors.map(e => e.msg).join('. '));
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
      background: isDark
        ? `radial-gradient(ellipse 80% 60% at 50% 0%, ${alpha('#7B6FFF', 0.12)}, transparent)`
        : `radial-gradient(ellipse 80% 60% at 50% 0%, ${alpha('#5B4FCF', 0.05)}, transparent)`,
    }}>
      <Container maxWidth="sm">
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '14px', mx: 'auto', mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
          }}>
            <WorkOutline sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>Create account</Typography>
          <Typography variant="body2" color="text.secondary">Join ATS Pro — it's free</Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {steps.map((label, i) => (
            <Step key={label} completed={step > i}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    '&.Mui-completed': { color: 'success.main' },
                    '&.Mui-active': { color: 'primary.main' },
                  },
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: step === i ? 600 : 400 }}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card sx={{ p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

            {/* ── STEP 0: Role selection ─────────────────────────────────── */}
            {step === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  How are you using ATS Pro?
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[
                    { val: 'recruiter', label: "I'm Hiring", sub: 'Post jobs, manage applications, and rank candidates with AI', icon: Business },
                    { val: 'applicant', label: "I'm Job Seeking", sub: 'Browse jobs, apply, and track your application pipeline', icon: Psychology },
                  ].map(({ val, label, sub, icon: Icon }) => (
                    <Box
                      key={val}
                      onClick={() => setRole(val)}
                      sx={{
                        flex: 1, p: 2.5, borderRadius: 3, cursor: 'pointer', border: `2px solid`,
                        borderColor: role === val ? 'primary.main' : 'divider',
                        bgcolor: role === val ? alpha(theme.palette.primary.main, isDark ? 0.1 : 0.04) : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.light' },
                      }}
                    >
                      <Box sx={{
                        width: 44, height: 44, borderRadius: 2, mb: 1.5,
                        bgcolor: role === val ? alpha(theme.palette.primary.main, 0.15) : 'action.hover',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon sx={{ color: role === val ? 'primary.main' : 'text.secondary', fontSize: 22 }} />
                      </Box>
                      <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>{label}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>{sub}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  id="register-next-role"
                  variant="contained" size="large" fullWidth endIcon={<ArrowForward />}
                  onClick={handleNext}
                  sx={{ borderRadius: 2.5, py: 1.5, mt: 1 }}
                >
                  Continue as {role === 'recruiter' ? 'Recruiter' : 'Candidate'}
                </Button>
              </Box>
            )}

            {/* ── STEP 1: Credentials ────────────────────────────────────── */}
            {step === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>Account credentials</Typography>

                <TextField
                  id="register-name"
                  label="Full Name" required fullWidth
                  value={creds.name} onChange={e => setCreds(c => ({ ...c, name: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
                />
                <TextField
                  id="register-email"
                  label="Email address" type="email" required fullWidth
                  value={creds.email} onChange={e => setCreds(c => ({ ...c, email: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
                />
                <Box>
                  <TextField
                    id="register-password"
                    label="Password" type={showPass ? 'text' : 'password'} required fullWidth
                    value={creds.password} onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPass(v => !v)}>
                            {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StrengthDots password={creds.password} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />} sx={{ borderRadius: 2, flex: 1, py: 1.4 }}>Back</Button>
                  <Button
                    id="register-next-creds"
                    variant="contained" onClick={handleNext} endIcon={<ArrowForward />}
                    sx={{ borderRadius: 2, flex: 2, py: 1.4 }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}

            {/* ── STEP 2a: Recruiter Profile ─────────────────────────────── */}
            {step === 2 && role === 'recruiter' && (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>Company profile</Typography>

                <TextField
                  id="register-company"
                  label="Company Name *" required fullWidth
                  value={recruiterProfile.company}
                  onChange={e => setRecruiterProfile(p => ({ ...p, company: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Business sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
                />
                <TextField
                  id="register-jobtitle"
                  label="Your Job Title" fullWidth
                  value={recruiterProfile.jobTitle}
                  onChange={e => setRecruiterProfile(p => ({ ...p, jobTitle: e.target.value }))}
                  placeholder="e.g. Head of Talent, HR Manager"
                />
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={recruiterProfile.industry}
                    onChange={e => setRecruiterProfile(p => ({ ...p, industry: e.target.value }))}
                    label="Industry"
                  >
                    {INDUSTRY_OPTIONS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Company Size</InputLabel>
                  <Select
                    value={recruiterProfile.companySize}
                    onChange={e => setRecruiterProfile(p => ({ ...p, companySize: e.target.value }))}
                    label="Company Size"
                  >
                    {COMPANY_SIZES.map(s => (
                      <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Helps candidates understand your organisation</FormHelperText>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />} sx={{ borderRadius: 2, flex: 1, py: 1.4 }}>Back</Button>
                  <Button
                    id="register-submit-recruiter"
                    type="submit" variant="contained" disabled={loading}
                    startIcon={<Check />}
                    sx={{ borderRadius: 2, flex: 2, py: 1.4, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})` }}
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* ── STEP 2b: Applicant Profile ─────────────────────────────── */}
            {step === 2 && role === 'applicant' && (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>Your profile</Typography>

                <TextField
                  id="register-bio"
                  label="Short Bio" fullWidth multiline rows={3}
                  value={applicantProfile.bio}
                  onChange={e => setApplicantProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell recruiters about yourself, your background, and what you're looking for…"
                  helperText={`${applicantProfile.bio.length}/500`}
                  inputProps={{ maxLength: 500 }}
                />

                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Skills</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <TextField
                      id="register-skill-input"
                      size="small" placeholder="Add a skill…" sx={{ flex: 1 }}
                      value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button variant="outlined" onClick={() => addSkill()} sx={{ borderRadius: 2, flexShrink: 0 }}>Add</Button>
                  </Box>
                  {/* Suggestions */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                    {SKILL_SUGGESTIONS.filter(s => !applicantProfile.skills.includes(s.toLowerCase())).slice(0, 6).map(s => (
                      <Chip
                        key={s} label={s} size="small" variant="outlined"
                        onClick={() => addSkill(s)}
                        sx={{ fontSize: '0.72rem', cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
                      />
                    ))}
                  </Box>
                  {/* Added skills */}
                  {applicantProfile.skills.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {applicantProfile.skills.map(s => (
                        <Chip
                          key={s} label={s} size="small"
                          onDelete={() => setApplicantProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))}
                          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', textTransform: 'capitalize', fontWeight: 500 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />} sx={{ borderRadius: 2, flex: 1, py: 1.4 }}>Back</Button>
                  <Button
                    id="register-submit-applicant"
                    type="submit" variant="contained" disabled={loading}
                    startIcon={<Check />}
                    sx={{ borderRadius: 2, flex: 2, py: 1.4, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})` }}
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Sign-in link */}
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.5 }}>
              Already have an account?{' '}
              <Typography component={Link} to="/login" variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Sign in
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
