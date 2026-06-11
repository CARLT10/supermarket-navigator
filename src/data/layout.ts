export interface Rack {
  id: string;
  name: string;
  category: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  shelfCount: number;
}

export const STORE_SIZE = {
  width: 15,  // X axis: -7.5 to 7.5
  depth: 12,  // Z axis: -6.0 to 6.0
  height: 4,  // Y axis: ceiling height
};

export const RACKS: Rack[] = [
  {
    id: 'A1',
    name: 'Fruits',
    category: 'Fruits',
    x: -3.5,
    z: -3.0,
    width: 1.2,
    depth: 0.6,
    height: 2.0,
    shelfCount: 5,
  },
  {
    id: 'A2',
    name: 'Vegetables',
    category: 'Vegetables',
    x: 3.5,
    z: -3.0,
    width: 1.2,
    depth: 0.6,
    height: 2.0,
    shelfCount: 5,
  },
  {
    id: 'B1',
    name: 'Dairy',
    category: 'Dairy',
    x: -3.5,
    z: 0.0,
    width: 1.2,
    depth: 0.6,
    height: 2.0,
    shelfCount: 5,
  },
  {
    id: 'B2',
    name: 'Bakery',
    category: 'Bakery',
    x: 3.5,
    z: 0.0,
    width: 1.2,
    depth: 0.6,
    height: 2.0,
    shelfCount: 5,
  },
  {
    id: 'C1',
    name: 'Snacks',
    category: 'Snacks',
    x: -3.5,
    z: 3.0,
    width: 1.2,
    depth: 0.6,
    height: 2.0,
    shelfCount: 5,
  },
  {
    id: 'C2',
    name: 'Beverages',
    category: 'Beverages',
    x: 3.5,
    z: 3.0,
    width: 1.2,
    depth: 0.6,
    height: 2.0,
    shelfCount: 5,
  },
];

export const ENTRANCE = { x: 0.0, z: 5.5 };
export const BILLING_COUNTER = { x: -3.5, z: 4.8 };
export const EXIT = { x: -5.0, z: 5.5 };
