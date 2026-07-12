import React, { useState } from 'react';
import {
  AppBar, Toolbar, Box, Button, IconButton, Avatar, Badge, Menu, MenuItem,
  Tooltip, Typography, Divider, useTheme, alpha, Chip,
} from '@mui/material';
import {
  WorkOutline, NotificationsNone, DarkMode, LightMode,
  Person, Logout, Dashboard, Work, BarChart, KeyboardArrowDown,
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ mode, onToggleTheme }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isRecruiter } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  const navLinks = isRecruiter
    ? [
        { label: 'Dashboard', path: '/recruiter', icon: <Dashboard fontSize="small" /> },
        { label: 'Pipeline', path: '/pipeline', icon: <Work fontSize="small" /> },
        { label: 'Rankings', path: '/rankings', icon: <BarChart fontSize="small" /> },
      ]
    : [
        { label: 'Jobs', path: '/jobs', icon: <Work fontSize="small" /> },
        { label: 'My Applications', path: '/dashboard', icon: <Dashboard fontSize="small" /> },
      ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <AppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: 1, px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box
          component={Link} to={user ? (isRecruiter ? '/recruiter' : '/dashboard') : '/'}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', mr: 4 }}
        >
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
          }}>
            <WorkOutline sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography variant="h5" sx={{ color: 'text.primary', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.5px' }}>
            ATS<span style={{ color: theme.palette.primary.main }}>Pro</span>
          </Typography>
        </Box>

        {/* Nav Links */}
        {user && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1 }}>
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  startIcon={link.icon}
                  sx={{
                    color: active ? 'primary.main' : 'text.secondary',
                    backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontWeight: active ? 600 : 500,
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>
        )}

        <Box sx={{ flex: user ? 0 : 1 }} />

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Jobs link for public */}
          {!user && (
            <Button component={Link} to="/jobs" sx={{ color: 'text.secondary', fontWeight: 500 }}>Browse Jobs</Button>
          )}

          {/* Theme toggle */}
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton
              onClick={onToggleTheme}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 1,
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
          </Tooltip>

          {user ? (
            <>
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 1 }}>
                  <Badge badgeContent={3} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '10px', height: 16, minWidth: 16 } }}>
                    <NotificationsNone fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Profile menu */}
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2, px: 1.5, py: 0.75,
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                }}
              >
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.7rem', fontWeight: 700 }}>{initials}</Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
                    {user.name?.split(' ')[0]}
                  </Typography>
                  <Chip label={user.role} size="small" sx={{ height: 16, fontSize: '0.65rem', bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main' }} />
                </Box>
                <KeyboardArrowDown fontSize="small" sx={{ color: 'text.disabled' }} />
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ gap: 1.5, py: 1.25 }}>
                  <Person fontSize="small" /> Profile Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.25, color: 'error.main' }}>
                  <Logout fontSize="small" /> Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/login" variant="outlined" sx={{ borderRadius: 2 }}>Log in</Button>
              <Button component={Link} to="/register" variant="contained" sx={{ borderRadius: 2 }}>Get Started</Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
