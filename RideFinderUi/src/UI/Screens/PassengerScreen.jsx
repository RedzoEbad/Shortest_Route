import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  CssBaseline,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import MapIcon from '@mui/icons-material/Map';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

import Map from '../Map/Map';
import FindRoutesModal from '../Componnents/FindRoutesModal';

const drawerWidth = 260;

const menuItems = [
  { text: 'Book Rides', icon: <DirectionsCarIcon sx={{ color: '#d81b60' }} /> },
  { text: 'Find Routes', icon: <AltRouteIcon sx={{ color: '#7e57c2' , cursor : 'pointer' }} /> },
  // { text: 'Measure Distance', icon: <MapIcon sx={{ color: '#66bb6a' }} /> },
  // { text: 'Find Lat/Lon', icon: <MapIcon sx={{ color: '#ffa726' }} /> },
  { text: 'Log Out', icon: <LogoutIcon sx={{ color: '#ef5350' }} /> },
];

const CustomToast = ({ open, message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 28, color: '#fff' }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 28, color: '#fff' }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 28, color: '#fff' }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 28, color: '#fff' }} />;
      default:
        return <InfoIcon sx={{ fontSize: 28, color: '#fff' }} />;
    }
  };

  const getBackground = () => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, #00c853, #69f0ae)';
      case 'error':
        return 'linear-gradient(135deg, #ff1744, #ff616f)';
      case 'warning':
        return 'linear-gradient(135deg, #ffd600, #ffecb3)';
      case 'info':
        return 'linear-gradient(135deg, #2196f3, #90caf9)';
      default:
        return 'linear-gradient(135deg, #2196f3, #90caf9)';
    }
  };

  return (
    <Fade in={open}>
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          minWidth: 300,
          maxWidth: 400,
        }}
      >
        <Grow in={open}>
          <Paper
            elevation={6}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: getBackground(),
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {getIcon()}
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 500,
                fontSize: '1rem',
                flex: 1,
              }}
            >
              {message}
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Typography sx={{ fontSize: '1.2rem' }}>×</Typography>
            </IconButton>
          </Paper>
        </Grow>
      </Box>
    </Fade>
  );
};

const PassengerScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Clear all items from localStorage
    localStorage.clear();
    // Show success toast
    setToast({
      open: true,
      message: 'Successfully logged out! Redirecting to register page...',
      type: 'success'
    });
    // Navigate to register page after a short delay
    setTimeout(() => {
      navigate('/register');
    }, 2000);
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleRoutesSubmit = (newRoutes) => {
    console.log('[PassengerScreen] Received routes:', newRoutes);
    if (!Array.isArray(newRoutes)) {
      console.error('[PassengerScreen] Routes is not an array:', newRoutes);
      return;
    }
    if (newRoutes.length === 0) {
      console.warn('[PassengerScreen] Empty routes array received');
      return;
    }
    console.log('[PassengerScreen] First route sample:', {
      id: newRoutes[0].id,
      distance: newRoutes[0].distance,
      pathLength: newRoutes[0].path?.length,
      firstCoord: newRoutes[0].path?.[0],
      lastCoord: newRoutes[0].path?.[newRoutes[0].path.length - 1]
    });
    setRoutes(newRoutes);
  };

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        background: 'linear-gradient(to bottom, #fce4ec, #e3f2fd)',
        height: '100%',
        color: '#4a148c',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer'
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="#aa00ff">
          RideEase
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, idx) => (
          <ListItem
            button
            key={idx}
            sx={{ '&:hover': { bgcolor: ' #f8bbd0' } }}
            onClick={() => {
              if (item.text === 'Find Routes') {
                setIsModalOpen(true);
              } else if (item.text === 'Log Out') {
                handleLogout();
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff0f5' }}>
      <CssBaseline />

      {/* Responsive Drawer */}
      {isMobile ? (
        <>
          <AppBar
            position="fixed"
            sx={{
              background: 'linear-gradient(to right, #f8bbd0, #d1c4e9, #b3e5fc)',
              color: '#6a1b9a',
              boxShadow: 2,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                RideEase Dashboard
              </Typography>
            </Toolbar>
          </AppBar>

          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxShadow: 4,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              boxShadow: 3,
              background: 'linear-gradient(to bottom, #fce4ec, #e3f2fd)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 2 : 4,
          pt: isMobile ? 8 : 4,
          background: 'linear-gradient(to bottom, #fce4ec, #e3f2fd)',
        }}
      >
        {!isMobile && (
          <AppBar
            position="static"
            elevation={2}
            sx={{
              background: 'linear-gradient(to right, #f8bbd0, #d1c4e9, #b3e5fc)',
              borderRadius: 2,
              mb: 4,
              color: '#6a1b9a',
              boxShadow: 1,
            }}
          >
            <Toolbar
              sx={{
                backdropFilter: 'blur(8px)',
                px: 3,
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: '#6a1b9a',
                  fontSize: '1.2rem',
                }}
              >
                {`Welcome ${JSON.parse(localStorage.getItem('name') || '"Passenger"' )}`}
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Paper
          elevation={6}
          sx={{
            height: '80vh',
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(to right, #fce4ec, #e1f5fe)',
            boxShadow: '0 4px 20px rgba(136, 79, 230, 0.2)',
            position: 'relative'
          }}
        >
          <Map routes={routes} />
        </Paper>
      </Box>

      {/* Custom Toast */}
      <CustomToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />

      {/* Modal */}
      <FindRoutesModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRoutesSubmit}
      />
    </Box>
  );
};

export default PassengerScreen;
