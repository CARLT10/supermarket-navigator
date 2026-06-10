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
  
  // Limbs references
  const leftLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  
  const leftArmRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);

  // Physics and velocity tracking states
  const prevPos = useRef<THREE.Vector3>(new THREE.Vector3(position[0], position[1], position[2]));
  const prevHeading = useRef<number>(0);
  const leanAngle = useRef<number>(0);

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

    // 2. Physics calculations for velocity and turning heading/banking
    const currentPos = new THREE.Vector3(position[0], position[1], position[2]);
    const diff = new THREE.Vector3().subVectors(currentPos, prevPos.current);
    const speed = diff.length() * 60; // Estimate speed assuming ~60 FPS
    
    // Check if character is moving
    const moving = speed > 0.005;
    
    let targetHeading = prevHeading.current;
    let targetLean = 0;
    
    if (moving) {
      // Calculate move angle
      targetHeading = Math.atan2(diff.x, diff.z);
      
      // Calculate turn rate / angular velocity
      let headingDiff = targetHeading - prevHeading.current;
      headingDiff = Math.atan2(Math.sin(headingDiff), Math.cos(headingDiff)); // wrap to [-PI, PI]
      const turnRate = headingDiff * 60; // rads per second
      
      // Centripetal bank angle (lean into the turn, scaled by speed)
      targetLean = -turnRate * 0.06 * Math.min(speed, 1.0);
      
      // Smoothly rotate body yaw (Y) to face heading direction
      let currentYaw = bodyRef.current ? bodyRef.current.rotation.y : 0;
      let yawDiff = targetHeading - currentYaw;
      yawDiff = Math.atan2(Math.sin(yawDiff), Math.cos(yawDiff));
      
      if (bodyRef.current) {
        bodyRef.current.rotation.y += yawDiff * 0.15; // Smooth heading rotation
      }
      
      prevHeading.current = targetHeading;
    }
    
    // Smoothly interpolate the banking lean angle (roll)
    leanAngle.current = THREE.MathUtils.lerp(leanAngle.current, targetLean, 0.1);
    prevPos.current.copy(currentPos);

    // 3. Biomechanical Walk Cycle & Idle animations
    if (isWalking) {
      const walkSpeed = 12.0;
      const swingAngle = Math.sin(elapsed * walkSpeed) * 0.45;
      
      // Left leg swing (from hip) and realistic knee bending
      if (leftLegRef.current) leftLegRef.current.rotation.x = swingAngle;
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = swingAngle > 0 ? swingAngle * 0.75 : 0.05; // Bend knee on forward swing
      }

      // Right leg swing (opposite phase) and knee bending
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swingAngle;
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = swingAngle < 0 ? -swingAngle * 0.75 : 0.05;
      }

      // Left arm swing (opposite phase to left leg) and elbow bending
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -swingAngle * 0.6;
        leftArmRef.current.rotation.z = Math.PI / 16 + Math.sin(elapsed * walkSpeed) * 0.03;
      }
      if (leftElbowRef.current) {
        leftElbowRef.current.rotation.x = swingAngle < 0 ? -swingAngle * 0.4 : 0.1;
      }

      // Right arm swing and elbow bending
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = swingAngle * 0.6;
        rightArmRef.current.rotation.z = -Math.PI / 16 - Math.sin(elapsed * walkSpeed) * 0.03;
      }
      if (rightElbowRef.current) {
        rightElbowRef.current.rotation.x = swingAngle > 0 ? swingAngle * 0.4 : 0.1;
      }

      // Body Bobbing & Leaning Roll (from turning physics)
      if (bodyRef.current) {
        // Vertically bob on step impacts
        bodyRef.current.position.y = 0.02 + Math.abs(Math.cos(elapsed * walkSpeed)) * 0.025;
        bodyRef.current.rotation.x = 0.08; // Lean forward slightly when walking
        bodyRef.current.rotation.z = leanAngle.current + Math.sin(elapsed * walkSpeed * 0.5) * 0.03; // Banking + walk sway
        bodyRef.current.rotation.y = prevHeading.current + Math.sin(elapsed * walkSpeed * 0.5) * 0.04;
      }
    } else {
      // Idle state
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0;
      
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0;

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = 0;
        leftArmRef.current.rotation.z = Math.PI / 18 + Math.sin(elapsed * 2.0) * 0.02;
      }
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = 0.15;

      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.z = -Math.PI / 18 - Math.sin(elapsed * 2.0) * 0.02;
      }
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = 0.15;

      if (bodyRef.current) {
        bodyRef.current.position.y = 0.02 + Math.sin(elapsed * 2.0) * 0.006; // breathing bob
        bodyRef.current.rotation.x = 0;
        bodyRef.current.rotation.z = leanAngle.current; // Keep settling bank
        // y remains at prevHeading
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
        <ringGeometry args={[0.45, 0.65, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={2} />
      </mesh>

      {/* Solid Small Inner Dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0, 0.22, 32]} />
        <meshBasicMaterial color="#38bdf8" side={2} />
      </mesh>

      {/* CJ (GTA STYLE HUMAN FIGURE) */}
      <group ref={bodyRef} position={[0, 0.02, 0]}>
        {/* Hips / Pelvis (Blue Jeans) */}
        <mesh position={[0, 0.70, 0]} castShadow>
          <boxGeometry args={[0.26, 0.14, 0.16]} />
          <meshStandardMaterial color="#1e40af" roughness={0.6} />
        </mesh>

        {/* Brown Belt */}
        <group position={[0, 0.77, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.265, 0.044, 0.162]} />
            <meshStandardMaterial color="#451a03" roughness={0.7} />
          </mesh>
          {/* Gold Buckle */}
          <mesh position={[0, 0, 0.082]} castShadow>
            <boxGeometry args={[0.06, 0.052, 0.008]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Lower Torso (White Tank Top) */}
        <mesh position={[0, 0.88, 0]} castShadow>
          <boxGeometry args={[0.25, 0.18, 0.15]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>

        {/* Upper Torso / Chest */}
        <group position={[0, 1.08, 0]}>
          {/* White Chest Box */}
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.22, 0.17]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Bare brown shoulders (Tank top straps reveal) */}
          <mesh position={[-0.12, 0.12, 0]} castShadow>
            <boxGeometry args={[0.045, 0.02, 0.17]} />
            <meshStandardMaterial color="#8d5524" roughness={0.5} />
          </mesh>
          <mesh position={[0.12, 0.12, 0]} castShadow>
            <boxGeometry args={[0.045, 0.02, 0.17]} />
            <meshStandardMaterial color="#8d5524" roughness={0.5} />
          </mesh>
        </group>

        {/* Neck (Bare skin) */}
        <mesh position={[0, 1.24, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.038, 0.12, 8]} />
          <meshStandardMaterial color="#8d5524" roughness={0.5} />
        </mesh>

        {/* Head & Face */}
        <group position={[0, 1.40, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.10, 16, 16]} />
            <meshStandardMaterial color="#8d5524" roughness={0.5} />
          </mesh>
          {/* Buzzcut Hair cap */}
          <mesh position={[0, 0.025, -0.008]} castShadow>
            <sphereGeometry args={[0.103, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
          {/* Left Eye */}
          <mesh position={[-0.032, 0.015, 0.08]} scale={[1, 1, 0.3]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.032, 0.015, 0.085]} scale={[1, 1, 0.1]}>
            <sphereGeometry args={[0.0036, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Right Eye */}
          <mesh position={[0.032, 0.015, 0.08]} scale={[1, 1, 0.3]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.032, 0.015, 0.085]} scale={[1, 1, 0.1]}>
            <sphereGeometry args={[0.0036, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>

        {/* Left Arm Group */}
        <group ref={leftArmRef} position={[-0.16, 1.15, 0]}>
          {/* Upper Arm (Bare skin) */}
          <mesh position={[0, -0.10, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.028, 0.20, 8]} />
            <meshStandardMaterial color="#8d5524" roughness={0.5} />
          </mesh>
          {/* Elbow Joint & Forearm */}
          <group ref={leftElbowRef} position={[0, -0.20, 0]}>
            <mesh position={[0, -0.09, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.024, 0.18, 8]} />
              <meshStandardMaterial color="#8d5524" roughness={0.5} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.19, 0]} castShadow>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial color="#8d5524" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Right Arm Group */}
        <group ref={rightArmRef} position={[0.16, 1.15, 0]}>
          {/* Upper Arm (Bare skin) */}
          <mesh position={[0, -0.10, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.028, 0.20, 8]} />
            <meshStandardMaterial color="#8d5524" roughness={0.5} />
          </mesh>
          {/* Elbow Joint & Forearm */}
          <group ref={rightElbowRef} position={[0, -0.20, 0]}>
            <mesh position={[0, -0.09, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.024, 0.18, 8]} />
              <meshStandardMaterial color="#8d5524" roughness={0.5} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.19, 0]} castShadow>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial color="#8d5524" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Left Leg Group */}
        <group ref={leftLegRef} position={[-0.08, 0.70, 0]}>
          {/* Thigh (Blue Jeans) */}
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.038, 0.32, 10]} />
            <meshStandardMaterial color="#1e40af" roughness={0.6} />
          </mesh>
          {/* Knee Joint & Calf */}
          <group ref={leftKneeRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.038, 0.032, 0.32, 10]} />
              <meshStandardMaterial color="#1e40af" roughness={0.6} />
            </mesh>
            {/* Shoe */}
            <group position={[0, -0.35, 0.025]}>
              {/* White Sole */}
              <mesh position={[0, -0.02, 0]} castShadow>
                <boxGeometry args={[0.068, 0.02, 0.13]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.5} />
              </mesh>
              {/* Black Sneaker Body */}
              <mesh castShadow>
                <boxGeometry args={[0.064, 0.036, 0.12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Right Leg Group */}
        <group ref={rightLegRef} position={[0.08, 0.70, 0]}>
          {/* Thigh (Blue Jeans) */}
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.038, 0.32, 10]} />
            <meshStandardMaterial color="#1e40af" roughness={0.6} />
          </mesh>
          {/* Knee Joint & Calf */}
          <group ref={rightKneeRef} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.038, 0.032, 0.32, 10]} />
              <meshStandardMaterial color="#1e40af" roughness={0.6} />
            </mesh>
            {/* Shoe */}
            <group position={[0, -0.35, 0.025]}>
              {/* White Sole */}
              <mesh position={[0, -0.02, 0]} castShadow>
                <boxGeometry args={[0.068, 0.02, 0.13]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.5} />
              </mesh>
              {/* Black Sneaker Body */}
              <mesh castShadow>
                <boxGeometry args={[0.064, 0.036, 0.12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
              </mesh>
            </group>
          </group>
        </group>

      </group>
    </group>
  );
};
export default UserMarker;
