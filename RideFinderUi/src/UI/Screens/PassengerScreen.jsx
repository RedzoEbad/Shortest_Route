import { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Paper,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import Map from '../Map/Map';
import FindRoutesModal from '../Componnents/FindRoutesModal';
import AuthToast from '../Componnents/AuthToast';
import { clearAuth } from '../../auth/authStorage';
import { appColors } from '../../theme/appTheme';

const drawerWidth = 272;

const getUserName = () => {
  try {
    return JSON.parse(localStorage.getItem('name') || '"Passenger"');
  } catch {
    return 'Passenger';
  }
};

const PassengerScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const userName = getUserName();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [activeNav, setActiveNav] = useState('map');
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });

  const handleLogout = () => {
    clearAuth();
    setToast({ open: true, message: 'Signed out successfully.', type: 'success' });
    setTimeout(() => navigate('/login'), 900);
  };

  const handleRoutesSubmit = (newRoutes, tripInfo = {}) => {
    if (!Array.isArray(newRoutes) || newRoutes.length === 0) return;
    setRoutes(newRoutes);
    setSelectedRouteId(newRoutes[0].id);
    setActiveNav('map');
    const warningText = tripInfo.warnings?.[0];
    setToast({
      open: true,
      message: warningText || '3 routes ready — compare on map, then minimize when you pick one.',
      type: warningText ? 'info' : 'success',
    });
  };

  const navItems = [
    {
      id: 'find',
      label: 'Find Routes',
      icon: RouteOutlinedIcon,
      onClick: () => {
        setActiveNav('find');
        setIsModalOpen(true);
        setMobileOpen(false);
      },
    },
    {
      id: 'map',
      label: 'Live Map',
      icon: DirectionsCarOutlinedIcon,
      onClick: () => setActiveNav('map'),
    },
  ];

  const sidebar = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 55%, #1e40af 100%)',
        color: '#fff',
      }}
    >
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>
          RideEase
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
          Passenger dashboard
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navItems.map(({ id, label, icon: Icon, onClick }) => (
          <ListItemButton
            key={id}
            onClick={onClick}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              color: '#fff',
              bgcolor: activeNav === id ? 'rgba(39,110,241,0.35)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            <ListItemIcon sx={{ color: '#93c5fd', minWidth: 40 }}>
              <Icon />
            </ListItemIcon>
            <ListItemText
              primary={label}
              primaryTypographyProps={{ fontWeight: activeNav === id ? 700 : 500, fontSize: '0.95rem' }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Avatar sx={{ bgcolor: appColors.primary, width: 40, height: 40, fontWeight: 700 }}>
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} fontSize="0.9rem" noWrap>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.65 }}>
              Passenger
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: '#fca5a5',
            '&:hover': { bgcolor: 'rgba(220,38,38,0.15)' },
          }}
        >
          <ListItemIcon sx={{ color: '#fca5a5', minWidth: 40 }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Sign out" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: appColors.bg }}>
      <CssBaseline />

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            border: 'none',
            boxShadow: '4px 0 24px rgba(15,23,42,0.08)',
          },
        }}
      >
        {sidebar}
      </Drawer>

      {/* Main */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
        }}
      >
        {/* Top bar */}
        <Paper
          elevation={0}
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            borderRadius: 0,
            borderBottom: `1px solid ${appColors.slate200}`,
            bgcolor: appColors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} edge="start">
                <MenuIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="h6" fontWeight={700} color={appColors.slate900}>
                Good to see you, {userName.split(' ')[0]}
              </Typography>
              <Typography variant="caption" color={appColors.slate500}>
                Plan your trip across Clifton
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddLocationAltOutlinedIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              background: 'linear-gradient(135deg, #276EF1, #1d4ed8)',
              boxShadow: '0 4px 14px rgba(39,110,241,0.35)',
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            Find routes
          </Button>
          <IconButton
            onClick={() => setIsModalOpen(true)}
            sx={{
              display: { xs: 'flex', sm: 'none' },
              bgcolor: appColors.primaryLight,
              color: appColors.primary,
            }}
          >
            <AddLocationAltOutlinedIcon />
          </IconButton>
        </Paper>

        {/* Map area */}
        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2.5 }, minHeight: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{ height: '100%' }}
          >
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${appColors.slate200}`,
                boxShadow: '0 8px 32px rgba(15,23,42,0.08)',
              }}
            >
              <Map
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                onNewTrip={() => setIsModalOpen(true)}
              />
            </Paper>
          </motion.div>
        </Box>
      </Box>

      <AuthToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <FindRoutesModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRoutesSubmit}
      />
    </Box>
  );
};

export default PassengerScreen;
