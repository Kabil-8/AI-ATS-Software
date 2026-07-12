import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, Chip, Skeleton, useTheme, alpha, Alert } from '@mui/material';
import { Psychology, Refresh } from '@mui/icons-material';
import { useMyJobs } from '../hooks/useJobs';
import { useJobApplications, useAnalyzeBatch } from '../hooks/useApplications';
import KanbanBoard from '../components/KanbanBoard';
import toast from 'react-hot-toast';

export default function ApplicationPipeline() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data: jobsData } = useMyJobs({ status: 'active', limit: 50 });
  const jobs = jobsData?.data || [];

  const [selectedJobId, setSelectedJobId] = useState('');
  const { data: applications, isLoading, refetch } = useJobApplications(selectedJobId);
  const { mutateAsync: analyzeBatch, isPending: analyzing } = useAnalyzeBatch();

  React.useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) setSelectedJobId(jobs[0]._id);
  }, [jobs]);

  const handleAnalyzeBatch = async () => {
    try {
      const result = await analyzeBatch(selectedJobId);
      toast.success(result.data.message);
      setTimeout(refetch, 8000);
    } catch { toast.error('Batch analysis failed'); }
  };

  const analyzed = (applications || []).filter(a => a.aiAnalysis?.isAnalyzed).length;
  const total = (applications || []).length;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="xl" sx={{ py: 5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ mb: 0.5 }}>Application Pipeline</Typography>
            <Typography variant="body2" color="text.secondary">Drag and drop candidates through your hiring stages</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {selectedJobId && total > 0 && analyzed < total && (
              <Button
                variant="outlined" startIcon={<Psychology />}
                onClick={handleAnalyzeBatch} disabled={analyzing}
                sx={{ borderRadius: 2 }}
              >
                {analyzing ? 'Analyzing…' : `AI Analyze All (${total - analyzed} pending)`}
              </Button>
            )}
            <Button variant="outlined" startIcon={<Refresh />} onClick={refetch} sx={{ borderRadius: 2 }}>Refresh</Button>
          </Box>
        </Box>

        {/* Job selector */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Select Job Position</InputLabel>
              <Select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                label="Select Job Position"
                sx={{ borderRadius: 2 }}
              >
                {jobs.map(j => (
                  <MenuItem key={j._id} value={j._id}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{j.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{j.department}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedJobId && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">{total}</Typography>
                  <Typography variant="caption" color="text.secondary">Total</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">{analyzed}</Typography>
                  <Typography variant="caption" color="text.secondary">AI Analyzed</Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Kanban */}
        {!selectedJobId ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h4" color="text.secondary" sx={{ mb: 1 }}>Select a job position above</Typography>
            <Typography variant="body2" color="text.disabled">to view and manage its application pipeline</Typography>
          </Box>
        ) : isLoading ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ flex: '0 0 240px' }}>
                <Skeleton variant="rounded" height={48} sx={{ mb: 2, borderRadius: 2 }} />
                {Array.from({ length: 3 }).map((__, j) => (
                  <Skeleton key={j} variant="rounded" height={110} sx={{ mb: 1.5, borderRadius: 2 }} />
                ))}
              </Box>
            ))}
          </Box>
        ) : (
          <KanbanBoard applications={applications || []} jobId={selectedJobId} onRefetch={refetch} />
        )}
      </Container>
    </Box>
  );
}
