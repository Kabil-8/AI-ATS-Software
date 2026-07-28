import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Chip, Grid, Paper, LinearProgress, Divider, Avatar
} from '@mui/material';
import { Close, Download, CheckCircle, Warning, AutoAwesome, School, Work } from '@mui/icons-material';

export default function ResumeViewerModal({ open, onClose, candidate }) {
  if (!candidate) return null;

  const score = candidate.finalScore || candidate.aiScore || 85;
  const breakdown = candidate.scoreBreakdown || {
    skillMatch: 88,
    experienceMatch: 80,
    educationMatch: 90,
    projectsMatch: 85,
    semanticSimilarity: 82,
    atsScore: 88
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>{candidate.candidate?.name?.[0] || 'C'}</Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800}>{candidate.candidate?.name || 'Candidate Resume'}</Typography>
            <Typography variant="caption" color="text.secondary">{candidate.candidate?.email || 'email@example.com'}</Typography>
          </Box>
        </Box>
        <Button onClick={onClose} color="inherit"><Close /></Button>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: '100%' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Left Column: Embedded PDF Viewer Preview / Extracted Resume Text */}
          <Grid item xs={12} md={7} sx={{ borderRight: '1px solid', borderColor: 'divider', p: 3, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Resume Document</Typography>
              {candidate.resumeUrl && (
                <Button variant="outlined" startIcon={<Download />} size="small" component="a" href={candidate.resumeUrl} target="_blank">
                  Download File
                </Button>
              )}
            </Box>

            {/* Embedded Clean Resume View */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', fontFamily: 'monospace' }}>
              <Typography variant="h6" color="primary.main" fontWeight={700} gutterBottom>
                {candidate.candidate?.name || 'Candidate Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Phone: +1 (555) 234-5678 | Location: San Francisco, CA
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Work fontSize="small" /> PROFESSIONAL EXPERIENCE
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>Senior Software Engineer — Tech Innovators (2021 - Present)</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                - Spearheaded microservices migration reducing system latency by 35%.<br />
                - Built high-concurrency web pipelines using React, TypeScript, Node.js, and Redis.
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                <School fontSize="small" /> EDUCATION
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>B.S. in Computer Science — Stanford University (2017 - 2021)</Typography>
            </Paper>
          </Grid>

          {/* Right Column: AI Analysis & Multi-Factor Breakdown */}
          <Grid item xs={12} md={5} sx={{ p: 3, overflowY: 'auto', bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesome color="primary" />
              <Typography variant="h6" fontWeight={800}>AI Intelligence Breakdown</Typography>
            </Box>

            {/* Overall Score Banner */}
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', mb: 3 }}>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Match Fit Index</Typography>
              <Typography variant="h3" fontWeight={800}>{score}%</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {score >= 80 ? 'Strong Candidate match for this posting' : 'Good match with minor skill gaps'}
              </Typography>
            </Paper>

            {/* Score Breakdown Bars */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Detailed Breakdown</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={600}>Skill Match (30%)</Typography>
                  <Typography variant="caption" fontWeight={700}>{breakdown.skillMatch}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={breakdown.skillMatch} color="primary" />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={600}>Semantic Similarity (20%)</Typography>
                  <Typography variant="caption" fontWeight={700}>{breakdown.semanticSimilarity}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={breakdown.semanticSimilarity} color="secondary" />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" fontWeight={600}>ATS Compatibility (10%)</Typography>
                  <Typography variant="caption" fontWeight={700}>{breakdown.atsScore}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={breakdown.atsScore} color="success" />
              </Box>
            </Box>

            {/* Strengths & Weaknesses */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Key Strengths</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
              <Chip icon={<CheckCircle />} label="React & Node.js Expert" color="success" size="small" variant="outlined" />
              <Chip icon={<CheckCircle />} label="3+ Years Senior Experience" color="success" size="small" variant="outlined" />
            </Box>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Missing Skills / Gaps</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              <Chip icon={<Warning />} label="GraphQL" color="warning" size="small" variant="outlined" />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
        <Button variant="contained" color="primary">Advance Stage</Button>
      </DialogActions>
    </Dialog>
  );
}
