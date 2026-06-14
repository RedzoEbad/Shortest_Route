const fs = require("fs");
const path = require("path");
const { geojsonToGraph, findRoutes } = require("../Utils/graphUtils");

let cachedGraph = null;

const loadGraph = (force = false) => {
  if (cachedGraph && !force) return cachedGraph;

  const geojsonPath = path.join(__dirname, "..", "DataSet", "DataSet.geojson");
  const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, "utf8"));
  cachedGraph = geojsonToGraph(geojsonData);
  return cachedGraph;
};

const Graph = async (req, res) => {
  try {
    const { startCoords, endCoords, K = 3 } = req.body;

    if (
      !Array.isArray(startCoords) ||
      startCoords.length !== 2 ||
      !Array.isArray(endCoords) ||
      endCoords.length !== 2
    ) {
      return res.status(400).json({
        error:
          "Invalid input: startCoords and endCoords must be [longitude, latitude].",
      });
    }

    const [startLon, startLat] = startCoords.map(Number);
    const [endLon, endLat] = endCoords.map(Number);

    if ([startLon, startLat, endLon, endLat].some((n) => Number.isNaN(n))) {
      return res.status(400).json({ error: "Coordinates must be valid numbers." });
    }

    const graph = loadGraph();
    const result = findRoutes(graph, startLon, startLat, endLon, endLat, K);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      routes: result.routes,
      meta: {
        start: {
          lon: startLon,
          lat: startLat,
          snappedMeters: Math.round(result.snap.start.distance),
        },
        end: {
          lon: endLon,
          lat: endLat,
          snappedMeters: Math.round(result.snap.end.distance),
        },
      },
      warnings: result.warnings || [],
    });
  } catch (error) {
    console.error("[Graph] Error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

module.exports = Graph;
