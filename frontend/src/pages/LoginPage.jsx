import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Divider, Alert, InputAdornment, IconButton, Link as MuiLink,
  useTheme, alpha, Collapse,
} from '@mui/material';
import {
  Email, Lock, Visibility, VisibilityOff, WorkOutline,
  InfoOutlined,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Demo credential quick-fill helpers
const DEMO_ACCOUNTS = [
  { label: 'Recruiter Demo', email: 'recruiter@demo.com', password: 'Demo@1234', role: 'recruiter' },
  { label: 'Candidate Demo', email: 'candidate@demo.com', password: 'Demo@1234', role: 'applicant' },
];

export default function LoginPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  React.useEffect(() => {
    if (user) navigate(user.role === 'recruiter' ? '/recruiter' : '/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(u.role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'Account has been deactivated') {
        setError('Your account has been deactivated. Please contact support.');
      } else {
        setError('Incorrect email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setShowDemo(false);
    toast(`Filled ${account.label} credentials`, { icon: '👤' });
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: 'background.default',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark
        ? `radial-gradient(ellipse 80% 60% at 50% 0%, ${alpha('#7B6FFF', 0.15)}, transparent)`
        : `radial-gradient(ellipse 80% 60% at 50% 0%, ${alpha('#5B4FCF', 0.06)}, transparent)`,
      p: 2,
    }}>
      <Container maxWidth="xs">
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
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary">Sign in to your ATS Pro account</Typography>
        </Box>

        <Card sx={{ p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                id="login-email"
                label="Email address" type="email" fullWidth required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                }}
              />

              <Box>
                <TextField
                  id="login-password"
                  label="Password" type={showPass ? 'text' : 'password'} fullWidth required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
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
                {/* Forgot password link */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.75 }}>
                  <Typography
                    component={Link} to="/forgot-password"
                    variant="caption"
                    sx={{ color: 'primary.main', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Forgot password?
                  </Typography>
                </Box>
              </Box>

              <Button
                id="login-submit"
                type="submit" variant="contained" fullWidth size="large"
                disabled={loading}
                sx={{ borderRadius: 2.5, py: 1.5, fontSize: '1rem' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.disabled">New to ATS Pro?</Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <Button component={Link} to="/register?role=recruiter" variant="outlined" fullWidth
                sx={{ borderRadius: 2, py: 1.25, fontSize: '0.85rem' }}>
                I'm a Recruiter
              </Button>
              <Button component={Link} to="/register?role=applicant" variant="outlined" fullWidth
                sx={{ borderRadius: 2, py: 1.25, fontSize: '0.85rem' }}>
                I'm a Candidate
              </Button>
            </Box>

            {/* Demo credentials section */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                size="small"
                startIcon={<InfoOutlined sx={{ fontSize: 15 }} />}
                onClick={() => setShowDemo(v => !v)}
                sx={{ color: 'text.disabled', fontSize: '0.75rem', textTransform: 'none' }}
              >
                Use demo account
              </Button>
              <Collapse in={showDemo}>
                <Box sx={{
                  mt: 1.5, p: 1.5, borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                  display: 'flex', gap: 1,
                }}>
                  {DEMO_ACCOUNTS.map(acc => (
                    <Button
                      key={acc.role} size="small" variant="outlined" fullWidth
                      onClick={() => fillDemo(acc)}
                      sx={{ borderRadius: 1.5, fontSize: '0.75rem', textTransform: 'none', py: 0.75 }}
                    >
                      {acc.label}
                    </Button>
                  ))}
                </Box>
              </Collapse>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}


