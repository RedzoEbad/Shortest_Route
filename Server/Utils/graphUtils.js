const haversine = require("haversine-distance");

const NODE_PRECISION = 6;
const CONNECT_THRESHOLD_M = 1000; // link nearby road endpoints (meters)
const AVG_SPEED_KMH = 28; // city traffic estimate

const toKey = (lon, lat) =>
  `${Number(lon).toFixed(NODE_PRECISION)},${Number(lat).toFixed(NODE_PRECISION)}`;

const parseKey = (key) => {
  const [lon, lat] = key.split(",").map(Number);
  return { lon, lat };
};

const distanceMeters = (lon1, lat1, lon2, lat2) =>
  haversine([lon1, lat1], [lon2, lat2]);

const addEdge = (graph, lon1, lat1, lon2, lat2, segmentCoords = null) => {
  const key1 = toKey(lon1, lat1);
  const key2 = toKey(lon2, lat2);
  if (key1 === key2) return;

  const weight = distanceMeters(lon1, lat1, lon2, lat2);
  const coords = segmentCoords || [
    [lon1, lat1],
    [lon2, lat2],
  ];

  if (!graph[key1]) graph[key1] = [];
  if (!graph[key2]) graph[key2] = [];

  if (!graph[key1].some((e) => e.node === key2)) {
    graph[key1].push({ node: key2, weight, coords });
  }
  if (!graph[key2].some((e) => e.node === key1)) {
    graph[key2].push({ node: key1, weight, coords: [...coords].reverse() });
  }
};

function geojsonToGraph(geojson) {
  const graph = {};

  geojson.features.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry) return;

    if (geometry.type === "LineString") {
      const coords = geometry.coordinates;
      for (let i = 0; i < coords.length - 1; i++) {
        const [lon1, lat1] = coords[i];
        const [lon2, lat2] = coords[i + 1];
        addEdge(graph, lon1, lat1, lon2, lat2);
      }
    } else if (geometry.type === "MultiLineString") {
      geometry.coordinates.forEach((coords) => {
        for (let i = 0; i < coords.length - 1; i++) {
          const [lon1, lat1] = coords[i];
          const [lon2, lat2] = coords[i + 1];
          addEdge(graph, lon1, lat1, lon2, lat2);
        }
      });
    } else if (geometry.type === "Point") {
      const [lon, lat] = geometry.coordinates;
      const key = toKey(lon, lat);
      if (!graph[key]) graph[key] = [];
    }
  });

  connectNearbyNodes(graph, CONNECT_THRESHOLD_M);
  return graph;
}

function connectNearbyNodes(graph, maxDistanceMeters) {
  const keys = Object.keys(graph);

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = parseKey(keys[i]);
      const b = parseKey(keys[j]);
      const dist = distanceMeters(a.lon, a.lat, b.lon, b.lat);

      if (dist > 0 && dist <= maxDistanceMeters) {
        const alreadyLinked = graph[keys[i]].some((e) => e.node === keys[j]);
        if (!alreadyLinked) {
          addEdge(graph, a.lon, a.lat, b.lon, b.lat);
        }
      }
    }
  }
}

function findNearestNode(graph, lat, lon) {
  const keys = Object.keys(graph);
  if (!keys.length) return null;

  let minDist = Infinity;
  let nearest = null;

  for (const key of keys) {
    const node = parseKey(key);
    const dist = distanceMeters(lon, lat, node.lon, node.lat);
    if (dist < minDist) {
      minDist = dist;
      nearest = key;
    }
  }

  return nearest ? { key: nearest, distance: minDist, ...parseKey(nearest) } : null;
}

function dijkstra(graph, start, end) {
  if (!graph[start] || !graph[end]) {
    return null;
  }

  const distances = {};
  const prev = {};
  const visited = new Set();

  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
  }
  distances[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let current = null;
    let best = Infinity;

    for (const node of Object.keys(graph)) {
      if (!visited.has(node) && distances[node] < best) {
        best = distances[node];
        current = node;
      }
    }

    if (current === null || best === Infinity) break;
    if (current === end) break;

    visited.add(current);

    for (const neighbor of graph[current] || []) {
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        prev[neighbor.node] = current;
      }
    }
  }

  if (!Number.isFinite(distances[end])) {
    return null;
  }

  const path = [];
  let node = end;
  while (node) {
    const { lon, lat } = parseKey(node);
    path.unshift([lon, lat]);
    node = prev[node];
  }

  if (path.length === 0 || toKey(path[0][0], path[0][1]) !== start) {
    return null;
  }

  return { path, distance: distances[end] };
}

function pathSignature(path) {
  return path.map(([lon, lat]) => toKey(lon, lat)).join("|");
}

function yenKShortestPaths(graph, start, end, K = 3) {
  const first = dijkstra(graph, start, end);
  if (!first) return [];

  const results = [first];
  const candidates = [];

  for (let k = 1; k < K; k++) {
    const previousPath = results[k - 1].path;

    for (let i = 0; i < previousPath.length - 1; i++) {
      const spurNodeKey = toKey(
        previousPath[i][0],
        previousPath[i][1]
      );
      const rootPath = previousPath.slice(0, i + 1);

      const removedEdges = [];

      for (const result of results) {
        const resultKeys = result.path.map(([lon, lat]) => toKey(lon, lat));
        const matchesRoot = rootPath.every(
          ([lon, lat], idx) => toKey(lon, lat) === resultKeys[idx]
        );

        if (matchesRoot && result.path.length > i + 1) {
          const fromKey = resultKeys[i];
          const toKeyStr = resultKeys[i + 1];
          const edgeList = graph[fromKey];
          const edgeIndex = edgeList?.findIndex((e) => e.node === toKeyStr) ?? -1;

          if (edgeIndex >= 0) {
            removedEdges.push({
              fromKey,
              edge: edgeList[edgeIndex],
            });
            edgeList.splice(edgeIndex, 1);
          }
        }
      }

      const spurPath = dijkstra(graph, spurNodeKey, end);

      for (const { fromKey, edge } of removedEdges) {
        graph[fromKey].push(edge);
      }

      if (!spurPath) continue;

      const combinedPath = rootPath.slice(0, -1).concat(spurPath.path);
      const combinedDistance =
        rootPathDistance(graph, rootPath) + spurPath.distance;

      const signature = pathSignature(combinedPath);
      const duplicate =
        results.some((r) => pathSignature(r.path) === signature) ||
        candidates.some((c) => pathSignature(c.path) === signature);

      if (!duplicate) {
        candidates.push({ path: combinedPath, distance: combinedDistance });
      }
    }

    if (!candidates.length) break;

    candidates.sort((a, b) => a.distance - b.distance);
    results.push(candidates.shift());
  }

  return results;
}

function rootPathDistance(graph, path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const from = toKey(path[i][0], path[i][1]);
    const to = toKey(path[i + 1][0], path[i + 1][1]);
    const edge = graph[from]?.find((e) => e.node === to);
    if (edge) total += edge.weight;
  }
  return total;
}

function estimateDurationMinutes(distanceMeters) {
  const hours = distanceMeters / 1000 / AVG_SPEED_KMH;
  return Math.max(1, Math.round(hours * 60));
}

function buildDisplayPath(graph, startLon, startLat, endLon, endLat, nodePath) {
  const path = [[startLon, startLat]];
  const keys = nodePath.map(([lon, lat]) => toKey(lon, lat));

  const pushCoord = (lon, lat) => {
    const last = path[path.length - 1];
    if (
      Math.abs(last[0] - lon) > 1e-7 ||
      Math.abs(last[1] - lat) > 1e-7
    ) {
      path.push([lon, lat]);
    }
  };

  for (let i = 0; i < keys.length - 1; i++) {
    const from = keys[i];
    const to = keys[i + 1];
    const edge = graph[from]?.find((e) => e.node === to);

    if (edge?.coords?.length) {
      edge.coords.forEach(([lon, lat]) => pushCoord(lon, lat));
    } else {
      const end = parseKey(to);
      pushCoord(end.lon, end.lat);
    }
  }

  pushCoord(endLon, endLat);
  return path;
}

function findRoutes(graph, startLon, startLat, endLon, endLat, K = 3) {
  const startSnap = findNearestNode(graph, startLat, startLon);
  const endSnap = findNearestNode(graph, endLat, endLon);

  if (!startSnap || !endSnap) {
    return { error: "Road network is not available. Please try again later." };
  }

  const warnings = [];
  if (startSnap.distance > 1500) {
    warnings.push(
      `Your pickup GPS was ${(startSnap.distance / 1000).toFixed(1)} km from Clifton roads — snapped to the nearest road on our map.`
    );
  }
  if (endSnap.distance > 1500) {
    warnings.push(
      `Destination was ${(endSnap.distance / 1000).toFixed(1)} km from roads — snapped to the nearest point.`
    );
  }

  const paths = yenKShortestPaths(
    graph,
    startSnap.key,
    endSnap.key,
    K
  );

  if (!paths.length) {
    return { error: "No drivable route found between these locations." };
  }

  const routes = paths.map((route, index) => {
    const path = buildDisplayPath(
      graph,
      startLon,
      startLat,
      endLon,
      endLat,
      route.path
    );

    const snapExtra = startSnap.distance + endSnap.distance;
    const totalMeters = route.distance + snapExtra;

    return {
      id: index + 1,
      rank: index + 1,
      label:
        index === 0
          ? "1st — Fastest route"
          : index === 1
            ? "2nd — Alternative route"
            : "3rd — Another option",
      description:
        index === 0
          ? "Recommended · Shortest distance"
          : index === 1
            ? "Different roads · Similar ETA"
            : "Extra alternative · Compare on map",
      distanceKm: parseFloat((totalMeters / 1000).toFixed(2)),
      durationMin: estimateDurationMinutes(totalMeters),
      path,
    };
  });

  return { routes, snap: { start: startSnap, end: endSnap }, warnings };
}

module.exports = {
  geojsonToGraph,
  findNearestNode,
  yenKShortestPaths,
  findRoutes,
  toKey,
};
