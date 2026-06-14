import { Box, Paper, Typography, IconButton, Fade, Grow } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const config = {
  success: { icon: CheckCircleIcon, bg: 'linear-gradient(135deg, #059669, #34d399)' },
  error: { icon: ErrorIcon, bg: 'linear-gradient(135deg, #dc2626, #f87171)' },
  warning: { icon: WarningIcon, bg: 'linear-gradient(135deg, #d97706, #fbbf24)' },
  info: { icon: InfoIcon, bg: 'linear-gradient(135deg, #2563eb, #60a5fa)' },
};

const AuthToast = ({ open, message, type = 'info', onClose }) => {
  const { icon: Icon, bg } = config[type] || config.info;

  return (
    <Fade in={open}>
      <Box
        sx={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: 'min(420px, 92vw)',
        }}
      >
        <Grow in={open}>
          <Paper
            elevation={12}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              background: bg,
              borderRadius: 3,
              color: '#fff',
            }}
          >
            <Icon sx={{ fontSize: 28 }} />
            <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '0.95rem' }}>
              {message}
            </Typography>
            <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Grow>
      </Box>
    </Fade>
  );
};

export default AuthToast;
