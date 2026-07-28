import React, { useState } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Button, Chip, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Rating, Card, CardContent
} from '@mui/material';
import { Event, VideoCall, Person, AccessTime, Add, Star, CheckCircle } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function InterviewCalendar() {
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [scheduleData, setScheduleData] = useState({
    candidateName: '',
    round: 'Technical Round 1',
    scheduledDate: '',
    durationMinutes: 45,
    platform: 'Google Meet',
  });

  const [feedbackData, setFeedbackData] = useState({
    rating: 4,
    technicalSkill: 4,
    communication: 5,
    problemSolving: 4,
    cultureFit: 4,
    comments: '',
    recommendation: 'Hire',
  });

  const [interviews, setInterviews] = useState([
    {
      id: 'i1',
      candidateName: 'Alex Mercer',
      candidateEmail: 'alex.mercer@gmail.com',
      jobTitle: 'Senior Full Stack Engineer',
      round: 'Technical Round 1',
      date: '2026-07-28 14:00',
      duration: '45 mins',
      platform: 'Google Meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      status: 'scheduled',
    },
    {
      id: 'i2',
      candidateName: 'Sophia Vance',
      candidateEmail: 'sophia.v@gmail.com',
      jobTitle: 'Lead AI Engineer',
      round: 'System Design',
      date: '2026-07-28 16:30',
      duration: '60 mins',
      platform: 'Zoom',
      meetingLink: 'https://zoom.us/j/9876543210',
      status: 'scheduled',
    },
    {
      id: 'i3',
      candidateName: 'Marcus Wright',
      candidateEmail: 'marcus.w@gmail.com',
      jobTitle: 'Product Designer',
      round: 'HR Round',
      date: '2026-07-27 11:00',
      duration: '30 mins',
      platform: 'Microsoft Teams',
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/1234',
      status: 'completed',
    },
  ]);

  const handleScheduleSubmit = () => {
    if (!scheduleData.candidateName || !scheduleData.scheduledDate) {
      toast.error('Please fill in candidate name and scheduled date');
      return;
    }

    const roomCode = Math.random().toString(36).substring(2, 9);
    const newInterview = {
      id: Date.now().toString(),
      candidateName: scheduleData.candidateName,
      candidateEmail: `${scheduleData.candidateName.toLowerCase().replace(' ', '.')}@gmail.com`,
      jobTitle: 'Senior Developer',
      round: scheduleData.round,
      date: scheduleData.scheduledDate.replace('T', ' '),
      duration: `${scheduleData.durationMinutes} mins`,
      platform: scheduleData.platform,
      meetingLink: `https://meet.google.com/${roomCode}`,
      status: 'scheduled',
    };

    setInterviews([newInterview, ...interviews]);
    setOpenScheduleModal(false);
    toast.success('Interview scheduled and email invitation sent!');
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackData.comments) {
      toast.error('Please provide interview comments');
      return;
    }

    setInterviews(
      interviews.map((item) =>
        item.id === selectedInterview?.id ? { ...item, status: 'completed' } : item
      )
    );
    setOpenFeedbackModal(false);
    toast.success('Interview feedback and rating submitted successfully!');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '2.2rem', fontWeight: 800 }}>Interview Management & Calendar</Typography>
          <Typography variant="body2" color="text.secondary">Schedule video rounds, generate links, and submit candidate feedback</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenScheduleModal(true)}>
          Schedule Interview
        </Button>
      </Box>

      {/* Grid of Interviews */}
      <Grid container spacing={3}>
        {interviews.map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>{item.candidateName[0]}</Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>{item.candidateName}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.jobTitle}</Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={item.status === 'completed' ? 'Completed' : 'Scheduled'}
                    color={item.status === 'completed' ? 'success' : 'primary'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Event fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight={600}>{item.date}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2">{item.duration} ({item.round})</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideoCall fontSize="small" color="primary" />
                    <Typography variant="body2" color="primary.main" fontWeight={600}>{item.platform}</Typography>
                  </Box>
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  component="a"
                  href={item.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  startIcon={<VideoCall />}
                  size="small"
                >
                  Join Meeting
                </Button>
                {item.status === 'scheduled' && (
                  <Button
                    variant="contained"
                    fullWidth
                    color="secondary"
                    startIcon={<Star />}
                    size="small"
                    onClick={() => {
                      setSelectedInterview(item);
                      setOpenFeedbackModal(true);
                    }}
                  >
                    Feedback
                  </Button>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Schedule Modal */}
      <Dialog open={openScheduleModal} onClose={() => setOpenScheduleModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule New Interview</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Candidate Name"
              fullWidth
              value={scheduleData.candidateName}
              onChange={(e) => setScheduleData({ ...scheduleData, candidateName: e.target.value })}
            />
            <TextField
              select
              label="Interview Round"
              fullWidth
              value={scheduleData.round}
              onChange={(e) => setScheduleData({ ...scheduleData, round: e.target.value })}
            >
              <MenuItem value="Screening">Screening</MenuItem>
              <MenuItem value="Technical Round 1">Technical Round 1</MenuItem>
              <MenuItem value="Technical Round 2">Technical Round 2</MenuItem>
              <MenuItem value="System Design">System Design</MenuItem>
              <MenuItem value="HR Round">HR Round</MenuItem>
            </TextField>
            <TextField
              type="datetime-local"
              label="Scheduled Date & Time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={scheduleData.scheduledDate}
              onChange={(e) => setScheduleData({ ...scheduleData, scheduledDate: e.target.value })}
            />
            <TextField
              select
              label="Video Platform"
              fullWidth
              value={scheduleData.platform}
              onChange={(e) => setScheduleData({ ...scheduleData, platform: e.target.value })}
            >
              <MenuItem value="Google Meet">Google Meet</MenuItem>
              <MenuItem value="Zoom">Zoom</MenuItem>
              <MenuItem value="Microsoft Teams">Microsoft Teams</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScheduleModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleScheduleSubmit}>Confirm & Send Invite</Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={openFeedbackModal} onClose={() => setOpenFeedbackModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Submit Interview Evaluation ({selectedInterview?.candidateName})</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Overall Rating</Typography>
              <Rating
                value={feedbackData.rating}
                onChange={(e, val) => setFeedbackData({ ...feedbackData, rating: val })}
                precision={0.5}
              />
            </Box>
            <TextField
              select
              label="Hiring Recommendation"
              fullWidth
              value={feedbackData.recommendation}
              onChange={(e) => setFeedbackData({ ...feedbackData, recommendation: e.target.value })}
            >
              <MenuItem value="Strong Hire">Strong Hire</MenuItem>
              <MenuItem value="Hire">Hire</MenuItem>
              <MenuItem value="No Hire">No Hire</MenuItem>
              <MenuItem value="Strong No Hire">Strong No Hire</MenuItem>
            </TextField>
            <TextField
              multiline
              rows={4}
              label="Detailed Comments & Code Assessment"
              fullWidth
              value={feedbackData.comments}
              onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFeedbackModal(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleFeedbackSubmit}>Submit Feedback</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
