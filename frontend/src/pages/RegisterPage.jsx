import React, { useState } from 'react';
import { Box, Container, Card, CardContent, Typography, TextField, Button, Alert, InputAdornment, IconButton, ToggleButton, ToggleButtonGroup, useTheme, alpha } from '@mui/material';
import { Person, Email, Lock, Visibility, VisibilityOff, Business, WorkOutline } from '@mui/icons-material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();

  const [role, setRole] = useState(params.get('role') || 'applicant');
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', jobTitle: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    try {
      const u = await register({ ...form, role });
      toast.success(`Welcome to ATS Pro, ${u.name.split(' ')[0]}!`);
      navigate(u.role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: 'background.default', display: 'flex',
      alignItems: 'center', justifyContent: 'center', p: 2,
      background: isDark
        ? `radial-gradient(ellipse 80% 60% at 50% 0%, ${alpha('#7B6FFF', 0.12)}, transparent)`
        : `radial-gradient(ellipse 80% 60% at 50% 0%, ${alpha('#5B4FCF', 0.05)}, transparent)`,
    }}>
      <Container maxWidth="xs">
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

        <Card sx={{ p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Role toggle */}
            <ToggleButtonGroup
              value={role} exclusive onChange={(_, v) => v && setRole(v)}
              fullWidth sx={{ mb: 3, '& .MuiToggleButton-root': { borderRadius: '10px !important', py: 1, fontWeight: 600, textTransform: 'none' } }}
            >
              <ToggleButton value="applicant">I'm a Candidate</ToggleButton>
              <ToggleButton value="recruiter">I'm a Recruiter</ToggleButton>
            </ToggleButtonGroup>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Full Name" required fullWidth value={form.name} onChange={update('name')}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }} />
              <TextField label="Email address" type="email" required fullWidth value={form.email} onChange={update('email')}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }} />
              <TextField
                label="Password" type={showPass ? 'text' : 'password'} required fullWidth
                value={form.password} onChange={update('password')} helperText="Minimum 8 characters"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setShowPass(v => !v)}>{showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
                }}
              />
              {role === 'recruiter' && (
                <TextField label="Company Name" fullWidth value={form.company} onChange={update('company')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Business sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }} />
              )}

              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
                sx={{ borderRadius: 2.5, py: 1.5, fontSize: '1rem', mt: 0.5 }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.5 }}>
              Already have an account?{' '}
              <Typography component={Link} to="/login" variant="body2" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Sign in
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
