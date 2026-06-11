import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UserMarkerProps {
  position: [number, number, number];
  isWalking?: boolean;
  facingAngle?: number; // radians, direction avatar faces
}

export const UserMarker: React.FC<UserMarkerProps> = ({
  position,
  isWalking = false,
  facingAngle = 0,
}) => {
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Smoothly interpolate facing angle
  const currentFacingAngle = useRef(facingAngle);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Smoothly rotate avatar to face movement direction
    if (groupRef.current) {
      // Shortest-path angle interpolation
      let diff = facingAngle - currentFacingAngle.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      currentFacingAngle.current += diff * 0.15;
      groupRef.current.rotation.y = currentFacingAngle.current;
    }

    // 1. Pulse the ground ring
    if (pulseRingRef.current) {
      const scale = 1.0 + Math.sin(elapsed * 4.0) * 0.15;
      pulseRingRef.current.scale.set(scale, scale, 1);
      const opacity = 0.45 - Math.sin(elapsed * 4.0) * 0.15;
      if (pulseRingRef.current.material && !Array.isArray(pulseRingRef.current.material)) {
        (pulseRingRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      }
    }

    // 2. Animate limbs
    if (isWalking) {
      const swingSpeed = 10.0;
      const swingAngle = Math.sin(elapsed * swingSpeed) * 0.5;

      if (leftLegRef.current) leftLegRef.current.rotation.x = swingAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swingAngle;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swingAngle * 0.7;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swingAngle * 0.7;

      if (bodyRef.current) {
        bodyRef.current.position.y = 0.04 + Math.abs(Math.sin(elapsed * swingSpeed)) * 0.03;
        bodyRef.current.rotation.z = Math.sin(elapsed * swingSpeed * 0.5) * 0.03;
      }
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.85;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.85;
      if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.85;
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.85;

      if (bodyRef.current) {
        bodyRef.current.position.y = 0.04 + Math.sin(elapsed * 1.8) * 0.01;
        bodyRef.current.rotation.z *= 0.9;
      }
    }
  });

  return (
    <group position={position}>
      {/* GROUND RINGS */}
      <mesh ref={pulseRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[0.1, 32]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
      </mesh>

      {/* AVATAR — rotates to face movement direction */}
      <group ref={groupRef}>
        <group ref={bodyRef} position={[0, 0.04, 0]}>
          {/* Shoes */}
          <mesh position={[-0.06, 0.02, 0.01]} castShadow>
            <boxGeometry args={[0.04, 0.03, 0.09]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          <mesh position={[0.06, 0.02, 0.01]} castShadow>
            <boxGeometry args={[0.04, 0.03, 0.09]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>

          {/* Legs */}
          <mesh ref={leftLegRef} position={[-0.06, 0.13, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.2, 10]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
          <mesh ref={rightLegRef} position={[0.06, 0.13, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.2, 10]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>

          {/* Torso */}
          <mesh position={[0, 0.34, 0]} castShadow>
            <boxGeometry args={[0.2, 0.26, 0.12]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.1} />
          </mesh>

          {/* Arms */}
          <mesh ref={leftArmRef} position={[-0.13, 0.33, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.2, 8]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
          <mesh ref={rightArmRef} position={[0.13, 0.33, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.2, 8]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>

          {/* Head */}
          <mesh position={[0, 0.54, 0]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.3} />
          </mesh>

          {/* Cap */}
          <group position={[0, 0.61, 0]}>
            <mesh position={[0, 0.01, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.028, 16]} />
              <meshStandardMaterial color="#be123c" roughness={0.4} />
            </mesh>
            {/* Brim pointing forward (Z+) */}
            <mesh position={[0, -0.005, 0.058]} rotation={[0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.12, 0.007, 0.075]} />
              <meshStandardMaterial color="#be123c" roughness={0.4} />
            </mesh>
          </group>

          {/* Direction indicator arrow — points forward (Z+) */}
          {isWalking && (
            <mesh position={[0, 0.05, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.04, 0.1, 6]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};
