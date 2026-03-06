import { createTheme, type PaletteMode } from '@mui/material/styles'

export function getAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    spacing: 8,
    palette: {
      mode,
      primary: {
        main: isDark ? 'hsl(0, 78%, 58%)' : 'hsl(0, 100%, 43%)',
      },
      secondary: {
        main: isDark ? '#ffffff' : '#000000',
      },
      text: {
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? '#d4d4d4' : '#525252',
      },
      divider: isDark ? '#ffffff' : '#000000',
      background: {
        default: isDark ? '#000000' : '#ffffff',
        paper: isDark ? '#131313' : '#ffffff',
      },
    },
    shape: {
      borderRadius: 0,
    },
    typography: {
      fontFamily: 'Inter, Helvetica Neue, Helvetica, Arial, sans-serif',
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
            borderBottom: `1px solid ${isDark ? '#ffffff' : '#000000'}`,
            backgroundImage: 'none',
            boxShadow: `3px 3px 0px 0px ${isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'}`,
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
          root: {
            borderColor: isDark ? '#ffffff' : '#000000',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            boxShadow: `3px 3px 0px 0px ${isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `4px 4px 0px 0px ${isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'}`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 0,
            border: `1px solid ${isDark ? '#ffffff' : '#000000'}`,
            paddingInline: 14,
            transition: 'transform 120ms ease, box-shadow 180ms ease, background-color 160ms ease, border-color 160ms ease',
            boxShadow: `3px 3px 0px 0px ${isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'}`,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `4px 4px 0px 0px ${isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'}`,
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: `2px 2px 0px 0px ${isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'}`,
            },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
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
}
