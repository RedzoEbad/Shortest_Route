import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = ({ routes }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapInstance.current) {
      console.log('[Map Debug] Initializing map...');
      mapInstance.current = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
        center: [67.25016014042554, 24.919724453191485],
        zoom: 12,
        attributionControl: true
      });

      mapInstance.current.on('load', () => {
        console.log('[Map Debug] Map loaded successfully');
        setMapLoaded(true);
      });

      mapInstance.current.on('error', (e) => {
        console.error('[Map Debug] Map error:', e);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !routes) {
      console.log('[Map Debug] Map not ready or no routes:', { mapLoaded, routes });
      return;
    }

    console.log('[Map Debug] Routes prop changed:', routes);

    const map = mapInstance.current;
    if (!map) {
      console.error('[Map Debug] Map instance not found');
      return;
    }

    // Clear existing layers and sources
    const layers = map.getStyle().layers || [];
    const sources = map.getStyle().sources || {};

    // Remove existing layers
    layers.forEach(layer => {
      if (layer.id.startsWith('route-') || layer.id.startsWith('marker-')) {
        map.removeLayer(layer.id);
      }
    });

    // Remove existing sources
    Object.keys(sources).forEach(source => {
      if (source.startsWith('route-') || source.startsWith('marker-')) {
        map.removeSource(source);
      }
    });

    // Remove existing popups
    const popups = document.getElementsByClassName('maplibregl-popup');
    while (popups[0]) {
      popups[0].remove();
    }

    if (!Array.isArray(routes) || routes.length === 0) {
      console.log('[Map Debug] Invalid routes data:', routes);
      return;
    }

    const colors = [
      '#FF0000', // Red for primary route
      '#00FF00', // Green for alternative route 1
      '#0000FF'  // Blue for alternative route 2
    ];
    const allCoords = [];

    routes.forEach((route, index) => {
      if (!route.path || !Array.isArray(route.path)) {
        console.warn(`[Map Debug] Invalid path data for route ${index}:`, route);
        return;
      }

      const routeId = `route-${index}`;
      const color = colors[index % colors.length];

      // Ensure coordinates are in [lon, lat] format and valid
      const coordinates = route.path.map(coord => {
        if (Array.isArray(coord) && coord.length >= 2) {
          const [lon, lat] = coord.map(Number);
          if (!isNaN(lon) && !isNaN(lat)) {
            // Validate coordinate ranges
            if (lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
              const mapCoord = [lon, lat];
              allCoords.push(mapCoord);
              return mapCoord;
            }
          }
        }
        console.warn(`[Map Debug] Invalid coordinate in route ${index}:`, coord);
        return null;
      }).filter(Boolean);

      if (coordinates.length < 2) {
        console.warn(`[Map Debug] Not enough valid coordinates for route ${index}`);
        return;
      }

      console.log(`[Map Debug] Route ${index} coordinates:`, coordinates);

      try {
        // Create source data
        const sourceData = {
          type: 'Feature',
          properties: {
            id: route.id,
            distance: route.distance
          },
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        };

        // Add source and layer
        map.addSource(routeId, {
          type: 'geojson',
          data: sourceData
        });

        // Add route line
        map.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        // Add route outline for better visibility
        map.addLayer({
          id: `${routeId}-outline`,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#000000',
            'line-width': 6,
            'line-opacity': 0.3
          }
        });

        // Add hover effect
        map.on('mouseenter', routeId, () => {
          map.getCanvas().style.cursor = 'pointer';
          map.setPaintProperty(routeId, 'line-width', 6);
          map.setPaintProperty(`${routeId}-outline`, 'line-width', 8);
        });

        map.on('mouseleave', routeId, () => {
          map.getCanvas().style.cursor = '';
          map.setPaintProperty(routeId, 'line-width', 4);
          map.setPaintProperty(`${routeId}-outline`, 'line-width', 6);
        });

        // Add click event for popup
        map.on('click', routeId, (e) => {
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0; color: ${color};">Route ${route.id}</h3>
                <p style="margin: 0;">Distance: ${route.distance.toFixed(2)} km</p>
                <p style="margin: 5px 0 0 0;">Points: ${coordinates.length}</p>
              </div>
            `)
            .addTo(map);
        });

        // Add start and end markers for first and last routes
        if (index === 0) {
          const startCoord = coordinates[0];
          new maplibregl.Marker({ color: '#FF0000' })
            .setLngLat(startCoord)
            .setPopup(new maplibregl.Popup().setHTML('<div>Start Point</div>'))
            .addTo(map);
        }
        if (index === routes.length - 1) {
          const endCoord = coordinates[coordinates.length - 1];
          new maplibregl.Marker({ color: '#00FF00' })
            .setLngLat(endCoord)
            .setPopup(new maplibregl.Popup().setHTML('<div>End Point</div>'))
            .addTo(map);
        }
      } catch (error) {
        console.error(`[Map Debug] Error adding route ${index}:`, error);
      }
    });

    // Fit bounds to show all routes
    if (allCoords.length > 0) {
      try {
        const bounds = allCoords.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new maplibregl.LngLatBounds(allCoords[0], allCoords[0]));

        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
          duration: 1000
        });
      } catch (error) {
        console.error('[Map Debug] Error fitting bounds:', error);
      }
    }
  }, [routes, mapLoaded]);

  return (
    <div className="map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div id="map" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}></div>
    </div>
  );
};

export default Map;
