import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, TextField,
  Button, Avatar, Divider, Alert, Chip, InputAdornment, useTheme, alpha,
} from '@mui/material';
import {
  Person, Email, Phone, LocationOn, LinkedIn, Language,
  Business, Edit, Save, Lock, Visibility, VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const theme = useTheme();
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    linkedIn: user?.linkedIn || '',
    portfolio: user?.portfolio || '',
    company: user?.company || '',
    jobTitle: user?.jobTitle || '',
  });
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPass !== pwForm.confirm) { setPwError('New passwords do not match'); return; }
    if (pwForm.newPass.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.current, newPassword: pwForm.newPass });
      toast.success('Password changed successfully');
      setPwForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Password change failed');
    } finally {
      setPwSaving(false);
    }
  };

  const field = (label, key, icon, type = 'text', placeholder = '') => (
    <TextField
      label={label} fullWidth type={type} placeholder={placeholder}
      value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      disabled={!editMode}
      InputProps={{ startAdornment: <InputAdornment position="start">{icon}</InputAdornment> }}
      sx={{ '& .Mui-disabled': { WebkitTextFillColor: theme.palette.text.secondary } }}
    />
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography variant="h2" sx={{ mb: 5 }}>Profile Settings</Typography>

        <Grid container spacing={3}>
          {/* Avatar card */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Avatar sx={{
                  width: 80, height: 80, fontSize: '1.8rem', fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  borderRadius: 3,
                }}>
                  {initials}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" sx={{ mb: 0.5 }}>{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                  <Chip
                    label={user?.role === 'recruiter' ? `Recruiter${user.company ? ` at ${user.company}` : ''}` : 'Job Applicant'}
                    size="small"
                    sx={{ mt: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 600 }}
                  />
                </Box>
                <Button
                  variant={editMode ? 'contained' : 'outlined'}
                  startIcon={editMode ? <Save /> : <Edit />}
                  onClick={editMode ? handleSave : () => setEditMode(true)}
                  disabled={saving}
                  sx={{ borderRadius: 2 }}
                >
                  {saving ? 'Saving…' : editMode ? 'Save Changes' : 'Edit Profile'}
                </Button>
                {editMode && (
                  <Button variant="text" onClick={() => setEditMode(false)} sx={{ borderRadius: 2 }}>
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Personal Info */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>Personal Information</Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    {field('Full Name', 'name', <Person sx={{ fontSize: 18, color: 'text.disabled' }} />)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {field('Phone', 'phone', <Phone sx={{ fontSize: 18, color: 'text.disabled' }} />, 'tel', '+1 (555) 000-0000')}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {field('Location', 'location', <LocationOn sx={{ fontSize: 18, color: 'text.disabled' }} />, 'text', 'City, Country')}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {field('LinkedIn URL', 'linkedIn', <LinkedIn sx={{ fontSize: 18, color: 'text.disabled' }} />, 'url', 'https://linkedin.com/in/…')}
                  </Grid>
                  {user?.role === 'applicant' && (
                    <Grid item xs={12}>
                      {field('Portfolio / Website', 'portfolio', <Language sx={{ fontSize: 18, color: 'text.disabled' }} />, 'url', 'https://yourportfolio.com')}
                    </Grid>
                  )}
                  {user?.role === 'recruiter' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        {field('Company', 'company', <Business sx={{ fontSize: 18, color: 'text.disabled' }} />)}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {field('Job Title', 'jobTitle', <Person sx={{ fontSize: 18, color: 'text.disabled' }} />)}
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Info */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>Account</Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      label="Email Address" fullWidth value={user?.email} disabled
                      InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
                      helperText="Email address cannot be changed"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Change password */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Lock fontSize="small" color="primary" />
                  <Typography variant="h4">Change Password</Typography>
                </Box>
                {pwError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{pwError}</Alert>}
                <Box component="form" onSubmit={handlePasswordChange}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <TextField
                        label="Current Password" type={showPw ? 'text' : 'password'} fullWidth required
                        value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                          endAdornment: <InputAdornment position="end">
                            <Button size="small" onClick={() => setShowPw(v => !v)} sx={{ minWidth: 0, p: 0.5 }}>
                              {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </Button>
                          </InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="New Password" type={showPw ? 'text' : 'password'} fullWidth required
                        value={pwForm.newPass} onChange={e => setPwForm(f => ({ ...f, newPass: e.target.value }))}
                        helperText="Minimum 8 characters"
                        InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Confirm New Password" type={showPw ? 'text' : 'password'} fullWidth required
                        value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="outlined" disabled={pwSaving} sx={{ borderRadius: 2 }}>
                        {pwSaving ? 'Updating…' : 'Update Password'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
