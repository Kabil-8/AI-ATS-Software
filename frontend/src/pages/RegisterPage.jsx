import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Alert, InputAdornment, IconButton, Chip, Stepper, Step, StepLabel,
  MenuItem, Select, FormControl, InputLabel, FormHelperText, useTheme, alpha,
} from '@mui/material';
import {
  Person, Email, Lock, Visibility, VisibilityOff, Business,
  ArrowForward, ArrowBack, Psychology, Check, WorkOutline,
} from '@mui/icons-material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const INDUSTRY_OPTIONS = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Media', 'Consulting', 'Government', 'Other'];
const COMPANY_SIZES = ['startup', 'small', 'medium', 'large', 'enterprise'];
const SKILL_SUGGESTIONS = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'TypeScript', 'Java', 'Go'];
const STEPS_RECRUITER = ['Role', 'Credentials', 'Company'];
const STEPS_APPLICANT = ['Role', 'Credentials', 'Profile'];

function StrengthDots({ password }) {
  if (!password) return null;
  const score = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
        {[1, 2, 3, 4].map(i => (
          <Box key={i} sx={{
            flex: 1, height: 3, borderRadius: 99,
            bgcolor: i <= score ? colors[score] : 'divider',
            transition: 'background-color 0.3s ease',
          }} />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color: colors[score] || 'text.disabled', fontWeight: 500 }}>
        {labels[score]}
      </Typography>
    </Box>
  );
}

function Orb({ sx }) {
  return <Box sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none', ...sx }} />;
}

export default function RegisterPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();

  const [role, setRole] = useState(params.get('role') || 'applicant');
  const [step, setStep] = useState(0);
  const [creds, setCreds] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [recruiterProfile, setRecruiterProfile] = useState({ company: '', jobTitle: '', industry: '', companySize: '' });
  const [applicantProfile, setApplicantProfile] = useState({ bio: '', skills: [] });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = role === 'recruiter' ? STEPS_RECRUITER : STEPS_APPLICANT;

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

  const handleNext = () => { setError(''); if (!validateStep()) return; setStep(s => s + 1); };
  const handleBack = () => { setError(''); setStep(s => s - 1); };

  const addSkill = (val) => {
    const s = (val || skillInput).trim().toLowerCase();
    if (s && !applicantProfile.skills.includes(s)) setApplicantProfile(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true); setError('');
    try {
      const payload = {
        name: creds.name, email: creds.email, password: creds.password, role,
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
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
      position: 'relative', overflow: 'hidden',
      background: isDark
        ? 'linear-gradient(135deg, #080A12 0%, #0D0F1E 50%, #0A0C18 100%)'
        : 'linear-gradient(135deg, #EEF0FC 0%, #F4F5FF 50%, #EBF0FF 100%)',
    }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <Orb sx={{
        width: 600, height: 600, top: '-15%', left: '-10%',
        background: `radial-gradient(circle, ${alpha('#7B6FFF', isDark ? 0.16 : 0.07)}, transparent 70%)`,
      }} />
      <Orb sx={{
        width: 350, height: 350, bottom: '-10%', right: '-5%',
        background: `radial-gradient(circle, ${alpha('#34D399', isDark ? 0.1 : 0.05)}, transparent 70%)`,
      }} />

      <Box sx={{ width: '100%', maxWidth: 500, animation: 'fadeSlideUp 0.5s ease both', position: 'relative', zIndex: 1 }}>
        {/* Logo + Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '14px', mx: 'auto', mb: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
          }}>
            <WorkOutline sx={{ color: 'white', fontSize: 26 }} />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>Create account</Typography>
          <Typography variant="body2" color="text.secondary">Join ATS Pro — it's free</Typography>
        </Box>

        {/* Step Progress */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {steps.map((label, i) => (
              <React.Fragment key={label}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700,
                    transition: 'all 0.3s ease',
                    ...(step > i
                      ? {
                          background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                          color: '#fff',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`,
                        }
                      : step === i
                      ? {
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                          color: '#fff',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                        }
                      : {
                          bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                          color: 'text.disabled',
                          border: `1.5px solid ${theme.palette.divider}`,
                        }),
                  }}>
                    {step > i ? <Check sx={{ fontSize: 16 }} /> : i + 1}
                  </Box>
                  <Typography variant="caption" sx={{
                    mt: 0.75,
                    fontWeight: step === i ? 600 : 400,
                    color: step === i ? 'primary.main' : step > i ? 'success.main' : 'text.disabled',
                    fontSize: '0.7rem',
                  }}>
                    {label}
                  </Typography>
                </Box>
                {i < steps.length - 1 && (
                  <Box sx={{
                    flex: 2, height: 2, borderRadius: 99, mb: 3.5,
                    background: step > i
                      ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                      : theme.palette.divider,
                    transition: 'background 0.4s ease',
                  }} />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>

        <Card sx={{
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#141828', 0.9)}, ${alpha('#0F1120', 0.95)})`
            : alpha('#FFFFFF', 0.92),
          backdropFilter: 'blur(24px)',
          border: `1px solid ${alpha(isDark ? '#7B6FFF' : '#5B4FCF', 0.12)}`,
          boxShadow: isDark
            ? `0 0 0 1px ${alpha('#7B6FFF', 0.08)}, 0 24px 64px rgba(0,0,0,0.4)`
            : '0 24px 64px rgba(91,79,207,0.12)',
          '&:hover': { transform: 'none' },
        }}>
          <CardContent sx={{ p: 3.5 }}>
            {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

            {/* STEP 0: Role Selection */}
            {step === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'stepIn 0.3s ease both' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  How are you using ATS Pro?
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[
                    { val: 'recruiter', label: "I'm Hiring", sub: 'Post jobs, manage applications, rank candidates with AI', icon: Business, color: theme.palette.primary.main },
                    { val: 'applicant', label: "I'm Job Seeking", sub: 'Browse jobs, apply, and track your applications', icon: Psychology, color: '#34D399' },
                  ].map(({ val, label, sub, icon: Icon, color }) => (
                    <Box
                      key={val}
                      onClick={() => setRole(val)}
                      sx={{
                        flex: 1, p: 2.5, borderRadius: 3, cursor: 'pointer',
                        border: `2px solid`,
                        borderColor: role === val ? color : 'divider',
                        background: role === val
                          ? alpha(color, isDark ? 0.1 : 0.04)
                          : 'transparent',
                        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:hover': {
                          borderColor: alpha(color, 0.6),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
                        },
                      }}
                    >
                      <Box sx={{
                        width: 44, height: 44, borderRadius: 2, mb: 1.5,
                        bgcolor: role === val ? alpha(color, 0.15) : 'action.hover',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}>
                        <Icon sx={{ color: role === val ? color : 'text.secondary', fontSize: 22 }} />
                      </Box>
                      <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5, fontSize: '0.9rem' }}>{label}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{sub}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  id="register-next-role"
                  variant="contained" size="large" fullWidth endIcon={<ArrowForward />}
                  onClick={handleNext}
                  sx={{
                    borderRadius: 3, py: 1.5, mt: 0.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': { boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.55)}` },
                  }}
                >
                  Continue as {role === 'recruiter' ? 'Recruiter' : 'Candidate'}
                </Button>
              </Box>
            )}

            {/* STEP 1: Credentials */}
            {step === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, animation: 'stepIn 0.3s ease both' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>Account credentials</Typography>

                <TextField
                  id="register-name" label="Full Name" required fullWidth autoFocus
                  value={creds.name} onChange={e => setCreds(c => ({ ...c, name: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 18 }} /></InputAdornment> }}
                />
                <TextField
                  id="register-email" label="Email address" type="email" required fullWidth
                  value={creds.email} onChange={e => setCreds(c => ({ ...c, email: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18 }} /></InputAdornment> }}
                />
                <Box>
                  <TextField
                    id="register-password" label="Password" type={showPass ? 'text' : 'password'} required fullWidth
                    autoComplete="new-password"
                    value={creds.password} onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18 }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                            {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StrengthDots password={creds.password} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />} sx={{ borderRadius: 2.5, flex: 1, py: 1.4 }}>Back</Button>
                  <Button
                    id="register-next-creds" variant="contained" onClick={handleNext} endIcon={<ArrowForward />}
                    sx={{
                      borderRadius: 2.5, flex: 2, py: 1.4,
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                    }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}

            {/* STEP 2a: Recruiter Profile */}
            {step === 2 && role === 'recruiter' && (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, animation: 'stepIn 0.3s ease both' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>Company profile</Typography>

                <TextField
                  id="register-company" label="Company Name *" required fullWidth autoFocus
                  value={recruiterProfile.company}
                  onChange={e => setRecruiterProfile(p => ({ ...p, company: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Business sx={{ fontSize: 18 }} /></InputAdornment> }}
                />
                <TextField
                  id="register-jobtitle" label="Your Job Title" fullWidth
                  value={recruiterProfile.jobTitle}
                  onChange={e => setRecruiterProfile(p => ({ ...p, jobTitle: e.target.value }))}
                  placeholder="e.g. Head of Talent, HR Manager"
                />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <FormControl fullWidth>
                    <InputLabel>Industry</InputLabel>
                    <Select value={recruiterProfile.industry} onChange={e => setRecruiterProfile(p => ({ ...p, industry: e.target.value }))} label="Industry">
                      {INDUSTRY_OPTIONS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Company Size</InputLabel>
                    <Select value={recruiterProfile.companySize} onChange={e => setRecruiterProfile(p => ({ ...p, companySize: e.target.value }))} label="Company Size">
                      {COMPANY_SIZES.map(s => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />} sx={{ borderRadius: 2.5, flex: 1, py: 1.4 }}>Back</Button>
                  <Button
                    id="register-submit-recruiter" type="submit" variant="contained" disabled={loading} startIcon={<Check />}
                    sx={{
                      borderRadius: 2.5, flex: 2, py: 1.4,
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }}
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* STEP 2b: Applicant Profile */}
            {step === 2 && role === 'applicant' && (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, animation: 'stepIn 0.3s ease both' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>Your profile</Typography>

                <TextField
                  id="register-bio" label="Short Bio" fullWidth multiline rows={3} autoFocus
                  value={applicantProfile.bio}
                  onChange={e => setApplicantProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell recruiters about yourself, your background, and what you're looking for…"
                  helperText={`${applicantProfile.bio.length}/500`}
                  inputProps={{ maxLength: 500 }}
                />

                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>Skills</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <TextField
                      id="register-skill-input" size="small" placeholder="Add a skill…" sx={{ flex: 1 }}
                      value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button variant="outlined" onClick={() => addSkill()} sx={{ borderRadius: 2, flexShrink: 0 }}>Add</Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                    {SKILL_SUGGESTIONS.filter(s => !applicantProfile.skills.includes(s.toLowerCase())).slice(0, 6).map(s => (
                      <Chip
                        key={s} label={s} size="small" variant="outlined"
                        onClick={() => addSkill(s)}
                        sx={{
                          fontSize: '0.72rem', cursor: 'pointer',
                          borderColor: alpha(theme.palette.primary.main, 0.25),
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), borderColor: 'primary.main' },
                        }}
                      />
                    ))}
                  </Box>
                  {applicantProfile.skills.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {applicantProfile.skills.map(s => (
                        <Chip
                          key={s} label={s} size="small"
                          onDelete={() => setApplicantProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main',
                            textTransform: 'capitalize', fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                  <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBack />} sx={{ borderRadius: 2.5, flex: 1, py: 1.4 }}>Back</Button>
                  <Button
                    id="register-submit-applicant" type="submit" variant="contained" disabled={loading} startIcon={<Check />}
                    sx={{
                      borderRadius: 2.5, flex: 2, py: 1.4,
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }}
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </Button>
                </Box>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
              Already have an account?{' '}
              <Typography component={Link} to="/login" variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Sign in
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
