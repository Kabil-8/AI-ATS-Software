import React, { useState } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Avatar, Switch, Card, CardContent
} from '@mui/material';
import { Security, Business, Storage, Analytics, LocalActivity } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState([
    { id: '1', name: 'Acme Corp', industry: 'Technology', plan: 'Enterprise', recruiters: 12, suspended: false },
    { id: '2', name: 'Stark Industries', industry: 'Robotics', plan: 'Professional', recruiters: 8, suspended: false },
    { id: '3', name: 'Wayne Tech', industry: 'Finance', plan: 'Starter', recruiters: 3, suspended: true }
  ]);

  const [auditLogs] = useState([
    { id: 'l1', user: 'Admin User', action: 'SUSPEND', entity: 'Company', details: 'Suspended Wayne Tech due to non-payment', date: '2026-07-27 18:30' },
    { id: 'l2', user: 'Sarah Jenkins', action: 'CREATE', entity: 'Job', details: 'Created Senior React Developer job posting', date: '2026-07-27 17:15' },
    { id: 'l3', user: 'System AI', action: 'AI_RANK', entity: 'Application', details: 'Ranked 45 candidates with 88% precision', date: '2026-07-27 16:00' }
  ]);

  const toggleSuspension = (id) => {
    setCompanies(companies.map((c) => {
      if (c.id === id) {
        const nextState = !c.suspended;
        toast.success(`Company ${c.name} ${nextState ? 'suspended' : 'reinstated'}`);
        return { ...c, suspended: nextState };
      }
      return c;
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontSize: '2.2rem', fontWeight: 800 }}>Super Admin Portal</Typography>
        <Typography variant="body2" color="text.secondary">Global multi-tenant system oversight, security audit logs, and subscription management</Typography>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}><Business /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Companies</Typography>
                <Typography variant="h4" fontWeight={700}>48</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 52, height: 52 }}><Storage /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Active Applications</Typography>
                <Typography variant="h4" fontWeight={700}>14,280</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 52, height: 52 }}><Analytics /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">AI Analyses Executed</Typography>
                <Typography variant="h4" fontWeight={700}>98.4K</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', width: 52, height: 52 }}><Security /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">System Status</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">100% Healthy</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Companies Management */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight={700}>Registered Organizations</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Recruiters</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{comp.name}</TableCell>
                  <TableCell>{comp.industry}</TableCell>
                  <TableCell><Chip label={comp.plan} color="primary" size="small" /></TableCell>
                  <TableCell>{comp.recruiters}</TableCell>
                  <TableCell>
                    <Chip label={comp.suspended ? 'Suspended' : 'Active'} color={comp.suspended ? 'error' : 'success'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={!comp.suspended} onChange={() => toggleSuspension(comp.id)} color="primary" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* System Audit Logs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalActivity color="primary" />
          <Typography variant="h5" fontWeight={700}>Security Audit Trail</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.date}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{log.user}</TableCell>
                  <TableCell><Chip label={log.action} color="secondary" size="small" /></TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
