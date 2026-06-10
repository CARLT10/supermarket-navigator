export interface GraphNode {
  id: string;
  name: string;
  x: number;
  z: number;
}

export const GRAPH_NODES: Record<string, GraphNode> = {
  // Entrances and Exits
  'entrance': { id: 'entrance', name: 'Supermarket Entrance', x: 0.0, z: 7.0 },
  'exit': { id: 'exit', name: 'Supermarket Exit', x: -5.0, z: 7.0 },
  'billing': { id: 'billing', name: 'Billing Counter', x: -3.5, z: 6.4 },

  // Front Perimeter Aisle Intersections
  'front_left': { id: 'front_left', name: 'Front-Left Aisle', x: -5.8, z: 6.4 },
  'front_center': { id: 'front_center', name: 'Front-Center Aisle', x: 0.0, z: 6.4 },
  'front_right': { id: 'front_right', name: 'Front-Right Aisle', x: 5.8, z: 6.4 },

  // Mid-Front (B-C Horizontal Aisle) Intersections
  'mid_front_left': { id: 'mid_front_left', name: 'Mid-Front Left Aisle', x: -5.8, z: 2.0 },
  'mid_front_center': { id: 'mid_front_center', name: 'Center Crossroad (Aisle B-C)', x: 0.0, z: 2.0 },
  'mid_front_right': { id: 'mid_front_right', name: 'Mid-Front Right Aisle', x: 5.8, z: 2.0 },

  // Mid-Rear (A-B Horizontal Aisle) Intersections
  'mid_rear_left': { id: 'mid_rear_left', name: 'Mid-Rear Left Aisle', x: -5.8, z: -2.0 },
  'mid_rear_center': { id: 'mid_rear_center', name: 'Center Crossroad (Aisle A-B)', x: 0.0, z: -2.0 },
  'mid_rear_right': { id: 'mid_rear_right', name: 'Mid-Rear Right Aisle', x: 5.8, z: -2.0 },

  // Rear Perimeter Aisle Intersections
  'rear_left': { id: 'rear_left', name: 'Rear-Left Aisle', x: -5.8, z: -6.2 },
  'rear_center': { id: 'rear_center', name: 'Rear-Center Aisle', x: 0.0, z: -6.2 },
  'rear_right': { id: 'rear_right', name: 'Rear-Right Aisle', x: 5.8, z: -6.2 },

  // Rack Access Points
  // Rack A1 (Fruits) & A2 (Vegetables)
  'rack_A1_rear': { id: 'rack_A1_rear', name: 'Fruits Shelf Access (Rear Aisle)', x: -3.5, z: -6.2 },
  'rack_A1_front': { id: 'rack_A1_front', name: 'Fruits Shelf Access (Aisle A-B)', x: -3.5, z: -2.0 },
  'rack_A2_rear': { id: 'rack_A2_rear', name: 'Vegetables Shelf Access (Rear Aisle)', x: 3.5, z: -6.2 },
  'rack_A2_front': { id: 'rack_A2_front', name: 'Vegetables Shelf Access (Aisle A-B)', x: 3.5, z: -2.0 },

  // Rack B1 (Dairy) & B2 (Bakery)
  'rack_B1_rear': { id: 'rack_B1_rear', name: 'Dairy Shelf Access (Aisle A-B)', x: -3.5, z: -2.0 },
  'rack_B1_front': { id: 'rack_B1_front', name: 'Dairy Shelf Access (Aisle B-C)', x: -3.5, z: 2.0 },
  'rack_B2_rear': { id: 'rack_B2_rear', name: 'Bakery Shelf Access (Aisle A-B)', x: 3.5, z: -2.0 },
  'rack_B2_front': { id: 'rack_B2_front', name: 'Bakery Shelf Access (Aisle B-C)', x: 3.5, z: 2.0 },

  // Rack C1 (Snacks) & C2 (Beverages)
  'rack_C1_rear': { id: 'rack_C1_rear', name: 'Snacks Shelf Access (Aisle B-C)', x: -3.5, z: 2.0 },
  'rack_C1_front': { id: 'rack_C1_front', name: 'Snacks Shelf Access (Front Aisle)', x: -3.5, z: 5.2 },
  'rack_C2_rear': { id: 'rack_C2_rear', name: 'Beverages Shelf Access (Aisle B-C)', x: 3.5, z: 2.0 },
  'rack_C2_front': { id: 'rack_C2_front', name: 'Beverages Shelf Access (Front Aisle)', x: 3.5, z: 5.2 },
};

// Define bi-directional adjacency list with actual distances
export const GRAPH_EDGES: Record<string, string[]> = {
  'entrance': ['front_center'],
  'front_center': ['entrance', 'billing', 'front_left', 'front_right', 'mid_front_center', 'rack_C1_front', 'rack_C2_front'],
  'billing': ['front_center', 'front_left', 'rack_C1_front'],
  'exit': ['front_left'],

  'front_left': ['exit', 'billing', 'front_center', 'mid_front_left', 'rack_C1_front'],
  'front_right': ['front_center', 'mid_front_right', 'rack_C2_front'],

  // Rack access nodes on Front Aisle
  'rack_C1_front': ['front_left', 'billing', 'front_center'],
  'rack_C2_front': ['front_center', 'front_right'],

  // Mid-Front Horizontal Aisle (Z = 2.0)
  'mid_front_left': ['front_left', 'mid_rear_left', 'rack_C1_rear', 'rack_B1_front'],
  'mid_front_center': ['front_center', 'mid_rear_center', 'rack_C1_rear', 'rack_B1_front', 'rack_C2_rear', 'rack_B2_front'],
  'mid_front_right': ['front_right', 'mid_rear_right', 'rack_C2_rear', 'rack_B2_front'],

  // Rack access nodes on Aisle B-C (Z = 2.0)
  'rack_C1_rear': ['mid_front_left', 'mid_front_center'],
  'rack_B1_front': ['mid_front_left', 'mid_front_center'],
  'rack_C2_rear': ['mid_front_center', 'mid_front_right'],
  'rack_B2_front': ['mid_front_center', 'mid_front_right'],

  // Mid-Rear Horizontal Aisle (Z = -2.0)
  'mid_rear_left': ['mid_front_left', 'rear_left', 'rack_B1_rear', 'rack_A1_front'],
  'mid_rear_center': ['mid_front_center', 'rear_center', 'rack_B1_rear', 'rack_A1_front', 'rack_B2_rear', 'rack_A2_front'],
  'mid_rear_right': ['mid_front_right', 'rear_right', 'rack_B2_rear', 'rack_A2_front'],

  // Rack access nodes on Aisle A-B (Z = -2.0)
  'rack_B1_rear': ['mid_rear_left', 'mid_rear_center'],
  'rack_A1_front': ['mid_rear_left', 'mid_rear_center'],
  'rack_B2_rear': ['mid_rear_center', 'mid_rear_right'],
  'rack_A2_front': ['mid_rear_center', 'mid_rear_right'],

  // Rear Perimeter Aisle (Z = -6.2)
  'rear_left': ['mid_rear_left', 'rack_A1_rear'],
  'rear_center': ['mid_rear_center', 'rack_A1_rear', 'rack_A2_rear'],
  'rear_right': ['mid_rear_right', 'rack_A2_rear'],

  // Rack access nodes on Rear Aisle (Z = -6.2)
  'rack_A1_rear': ['rear_left', 'rear_center'],
  'rack_A2_rear': ['rear_center', 'rear_right'],
};

// Calculate Euclidean distance between two nodes
export function getDistance(nodeA: GraphNode, nodeB: GraphNode): number {
  const dx = nodeA.x - nodeB.x;
  const dz = nodeA.z - nodeB.z;
  return Math.sqrt(dx * dx + dz * dz);
}
