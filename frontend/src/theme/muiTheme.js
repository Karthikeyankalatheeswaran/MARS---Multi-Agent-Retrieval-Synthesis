import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // MARS Light Mode (Clean, Paper-like)
          primary: {
            main: '#2563EB', // Cosmic Blue
            light: '#60A5FA',
            dark: '#1E40AF',
          },
          secondary: {
            main: '#7C3AED', // Nebula Purple
          },
          background: {
            default: '#F8FAFC', // Slate-50
            paper: '#FFFFFF',   // Pure White
          },
          text: {
            primary: '#0F172A', // Slate-900
            secondary: '#475569', // Slate-600
          },
          action: {
            hover: 'rgba(37, 99, 235, 0.04)',
            selected: 'rgba(37, 99, 235, 0.08)',
          },
        }
      : {
          // MARS Dark Mode (Deep Void)
          primary: {
            main: '#60A5FA', // Lighter Blue for dark mode
            light: '#93C5FD',
            dark: '#2563EB',
          },
          secondary: {
            main: '#A78BFA', // Light Purple
          },
          background: {
            default: '#0F172A', // Slate-900 (Void)
            paper: '#1E293B',   // Slate-800
          },
          text: {
            primary: '#F8FAFC', // Slate-50
            secondary: '#94A3B8', // Slate-400
          },
          action: {
            hover: 'rgba(255, 255, 255, 0.05)',
            selected: 'rgba(255, 255, 255, 0.1)',
          },
        }),
  },
  typography: {
    fontFamily: [
      '"Inter"',
      '"Roboto"',
      '"Helvetica"',
      '"Arial"',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { lineHeight: 1.7 },
  },
  shape: {
    borderRadius: 16, // Softer, modern curves
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: mode === 'light' 
            ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' // Tailwind-like soft shadow
            : '0 4px 6px -1px rgb(0 0 0 / 0.5)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));
