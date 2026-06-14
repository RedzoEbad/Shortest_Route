import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Button,
  IconButton,
  alpha,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StraightenIcon from '@mui/icons-material/Straighten';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import { motion, AnimatePresence } from 'framer-motion';
import { appColors } from '../../theme/appTheme';

export const ROUTE_STYLES = [
  { color: '#276EF1', casing: '#1a4fad', rank: '1st', badge: 'Fastest', medal: '🥇' },
  { color: '#05944F', casing: '#03703a', rank: '2nd', badge: 'Alternative', medal: '🥈' },
  { color: '#E8710A', casing: '#b85608', rank: '3rd', badge: 'Option', medal: '🥉' },
];

const createPinElement = (type) => {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.35));">
      <div style="width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        background:${type === 'pickup' ? 'linear-gradient(135deg,#276EF1,#5b9bf8)' : 'linear-gradient(135deg,#E11900,#ff5a4a)'};
        border:3px solid #fff;display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);font-size:15px;color:#fff;font-weight:800;">${type === 'pickup' ? 'A' : 'B'}</span>
      </div>
      <span style="margin-top:5px;font-size:11px;font-weight:700;color:#222;background:#fff;
        padding:3px 10px;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
        ${type === 'pickup' ? 'Pickup' : 'Drop-off'}
      </span>
    </div>`;
  return el;
};

const Map = ({ routes, selectedRouteId, onSelectRoute, onNewTrip }) => {
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const listenersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(true);

  useEffect(() => {
    if (routes?.length) setPanelExpanded(true);
  }, [routes]);

  const clearRouteLayers = useCallback((map) => {
    listenersRef.current.forEach(({ layerId, type, handler }) => {
      map.off(type, layerId, handler);
    });
    listenersRef.current = [];

    const style = map.getStyle();
    (style?.layers || [])
      .map((l) => l.id)
      .filter((id) => id.startsWith('route-'))
      .forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });

    Object.keys(style?.sources || {})
      .filter((id) => id.startsWith('route-'))
      .forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
  }, []);

  const handleRouteSelect = useCallback(
    (routeId) => {
      onSelectRoute?.(routeId);
    },
    [onSelectRoute]
  );

  const handleRouteConfirm = useCallback(
    (routeId) => {
      onSelectRoute?.(routeId);
      setPanelExpanded(false);
    },
    [onSelectRoute]
  );

  const handleExpandPanel = useCallback(() => {
    setPanelExpanded(true);
  }, []);

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
        center: [67.0335, 24.8159],
        zoom: 13,
        attributionControl: false,
      });
      mapInstance.current.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-right'
      );
      mapInstance.current.on('load', () => setMapLoaded(true));
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !routes?.length) return;

    const map = mapInstance.current;
    if (!map) return;

    clearRouteLayers(map);
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const selectedId = selectedRouteId ?? routes[0]?.id;
    // Show all 3 routes whenever panel is expanded; only focus one when collapsed
    const focusSelected = !panelExpanded;

    const drawOrder = [...routes].sort((a, b) => {
      if (a.id === selectedId) return 1;
      if (b.id === selectedId) return -1;
      return a.id - b.id;
    });

    const boundsCoords = [];

    drawOrder.forEach((route) => {
      const index = route.id - 1;
      const style = ROUTE_STYLES[index] || ROUTE_STYLES[0];
      const isSelected = route.id === selectedId;
      const routeId = `route-${route.id}`;

      if (focusSelected && !isSelected) return;

      const coordinates = (route.path || []).filter(
        (c) => Array.isArray(c) && c.length === 2 && !Number.isNaN(c[0])
      );

      if (coordinates.length < 2) return;
      if (panelExpanded || isSelected) boundsCoords.push(...coordinates);

      map.addSource(routeId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates },
        },
      });

      map.addLayer({
        id: `${routeId}-casing`,
        type: 'line',
        source: routeId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': isSelected ? 16 : 10,
          'line-opacity': focusSelected ? 1 : isSelected ? 1 : 0.7,
        },
      });

      map.addLayer({
        id: routeId,
        type: 'line',
        source: routeId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': style.color,
          'line-width': isSelected ? 9 : 5,
          'line-opacity': focusSelected ? 1 : isSelected ? 1 : 0.55,
        },
      });

      const onClick = () => handleRouteSelect(route.id);
      map.on('click', routeId, onClick);
      map.on('mouseenter', routeId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', routeId, () => { map.getCanvas().style.cursor = ''; });
      listenersRef.current.push({ layerId: routeId, type: 'click', handler: onClick });
    });

    const selected = routes.find((r) => r.id === selectedId) || routes[0];
    if (selected?.path?.length >= 2) {
      const start = selected.path[0];
      const end = selected.path[selected.path.length - 1];
      markersRef.current.push(
        new maplibregl.Marker({ element: createPinElement('pickup'), anchor: 'bottom' })
          .setLngLat(start)
          .addTo(map)
      );
      markersRef.current.push(
        new maplibregl.Marker({ element: createPinElement('dropoff'), anchor: 'bottom' })
          .setLngLat(end)
          .addTo(map)
      );
    }

    const fitCoords = boundsCoords.length ? boundsCoords : routes.flatMap((r) => r.path || []);
    if (fitCoords.length) {
      const bounds = fitCoords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(fitCoords[0], fitCoords[0])
      );
      map.fitBounds(bounds, {
        padding: panelExpanded
          ? { top: 70, bottom: 280, left: 50, right: 50 }
          : { top: 70, bottom: 50, left: 50, right: 300 },
        maxZoom: 15,
        duration: 700,
      });
    }
  }, [routes, selectedRouteId, mapLoaded, panelExpanded, handleRouteSelect, clearRouteLayers]);

  const selectedId = selectedRouteId ?? routes?.[0]?.id;
  const selectedRoute = routes?.find((r) => r.id === selectedId);
  const selectedStyle = ROUTE_STYLES[(selectedId || 1) - 1] || ROUTE_STYLES[0];

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative', bgcolor: appColors.slate100 }}>
      <div id="map" style={{ width: '100%', height: '100%' }} />

      {/* Legend — hide when panel collapsed to reduce clutter */}
      {routes?.length > 0 && panelExpanded && (
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            px: 2,
            py: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.98)',
            border: `1px solid ${appColors.slate200}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="caption" fontWeight={700} color="#666">
            ROUTES ON MAP
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {routes.map((route, i) => {
              const s = ROUTE_STYLES[i];
              return (
                <Box key={route.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 24, height: 5, borderRadius: 2, bgcolor: s.color }} />
                  <Typography variant="caption" fontWeight={600}>
                    {s.medal} {s.rank} · {s.badge}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      )}

      {/* Route panel — expanded (center/bottom) or collapsed (right side) */}
      <AnimatePresence mode="wait">
        {routes?.length > 0 && panelExpanded && (
          <motion.div
            key="expanded"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 16px' }}
          >
            <Paper
              elevation={0}
              sx={{
                maxWidth: 520,
                mx: 'auto',
                p: 2,
                borderRadius: '20px 20px 16px 16px',
                bgcolor: 'rgba(255,255,255,0.98)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.14)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEventsIcon sx={{ color: '#276EF1' }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Choose your route
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<EditLocationAltIcon />}
                  onClick={onNewTrip}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  New trip
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                All 3 routes are on the map. Tap to highlight — then minimize to focus one route.
              </Typography>

              <Stack spacing={1}>
                {routes.map((route, index) => {
                  const s = ROUTE_STYLES[index];
                  const active = route.id === selectedId;
                  return (
                    <Paper
                      key={route.id}
                      onClick={() => handleRouteSelect(route.id)}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        borderRadius: 2.5,
                        border: `2px solid ${active ? s.color : '#eee'}`,
                        bgcolor: active ? alpha(s.color, 0.07) : '#fafafa',
                        '&:hover': { bgcolor: alpha(s.color, 0.1) },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            bgcolor: s.color,
                            color: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.65rem',
                          }}
                        >
                          <span style={{ fontSize: '1rem' }}>{s.medal}</span>
                          {s.rank}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={700} fontSize="0.95rem">
                            {route.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {route.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
                            <Chip size="small" label={`${route.distanceKm} km`} sx={{ fontWeight: 600 }} />
                            <Chip size="small" label={`${route.durationMin} min`} sx={{ fontWeight: 600 }} />
                          </Box>
                        </Box>
                        <Box sx={{ width: 5, height: 48, borderRadius: 2, bgcolor: s.color }} />
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>

              <Button
                fullWidth
                variant="contained"
                onClick={() => handleRouteConfirm(selectedId)}
                sx={{
                  mt: 1.5,
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${selectedStyle.color}, ${alpha(selectedStyle.color, 0.75)})`,
                }}
              >
                Minimize & focus selected route
              </Button>
            </Paper>
          </motion.div>
        )}

        {routes?.length > 0 && !panelExpanded && selectedRoute && (
          <motion.div
            key="collapsed"
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)' }}
          >
            <Paper
              onClick={handleExpandPanel}
              elevation={0}
              sx={{
                width: 260,
                p: 2,
                borderRadius: 3,
                cursor: 'pointer',
                bgcolor: 'rgba(255,255,255,0.98)',
                border: `2px solid ${selectedStyle.color}`,
                boxShadow: `0 8px 32px ${alpha(selectedStyle.color, 0.3)}`,
                '&:hover': { boxShadow: `0 12px 40px ${alpha(selectedStyle.color, 0.4)}` },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" fontWeight={700} color={selectedStyle.casing}>
                  SELECTED ROUTE
                </Typography>
                <IconButton size="small" sx={{ bgcolor: alpha(selectedStyle.color, 0.1) }}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: selectedStyle.color,
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{selectedStyle.medal}</span>
                  <span style={{ fontSize: '0.65rem' }}>{selectedStyle.rank}</span>
                </Box>
                <Box>
                  <Typography fontWeight={700} fontSize="0.9rem">
                    {selectedRoute.label}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5 }}>
                    <Chip
                      size="small"
                      icon={<StraightenIcon sx={{ fontSize: '13px !important' }} />}
                      label={`${selectedRoute.distanceKm} km`}
                      sx={{ height: 24, fontWeight: 600 }}
                    />
                    <Chip
                      size="small"
                      icon={<AccessTimeIcon sx={{ fontSize: '13px !important' }} />}
                      label={`${selectedRoute.durationMin} min`}
                      sx={{ height: 24, fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Tap to expand — compare all 3 routes on the map
              </Typography>

              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<EditLocationAltIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onNewTrip?.();
                }}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                New locations
              </Button>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse hint when expanded */}
      {panelExpanded && routes?.length > 0 && (
        <IconButton
          onClick={() => setPanelExpanded(false)}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.95)',
            boxShadow: 2,
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default Map;
