import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  spacing: 8,
  palette: {
    mode: 'light',
    primary: {
      main: '#0e7490',
      dark: '#155e75',
      light: '#67e8f9',
    },
    secondary: {
      main: '#0f172a',
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
    },
    divider: '#e2e8f0',
    background: {
      default: '#f4f8fc',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Roboto, Manrope, Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: -0.3 },
    h5: { fontWeight: 800, letterSpacing: -0.2 },
    h6: { fontWeight: 700, letterSpacing: -0.1 },
    subtitle1: { fontWeight: 600 },
    overline: { fontWeight: 700, letterSpacing: 0.8 },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e2e8f0',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: '#e2e8f0',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[3],
            borderColor: theme.palette.primary.light,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          paddingInline: 14,
          transition: 'transform 120ms ease, box-shadow 180ms ease, background-color 160ms ease, border-color 160ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: theme.shadows[2],
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.light}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease',
        },
      },
    },
  },
})
