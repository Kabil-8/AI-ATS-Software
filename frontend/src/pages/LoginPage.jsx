import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Divider, Alert, InputAdornment, IconButton, Link as MuiLink,
  useTheme, alpha, Collapse, Chip,
} from '@mui/material';
import {
  Email, Lock, Visibility, VisibilityOff,
  InfoOutlined, ArrowForward, Psychology, TrendingUp, People,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { label: 'Recruiter Demo', email: 'recruiter@demo.com', password: 'Demo@1234', role: 'recruiter', color: '#7B6FFF' },
  { label: 'Candidate Demo', email: 'candidate@demo.com', password: 'Demo@1234', role: 'applicant', color: '#34D399' },
];

const HIGHLIGHTS = [
  { icon: Psychology, label: 'AI resume parsing & scoring' },
  { icon: TrendingUp, label: 'Smart candidate ranking' },
  { icon: People, label: 'Full pipeline management' },
];

// Floating orb decoration
function Orb({ sx }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        animation: 'orbFloat 8s ease-in-out infinite',
        ...sx,
      }}
    />
  );
}

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
      toast.success(`Welcome back, ${u.name.split(' ')[0]}! 👋`);
      navigate(u.role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(
        msg === 'Account has been deactivated'
          ? 'Your account has been deactivated. Contact support.'
          : 'Incorrect email or password. Please try again.'
      );
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
      minHeight: '100vh',
      display: 'flex',
      background: isDark
        ? 'linear-gradient(135deg, #080A12 0%, #0D0F1E 50%, #0A0C18 100%)'
        : 'linear-gradient(135deg, #EEF0FC 0%, #F4F5FF 50%, #EBF0FF 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerLine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Background orbs */}
      <Orb sx={{
        width: 600, height: 600,
        top: '-15%', left: '-10%',
        background: `radial-gradient(circle, ${alpha('#7B6FFF', isDark ? 0.18 : 0.08)}, transparent 70%)`,
        animation: 'orbFloat 10s ease-in-out infinite',
      }} />
      <Orb sx={{
        width: 400, height: 400,
        bottom: '-10%', right: '-5%',
        background: `radial-gradient(circle, ${alpha('#34D399', isDark ? 0.12 : 0.06)}, transparent 70%)`,
        animation: 'orbFloat2 12s ease-in-out infinite',
      }} />
      <Orb sx={{
        width: 300, height: 300,
        top: '40%', right: '30%',
        background: `radial-gradient(circle, ${alpha('#F59E0B', isDark ? 0.08 : 0.04)}, transparent 70%)`,
        animation: 'orbFloat 14s ease-in-out infinite 2s',
      }} />

      {/* Left branding panel (hidden on mobile) */}
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
        maxWidth: 520,
        px: 8,
        py: 6,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 8 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
          }}>
            <Psychology sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Typography sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700, fontSize: '1.4rem',
            color: 'text.primary', letterSpacing: '-0.5px',
          }}>
            ATS<span style={{ color: theme.palette.primary.main }}>Pro</span>
          </Typography>
        </Box>

        <Typography variant="h1" sx={{
          fontSize: { lg: '2.6rem' },
          mb: 2.5,
          background: isDark
            ? `linear-gradient(135deg, #E8ECF6 20%, ${theme.palette.primary.light} 80%)`
            : `linear-gradient(135deg, #0D0F1C 20%, ${theme.palette.primary.main} 80%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Recruit smarter with AI
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, lineHeight: 1.8, fontSize: '1.05rem' }}>
          The intelligent applicant tracking system that automatically ranks candidates, parses resumes, and streamlines your entire hiring workflow.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                background: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}>
                <Icon sx={{ fontSize: 18, color: 'primary.main' }} />
              </Box>
              <Typography variant="body2" fontWeight={500} color="text.secondary">{label}</Typography>
            </Box>
          ))}
        </Box>

        {/* Decorative grid lines */}
        <Box sx={{
          position: 'absolute', bottom: 40, left: 32,
          opacity: isDark ? 0.06 : 0.04,
        }}>
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{
              width: 200, height: 1, bgcolor: 'text.primary', mb: 6,
            }} />
          ))}
        </Box>
      </Box>

      {/* Right form panel */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: 420,
          animation: 'fadeSlideUp 0.5s ease both',
        }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1.5, mb: 6, justifyContent: 'center' }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '13px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
            }}>
              <Psychology sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700, fontSize: '1.5rem',
              color: 'text.primary', letterSpacing: '-0.5px',
            }}>
              ATS<span style={{ color: theme.palette.primary.main }}>Pro</span>
            </Typography>
          </Box>

          {/* Header */}
          <Box sx={{ mb: 4, textAlign: { xs: 'center', lg: 'left' } }}>
            <Typography variant="h2" sx={{ mb: 0.75, fontWeight: 700 }}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          {/* Card */}
          <Card sx={{
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#141828', 0.9)}, ${alpha('#0F1120', 0.95)})`
              : alpha('#FFFFFF', 0.92),
            backdropFilter: 'blur(24px)',
            border: `1px solid ${alpha(isDark ? '#7B6FFF' : '#5B4FCF', 0.12)}`,
            boxShadow: isDark
              ? `0 0 0 1px ${alpha('#7B6FFF', 0.08)}, 0 24px 64px rgba(0,0,0,0.4)`
              : '0 24px 64px rgba(91,79,207,0.12), 0 2px 4px rgba(11,13,21,0.04)',
            '&:hover': { transform: 'none' },
          }}>
            <CardContent sx={{ p: 3.5 }}>
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.85rem' }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  id="login-email"
                  label="Email address"
                  type="email"
                  fullWidth
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box>
                  <TextField
                    id="login-password"
                    label="Password"
                    type={showPass ? 'text' : 'password'}
                    fullWidth
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                            {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Typography
                      component={Link}
                      to="/forgot-password"
                      variant="caption"
                      sx={{
                        color: 'primary.main', fontWeight: 600,
                        textDecoration: 'none', fontSize: '0.8rem',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>
                </Box>

                <Button
                  id="login-submit"
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  endIcon={!loading && <ArrowForward />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontSize: '0.95rem',
                    mt: 0.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.55)}`,
                    },
                  }}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
                  New to ATS Pro?
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
                <Button
                  component={Link}
                  to="/register?role=recruiter"
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 2.5, py: 1.2, fontSize: '0.82rem' }}
                >
                  I'm a Recruiter
                </Button>
                <Button
                  component={Link}
                  to="/register?role=applicant"
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 2.5, py: 1.2, fontSize: '0.82rem' }}
                >
                  I'm a Candidate
                </Button>
              </Box>

              {/* Demo section */}
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  size="small"
                  startIcon={<InfoOutlined sx={{ fontSize: 15 }} />}
                  onClick={() => setShowDemo(v => !v)}
                  sx={{
                    color: 'text.disabled', fontSize: '0.75rem',
                    textTransform: 'none', borderRadius: 2,
                    '&:hover': { color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.06) },
                  }}
                >
                  Use demo account
                </Button>
                <Collapse in={showDemo}>
                  <Box sx={{
                    mt: 1.5, p: 1.5, borderRadius: 2.5,
                    border: `1px solid ${alpha(isDark ? '#7B6FFF' : '#5B4FCF', 0.15)}`,
                    background: isDark ? alpha('#7B6FFF', 0.04) : alpha('#5B4FCF', 0.02),
                    display: 'flex', gap: 1,
                  }}>
                    {DEMO_ACCOUNTS.map(acc => (
                      <Button
                        key={acc.role}
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => fillDemo(acc)}
                        sx={{
                          borderRadius: 2, fontSize: '0.75rem',
                          textTransform: 'none', py: 0.75,
                          borderColor: alpha(acc.color, 0.4),
                          color: acc.color,
                          '&:hover': { borderColor: acc.color, bgcolor: alpha(acc.color, 0.06) },
                        }}
                      >
                        {acc.label}
                      </Button>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
