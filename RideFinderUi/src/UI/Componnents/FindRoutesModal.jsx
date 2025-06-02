import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 4,
  p: 4,
  background: 'linear-gradient(to right, #f3e5f5, #e1f5fe)',
};

const FindRoutesModal = ({ open, onClose, onSubmit }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [places, setPlaces] = useState([]);
  const [geoFeatures, setGeoFeatures] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && places.length === 0) {
      setLoading(true);
      fetch('/DataSet/DataSet.geojson')
        .then((res) => res.json())
        .then((data) => {
          const features = data.features || [];
          setGeoFeatures(features);
          const names = features.map((f) => f.properties?.name).filter(Boolean);
          setPlaces(names);
        })
        .catch((err) => console.error('Failed to load GeoJSON:', err))
        .finally(() => setLoading(false));
    }
  }, [open, places.length]);

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setStart(`My Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
    });
  };

  const getCoordinatesByName = (name) => {
    const match = geoFeatures.find(
      (f) => f.properties?.name?.toLowerCase() === name.toLowerCase()
    );
    if (!match) return null;

    const coords = match.geometry?.coordinates;
    if (!coords) return null;

    const calculateCentroid = (coordinates) => {
      let points = [];

      const flattenCoords = (arr) => {
        if (typeof arr[0] === 'number' && typeof arr[1] === 'number') {
          points.push(arr);
        } else {
          arr.forEach(flattenCoords);
        }
      };

      flattenCoords(coordinates);

      const total = points.length;
      const sum = points.reduce(
        (acc, [lng, lat]) => {
          acc[0] += lng;
          acc[1] += lat;
          return acc;
        },
        [0, 0]
      );

      return [sum[0] / total, sum[1] / total]; // [lng, lat]
    };

    switch (match.geometry.type) {
      case 'MultiPolygon':
      case 'Polygon':
        return calculateCentroid(coords);
      case 'Point':
        return coords;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!start || !end) return;

    let startCoords = null;
    let endCoords = null;

    if (start.startsWith('My Location')) {
      const match = start.match(/\(([^)]+)\)/);
      if (match) {
        const [lat, lng] = match[1].split(',').map((val) => parseFloat(val.trim()));
        // Validate coordinates
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          alert('Invalid current location coordinates.');
          return;
        }
        // Convert to [lon, lat] format for backend
        startCoords = [lng, lat];
        console.log('[FindRoutesModal] Current location coordinates:', { lat, lng, startCoords });
      }
    } else {
      const coords = getCoordinatesByName(start);
      if (coords) {
        // Validate coordinates
        const [lon, lat] = coords;
        if (isNaN(lon) || isNaN(lat) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          alert('Invalid start location coordinates.');
          return;
        }
        // Ensure coordinates are in [lon, lat] format
        startCoords = coords;
        console.log('[FindRoutesModal] Start location coordinates:', { coords, startCoords });
      }
    }

    const endGeo = getCoordinatesByName(end);
    if (endGeo) {
      // Validate coordinates
      const [lon, lat] = endGeo;
      if (isNaN(lon) || isNaN(lat) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        alert('Invalid end location coordinates.');
        return;
      }
      // Ensure coordinates are in [lon, lat] format
      endCoords = endGeo;
      console.log('[FindRoutesModal] End location coordinates:', { endGeo, endCoords });
    }

    if (!startCoords || !endCoords) {
      alert('Invalid start or end location.');
      return;
    }

    try {
      console.log('[FindRoutesModal] Sending coordinates to backend:', { 
        startCoords, 
        endCoords,
        startLocation: start,
        endLocation: end
      });

      const response = await axios.post('http://localhost:8000/api/auth/find-routes', {
        startCoords,
        endCoords,
      });

      console.log('[FindRoutesModal] Received routes from backend:', response.data);
      const routes = response.data.routes;
      if (!routes || routes.length === 0) {
        alert('No routes found.');
        return;
      }

      // Ensure routes are in [lon, lat] format for the map
      const formattedRoutes = routes.map(route => {
        console.log('[FindRoutesModal] Processing route:', route);
        const formattedPath = route.path.map(coord => {
          // Ensure each coordinate is in [lon, lat] format
          if (Array.isArray(coord) && coord.length === 2) {
            const [lon, lat] = coord.map(Number);
            if (isNaN(lon) || isNaN(lat) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
              console.error('[FindRoutesModal] Invalid coordinate:', coord);
              return null;
            }
            return [lon, lat];
          }
          console.error('[FindRoutesModal] Invalid coordinate format:', coord);
          return null;
        }).filter(Boolean);

        if (formattedPath.length < 2) {
          console.error('[FindRoutesModal] Route has insufficient valid coordinates');
          return null;
        }

        console.log('[FindRoutesModal] Formatted path:', formattedPath);
        return {
          ...route,
          path: formattedPath
        };
      }).filter(Boolean);

      if (formattedRoutes.length === 0) {
        alert('No valid routes found after processing.');
        return;
      }

      console.log('[FindRoutesModal] Submitting formatted routes to map:', formattedRoutes);
      onSubmit(formattedRoutes);
      setStart('');
      setEnd('');
      onClose();
    } catch (error) {
      console.error('[FindRoutesModal] Error fetching routes:', error);
      alert('Error fetching routes. Check console for details.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <Typography variant="h6" sx={{ mb: 2, color: '#6a1b9a' }}>
            Find a Route
          </Typography>

          <Autocomplete
            freeSolo
            options={places}
            filterOptions={(options, state) =>
              options
                .filter((opt) =>
                  opt.toLowerCase().includes(state.inputValue.toLowerCase())
                )
                .slice(0, 3)
            }
            inputValue={start}
            onInputChange={(e, value) => setStart(value)}
            loading={loading}
            loadingText="Loading..."
            renderInput={(params) => (
              <TextField
                {...params}
                label="Start Location"
                variant="outlined"
                sx={{ mb: 2 }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : (
                        <InputAdornment position="end">
                          <IconButton onClick={handleUseCurrentLocation} aria-label="Use Current Location">
                            <MyLocationIcon />
                          </IconButton>
                        </InputAdornment>
                      )}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Autocomplete
            freeSolo
            options={places}
            filterOptions={(options, state) =>
              options
                .filter((opt) =>
                  opt.toLowerCase().includes(state.inputValue.toLowerCase())
                )
                .slice(0, 3)
            }
            inputValue={end}
            onInputChange={(e, value) => setEnd(value)}
            loading={loading}
            loadingText="Loading..."
            renderInput={(params) => (
              <TextField
                {...params}
                label="Destination"
                variant="outlined"
                sx={{ mb: 3 }}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} color="error" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ backgroundColor: '#7e57c2' }}
              disabled={!start || !end}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default FindRoutesModal;
