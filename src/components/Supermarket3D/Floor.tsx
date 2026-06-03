import React from 'react';

interface WallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  length: number;
  thickness?: number;
  height?: number;
}

const Wall: React.FC<WallProps> = ({ 
  position, 
  rotation = [0, 0, 0], 
  length, 
  thickness = 0.15, 
  height = 2.2 
}) => {
  const baseHeight = 0.15;
  const topHeight = 0.15;
  const glassHeight = height - baseHeight - topHeight;

  return (
    <group position={position} rotation={rotation}>
      {/* Baseboard */}
      <mesh position={[0, baseHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, baseHeight, thickness]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.2} />
      </mesh>
      
      {/* Glass Pane */}
      <mesh position={[0, baseHeight + glassHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, glassHeight, thickness - 0.02]} />
        <meshStandardMaterial 
          color="#94a3b8" 
          transparent 
          opacity={0.25} 
          roughness={0.1} 
          metalness={0.8} 
        />
      </mesh>

      {/* Top Cap */}
      <mesh position={[0, height - topHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, topHeight, thickness]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
};

export const Floor: React.FC = () => {
  return (
    <group>
      {/* Main Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[15, 12]} />
        <meshStandardMaterial 
          color="#f8fafc" 
          roughness={0.15} 
          metalness={0.02} 
        />
      </mesh>

      {/* Grid helper for tile effect */}
      <gridHelper 
        args={[15, 15, '#cbd5e1', '#e2e8f0']} 
        position={[0, 0.001, 0]} 
      />

      {/* Store boundary walls - 2.2m tall glass & metal frames */}
      {/* Back Wall */}
      <Wall position={[0, 0, -6]} length={15} />

      {/* Front Wall with Entrance gap */}
      <Wall position={[-4.5, 0, 6]} length={6} />
      <Wall position={[4.5, 0, 6]} length={6} />

      {/* Left Wall */}
      <Wall position={[-7.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} length={12} />

      {/* Right Wall */}
      <Wall position={[7.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} length={12} />
    </group>
  );
};
