import React from 'react';
import {
  Box, Container, Typography, Button, Grid, Chip, useTheme, alpha,
  Avatar, AvatarGroup,
} from '@mui/material';
import {
  RocketLaunch, Psychology, Dashboard, TrendingUp, ArrowForward,
  CheckCircle, AutoAwesome, Speed, Security,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: Psychology,
    title: 'AI Resume Parsing',
    desc: 'Gemini AI extracts skills, experience, and qualifications from any PDF or DOCX resume instantly.',
    color: '#7B6FFF',
    gradient: 'linear-gradient(135deg, #5B4FCF, #7B6FFF)',
  },
  {
    icon: TrendingUp,
    title: 'Smart Candidate Ranking',
    desc: 'Semantic matching scores candidates 0–100 against job requirements, eliminating manual screening bias.',
    color: '#34D399',
    gradient: 'linear-gradient(135deg, #059669, #34D399)',
  },
  {
    icon: Dashboard,
    title: 'Kanban Pipeline',
    desc: 'Drag and drop candidates through Applied → Interview → Hired stages with real-time notifications.',
    color: '#60A5FA',
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  },
  {
    icon: RocketLaunch,
    title: 'Automated Communication',
    desc: 'Status updates and interview invitations delivered automatically with personalized messaging.',
    color: '#FCD34D',
    gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
  },
];

const STATS = [
  { value: '78%', label: 'Faster screening', icon: Speed, color: '#7B6FFF' },
  { value: '3×', label: 'More qualified hires', icon: TrendingUp, color: '#34D399' },
  { value: '94%', label: 'Recruiter satisfaction', icon: CheckCircle, color: '#60A5FA' },
  { value: '<2min', label: 'AI analysis time', icon: AutoAwesome, color: '#FCD34D' },
];

function Orb({ sx }) {
  return <Box sx={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', ...sx }} />;
}

export default function LandingPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Box sx={{
        position: 'relative',
        pt: { xs: 8, md: 14 }, pb: { xs: 10, md: 16 },
        overflow: 'hidden',
      }}>
        <Orb sx={{
          width: 700, height: 700, top: '-20%', left: '-15%',
          background: `radial-gradient(circle, ${alpha('#7B6FFF', isDark ? 0.18 : 0.08)}, transparent 70%)`,
        }} />
        <Orb sx={{
          width: 500, height: 500, top: '10%', right: '-10%',
          background: `radial-gradient(circle, ${alpha('#34D399', isDark ? 0.12 : 0.05)}, transparent 70%)`,
        }} />
        <Orb sx={{
          width: 300, height: 300, bottom: '5%', left: '35%',
          background: `radial-gradient(circle, ${alpha('#60A5FA', isDark ? 0.1 : 0.04)}, transparent 70%)`,
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 820, mx: 'auto' }}>
            <Chip
              label="✦ Powered by Gemini AI"
              sx={{
                mb: 3.5, fontWeight: 600, fontSize: '0.82rem',
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08),
                color: 'primary.main',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                borderRadius: 2, px: 0.5,
              }}
            />

            <Typography
              component="h1"
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: { xs: '2.4rem', md: '3.6rem', lg: '4.2rem' },
                fontWeight: 800,
                mb: 3,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                background: isDark
                  ? `linear-gradient(135deg, #E8ECF6 0%, #A89EFF 60%, #7B6FFF 100%)`
                  : `linear-gradient(135deg, #0D0F1C 0%, #3D33A8 60%, #5B4FCF 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Recruit smarter,<br />not harder.
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { md: '1.15rem' }, mb: 5.5, maxWidth: 580, mx: 'auto', lineHeight: 1.8 }}
            >
              The AI-powered ATS that automatically parses resumes, scores candidates, and moves top talent through your pipeline — so you focus on the human side of hiring.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 7 }}>
              <Button
                component={Link} to="/register?role=recruiter"
                variant="contained" size="large"
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: 3, px: 4, py: 1.625, fontSize: '1rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                  boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': { boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.55)}` },
                }}
              >
                Start Recruiting Free
              </Button>
              <Button
                component={Link} to="/jobs"
                variant="outlined" size="large"
                sx={{ borderRadius: 3, px: 4, py: 1.625, fontSize: '1rem' }}
              >
                Browse Open Roles
              </Button>
            </Box>

            {/* Social proof */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 34, height: 34, fontSize: '0.8rem', border: `2px solid ${theme.palette.background.paper}` } }}>
                {['#5B4FCF', '#059669', '#D97706', '#3B82F6'].map((c, i) => (
                  <Avatar key={i} sx={{ bgcolor: c }}>{String.fromCharCode(65 + i)}</Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="body2" color="text.secondary">
                <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>500+ recruiters</Box>{' '}
                are already hiring smarter
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 10 } }}>
        <Grid container spacing={2.5}>
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={6} md={3} key={stat.value}>
                <Box sx={{
                  textAlign: 'center', p: 3, borderRadius: 3,
                  border: `1px solid ${alpha(stat.color, isDark ? 0.2 : 0.12)}`,
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha(stat.color, 0.1)}, ${alpha('#0F1120', 0.8)})`
                    : `linear-gradient(135deg, ${alpha(stat.color, 0.05)}, #FFFFFF)`,
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: alpha(stat.color, 0.4),
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${alpha(stat.color, isDark ? 0.2 : 0.12)}`,
                  },
                }}>
                  <Box sx={{
                    position: 'absolute', top: -10, right: -10,
                    width: 60, height: 60, borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(stat.color, isDark ? 0.25 : 0.1)}, transparent 70%)`,
                  }} />
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '12px', mx: 'auto', mb: 1.5,
                    background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.7)})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 14px ${alpha(stat.color, 0.4)}`,
                  }}>
                    <Icon sx={{ color: '#fff', fontSize: 20 }} />
                  </Box>
                  <Typography sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 800, fontSize: '1.875rem',
                    color: stat.color, mb: 0.5, letterSpacing: '-0.02em',
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        background: isDark
          ? `linear-gradient(180deg, ${alpha('#7B6FFF', 0.04)} 0%, transparent 100%)`
          : `linear-gradient(180deg, ${alpha('#5B4FCF', 0.03)} 0%, transparent 100%)`,
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="Features"
              sx={{
                mb: 2, fontWeight: 600, fontSize: '0.78rem',
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.07),
                color: 'primary.main',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 1.5,
              }}
            />
            <Typography variant="h2" sx={{ mb: 2 }}>Everything you need to hire better</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto', lineHeight: 1.8 }}>
              From AI-powered screening to automated communications — built for modern recruiting teams.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Grid item xs={12} sm={6} key={f.title}>
                  <Box sx={{
                    p: 4, borderRadius: 3,
                    border: `1px solid ${alpha(f.color, isDark ? 0.15 : 0.1)}`,
                    background: isDark
                      ? `linear-gradient(135deg, ${alpha(f.color, 0.07)}, ${alpha('#0F1120', 0.9)})`
                      : `linear-gradient(135deg, ${alpha(f.color, 0.03)}, #FFFFFF)`,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: alpha(f.color, isDark ? 0.4 : 0.3),
                      transform: 'translateY(-4px)',
                      boxShadow: `0 16px 48px ${alpha(f.color, isDark ? 0.18 : 0.1)}`,
                    },
                  }}>
                    <Box sx={{
                      width: 54, height: 54, borderRadius: '15px', mb: 3,
                      background: f.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 6px 20px ${alpha(f.color, 0.4)}`,
                    }}>
                      <Icon sx={{ color: '#fff', fontSize: 26 }} />
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 700 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{f.desc}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 10, md: 16 }, position: 'relative', overflow: 'hidden' }}>
        <Orb sx={{
          width: 600, height: 400, top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse, ${alpha('#7B6FFF', isDark ? 0.15 : 0.07)}, transparent 70%)`,
        }} />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Chip
            label="Get Started Free"
            sx={{
              mb: 3, fontWeight: 600, fontSize: '0.78rem',
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.07),
              color: 'primary.main',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 1.5,
            }}
          />
          <Typography variant="h2" sx={{
            mb: 2.5, fontSize: { xs: '1.875rem', md: '2.5rem' },
            fontWeight: 800, letterSpacing: '-0.02em',
          }}>
            Ready to transform your hiring?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontSize: '1.1rem', lineHeight: 1.8 }}>
            Join hundreds of companies using AI to hire faster, fairer, and smarter.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link} to="/register?role=recruiter"
              variant="contained" size="large"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 3, px: 5, py: 1.75, fontSize: '1rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light})`,
                boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': { boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.55)}` },
              }}
            >
              Start for Free
            </Button>
            <Button
              component={Link} to="/register?role=applicant"
              variant="outlined" size="large"
              sx={{ borderRadius: 3, px: 5, py: 1.75, fontSize: '1rem' }}
            >
              Find a Job
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
