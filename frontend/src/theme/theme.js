import { createTheme, alpha } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#5B4FCF', light: '#7B6FFF', dark: '#3D33A8', contrastText: '#fff' },
          secondary: { main: '#7B6FFF', light: '#A89EFF', dark: '#5B4FCF' },
          background: { default: '#F0F2FC', paper: '#FFFFFF' },
          text: { primary: '#0D0F1C', secondary: '#3E4260', disabled: '#6B6F85' },
          divider: '#E2E6F0',
          success: { main: '#22C55E', light: '#86EFAC', dark: '#15803D' },
          warning: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
          error: { main: '#EF4444', light: '#FCA5A5', dark: '#DC2626' },
          info: { main: '#3B82F6', light: '#93C5FD', dark: '#1D4ED8' },
        }
      : {
          primary: { main: '#7B6FFF', light: '#A89EFF', dark: '#5B4FCF', contrastText: '#fff' },
          secondary: { main: '#5B4FCF', light: '#7B6FFF', dark: '#3D33A8' },
          background: { default: '#080A12', paper: '#0F1120' },
          text: { primary: '#E8ECF6', secondary: '#A8B2CC', disabled: '#6A738C' },
          divider: '#1E2338',
          success: { main: '#34D399', light: '#6EE7B7', dark: '#059669' },
          warning: { main: '#FCD34D', light: '#FDE68A', dark: '#F59E0B' },
          error: { main: '#F87171', light: '#FCA5A5', dark: '#EF4444' },
          info: { main: '#60A5FA', light: '#93C5FD', dark: '#3B82F6' },
        }),
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.15, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.25, letterSpacing: '-0.015em' },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '1.375rem', lineHeight: 1.35, letterSpacing: '-0.01em' },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '1rem' },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '0.875rem' },
    body1: { fontSize: '1rem', lineHeight: 1.65 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', lineHeight: 1.45 },
    button: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 14 },
  shadows: [
    'none',
    '0 1px 3px rgba(11,13,21,0.07), 0 1px 2px rgba(11,13,21,0.04)',
    '0 2px 6px rgba(11,13,21,0.08), 0 1px 3px rgba(11,13,21,0.04)',
    '0 4px 12px rgba(11,13,21,0.10), 0 2px 4px rgba(11,13,21,0.05)',
    '0 8px 24px rgba(11,13,21,0.12), 0 4px 8px rgba(11,13,21,0.06)',
    '0 12px 32px rgba(11,13,21,0.14), 0 6px 12px rgba(11,13,21,0.07)',
    '0 16px 40px rgba(11,13,21,0.16), 0 8px 16px rgba(11,13,21,0.08)',
    '0 20px 48px rgba(11,13,21,0.18)',
    '0 24px 56px rgba(11,13,21,0.20)',
    ...Array(16).fill('0 24px 56px rgba(11,13,21,0.22)'),
  ],
});

export const createAppTheme = (mode) => {
  const tokens = getDesignTokens(mode);
  const isDark = mode === 'dark';

  return createTheme({
    ...tokens,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*, *::before, *::after': { boxSizing: 'border-box' },
          html: { scrollBehavior: 'smooth' },
          body: {
            transition: 'background-color 0.4s ease, color 0.4s ease',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          // Fix browser autofill teal colour
          'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
            WebkitBoxShadow: isDark
              ? '0 0 0 100px #131629 inset !important'
              : '0 0 0 100px #F4F5FF inset !important',
            WebkitTextFillColor: isDark ? '#E8ECF6 !important' : '#0D0F1C !important',
            caretColor: isDark ? '#E8ECF6' : '#0D0F1C',
            borderRadius: 'inherit',
          },
          '::-webkit-scrollbar': { width: 6, height: 6 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: isDark ? '#2A3050' : '#CBD2E0',
            borderRadius: 99,
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: isDark ? '#7B6FFF' : '#5B4FCF',
          },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 18,
            background: isDark
              ? `linear-gradient(135deg, ${alpha('#141828', 0.95)}, ${alpha('#0F1120', 0.98)})`
              : '#FFFFFF',
            backdropFilter: isDark ? 'blur(20px)' : 'none',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: isDark
                ? `0 0 0 1px ${alpha('#7B6FFF', 0.25)}, 0 12px 40px rgba(123,111,255,0.18)`
                : '0 12px 40px rgba(91,79,207,0.14)',
              borderColor: alpha(isDark ? '#7B6FFF' : '#5B4FCF', 0.3),
            },
          }),
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
            padding: '10px 24px',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': { transform: 'translateY(-2px)' },
            '&:active': { transform: 'translateY(0)', transition: 'all 0.08s ease' },
          },
          containedPrimary: ({ theme }) => ({
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
            backgroundSize: '200% 200%',
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              backgroundPosition: 'right center',
              boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.45)}`,
            },
          }),
          outlined: ({ theme }) => ({
            borderColor: alpha(theme.palette.primary.main, isDark ? 0.5 : 0.3),
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
            },
          }),
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              background: isDark ? alpha('#1A1F35', 0.6) : alpha('#F8F9FF', 0.8),
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              '& fieldset': {
                borderColor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.15),
                transition: 'border-color 0.2s ease',
              },
              '&:hover fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.4),
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 1.5,
              },
            },
          }),
        },
      },

      MuiSelect: {
        styleOverrides: {
          outlined: {
            borderRadius: 12,
          },
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
            background: isDark ? alpha('#0F1120', 0.98) : '#FFFFFF',
          }),
        },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            backgroundColor: isDark ? alpha('#080A12', 0.85) : alpha('#FFFFFF', 0.88),
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
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

      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 99, height: 6 },
          bar: { borderRadius: 99, transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)' },
        },
      },

      MuiSkeleton: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: isDark ? alpha('#1E2338', 0.8) : '#EEF0F8',
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.06)}, transparent)`,
            },
          }),
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            backgroundColor: isDark ? '#1C2238' : '#0D0F1C',
            color: isDark ? '#E8ECF6' : '#fff',
            fontSize: '0.75rem',
            borderRadius: 8,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(8px)',
            padding: '6px 12px',
          }),
          arrow: {
            color: isDark ? '#1C2238' : '#0D0F1C',
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },

      MuiInputAdornment: {
        styleOverrides: {
          root: {
            '& .MuiSvgIcon-root': {
              opacity: 0.5,
            },
          },
        },
      },

      MuiStepper: {
        styleOverrides: {
          root: {
            background: 'transparent',
          },
        },
      },

      MuiStepConnector: {
        styleOverrides: {
          line: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(123,111,255,0.1)'
              : '0 8px 32px rgba(11,13,21,0.15)',
          },
        },
      },
    },
  });
};
