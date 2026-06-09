import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RACKS } from '../../data/layout';
import { type Product } from '../../data/products';
import { type GraphNode } from '../../data/graph';
import { Lighting } from './Lighting';
import { Floor } from './Floor';
import { Rack3D } from './Rack3D';
import { BillingCounter } from './BillingCounter';
import { UserMarker } from './UserMarker';
import { RouteLine } from './RouteLine';

interface CameraControllerProps {
  focusedRackId: string | null;
  userPosition: { x: number; z: number };
  isNavigating: boolean;
  compassHeading: number | null;
}

const CameraController: React.FC<CameraControllerProps> = ({
  focusedRackId,
  userPosition,
  isNavigating,
  compassHeading,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Predefine target vectors
  const targetPos = useRef(new THREE.Vector3(7, 10, 10));
  const targetLook = useRef(new THREE.Vector3(0, 0.5, 0));

  // Track if we need to transition to the targets
  const isTransitioning = useRef(true);
  const isUserInteracting = useRef(false);
  const prevFocusedRackId = useRef<string | null>(null);
  const prevIsNavigating = useRef<boolean>(false);
  const prevUserPosition = useRef({ x: 0, z: 0 });

  useEffect(() => {
    let changed = false;

    if (focusedRackId !== prevFocusedRackId.current) {
      prevFocusedRackId.current = focusedRackId;
      changed = true;
    }
    if (isNavigating !== prevIsNavigating.current) {
      prevIsNavigating.current = isNavigating;
      changed = true;
    }
    // Only trigger transition on user position change if we are actively navigating and not interacting
    if (isNavigating && !isUserInteracting.current && 
        (Math.abs(userPosition.x - prevUserPosition.current.x) > 0.01 || 
         Math.abs(userPosition.z - prevUserPosition.current.z) > 0.01)) {
      prevUserPosition.current = { ...userPosition };
      changed = true;
    }

    if (changed) {
      if (isNavigating) {
        // Focus camera on the user moving through the store
        targetPos.current.set(userPosition.x + 3.0, 5.0, userPosition.z + 4.5);
        targetLook.current.set(userPosition.x, 0.4, userPosition.z);
      } else if (focusedRackId) {
        // Find the focused rack
        const rack = RACKS.find((r) => r.id === focusedRackId);
        if (rack) {
          // Zoom and focus on the shelf
          targetPos.current.set(rack.x, 2.2, rack.z + 2.8);
          targetLook.current.set(rack.x, 1.0, rack.z);
        }
      } else {
        // Default isometric overview coordinates
        targetPos.current.set(7, 10, 10);
        targetLook.current.set(0, 0.5, 0);
      }
      isTransitioning.current = true;
    }
  }, [focusedRackId, userPosition, isNavigating]);

  useFrame(() => {
    // If user is actively interacting, stop auto-rotation/transition
    if (isUserInteracting.current) {
      isTransitioning.current = false;
      return;
    }

    if (compassHeading !== null && controlsRef.current) {
      // Calculate current radius (distance in horizontal plane) and height relative to controls target
      const target = controlsRef.current.target;
      const dx = camera.position.x - target.x;
      const dz = camera.position.z - target.z;
      const radius = Math.sqrt(dx * dx + dz * dz);
      const height = camera.position.y - target.y;

      // Orbit camera position smoothly matching the device orientation angle
      const currentAngle = Math.atan2(dx, dz);
      const targetAngle = compassHeading;
      
      // Interpolate angle smoothly wrapping around circles
      let diff = targetAngle - currentAngle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      const nextAngle = currentAngle + diff * 0.08; // smooth rotate speed

      // Update camera position
      camera.position.x = target.x + Math.sin(nextAngle) * radius;
      camera.position.z = target.z + Math.cos(nextAngle) * radius;
      camera.position.y = target.y + height;
      
      controlsRef.current.update();
    } else if (isTransitioning.current && controlsRef.current) {
      // Lerp camera position
      camera.position.lerp(targetPos.current, 0.05);

      // Lerp controls target
      controlsRef.current.target.lerp(targetLook.current, 0.05);
      controlsRef.current.update();

      // Check if we are close enough to stop transition
      const distPos = camera.position.distanceTo(targetPos.current);
      const distLook = controlsRef.current.target.distanceTo(targetLook.current);
      if (distPos < 0.05 && distLook < 0.05) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
      minDistance={2}
      maxDistance={25}
      onStart={() => {
        isUserInteracting.current = true;
        isTransitioning.current = false;
      }}
      onEnd={() => {
        isUserInteracting.current = false;
      }}
    />
  );
};

interface SupermarketSceneProps {
  products: Product[];
  selectedProductId?: string;
  onSelectProduct: (product: Product) => void;
  focusedRackId: string | null;
  userPosition: { x: number; z: number };
  isNavigating: boolean;
  isSimulating?: boolean;
  compassHeading: number | null;
  routePath: GraphNode[];
  onCheckoutClick?: () => void;
}

export const SupermarketScene: React.FC<SupermarketSceneProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
  focusedRackId,
  userPosition,
  isNavigating,
  isSimulating = false,
  compassHeading,
  routePath,
  onCheckoutClick,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [7, 10, 10], fov: 45 }}
        style={{ background: '#0f172a' }}
      >
        {/* Soft Background Fog */}
        <fog attach="fog" args={['#0f172a', 12, 28]} />

        <Lighting />
        
        <Floor />

        {/* Supermarket Racks */}
        {RACKS.map((rack) => (
          <Rack3D
            key={rack.id}
            rack={rack}
            products={products}
            onSelectProduct={onSelectProduct}
            selectedProductId={selectedProductId}
          />
        ))}

        {/* Checkout Counter */}
        <BillingCounter onCheckoutClick={onCheckoutClick} />

        {/* Walking Route Path */}
        {routePath.length > 0 && <RouteLine path={routePath} />}

        {/* Google-Maps-Style User Pin */}
        <UserMarker position={[userPosition.x, 0.01, userPosition.z]} isWalking={isSimulating} />

        {/* Smooth Camera Director */}
        <CameraController
          focusedRackId={focusedRackId}
          userPosition={userPosition}
          isNavigating={isNavigating}
          compassHeading={compassHeading}
        />
      </Canvas>
    </div>
  );
};
export default SupermarketScene;
