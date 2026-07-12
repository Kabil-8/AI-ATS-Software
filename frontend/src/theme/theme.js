import { createTheme, alpha } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#5B4FCF', light: '#7B6FFF', dark: '#3D33A8', contrastText: '#fff' },
          secondary: { main: '#7B6FFF', light: '#A89EFF', dark: '#5B4FCF' },
          background: { default: '#F6F8FC', paper: '#FFFFFF' },
          text: { primary: '#0B0D15', secondary: '#3E4150', disabled: '#6B6F80' },
          divider: '#E2E6EE',
          success: { main: '#22C55E', light: '#86EFAC', dark: '#15803D' },
          warning: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
          error: { main: '#EF4444', light: '#FCA5A5', dark: '#DC2626' },
          info: { main: '#3B82F6', light: '#93C5FD', dark: '#1D4ED8' },
        }
      : {
          primary: { main: '#7B6FFF', light: '#A89EFF', dark: '#5B4FCF', contrastText: '#fff' },
          secondary: { main: '#5B4FCF', light: '#7B6FFF', dark: '#3D33A8' },
          background: { default: '#0B0D15', paper: '#141724' },
          text: { primary: '#EDF0F7', secondary: '#B0B8D0', disabled: '#7A83A0' },
          divider: '#282E44',
          success: { main: '#34D399', light: '#6EE7B7', dark: '#059669' },
          warning: { main: '#FCD34D', light: '#FDE68A', dark: '#F59E0B' },
          error: { main: '#F87171', light: '#FCA5A5', dark: '#EF4444' },
          info: { main: '#60A5FA', light: '#93C5FD', dark: '#3B82F6' },
        }),
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2 },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.3 },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '1.375rem', lineHeight: 1.4 },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '1rem' },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '0.875rem' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4 },
    button: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 4px rgba(11,13,21,0.06)',
    '0 2px 8px rgba(11,13,21,0.08)',
    '0 4px 16px rgba(11,13,21,0.10)',
    '0 8px 24px rgba(11,13,21,0.12)',
    '0 12px 32px rgba(11,13,21,0.14)',
    '0 16px 40px rgba(11,13,21,0.16)',
    '0 20px 48px rgba(11,13,21,0.18)',
    '0 24px 56px rgba(11,13,21,0.20)',
    ...Array(16).fill('0 24px 56px rgba(11,13,21,0.20)'),
  ],
});

export const createAppTheme = (mode) => {
  const tokens = getDesignTokens(mode);
  return createTheme({
    ...tokens,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.4s ease, color 0.4s ease',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 16,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'dark'
                ? `0 0 0 1px ${alpha('#7B6FFF', 0.3)}, 0 8px 32px rgba(123,111,255,0.15)`
                : '0 8px 32px rgba(91,79,207,0.12)',
              borderColor: alpha(mode === 'dark' ? '#7B6FFF' : '#5B4FCF', 0.3),
            },
          }),
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 600,
            padding: '10px 24px',
            transition: 'all 0.2s ease',
            '&:hover': { transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0)' },
          },
          containedPrimary: ({ theme }) => ({
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            '&:hover': {
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }),
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'box-shadow 0.2s ease',
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
              },
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 500, fontSize: '0.8rem' },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: mode === 'dark' ? alpha('#141724', 0.95) : alpha('#FFFFFF', 0.95),
            backdropFilter: 'blur(12px)',
          }),
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
            transition: 'background-color 0.15s ease',
          }),
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 99, height: 8 },
          bar: { borderRadius: 99, transition: 'transform 1s ease' },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: mode === 'dark' ? '#1C2030' : '#E8ECF4',
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.08)}, transparent)`,
            },
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            backgroundColor: mode === 'dark' ? '#1C2030' : '#0B0D15',
            color: mode === 'dark' ? '#EDF0F7' : '#fff',
            fontSize: '0.75rem',
            borderRadius: 8,
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
    },
  });
};
