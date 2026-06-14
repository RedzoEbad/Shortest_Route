import { IconButton, Tooltip } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from '../../theme/AppThemeProvider';

const ThemeToggle = ({ sx = {} }) => {
  const { mode, toggleTheme, colors } = useThemeMode();

  return (
    <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
      <IconButton
        onClick={toggleTheme}
        aria-label="toggle theme"
        sx={{
          color: colors.textPrimary,
          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : colors.slate100,
          border: `1px solid ${colors.border}`,
          '&:hover': {
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.14)' : colors.slate200,
          },
          ...sx,
        }}
      >
        {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
