import React, { useState, useEffect } from 'react';
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
import axios from 'axios';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch('/DataSet/DataSet.geojson')
        .then((res) => res.json())
        .then((data) => {
          // Filter only Point features and extract necessary info
          const pointFeatures = data.features
            .filter((f) => f.geometry?.type === 'Point')
            .map((f) => ({
              name: f.properties?.name,
              lat: f.geometry.coordinates[1], // [lon, lat]
              lon: f.geometry.coordinates[0],
            }));
          setPlaces(pointFeatures);
        })
        .catch((err) => console.error('Failed to load places:', err))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setStart(`My Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
    });
  };

  const getCoords = (placeName) => {
    const place = places.find((p) => p.name === placeName);
    return place ? [place.lon, place.lat] : null;
  };

  const handleSubmit = async () => {
    let startCoords = null;
    let endCoords = null;

    if (start.startsWith('My Location')) {
      const match = start.match(/\(([^)]+)\)/);
      if (match) {
        const [lat, lon] = match[1].split(',').map((n) => parseFloat(n.trim()));
        startCoords = [lon, lat];
      }
    } else {
      startCoords = getCoords(start);
    }

    endCoords = getCoords(end);

    if (!startCoords || !endCoords) {
      alert('Please select valid start and end locations.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8000/api/auth/find-routes', {
        startCoords,
        endCoords,
      });

      const routes = res.data.routes || [];
      if (!routes.length) {
        alert('No routes found.');
        return;
      }

      onSubmit(routes);
      setStart('');
      setEnd('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to get routes.');
    }
  };

  const placeOptions = places.map((p) => p.name);

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300 }}>
      <Fade in={open}>
        <Box sx={style}>
          <Typography variant="h6" sx={{ mb: 2, color: '#6a1b9a' }}>Find a Route</Typography>

          <Autocomplete
            value={start}
            onChange={(e, newVal) => setStart(newVal)}
            options={placeOptions}
            loading={loading}
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
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      <InputAdornment position="end">
                        <IconButton onClick={handleUseCurrentLocation}>
                          <MyLocationIcon />
                        </IconButton>
                      </InputAdornment>
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Autocomplete
            value={end}
            onChange={(e, newVal) => setEnd(newVal)}
            options={placeOptions}
            loading={loading}
            renderInput={(params) => (
              <TextField {...params} label="Destination" variant="outlined" sx={{ mb: 3 }} />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} color="error" variant="outlined">Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: '#7e57c2' }} disabled={!start || !end}>Submit</Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default FindRoutesModal;
