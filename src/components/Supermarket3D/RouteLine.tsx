import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { type GraphNode } from '../../data/graph';

interface RouteLineProps {
  path: GraphNode[];
}

export const RouteLine: React.FC<RouteLineProps> = ({ path }) => {
  const lineRef = useRef<any>(null);

  useFrame((state) => {
    if (lineRef.current && lineRef.current.material) {
      // Animate the dash offset to make the line look like it is flowing
      const elapsed = state.clock.getElapsedTime();
      lineRef.current.material.dashOffset = -elapsed * 0.8;
    }
  });

  if (path.length < 2) return null;

  // Map graph nodes to 3D coordinate arrays [x, y, z]
  // We raise Y slightly to 0.05m to prevent z-fighting with the floor
  const points = path.map((node) => new THREE.Vector3(node.x, 0.06, node.z));

  return (
    <group>
      {/* Glow path line */}
      <Line
        ref={lineRef}
        points={points}
        color="#38bdf8"
        lineWidth={6}
        dashed
        dashScale={5}
        dashSize={0.4}
        gapSize={0.2}
      />

      {/* Outer shadow/outline path line for premium depth */}
      <Line
        points={points}
        color="#1d4ed8"
        lineWidth={8}
        opacity={0.3}
        transparent
      />
    </group>
  );
};
