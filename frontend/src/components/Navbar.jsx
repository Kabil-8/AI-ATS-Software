import React, { useState } from 'react';
import {
  AppBar, Toolbar, Box, Button, IconButton, Avatar, Badge, Menu, MenuItem,
  Tooltip, Typography, Divider, useTheme, alpha, Chip,
} from '@mui/material';
import {
  Psychology, NotificationsNone, DarkMode, LightMode,
  Person, Logout, Dashboard, Work, BarChart, KeyboardArrowDown,
  Add,
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ mode, onToggleTheme }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isRecruiter } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const isDark = mode === 'dark';

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
      <Toolbar sx={{ gap: 1, px: { xs: 2, md: 4 }, minHeight: '60px !important' }}>

        {/* Logo */}
        <Box
          component={Link}
          to={user ? (isRecruiter ? '/recruiter' : '/dashboard') : '/'}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', mr: { md: 5 } }}
        >
          <Box sx={{
            width: 34, height: 34, borderRadius: '10px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.5)}`,
            transition: 'box-shadow 0.2s ease',
            '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.65)}` },
          }}>
            <Psychology sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Typography variant="h5" sx={{
            color: 'text.primary',
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            fontSize: '1.15rem',
          }}>
            ATS<span style={{ color: theme.palette.primary.main }}>Pro</span>
          </Typography>
        </Box>

        {/* Nav Links */}
        {user && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.25, flex: 1 }}>
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
                    backgroundColor: active ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08) : 'transparent',
                    borderRadius: 2.5,
                    px: 2, py: 0.875,
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.06),
                      color: 'primary.main',
                    },
                    ...(active && {
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '50%',
                        height: 2,
                        borderRadius: 99,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      },
                    }),
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>

          {/* Post job shortcut for recruiters */}
          {isRecruiter && (
            <Button
              component={Link}
              to="/jobs/new"
              variant="contained"
              size="small"
              startIcon={<Add />}
              sx={{
                borderRadius: 2.5, px: 2, py: 0.75,
                fontSize: '0.82rem',
                display: { xs: 'none', sm: 'flex' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.35)}`,
                '&:hover': { boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.5)}` },
              }}
            >
              Post Job
            </Button>
          )}

          {/* Jobs link for public */}
          {!user && (
            <Button component={Link} to="/jobs"
              sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
              Browse Jobs
            </Button>
          )}

          {/* Theme toggle */}
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`} arrow>
            <IconButton
              onClick={onToggleTheme}
              size="small"
              sx={{
                width: 36, height: 36,
                border: `1px solid ${alpha(theme.palette.divider, 1.5)}`,
                borderRadius: '10px',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  transform: 'rotate(12deg)',
                },
              }}
            >
              {mode === 'dark'
                ? <LightMode sx={{ fontSize: 17 }} />
                : <DarkMode sx={{ fontSize: 17 }} />}
            </IconButton>
          </Tooltip>

          {user ? (
            <>
              {/* Notifications */}
              <Tooltip title="Notifications" arrow>
                <IconButton
                  size="small"
                  sx={{
                    width: 36, height: 36,
                    border: `1px solid ${alpha(theme.palette.divider, 1.5)}`,
                    borderRadius: '10px',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.06) },
                  }}
                >
                  <Badge
                    badgeContent={3}
                    color="primary"
                    sx={{ '& .MuiBadge-badge': { fontSize: '9px', height: 15, minWidth: 15, padding: 0 } }}
                  >
                    <NotificationsNone sx={{ fontSize: 17 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Profile menu trigger */}
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
                  border: `1px solid ${alpha(theme.palette.divider, 1.5)}`,
                  borderRadius: '10px', px: 1.25, py: 0.625,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <Avatar sx={{
                  width: 26, height: 26,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  fontSize: '0.65rem', fontWeight: 700,
                }}>
                  {initials}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
                    {user.name?.split(' ')[0]}
                  </Typography>
                  <Typography variant="caption" sx={{
                    fontSize: '0.62rem', color: 'primary.main', fontWeight: 500, lineHeight: 1,
                    textTransform: 'capitalize',
                  }}>
                    {user.role}
                  </Typography>
                </Box>
                <KeyboardArrowDown sx={{ fontSize: 15, color: 'text.disabled', ml: 0.25 }} />
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1, minWidth: 210, borderRadius: 2.5,
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(123,111,255,0.1)'
                      : '0 8px 32px rgba(11,13,21,0.15)',
                  },
                }}
              >
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Typography variant="body2" fontWeight={700}>{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => { setAnchorEl(null); navigate('/profile'); }}
                  sx={{ gap: 1.5, py: 1.25, mx: 1, my: 0.5, borderRadius: 1.5, fontSize: '0.875rem' }}
                >
                  <Person fontSize="small" /> Profile Settings
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={handleLogout}
                  sx={{ gap: 1.5, py: 1.25, mx: 1, my: 0.5, borderRadius: 1.5, color: 'error.main', fontSize: '0.875rem' }}
                >
                  <Logout fontSize="small" /> Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/login" variant="outlined"
                sx={{ borderRadius: 2.5, py: 0.75, px: 2, fontSize: '0.875rem' }}>
                Log in
              </Button>
              <Button component={Link} to="/register" variant="contained"
                sx={{
                  borderRadius: 2.5, py: 0.75, px: 2, fontSize: '0.875rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                }}>
                Get Started
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
