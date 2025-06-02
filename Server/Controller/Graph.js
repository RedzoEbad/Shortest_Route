// graphController.js
const fs = require('fs');
const path = require('path');
const { geojsonToGraph, findNearestNode, yenKShortestPaths } = require('../Utils/graphUtils');

const Graph = async (req, res) => {
  try {
    const { startCoords, endCoords, K = 3 } = req.body;
    
    if (!startCoords || !endCoords) {
      return res.status(400).json({ error: 'Start and end coordinates are required.' });
    }

    // Input coordinates are already in [lon, lat] format from frontend
    // No need to swap them
    console.log('Received coordinates:', {
      start: { lon: startCoords[0], lat: startCoords[1] },
      end: { lon: endCoords[0], lat: endCoords[1] }
    });

    // Load OSM data from file
    const osmData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../DataSet/DataSet.geojson'), 'utf8')
    );
    console.log('Loaded OSM data with', osmData.elements?.length, 'elements');

    // Build graph from OSM data
    const graph = geojsonToGraph(osmData);
    console.log('Built graph with', Object.keys(graph).length, 'nodes');

    // Find nearest nodes using coordinates in [lon, lat] format
    const startNode = findNearestNode(graph, startCoords[1], startCoords[0]);
    const endNode = findNearestNode(graph, endCoords[1], endCoords[0]);
    
    console.log('Found nearest nodes:', { 
      startNode, 
      endNode,
      startCoords: [startCoords[0], startCoords[1]],
      endCoords: [endCoords[0], endCoords[1]]
    });

    if (!startNode || !endNode) {
      return res.status(404).json({ 
        error: 'Could not find valid start or end points near the given coordinates.',
        startFound: !!startNode,
        endFound: !!endNode,
        startCoords: [startCoords[0], startCoords[1]],
        endCoords: [endCoords[0], endCoords[1]],
        searchRadius: '50km',
        message: 'Please try coordinates closer to the road network or increase the search radius.'
      });
    }

    // Find K shortest paths
    const paths = yenKShortestPaths(graph, startNode, endNode, K);
    console.log('Found', paths.length, 'paths');

    if (!paths || paths.length === 0) {
      return res.status(404).json({ error: 'No paths found between the selected points.' });
    }

    // Format response - keep coordinates in [lon, lat] format
    const result = paths.map((route, idx) => ({
      id: idx + 1,
      distance: parseFloat(route.distance.toFixed(3)),
      path: route.path.map(coord => [coord[1], coord[0]]) // Convert from [lat, lon] to [lon, lat]
    }));

    console.log('Sending response with', result.length, 'routes');
    res.json({ routes: result });
  } catch (error) {
    console.error('Error in Graph controller:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = Graph;
