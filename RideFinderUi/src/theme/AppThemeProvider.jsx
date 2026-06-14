import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import {
  createAppMuiTheme,
  getAppColors,
  getFieldSx,
  primaryButtonSx,
} from './appTheme';

const STORAGE_KEY = 'rideease-theme';

const ThemeModeContext = createContext(null);

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within AppThemeProvider');
  return ctx;
};

const getInitialMode = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const value = useMemo(() => {
    const colors = getAppColors(mode);
    return {
      mode,
      isDark: mode === 'dark',
      colors,
      fieldSx: getFieldSx(mode),
      primaryButtonSx,
      toggleTheme: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
      setMode,
    };
  }, [mode]);

  const muiTheme = useMemo(() => createAppMuiTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default AppThemeProvider;
