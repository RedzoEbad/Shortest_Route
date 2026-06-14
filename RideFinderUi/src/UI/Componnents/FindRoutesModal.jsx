import { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Fade,
  Backdrop,
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useThemeMode } from '../../theme/AppThemeProvider';

const nearestPlace = (places, lon, lat) => {
  let best = null;
  let minDist = Infinity;
  places.forEach((p) => {
    const d = Math.hypot(p.lon - lon, p.lat - lat);
    if (d < minDist) {
      minDist = d;
      best = p;
    }
  });
  return best;
};

const FindRoutesModal = ({ open, onClose, onSubmit }) => {
  const { colors, fieldSx, primaryButtonSx } = useThemeMode();
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '92%',
    maxWidth: 500,
    bgcolor: colors.surface,
    boxShadow: colors.panelShadow,
    borderRadius: '16px',
    p: { xs: 3, sm: 4 },
    outline: 'none',
    border: `1px solid ${colors.border}`,
  };

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [locationNote, setLocationNote] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setLocationNote('');
      setLoadingPlaces(true);
      fetch('/DataSet/DataSet.geojson')
        .then((res) => res.json())
        .then((data) => {
          const pointFeatures = data.features
            .filter((f) => f.geometry?.type === 'Point')
            .map((f) => ({
              name: f.properties?.name,
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
            }));
          setPlaces(pointFeatures);
        })
        .catch(() => setError('Failed to load locations.'))
        .finally(() => setLoadingPlaces(false));
    }
  }, [open]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setGpsLoading(true);
    setError('');
    setLocationNote('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGpsCoords([longitude, latitude]);
        setStart(`My Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);

        const near = nearestPlace(places, longitude, latitude);
        if (near) {
          const approxKm = Math.hypot(near.lon - longitude, near.lat - latitude) * 111;
          if (approxKm > 2) {
            setLocationNote(
              `You're ~${approxKm.toFixed(1)} km from Clifton landmarks. We'll snap your pickup to the nearest road (near ${near.name}).`
            );
          } else {
            setLocationNote(`GPS locked (±${Math.round(accuracy)}m). Near ${near.name}.`);
          }
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsCoords(null);
        const messages = {
          1: 'Location permission denied. Allow GPS or pick from the list.',
          2: 'GPS unavailable. Pick a pickup from the list.',
          3: 'GPS timed out. Try again or pick from the list.',
        };
        setError(messages[err.code] || 'Could not get your location.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const getCoords = (placeName) => {
    const place = places.find((p) => p.name === placeName);
    return place ? [place.lon, place.lat] : null;
  };

  const resolveStartCoords = () => {
    if (gpsCoords && (start.startsWith('My Location') || start === 'My Location')) {
      return gpsCoords;
    }
    if (start.startsWith('My Location')) {
      const match = start.match(/\(([^)]+)\)/);
      if (match) {
        const [lat, lon] = match[1].split(',').map((n) => parseFloat(n.trim()));
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) return [lon, lat];
      }
    }
    return getCoords(start);
  };

  const handleSubmit = async () => {
    setError('');
    const startCoords = resolveStartCoords();
    const endCoords = getCoords(end);

    if (!startCoords || !endCoords) {
      setError('Please select a valid pickup and destination.');
      return;
    }

    if (startCoords[0] === endCoords[0] && startCoords[1] === endCoords[1]) {
      setError('Pickup and destination cannot be the same.');
      return;
    }

    setSearching(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/find-routes`, {
        startCoords,
        endCoords,
        K: 3,
      });

      const routes = res.data.routes || [];
      if (!routes.length) {
        setError('No routes found between these locations.');
        return;
      }

      onSubmit(routes, {
        start: startCoords,
        end: endCoords,
        warnings: res.data.warnings || [],
        meta: res.data.meta,
      });
      setStart('');
      setEnd('');
      setGpsCoords(null);
      setLocationNote('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find routes. Is the server running?');
    } finally {
      setSearching(false);
    }
  };

  const placeOptions = places.map((p) => p.name);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300, sx: { backdropFilter: 'blur(4px)' } }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: colors.primaryLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RouteOutlinedIcon sx={{ color: colors.primary }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} color={colors.textPrimary}>
                  Where to?
                </Typography>
                <Typography variant="body2" color={colors.textSecondary}>
                  Clifton area · 3 routes like Uber
                </Typography>
              </Box>
            </Box>

            <Autocomplete
              value={start}
              onChange={(e, newVal) => {
                if (newVal === 'Use current location...') {
                  handleUseCurrentLocation();
                } else {
                  setStart(newVal || '');
                  setGpsCoords(null);
                  setLocationNote('');
                }
              }}
              options={['Use current location...', ...placeOptions]}
              loading={loadingPlaces || gpsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pickup location"
                  placeholder="Search or use GPS"
                  sx={{ ...fieldSx, mb: 1 }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PlaceOutlinedIcon sx={{ color: colors.slate500, ml: 0.5 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {gpsLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleUseCurrentLocation}
                            disabled={gpsLoading}
                            sx={{
                              bgcolor: gpsCoords ? colors.primaryLight : 'transparent',
                              '&:hover': { bgcolor: colors.primaryLight },
                            }}
                          >
                            <MyLocationIcon sx={{ color: gpsCoords ? colors.primary : colors.slate500 }} />
                          </IconButton>
                        </InputAdornment>
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {locationNote && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
                {locationNote}
              </Alert>
            )}

            <Autocomplete
              value={end}
              onChange={(e, newVal) => setEnd(newVal || '')}
              options={placeOptions}
              loading={loadingPlaces}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination"
                  placeholder="Where are you going?"
                  sx={{ ...fieldSx, mb: 2 }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <FlagOutlinedIcon sx={{ color: colors.slate500, ml: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
              <Button
                onClick={onClose}
                variant="outlined"
                disabled={searching}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: colors.border,
                  color: colors.slate700,
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={!start || !end || searching || gpsLoading}
                sx={{ ...primaryButtonSx, minWidth: 140, px: 3 }}
              >
                {searching ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Find routes'}
              </Button>
            </Box>
          </motion.div>
        </Box>
      </Fade>
    </Modal>
  );
};

export default FindRoutesModal;
