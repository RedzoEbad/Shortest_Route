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
} from '@mui/material';

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
  { text: 'Measure Distance', icon: <MapIcon sx={{ color: '#66bb6a' }} /> },
  { text: 'Find Lat/Lon', icon: <MapIcon sx={{ color: '#ffa726' }} /> },
  { text: 'Log Out', icon: <LogoutIcon sx={{ color: '#ef5350' }} /> },
];

const PassengerScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routes, setRoutes] = useState([]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
        cursor : 'pointer'
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
