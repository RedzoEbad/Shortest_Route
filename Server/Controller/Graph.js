const fs = require('fs');
const path = require('path');
const { geojsonToGraph, findNearestNode, yenKShortestPaths } = require('../Utils/graphUtils');

const Graph = async (req, res) => {
  try {
    const { startCoords, endCoords, K = 3 } = req.body;

    if (
      !Array.isArray(startCoords) || startCoords.length !== 2 ||
      !Array.isArray(endCoords) || endCoords.length !== 2
    ) {
      return res.status(400).json({
        error: 'Invalid input: startCoords and endCoords must be arrays in [lon, lat] format.'
      });
    }

    const [startLon, startLat] = startCoords;
    const [endLon, endLat] = endCoords;

    console.log('📍 Received coordinates:', {
      start: { lon: startLon, lat: startLat },
      end: { lon: endLon, lat: endLat }
    });

    const geojsonPath = path.join(__dirname, '..', 'DataSet', 'DataSet.geojson');
    const geojsonRaw = fs.readFileSync(geojsonPath, 'utf8');
    const geojsonData = JSON.parse(geojsonRaw);

    const graph = geojsonToGraph(geojsonData);
    console.log(`🗺️  Graph built with ${Object.keys(graph).length} nodes`);

    const startNode = findNearestNode(graph, startLat, startLon);
    const endNode = findNearestNode(graph, endLat, endLon);

    if (!startNode || !endNode) {
      return res.status(404).json({
        error: 'Could not find valid graph nodes near provided coordinates.'
      });
    }

    console.log('✅ Nearest nodes found:', { startNode, endNode });
    console.log(`🔍 Finding top ${K} paths from ${startNode} to ${endNode}...`);

    const paths = yenKShortestPaths(graph, startNode, endNode, K);

    if (!paths || paths.length === 0) {
      return res.status(404).json({ error: 'No paths found between the selected points.' });
    }

    const result = paths.map((route, index) => {
      const formattedPath = route.path.map(coord => {
        if (Array.isArray(coord) && coord.length === 2) {
          const [lat, lon] = coord;
          return [lon, lat]; // [lon, lat] format
        }
        return null;
      }).filter(Boolean);

      if (formattedPath.length === 1) {
        const [lon, lat] = formattedPath[0];
        formattedPath.push([lon + 0.0001, lat + 0.0001]);
      }

      return {
        id: index + 1,
        distance: parseFloat(route.distance.toFixed(3)),
        path: formattedPath
      };
    });

    res.json({ routes: result });

  } catch (error) {
    console.error('❌ Error in Graph controller:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = Graph;
