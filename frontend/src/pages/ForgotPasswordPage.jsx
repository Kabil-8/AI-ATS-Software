import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Alert, InputAdornment, Link as MuiLink, useTheme, alpha,
} from '@mui/material';
import { Email, WorkOutline, CheckCircleOutline, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
            {sent ? 'Check your inbox' : 'Forgot password?'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sent
              ? `We sent a reset link to ${email}`
              : "No worries — we'll send you reset instructions"}
          </Typography>
        </Box>

        <Card sx={{ p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {sent ? (
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
                  If <strong>{email}</strong> is registered, you'll receive a link to reset your
                  password within a few minutes. Check your spam folder if it doesn't appear.
                </Typography>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
                  The reset link expires in <strong>1 hour</strong>.
                </Alert>
                <Button
                  onClick={() => { setSent(false); setEmail(''); }}
                  variant="outlined" fullWidth sx={{ borderRadius: 2, mb: 1.5 }}
                >
                  Try a different email
                </Button>
              </Box>
            ) : (
              /* ── Form state ── */
              <>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    id="forgot-email"
                    label="Email address" type="email" fullWidth required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit" variant="contained" fullWidth size="large"
                    disabled={loading}
                    sx={{ borderRadius: 2.5, py: 1.5, fontSize: '1rem' }}
                  >
                    {loading ? 'Sending link…' : 'Send Reset Link'}
                  </Button>
                </Box>
              </>
            )}

            {/* Back to login */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2.5, gap: 0.5 }}>
              <ArrowBack sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography
                component={Link} to="/login"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Back to Sign In
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
