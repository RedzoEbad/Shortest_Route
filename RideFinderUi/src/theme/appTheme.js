import { createTheme } from '@mui/material/styles';

const shared = {
  primary: '#276EF1',
  primaryDark: '#1d4ed8',
  primaryLight: '#dbeafe',
  success: '#059669',
  danger: '#dc2626',
};

export const lightColors = {
  ...shared,
  slate900: '#0f172a',
  slate700: '#334155',
  slate500: '#64748b',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceMuted: '#fafafa',
  border: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  iconMuted: '#94a3b8',
  panelBg: 'rgba(255,255,255,0.98)',
  panelShadow: '0 8px 32px rgba(15,23,42,0.08)',
  mapStyle: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
  white: '#ffffff',
};

export const darkColors = {
  ...shared,
  primaryLight: 'rgba(39,110,241,0.18)',
  slate900: '#f1f5f9',
  slate700: '#cbd5e1',
  slate500: '#94a3b8',
  slate200: '#334155',
  slate100: '#1e293b',
  bg: '#0b1220',
  surface: '#111827',
  surfaceMuted: '#1a2332',
  border: '#334155',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  iconMuted: '#64748b',
  panelBg: 'rgba(17,24,39,0.96)',
  panelShadow: '0 8px 32px rgba(0,0,0,0.45)',
  mapStyle: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
  white: '#111827',
};

export const getAppColors = (mode) => (mode === 'dark' ? darkColors : lightColors);

export const getFieldSx = (mode) => {
  const c = getAppColors(mode);
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: c.surface,
      color: c.textPrimary,
      transition: 'box-shadow 0.2s, background-color 0.2s',
      '& fieldset': { borderColor: c.border },
      '&:hover fieldset': { borderColor: c.slate500 },
      '&.Mui-focused': {
        boxShadow: '0 0 0 3px rgba(39,110,241,0.15)',
        '& fieldset': { borderColor: shared.primary },
      },
    },
    '& .MuiInputLabel-root': { color: c.textSecondary },
  };
};

export const primaryButtonSx = {
  py: 1.4,
  borderRadius: 2,
  fontWeight: 700,
  textTransform: 'none',
  color: '#fff',
  background: 'linear-gradient(135deg, #276EF1, #1d4ed8)',
  boxShadow: '0 8px 24px rgba(39,110,241,0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
    boxShadow: '0 12px 28px rgba(39,110,241,0.4)',
  },
};

export const createAppMuiTheme = (mode) => {
  const c = getAppColors(mode);
  return createTheme({
    palette: {
      mode,
      primary: { main: shared.primary, dark: shared.primaryDark },
      success: { main: shared.success },
      error: { main: shared.danger },
      background: {
        default: c.bg,
        paper: c.surface,
      },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
      },
      divider: c.border,
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: c.bg,
            color: c.textPrimary,
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
      MuiChip: {
        styleOverrides: {
          root: mode === 'dark' ? { bgcolor: c.surfaceMuted } : {},
        },
      },
    },
  });
};

// Backward-compatible default export for light mode
export const appColors = lightColors;
export const fieldSx = getFieldSx('light');
