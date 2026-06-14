import { Box, Typography, Paper, Button } from '@mui/material';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../../auth/authStorage';
import { useThemeMode } from '../../theme/AppThemeProvider';
import ThemeToggle from '../Componnents/ThemeToggle';

const RiderScreen = () => {
  const navigate = useNavigate();
  const { colors } = useThemeMode();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </Box>

      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: '100%',
          p: 4,
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
          bgcolor: colors.surface,
          textAlign: 'center',
        }}
      >
        <DirectionsCarOutlinedIcon sx={{ fontSize: 56, color: colors.primary, mb: 2 }} />
        <Typography variant="h5" fontWeight={800} color={colors.textPrimary} gutterBottom>
          Rider dashboard
        </Typography>
        <Typography color={colors.textSecondary} sx={{ mb: 3 }}>
          Rider features are coming soon. You&apos;re signed in as a Rider.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<LogoutOutlinedIcon />}
          onClick={handleLogout}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
        >
          Sign out
        </Button>
      </Paper>
    </Box>
  );
};

export default RiderScreen;
