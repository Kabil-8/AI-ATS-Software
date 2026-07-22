import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Alert, InputAdornment, useTheme, alpha,
} from '@mui/material';
import { Email, WorkOutline, CheckCircleOutline, ArrowBack, SendRounded } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Orb({ sx }) {
  return (
    <Box sx={{
      position: 'absolute', borderRadius: '50%',
      filter: 'blur(70px)', pointerEvents: 'none', ...sx,
    }} />
  );
}

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
            <WorkOutline sx={{ color: 'white', fontSize: 26 }} />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.75 }}>
            {sent ? 'Check your inbox' : 'Forgot password?'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sent
              ? `Reset link sent to ${email}`
              : "Enter your email and we'll send you a reset link"}
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
            {sent ? (
              /* ── Success State ── */
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

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.8 }}>
                  If <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{email}</Box> is
                  registered, you'll receive a reset link within a few minutes.
                </Typography>

                <Alert
                  severity="info"
                  sx={{ mb: 3, borderRadius: 2.5, textAlign: 'left', fontSize: '0.82rem' }}
                >
                  The reset link expires in <strong>1 hour</strong>. Check your spam folder if you don't see it.
                </Alert>

                <Button
                  onClick={() => { setSent(false); setEmail(''); }}
                  variant="outlined" fullWidth
                  sx={{ borderRadius: 2.5, py: 1.25, mb: 1 }}
                >
                  Try a different email
                </Button>
              </Box>
            ) : (
              /* ── Form State ── */
              <>
                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    id="forgot-email"
                    label="Email address"
                    type="email"
                    fullWidth
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ fontSize: 18 }} />
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
                    endIcon={!loading && <SendRounded />}
                    sx={{
                      borderRadius: 3, py: 1.5, fontSize: '0.95rem',
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      '&:hover': { boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.55)}` },
                    }}
                  >
                    {loading ? 'Sending link…' : 'Send Reset Link'}
                  </Button>
                </Box>
              </>
            )}

            {/* Back to login */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3, gap: 0.75 }}>
              <ArrowBack sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography
                component={Link}
                to="/login"
                variant="body2"
                sx={{
                  color: 'primary.main', fontWeight: 600,
                  textDecoration: 'none', fontSize: '0.85rem',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Back to Sign In
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
