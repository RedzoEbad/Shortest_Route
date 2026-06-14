import { Box, Typography, Stack } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import RouteIcon from '@mui/icons-material/Route';
import SecurityIcon from '@mui/icons-material/Security';
import { motion } from 'framer-motion';
import { useThemeMode } from '../../theme/AppThemeProvider';
import ThemeToggle from './ThemeToggle';

const features = [
  { icon: RouteIcon, text: 'Smart multi-route navigation' },
  { icon: DirectionsCarFilledIcon, text: 'Passenger & rider modes' },
  { icon: SecurityIcon, text: 'Secure JWT authentication' },
];

const AuthLayout = ({ title, subtitle, children }) => {
  const { colors } = useThemeMode();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: colors.bg,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle />
      </Box>

      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 45%, #276EF1 100%)',
          color: '#fff',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 6,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: -0.5, mb: 1 }}>
            RideEase
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, maxWidth: 380 }}>
            Clifton&apos;s smartest way to find routes — built for real rides.
          </Typography>
        </motion.div>

        <Stack spacing={2.5} sx={{ mt: 6 }}>
          {features.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon />
                </Box>
                <Typography sx={{ opacity: 0.9, fontWeight: 500 }}>{text}</Typography>
              </Box>
            </motion.div>
          ))}
        </Stack>

        <Box
          sx={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            top: -80,
            right: -80,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(39,110,241,0.25)',
            bottom: 40,
            left: -60,
          }}
        />
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px' },
          lg: { flex: '0 0 520px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 5 },
          pt: { xs: 7, sm: 5 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Box sx={{ mb: 4, display: { md: 'none' } }}>
            <Typography variant="h5" fontWeight={800} color={colors.textPrimary}>
              RideEase
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color={colors.textPrimary} sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5 }}>
            {subtitle}
          </Typography>
          {children}
        </motion.div>
      </Box>
    </Box>
  );
};

export default AuthLayout;
