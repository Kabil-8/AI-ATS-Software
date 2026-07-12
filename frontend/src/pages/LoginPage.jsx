import React, { useState } from 'react';
import { Box, Container, Card, CardContent, Typography, TextField, Button, Divider, Alert, InputAdornment, IconButton, Link as MuiLink, useTheme, alpha } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, WorkOutline } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
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
                label="Email address" type="email" fullWidth required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
              />
              <TextField
                label="Password" type={showPass ? 'text' : 'password'} fullWidth required
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
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
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
                sx={{ borderRadius: 2.5, py: 1.5, fontSize: '1rem', mt: 0.5 }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.disabled">New to ATS Pro?</Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button component={Link} to="/register?role=recruiter" variant="outlined" fullWidth sx={{ borderRadius: 2, py: 1.25, fontSize: '0.85rem' }}>
                I'm a Recruiter
              </Button>
              <Button component={Link} to="/register?role=applicant" variant="outlined" fullWidth sx={{ borderRadius: 2, py: 1.25, fontSize: '0.85rem' }}>
                I'm a Candidate
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
