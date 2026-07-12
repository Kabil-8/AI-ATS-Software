import React from 'react';
import { Box, Container, Typography, Button, Grid, Chip, useTheme, alpha, Avatar, AvatarGroup } from '@mui/material';
import { RocketLaunch, Psychology, Dashboard, TrendingUp, ArrowForward, CheckCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: Psychology, title: 'AI Resume Parsing', desc: 'Gemini AI extracts skills, experience, and qualifications from any PDF or DOCX resume instantly.', color: '#5B4FCF' },
  { icon: TrendingUp, title: 'Smart Candidate Ranking', desc: 'Semantic matching scores candidates 0–100 against job requirements, eliminating manual screening bias.', color: '#059669' },
  { icon: Dashboard, title: 'Kanban Pipeline', desc: 'Drag and drop candidates through Applied → Interview → Hired stages with real-time email notifications.', color: '#3B82F6' },
  { icon: RocketLaunch, title: 'Automated Communication', desc: 'Status updates and interview invitations delivered automatically with personalized, warm messaging.', color: '#D97706' },
];

const STATS = [
  { value: '78%', label: 'Reduction in screening time' },
  { value: '3×', label: 'More qualified interviews' },
  { value: '94%', label: 'Recruiter satisfaction rate' },
  { value: '<2min', label: 'AI analysis per resume' },
];

export default function LandingPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box sx={{
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? `radial-gradient(ellipse 80% 60% at 50% -10%, ${alpha('#7B6FFF', 0.2)}, transparent)`
          : `radial-gradient(ellipse 80% 60% at 50% -10%, ${alpha('#5B4FCF', 0.08)}, transparent)`,
        pt: { xs: 8, md: 14 }, pb: { xs: 8, md: 12 },
      }}>
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute', top: '20%', right: '-5%', width: 500, height: 500, borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)}, transparent)`,
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.05)}, transparent)`,
          pointerEvents: 'none',
        }} />

        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Chip
              label="✦ Powered by Gemini AI"
              sx={{
                mb: 3, fontWeight: 600, fontSize: '0.8rem',
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08),
                color: 'primary.main',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                borderRadius: 2,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.2rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 700,
                mb: 3,
                background: isDark
                  ? `linear-gradient(135deg, #EDF0F7 30%, #7B6FFF 100%)`
                  : `linear-gradient(135deg, #0B0D15 30%, #5B4FCF 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.15,
              }}
            >
              Recruit smarter,<br />not harder.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { md: '1.2rem' }, mb: 5, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
              The AI-powered ATS that automatically parses resumes, scores candidates, and moves top talent through your pipeline — so you can focus on the human part of hiring.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
              <Button
                component={Link} to="/register?role=recruiter"
                variant="contained" size="large"
                endIcon={<ArrowForward />}
                sx={{ borderRadius: 3, px: 4, py: 1.5, fontSize: '1rem' }}
              >
                Start Recruiting Free
              </Button>
              <Button
                component={Link} to="/jobs"
                variant="outlined" size="large"
                sx={{ borderRadius: 3, px: 4, py: 1.5, fontSize: '1rem' }}
              >
                Browse Open Roles
              </Button>
            </Box>

            {/* Social proof */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.75rem', border: `2px solid ${theme.palette.background.paper}` } }}>
                {['#5B4FCF','#059669','#D97706','#3B82F6'].map((c, i) => (
                  <Avatar key={i} sx={{ bgcolor: c }}>{String.fromCharCode(65+i)}</Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="body2" color="text.secondary">
                <strong style={{ color: theme.palette.text.primary }}>500+ recruiters</strong> are using ATS Pro
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={3}>
          {STATS.map((stat) => (
            <Grid item xs={6} md={3} key={stat.value}>
              <Box sx={{
                textAlign: 'center', p: 3, borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.4), transform: 'translateY(-2px)' },
              }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: isDark ? alpha('#141724', 0.5) : alpha('#F6F8FC', 0.8), py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>Everything you need to hire better</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              From AI-powered screening to automated communications — built for modern recruiting teams.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Grid item xs={12} sm={6} key={f.title}>
                  <Box sx={{
                    p: 3.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper', height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: alpha(f.color, 0.4), transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${alpha(f.color, 0.12)}` },
                  }}>
                    <Box sx={{
                      width: 52, height: 52, borderRadius: 2, mb: 2.5,
                      background: `linear-gradient(135deg, ${f.color}, ${alpha(f.color, 0.7)})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 16px ${alpha(f.color, 0.35)}`,
                    }}>
                      <Icon sx={{ color: '#fff', fontSize: 26 }} />
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1.5 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{f.desc}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ mb: 2 }}>Ready to transform your hiring?</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5, fontSize: '1.1rem' }}>
            Join hundreds of companies using AI to hire faster, fairer, and smarter.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={Link} to="/register?role=recruiter" variant="contained" size="large"
              sx={{ borderRadius: 3, px: 5, py: 1.75, fontSize: '1rem' }}>
              Start for Free
            </Button>
            <Button component={Link} to="/register?role=applicant" variant="outlined" size="large"
              sx={{ borderRadius: 3, px: 5, py: 1.75, fontSize: '1rem' }}>
              Find a Job
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
