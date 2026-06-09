import { GRAPH_NODES, GRAPH_EDGES, getDistance, type GraphNode } from '../data/graph';

export interface PathfindingResult {
  path: GraphNode[];
  distance: number;
}

export function findShortestPath(startId: string, endId: string): PathfindingResult {
  // If start and end are same, return simple path
  if (startId === endId) {
    const node = GRAPH_NODES[startId];
    return { path: node ? [node] : [], distance: 0 };
  }

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  // Initialize
  Object.keys(GRAPH_NODES).forEach((nodeId) => {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  });

  distances[startId] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with the minimum distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach((nodeId) => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentId = nodeId;
      }
    });

    // If we can't reach any more nodes or reached destination
    if (currentId === null || currentId === endId) {
      break;
    }

    unvisited.delete(currentId);

    const neighbors = GRAPH_EDGES[currentId] || [];
    for (const neighborId of neighbors) {
      if (!unvisited.has(neighborId)) continue;

      const currentNode = GRAPH_NODES[currentId];
      const neighborNode = GRAPH_NODES[neighborId];
      if (!currentNode || !neighborNode) continue;

      const edgeWeight = getDistance(currentNode, neighborNode);
      const alt = distances[currentId] + edgeWeight;

      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = currentId;
      }
    }
  }

  // Reconstruct path
  const path: GraphNode[] = [];
  let currentId: string | null = endId;

  if (distances[endId] === Infinity) {
    // No path found
    return { path: [], distance: 0 };
  }

  while (currentId !== null) {
    const node = GRAPH_NODES[currentId];
    if (node) {
      path.unshift(node);
    }
    currentId = previous[currentId];
  }

  return {
    path,
    distance: Number(distances[endId].toFixed(2)),
  };
}
