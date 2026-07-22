import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, InputAdornment, IconButton, useTheme, alpha,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, WorkOutline, CheckCircleOutline, ArrowBack, LockReset } from '@mui/icons-material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
        {[1, 2, 3, 4].map(i => (
          <Box key={i} sx={{
            flex: 1, height: 3, borderRadius: 99,
            bgcolor: i <= strength ? colors[strength] : 'divider',
            transition: 'background-color 0.35s ease',
          }} />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color: colors[strength] || 'text.disabled', fontWeight: 500 }}>
        {labels[strength]}
      </Typography>
    </Box>
  );
}

function Orb({ sx }) {
  return <Box sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none', ...sx }} />;
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
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
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
      position: 'relative', overflow: 'hidden', p: 2,
      background: isDark
        ? 'linear-gradient(135deg, #080A12 0%, #0D0F1E 50%, #0A0C18 100%)'
        : 'linear-gradient(135deg, #EEF0FC 0%, #F4F5FF 50%, #EBF0FF 100%)',
    }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <Orb sx={{
        width: 500, height: 500, top: '-15%', left: '-10%',
        background: `radial-gradient(circle, ${alpha('#7B6FFF', isDark ? 0.16 : 0.07)}, transparent 70%)`,
      }} />
      <Orb sx={{
        width: 350, height: 350, bottom: '-10%', right: '-5%',
        background: `radial-gradient(circle, ${alpha('#34D399', isDark ? 0.1 : 0.05)}, transparent 70%)`,
      }} />

      <Box sx={{ width: '100%', maxWidth: 420, animation: 'fadeSlideUp 0.5s ease both', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '14px', mx: 'auto', mb: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
          }}>
            <LockReset sx={{ color: 'white', fontSize: 26 }} />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.75 }}>
            {done ? 'All done!' : 'Set new password'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {done ? 'You can now sign in with your new password' : 'Must be at least 8 characters'}
          </Typography>
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
            {done ? (
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
                  background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.15)}, ${alpha(theme.palette.success.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}>
                  <CheckCircleOutline sx={{ fontSize: 44, color: 'success.main' }} />
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.8 }}>
                  Your password has been reset successfully. All existing sessions have been invalidated for your security.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: 3, py: 1.5, fontSize: '0.95rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': { boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.55)}` },
                  }}
                >
                  Sign In Now
                </Button>
              </Box>
            ) : (
              <>
                {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <TextField
                      id="reset-password"
                      label="New Password"
                      type={showPass ? 'text' : 'password'}
                      fullWidth required autoFocus
                      autoComplete="new-password"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
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
                    <PasswordStrength password={form.password} />
                  </Box>

                  <TextField
                    id="reset-confirm"
                    label="Confirm New Password"
                    type={showConfirm ? 'text' : 'password'}
                    fullWidth required
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    error={!!form.confirm && form.confirm !== form.password}
                    helperText={form.confirm && form.confirm !== form.password ? 'Passwords do not match' : ''}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18 }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                            {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{
                      borderRadius: 3, py: 1.5, mt: 0.5, fontSize: '0.95rem',
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      '&:hover': { boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.55)}` },
                    }}
                  >
                    {loading ? 'Resetting password…' : 'Reset Password'}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3, gap: 0.75 }}>
                  <ArrowBack sx={{ fontSize: 15, color: 'text.disabled' }} />
                  <Typography
                    component={Link} to="/forgot-password"
                    variant="body2"
                    sx={{
                      color: 'primary.main', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Request a new link
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
