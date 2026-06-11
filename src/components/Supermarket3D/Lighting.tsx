import React from 'react';

export const Lighting: React.FC = () => {
  return (
    <group>
      {/* General Ambient Light */}
      <ambientLight intensity={0.65} />

      {/* Main Overhead Directional Light (Sun/Ceiling Grid style) */}
      <directionalLight
        position={[8, 12, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />

      {/* Secondary Directional Light for Fill */}
      <directionalLight
        position={[-8, 10, -5]}
        intensity={0.3}
      />

      {/* Simulated Aisle Spotlights */}
      <pointLight position={[-3.5, 3.5, 0]} intensity={0.5} distance={8} decay={2} />
      <pointLight position={[3.5, 3.5, 0]} intensity={0.5} distance={8} decay={2} />
      <pointLight position={[0, 3.5, 3.0]} intensity={0.4} distance={6} decay={2} />
      <pointLight position={[0, 3.5, -3.0]} intensity={0.4} distance={6} decay={2} />
    </group>
  );
};
