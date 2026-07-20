import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Alert, InputAdornment, IconButton, useTheme, alpha, LinearProgress,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, WorkOutline, CheckCircleOutline, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Simple password strength indicator
function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;
  return (
    <Box sx={{ mt: 0.5 }}>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
        {[1, 2, 3, 4].map(i => (
          <Box key={i} sx={{
            flex: 1, height: 3, borderRadius: 99,
            bgcolor: i <= strength ? colors[strength] : 'divider',
            transition: 'background-color 0.3s ease',
          }} />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color: colors[strength] || 'text.disabled' }}>
        {labels[strength]}
      </Typography>
    </Box>
  );
}

export default function ResetPasswordPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
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
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
            {done ? 'All done!' : 'Set new password'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {done ? 'You can now sign in with your new password' : 'Must be at least 8 characters'}
          </Typography>
        </Box>

        <Card sx={{ p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {done ? (
              /* ── Success state ── */
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 3,
                  background: alpha(theme.palette.success.main, 0.12),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircleOutline sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                  Your password has been reset. All existing sessions have been invalidated for security.
                </Typography>
                <Button
                  variant="contained" fullWidth size="large"
                  onClick={() => navigate('/login')}
                  sx={{ borderRadius: 2.5, py: 1.5 }}
                >
                  Sign In Now
                </Button>
              </Box>
            ) : (
              /* ── Form state ── */
              <>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <TextField
                      id="reset-password"
                      label="New Password"
                      type={showPass ? 'text' : 'password'}
                      fullWidth required
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ fontSize: 18, color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPass(v => !v)}>
                              {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <PasswordStrength password={form.password} />
                  </Box>

                  <TextField
                    id="reset-confirm"
                    label="Confirm New Password"
                    type={showConfirm ? 'text' : 'password'}
                    fullWidth required
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    error={!!form.confirm && form.confirm !== form.password}
                    helperText={form.confirm && form.confirm !== form.password ? 'Passwords do not match' : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowConfirm(v => !v)}>
                            {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit" variant="contained" fullWidth size="large"
                    disabled={loading}
                    sx={{ borderRadius: 2.5, py: 1.5, fontSize: '1rem' }}
                  >
                    {loading ? 'Resetting password…' : 'Reset Password'}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2.5, gap: 0.5 }}>
                  <ArrowBack sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography
                    component={Link} to="/forgot-password"
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Request a new link
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
