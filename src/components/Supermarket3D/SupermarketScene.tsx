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

  const targetPos = useRef(new THREE.Vector3(7, 10, 10));
  const targetLook = useRef(new THREE.Vector3(0, 0.5, 0));
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
    if (
      isNavigating &&
      !isUserInteracting.current &&
      (Math.abs(userPosition.x - prevUserPosition.current.x) > 0.01 ||
        Math.abs(userPosition.z - prevUserPosition.current.z) > 0.01)
    ) {
      prevUserPosition.current = { ...userPosition };
      changed = true;
    }

    if (changed) {
      if (isNavigating) {
        targetPos.current.set(userPosition.x + 2.5, 5.5, userPosition.z + 5.0);
        targetLook.current.set(userPosition.x, 0.4, userPosition.z);
      } else if (focusedRackId) {
        const rack = RACKS.find((r) => r.id === focusedRackId);
        if (rack) {
          targetPos.current.set(rack.x, 2.2, rack.z + 2.8);
          targetLook.current.set(rack.x, 1.0, rack.z);
        }
      } else {
        targetPos.current.set(7, 10, 10);
        targetLook.current.set(0, 0.5, 0);
      }
      isTransitioning.current = true;
    }
  }, [focusedRackId, userPosition, isNavigating]);

  useFrame(() => {
    if (isUserInteracting.current) {
      isTransitioning.current = false;
      return;
    }

    if (compassHeading !== null && controlsRef.current && !isNavigating) {
      const target = controlsRef.current.target;
      const dx = camera.position.x - target.x;
      const dz = camera.position.z - target.z;
      const radius = Math.sqrt(dx * dx + dz * dz);
      const height = camera.position.y - target.y;

      const currentAngle = Math.atan2(dx, dz);
      const targetAngle = compassHeading;
      let diff = targetAngle - currentAngle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      const nextAngle = currentAngle + diff * 0.06;

      camera.position.x = target.x + Math.sin(nextAngle) * radius;
      camera.position.z = target.z + Math.cos(nextAngle) * radius;
      camera.position.y = target.y + height;
      controlsRef.current.update();
    } else if (isTransitioning.current && controlsRef.current) {
      camera.position.lerp(targetPos.current, 0.05);
      controlsRef.current.target.lerp(targetLook.current, 0.05);
      controlsRef.current.update();

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
      maxPolarAngle={Math.PI / 2 - 0.05}
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
  avatarFacingAngle?: number;
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
  avatarFacingAngle = 0,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [7, 10, 10], fov: 45 }}
        style={{ background: '#0f172a' }}
      >
        <fog attach="fog" args={['#0f172a', 12, 28]} />
        <Lighting />
        <Floor />

        {RACKS.map((rack) => (
          <Rack3D
            key={rack.id}
            rack={rack}
            products={products}
            onSelectProduct={onSelectProduct}
            selectedProductId={selectedProductId}
          />
        ))}

        <BillingCounter onCheckoutClick={onCheckoutClick} />

        {routePath.length > 0 && <RouteLine path={routePath} />}

        <UserMarker
          position={[userPosition.x, 0.01, userPosition.z]}
          isWalking={isSimulating}
          facingAngle={avatarFacingAngle}
        />

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
