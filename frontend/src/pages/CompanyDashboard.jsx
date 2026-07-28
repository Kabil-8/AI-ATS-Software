import React, { useState } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Card, CardContent
} from '@mui/material';
import { Add, Business, People, Shield, AccountTree, FlashOn } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function CompanyDashboard() {
  const [openDeptModal, setOpenDeptModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [departments, setDepartments] = useState(['Engineering', 'Product', 'Design', 'Sales', 'HR', 'Marketing']);

  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Sarah Jenkins', email: 'sarah@acme.com', role: 'recruiter', dept: 'Engineering', active: true },
    { id: '2', name: 'David Chen', email: 'david@acme.com', role: 'interviewer', dept: 'Product', active: true },
    { id: '3', name: 'Elena Rostova', email: 'elena@acme.com', role: 'company_admin', dept: 'Executive', active: true }
  ]);

  const handleAddDept = () => {
    if (!newDepartment.trim()) return;
    setDepartments([...departments, newDepartment.trim()]);
    setNewDepartment('');
    setOpenDeptModal(false);
    toast.success('Department added successfully!');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 800 }}>Company Management</Typography>
          <Typography variant="body2" color="text.secondary">Configure organization departments, recruiters, and subscription settings</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDeptModal(true)}>
          Add Department
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}><Business /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Organization</Typography>
                <Typography variant="h4" fontWeight={700}>Acme Corp</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 52, height: 52 }}><People /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Hiring Team</Typography>
                <Typography variant="h4" fontWeight={700}>{teamMembers.length} Members</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 52, height: 52 }}><AccountTree /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Departments</Typography>
                <Typography variant="h4" fontWeight={700}>{departments.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 52, height: 52 }}><FlashOn /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">AI Credits</Typography>
                <Typography variant="h4" fontWeight={700}>8,450 / 10K</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Departments Chips */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Active Departments</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {departments.map((dept, idx) => (
            <Chip key={idx} label={dept} color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.9rem', py: 2 }} />
          ))}
        </Box>
      </Paper>

      {/* Hiring Team Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight={700}>Hiring Team & Recruiters</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell><Chip label={member.role.replace('_', ' ')} size="small" color="secondary" /></TableCell>
                  <TableCell>{member.dept}</TableCell>
                  <TableCell><Chip label={member.active ? 'Active' : 'Inactive'} size="small" color="success" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Dept Dialog */}
      <Dialog open={openDeptModal} onClose={() => setOpenDeptModal(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add New Department</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Department Name"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeptModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddDept}>Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
