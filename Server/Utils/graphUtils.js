const haversine = require('haversine-distance');

// Convert GeoJSON to graph
function geojsonToGraph(geojson) {
  const graph = {};

  geojson.features.forEach(feature => {
    const geometry = feature.geometry;

    if (!geometry) return;

    let lines = [];

    if (geometry.type === 'LineString') {
      lines.push(geometry.coordinates);
    } else if (geometry.type === 'MultiLineString') {
      lines = lines.concat(geometry.coordinates);
    } else {
      // Skip unsupported geometry types
      return;
    }

    lines.forEach(coords => {
      for (let i = 0; i < coords.length - 1; i++) {
        const [lon1, lat1] = coords[i];
        const [lon2, lat2] = coords[i + 1];

        const key1 = `${lon1},${lat1}`;
        const key2 = `${lon2},${lat2}`;

        const dist = haversine([lon1, lat1], [lon2, lat2]);

        if (!graph[key1]) graph[key1] = [];
        if (!graph[key2]) graph[key2] = [];

        graph[key1].push({ node: key2, weight: dist });
        graph[key2].push({ node: key1, weight: dist }); // Bidirectional
      }
    });
  });

  return graph;
}
// Nearest node finder
function findNearestNode(graph, lat, lon) {
  const target = [lon, lat];
  let minDist = Infinity;
  let nearest = null;

  for (const key of Object.keys(graph)) {
    const [nodeLon, nodeLat] = key.split(',').map(Number);
    const dist = haversine(target, [nodeLon, nodeLat]);

    if (dist < minDist) {
      minDist = dist;
      nearest = key;
    }
  }

  return nearest;
}

// Dijkstra's algorithm
function dijkstra(graph, start, end) {
  const distances = {};
  const prev = {};
  const queue = new Set(Object.keys(graph));

  for (const node of queue) {
    distances[node] = Infinity;
  }
  distances[start] = 0;

  while (queue.size) {
    const current = [...queue].reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );
    queue.delete(current);

    if (current === end) break;

    for (const neighbor of graph[current]) {
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        prev[neighbor.node] = current;
      }
    }
  }

  const path = [];
  let u = end;
  while (u) {
    path.unshift(u.split(',').map(Number).reverse()); // Convert to [lat, lon]
    u = prev[u];
  }

  return { path, distance: distances[end] };
}

// Yen's K-Shortest Paths
function yenKShortestPaths(graph, start, end, K) {
  const paths = [];
  const { path, distance } = dijkstra(graph, start, end);
  if (!path.length) return [];

  paths.push({ path, distance });
  const candidates = [];

  for (let k = 1; k < K; k++) {
    const prevPath = paths[k - 1].path;

    for (let i = 0; i < prevPath.length - 1; i++) {
      const spurNode = prevPath[i];
      const rootPath = prevPath.slice(0, i + 1).map(p => `${p[1]},${p[0]}`); // back to "lon,lat"

      const tempGraph = JSON.parse(JSON.stringify(graph));

      for (const p of paths) {
        const pRoot = p.path.slice(0, i + 1).map(c => `${c[1]},${c[0]}`).join(',');
        const rootStr = rootPath.join(',');
        if (pRoot === rootStr) {
          const u = `${p.path[i][1]},${p.path[i][0]}`;
          const v = `${p.path[i + 1][1]},${p.path[i + 1][0]}`;
          tempGraph[u] = tempGraph[u].filter(n => n.node !== v);
        }
      }

      const spur = `${spurNode[1]},${spurNode[0]}`;
      const { path: spurPath, distance: spurDistance } = dijkstra(tempGraph, spur, end);
      if (!spurPath.length) continue;

      const totalPath = rootPath.map(r => r.split(',').map(Number).reverse()).concat(spurPath.slice(1));
      const rootDistance = rootPath.reduce((acc, _, j, arr) => {
        if (j === 0) return 0;
        const a = arr[j - 1].split(',').map(Number);
        const b = arr[j].split(',').map(Number);
        return acc + haversine([a[0], a[1]], [b[0], b[1]]);
      }, 0);

      candidates.push({
        path: totalPath,
        distance: rootDistance + spurDistance
      });
    }

    if (!candidates.length) break;

    candidates.sort((a, b) => a.distance - b.distance);
    paths.push(candidates.shift());
  }

  return paths;
}

module.exports = {
  geojsonToGraph,
  findNearestNode,
  yenKShortestPaths
};
