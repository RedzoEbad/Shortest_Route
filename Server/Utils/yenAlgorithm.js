// yenAlgorithm.js
function dijkstra(graph, start, end) {
  const distances = {};
  const prev = {};
  const visited = new Set();
  const pq = [[0, start]];

  distances[start] = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [dist, node] = pq.shift();

    if (visited.has(node)) continue;
    visited.add(node);

    if (node === end) {
      const path = [];
      let curr = end;
      while (curr) {
        path.unshift(curr);
        curr = prev[curr];
      }
      return { path, distance: dist };
    }

    for (const neighbor of graph[node] || []) {
      const newDist = dist + neighbor.distance;
      if (newDist < (distances[neighbor.node] ?? Infinity)) {
        distances[neighbor.node] = newDist;
        prev[neighbor.node] = node;
        pq.push([newDist, neighbor.node]);
      }
    }
  }

  return null;
}

function yenKShortestPaths(graph, start, end, K = 3) {
  const kPaths = [];
  const basePath = dijkstra(graph, start, end);
  if (!basePath) return [];

  kPaths.push(basePath);
  const candidates = [];

  for (let k = 1; k < K; k++) {
    const lastPath = kPaths[k - 1].path;

    for (let i = 0; i < lastPath.length - 1; i++) {
      const spurNode = lastPath[i];
      const rootPath = lastPath.slice(0, i + 1);

      const removedEdges = [];

      for (const path of kPaths) {
        if (
          rootPath.join(',') === path.path.slice(0, i + 1).join(',') &&
          i + 1 < path.path.length
        ) {
          const u = path.path[i];
          const v = path.path[i + 1];
          const index = graph[u]?.findIndex((n) => n.node === v);
          if (index !== -1) {
            removedEdges.push({ u, edge: graph[u][index] });
            graph[u].splice(index, 1);
          }
        }
      }

      const spurResult = dijkstra(graph, spurNode, end);
      if (spurResult) {
        const totalPath = rootPath.slice(0, -1).concat(spurResult.path);
        const totalDistance =
          totalPath.reduce((acc, node, idx, arr) => {
            if (idx === 0) return acc;
            const from = arr[idx - 1];
            const to = node;
            const edge = graph[from]?.find((n) => n.node === to);
            return acc + (edge?.distance || 0);
          }, 0) || 0;

        if (!kPaths.find((p) => p.path.join() === totalPath.join())) {
          candidates.push({ path: totalPath, distance: totalDistance });
        }
      }

      // Restore removed edges
      for (const { u, edge } of removedEdges) {
        graph[u].push(edge);
      }
    }

    if (candidates.length === 0) break;

    candidates.sort((a, b) => a.distance - b.distance);
    kPaths.push(candidates.shift());
  }

  return kPaths;
}

module.exports = { dijkstra, yenKShortestPaths };
