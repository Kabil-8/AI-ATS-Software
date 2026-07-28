import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { createAppTheme } from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobBoard from './pages/JobBoard';
import JobDetail from './pages/JobDetail';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import ApplicationPipeline from './pages/ApplicationPipeline';
import CandidateRanking from './pages/CandidateRanking';
import ApplicantDashboard from './pages/ApplicantDashboard';
import ProfilePage from './pages/ProfilePage';
import CompanyDashboard from './pages/CompanyDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import InterviewCalendar from './pages/InterviewCalendar';
import ResumeUploadPage from './pages/ResumeUploadPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60000, retry: 1 } },
});

// Route guards
const RecruiterRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const allowed = ['recruiter', 'company_admin', 'super_admin', 'interviewer'];
  if (!allowed.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const ApplicantRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark');
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem('themeMode', next);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', transition: 'background-color 0.4s ease' }}>
        <Navbar mode={mode} onToggleTheme={toggleTheme} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Shared Resume Analyzer */}
          <Route path="/ats-analyzer" element={<ResumeUploadPage />} />

          {/* Recruiter / Admin Routes */}
          <Route path="/recruiter" element={<RecruiterRoute><RecruiterDashboard /></RecruiterRoute>} />
          <Route path="/jobs/new" element={<RecruiterRoute><PostJob /></RecruiterRoute>} />
          <Route path="/jobs/:id/edit" element={<RecruiterRoute><PostJob /></RecruiterRoute>} />
          <Route path="/pipeline" element={<RecruiterRoute><ApplicationPipeline /></RecruiterRoute>} />
          <Route path="/rankings" element={<RecruiterRoute><CandidateRanking /></RecruiterRoute>} />
          <Route path="/interviews" element={<RecruiterRoute><InterviewCalendar /></RecruiterRoute>} />
          <Route path="/company" element={<RecruiterRoute><CompanyDashboard /></RecruiterRoute>} />
          <Route path="/admin" element={<RecruiterRoute><SuperAdminDashboard /></RecruiterRoute>} />

          {/* Candidate Routes */}
          <Route path="/dashboard" element={<ApplicantRoute><ApplicantDashboard /></ApplicantRoute>} />

          {/* Shared Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: '"Inter", sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            background: mode === 'dark' ? '#1C2030' : '#ffffff',
            color: mode === 'dark' ? '#EDF0F7' : '#0B0D15',
            border: `1px solid ${mode === 'dark' ? '#282E44' : '#E2E6EE'}`,
            boxShadow: '0 8px 32px rgba(11,13,21,0.15)',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
