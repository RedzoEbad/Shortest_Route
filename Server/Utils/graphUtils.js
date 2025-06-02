// graphUtils.js
function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  // Convert to radians
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  // Haversine formula
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  console.log('Distance calculation:', {
    point1: { lat: lat1, lon: lon1 },
    point2: { lat: lat2, lon: lon2 },
    distance: distance
  });

  return distance;
}

function findNearestNode(graph, lat, lon) {
  let minDist = Infinity;
  let nearestNode = null;

  // Input coordinates are in [lat, lon] format
  console.log('Finding nearest node for coordinates:', { lat, lon });

  // Check each node in the graph
  for (const nodeKey of Object.keys(graph)) {
    const [nodeLat, nodeLon] = nodeKey.split(',').map(Number);
    
    // Calculate distance using [lat, lon] format for both points
    const dist = haversineDistance([lat, lon], [nodeLat, nodeLon]);
    
    if (dist < minDist) {
      minDist = dist;
      nearestNode = nodeKey;
      console.log('Found closer node:', { 
        nodeKey, 
        distance: dist.toFixed(2) + 'km',
        nodeCoords: [nodeLat, nodeLon]
      });
    }
  }

  console.log('Nearest node found:', { 
    node: nearestNode, 
    distance: minDist.toFixed(2) + 'km',
    searchRadius: '50km'
  });

  // Return null if no node found within 50km
  return minDist <= 50 ? nearestNode : null;
}

function geojsonToGraph(osmData) {
  const graph = {};
  const nodeMap = {};

  // First pass: build node map
  osmData.elements.forEach(el => {
    if (el.type === 'node') {
      // Store coordinates as [lat, lon] in the node map
      nodeMap[el.id] = [el.lat, el.lon];
    }
  });

  console.log('Node map sample:', Object.entries(nodeMap).slice(0, 3));

  // Second pass: build graph from ways
  osmData.elements.forEach(el => {
    if (el.type === 'way' && el.nodes && el.nodes.length >= 2) {
      const nodes = el.nodes.map(id => nodeMap[id]).filter(Boolean);
      
      // Skip ways with missing nodes
      if (nodes.length < 2) return;

      // Add edges for each pair of consecutive nodes
      for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i];
        const to = nodes[i + 1];
        
        const fromKey = from.join(',');
        const toKey = to.join(',');
        const dist = haversineDistance(from, to);

        // Initialize arrays if they don't exist
        if (!graph[fromKey]) graph[fromKey] = [];
        if (!graph[toKey]) graph[toKey] = [];

        // Add bidirectional edges
        graph[fromKey].push({ node: toKey, distance: dist });
        graph[toKey].push({ node: fromKey, distance: dist });
      }
    }
  });

  console.log('Graph sample:', Object.entries(graph).slice(0, 3));
  return graph;
}

function dijkstra(graph, start, end, excludedEdges = new Set()) {
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  // Initialize distances
  for (const node in graph) {
    distances[node] = Infinity;
    unvisited.add(node);
  }
  distances[start] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current = null;
    let minDist = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDist) {
        minDist = distances[node];
        current = node;
      }
    }

    if (current === null || current === end) break;

    unvisited.delete(current);

    // Update distances to neighbors
    for (const { node: neighbor, distance } of graph[current]) {
      if (!unvisited.has(neighbor)) continue;
      
      // Skip excluded edges
      const edgeKey = `${current}-${neighbor}`;
      if (excludedEdges.has(edgeKey)) continue;

      const newDist = distances[current] + distance;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor] = current;
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = end;
  while (current) {
    path.unshift(current.split(',').map(Number));
    current = previous[current];
  }

  return {
    path,
    distance: distances[end]
  };
}

function yenKShortestPaths(graph, start, end, k = 3) {
  const paths = [];
  const usedPaths = new Set();
  const excludedEdges = new Set();

  // Get initial shortest path
  const initialPath = dijkstra(graph, start, end);
  if (!initialPath.path.length) return paths;

  paths.push(initialPath);
  usedPaths.add(initialPath.path.map(p => p.join(',')).join('|'));

  // Find k-1 more paths
  for (let i = 1; i < k; i++) {
    let bestPath = null;
    let bestDistance = Infinity;

    // Try removing each edge in the previous paths
    for (const prevPath of paths) {
      for (let j = 0; j < prevPath.path.length - 1; j++) {
        const from = prevPath.path[j].join(',');
        const to = prevPath.path[j + 1].join(',');
        const edgeKey = `${from}-${to}`;
        
        // Skip if we've already tried excluding this edge
        if (excludedEdges.has(edgeKey)) continue;
        
        excludedEdges.add(edgeKey);
        const newPath = dijkstra(graph, start, end, excludedEdges);
        excludedEdges.delete(edgeKey);

        if (!newPath.path.length) continue;

        const pathKey = newPath.path.map(p => p.join(',')).join('|');
        
        // Check if path is valid and unique
        if (!usedPaths.has(pathKey) && newPath.distance < bestDistance) {
          bestPath = newPath;
          bestDistance = newPath.distance;
        }
      }
    }

    if (bestPath) {
      paths.push(bestPath);
      usedPaths.add(bestPath.path.map(p => p.join(',')).join('|'));
    } else {
      break; // No more paths found
    }
  }

  console.log('Found paths:', paths.map(p => ({
    distance: p.distance.toFixed(2) + 'km',
    points: p.path.length
  })));

  return paths;
}

module.exports = { 
  haversineDistance, 
  geojsonToGraph, 
  findNearestNode,
  dijkstra,
  yenKShortestPaths 
};
