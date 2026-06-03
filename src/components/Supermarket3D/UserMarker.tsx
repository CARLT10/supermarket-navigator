import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UserMarkerProps {
  position: [number, number, number];
  isWalking?: boolean;
}

export const UserMarker: React.FC<UserMarkerProps> = ({ position, isWalking = false }) => {
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // 1. Pulse the ground ring locator
    if (pulseRingRef.current) {
      const scale = 1.0 + Math.sin(elapsed * 4.0) * 0.15;
      pulseRingRef.current.scale.set(scale, scale, 1);
      
      const opacity = 0.45 - Math.sin(elapsed * 4.0) * 0.15;
      if (pulseRingRef.current.material && !Array.isArray(pulseRingRef.current.material)) {
        pulseRingRef.current.material.opacity = opacity;
      }
    }

    // 2. Animate the Avatar character body parts
    if (isWalking) {
      // Walk cycle animation (Legs and arms swing back and forth)
      const swingSpeed = 12.0; // High speed walk cycle tempo
      const swingAngle = Math.sin(elapsed * swingSpeed) * 0.45; // Max angle in radians
      
      if (leftLegRef.current) leftLegRef.current.rotation.x = swingAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swingAngle;
      
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swingAngle * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swingAngle * 0.8;
      
      // Dynamic bobbing up/down based on step impact
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.04 + Math.abs(Math.sin(elapsed * swingSpeed)) * 0.025;
        bodyRef.current.rotation.y = Math.sin(elapsed * swingSpeed * 0.5) * 0.04; // slight body roll
      }
    } else {
      // Idle state animations (Subtle breathing/bobbing, limbs reset to neutral)
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.04 + Math.sin(elapsed * 2.0) * 0.012;
        bodyRef.current.rotation.y = 0;
      }
    }
  });

  return (
    <group position={position}>
      {/* GROUND POSITION INDICATORS */}
      {/* Pulsing Outer Ring */}
      <mesh
        ref={pulseRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={2} />
      </mesh>

      {/* Solid Small Inner Dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0, 0.1, 32]} />
        <meshBasicMaterial color="#38bdf8" side={2} />
      </mesh>

      {/* STYLIZED 3D AVATAR CHARACTER */}
      <group ref={bodyRef} position={[0, 0.04, 0]}>
        {/* Left Shoe */}
        <mesh position={[-0.06, 0.02, 0.01]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.08]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        
        {/* Right Shoe */}
        <mesh position={[0.06, 0.02, 0.01]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.08]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Left Leg */}
        <mesh ref={leftLegRef} position={[-0.06, 0.11, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.18, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>

        {/* Right Leg */}
        <mesh ref={rightLegRef} position={[0.06, 0.11, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.18, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>

        {/* Torso (Shopping Blue Hoodie) */}
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[0.18, 0.24, 0.1]} />
          <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Left Arm */}
        <mesh ref={leftArmRef} position={[-0.11, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.18, 8]} />
          <meshStandardMaterial color="#2563eb" roughness={0.4} />
        </mesh>

        {/* Right Arm */}
        <mesh ref={rightArmRef} position={[0.11, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.18, 8]} />
          <meshStandardMaterial color="#2563eb" roughness={0.4} />
        </mesh>

        {/* Head (Glossy white droid style) */}
        <mesh position={[0, 0.51, 0]} castShadow>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.3} />
        </mesh>

        {/* Red Baseball Cap (Points forward Z+ to show facing direction) */}
        <group position={[0, 0.57, 0]}>
          <mesh position={[0, 0.01, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.025, 16]} />
            <meshStandardMaterial color="#be123c" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.005, 0.05]} rotation={[0.08, 0, 0]} castShadow>
            <boxGeometry args={[0.11, 0.006, 0.07]} />
            <meshStandardMaterial color="#be123c" roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
