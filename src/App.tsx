import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PRODUCTS, type Product } from './data/products';
import { RACKS, ENTRANCE } from './data/layout';
import { GRAPH_NODES, type GraphNode } from './data/graph';
import { findShortestPath } from './utils/pathfinding';
import { generateDirections, type NavigationInstruction } from './utils/textDirections';
import { SupermarketScene } from './components/Supermarket3D/SupermarketScene';
import { SearchBar } from './components/UI/SearchBar';
import { BottomSheet } from './components/UI/BottomSheet';
import { ShellView } from './components/UI/ShellView';
import { Compass, X } from 'lucide-react';

// ─── Arrival Popup ──────────────────────────────────────────────────────────
interface ArrivalPopupProps {
  product: Product | null;
  onClose: () => void;
}

const ArrivalPopup: React.FC<ArrivalPopupProps> = ({ product, onClose }) => {
  if (!product) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: `2px solid ${product.imageColor}55`,
          borderRadius: '20px',
          padding: '28px 24px 24px',
          width: '100%',
          maxWidth: '320px',
          boxShadow: `0 0 40px ${product.imageColor}33`,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            borderRadius: '50%', width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', cursor: 'pointer',
          }}
          onClick={onClose}
        ><X size={16} /></button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
          <h2 style={{ color: '#f8fafc', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            You've Arrived!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Found your destination
          </p>
        </div>

        {/* Product Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${product.imageColor}44`,
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div
              style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: product.imageColor + '33',
                border: `2px solid ${product.imageColor}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: product.imageColor }} />
            </div>
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '16px' }}>{product.name}</div>
              <div style={{ color: product.imageColor, fontSize: '12px', fontWeight: 600 }}>{product.category}</div>
            </div>
            <div style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 700, fontSize: '18px' }}>
              ${product.price.toFixed(2)}
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5, margin: 0 }}>
            {product.description}
          </p>

          {/* Location badge */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)',
              color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600,
            }}>
              📍 Rack {product.rackId}
            </span>
            <span style={{
              background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)',
              color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600,
            }}>
              📦 Shelf {product.shelf} of 5
            </span>
          </div>
        </div>

        <button
          style={{
            width: '100%', padding: '12px',
            background: `linear-gradient(135deg, ${product.imageColor}cc, ${product.imageColor}88)`,
            border: 'none', borderRadius: '12px',
            color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
          }}
          onClick={onClose}
        >
          ✓ Got it!
        </button>
      </div>
    </div>
  );
};

// ─── Compass HUD ─────────────────────────────────────────────────────────────
interface CompassHUDProps {
  headingDeg: number | null;
  isActive: boolean;
}

const CompassHUD: React.FC<CompassHUDProps> = ({ headingDeg, isActive }) => {
  if (!isActive) return null;
  const deg = headingDeg ?? 0;
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(deg / 45) % 8;
  const cardinal = cardinals[idx];

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        right: '14px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        pointerEvents: 'none',
      }}
    >
      {/* Compass rose */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(15,23,42,0.85)',
          border: '2px solid rgba(56,189,248,0.45)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5), 0 0 12px rgba(56,189,248,0.15)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Tick marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <div
            key={angle}
            style={{
              position: 'absolute',
              width: angle % 90 === 0 ? '2px' : '1px',
              height: angle % 90 === 0 ? '6px' : '4px',
              background: angle % 90 === 0 ? 'rgba(56,189,248,0.7)' : 'rgba(255,255,255,0.25)',
              top: '4px',
              left: '50%',
              transformOrigin: '50% 24px',
              transform: `translateX(-50%) rotate(${angle}deg)`,
            }}
          />
        ))}
        {/* Needle — rotates with heading, red = N */}
        <div
          style={{
            position: 'absolute',
            width: '3px',
            height: '20px',
            top: '8px',
            left: 'calc(50% - 1.5px)',
            transformOrigin: '50% 100%',
            transform: `rotate(${deg}deg)`,
            transition: 'transform 0.15s ease-out',
            borderRadius: '2px 2px 0 0',
            background: 'linear-gradient(to bottom, #ef4444, #ef4444 50%, rgba(255,255,255,0.4) 50%)',
          }}
        />
        {/* Center dot */}
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#f8fafc', zIndex: 2, position: 'absolute',
        }} />
      </div>

      {/* Degree + cardinal */}
      <div
        style={{
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(56,189,248,0.3)',
          borderRadius: '8px',
          padding: '3px 8px',
          backdropFilter: 'blur(8px)',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>
          {cardinal}
        </div>
        <div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 600 }}>
          {Math.round(deg)}°
        </div>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  // Core Selected States
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [focusedRackId, setFocusedRackId] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>([]);

  // User Positioning
  const [userPosition, setUserPosition] = useState<{ x: number; z: number }>(ENTRANCE);
  const [currentUserNode, setCurrentUserNode] = useState<GraphNode>(GRAPH_NODES.entrance);
  const [avatarFacingAngle, setAvatarFacingAngle] = useState(0);

  // Navigation Route States
  const [isNavigating, setIsNavigating] = useState(false);
  const [routePath, setRoutePath] = useState<GraphNode[]>([]);
  const [routeDistance, setRouteDistance] = useState(0);
  const [instructions, setInstructions] = useState<NavigationInstruction[]>([]);

  // Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const simTimerRef = useRef<any>(null);
  const simProgressRef = useRef({
    pathIndex: 0,
    currentPos: { x: ENTRANCE.x, z: ENTRANCE.z },
  });

  // Compass & Pedometer
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [compassDegrees, setCompassDegrees] = useState<number | null>(null);
  const [isCompassActive, setIsCompassActive] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const lastStepTime = useRef<number>(0);

  // Arrival popup
  const [showArrivalPopup, setShowArrivalPopup] = useState(false);
  const [arrivedProduct, setArrivedProduct] = useState<Product | null>(null);

  // Stable ref for event callbacks
  const stateRef = useRef({
    userPosition,
    isNavigating,
    routePath,
    compassHeading,
    selectedProduct,
    isSimulating,
  });

  useEffect(() => {
    stateRef.current = {
      userPosition,
      isNavigating,
      routePath,
      compassHeading,
      selectedProduct,
      isSimulating,
    };
  }, [userPosition, isNavigating, routePath, compassHeading, selectedProduct, isSimulating]);

  // ── Physical step handler (PDR — Pedestrian Dead Reckoning) ────────────────
  const handlePhysicalStep = useCallback(() => {
    const {
      userPosition: currentPos,
      isNavigating: nav,
      routePath: path,
      compassHeading: heading,
      isSimulating: sim,
    } = stateRef.current;

    if (sim) return; // sim already moves avatar

    const stepLength = 0.5;

    if (nav && path.length >= 2) {
      // Navigate along path
      const targetNode = path[1];
      if (!targetNode) return;

      const dx = targetNode.x - currentPos.x;
      const dz = targetNode.z - currentPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Update facing angle towards next node
      const facing = Math.atan2(dx, dz);
      setAvatarFacingAngle(facing);

      if (dist <= stepLength) {
        setUserPosition({ x: targetNode.x, z: targetNode.z });
        setCurrentUserNode(targetNode);
      } else {
        const angle = Math.atan2(dz, dx);
        setUserPosition({
          x: currentPos.x + Math.cos(angle) * stepLength,
          z: currentPos.z + Math.sin(angle) * stepLength,
        });
      }
    } else {
      // Free roam — use compass heading
      const walkAngle = heading !== null ? heading : 0;
      const moveX = Math.sin(walkAngle) * stepLength;
      const moveZ = -Math.cos(walkAngle) * stepLength;

      setAvatarFacingAngle(walkAngle);

      const newX = Math.max(-7.0, Math.min(7.0, currentPos.x + moveX));
      const newZ = Math.max(-5.5, Math.min(5.5, currentPos.z + moveZ));
      setUserPosition({ x: newX, z: newZ });

      let nearestNode = GRAPH_NODES.entrance;
      let minDist = Infinity;
      Object.values(GRAPH_NODES).forEach((node) => {
        const d = Math.sqrt((newX - node.x) ** 2 + (newZ - node.z) ** 2);
        if (d < minDist) { minDist = d; nearestNode = node; }
      });
      setCurrentUserNode(nearestNode);
    }
  }, []);

  // ── Compass + accelerometer ────────────────────────────────────────────────
  useEffect(() => {
    if (!isCompassActive) {
      setCompassHeading(null);
      setCompassDegrees(null);
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let deg = (e as any).webkitCompassHeading as number | undefined;
      if (deg === undefined || deg === null) {
        deg = e.alpha ?? undefined;
      }
      if (deg !== undefined && deg !== null) {
        setCompassDegrees(deg);
        setCompassHeading((deg * Math.PI) / 180);
      }
    };

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x || 0, y = acc.y || 0, z = acc.z || 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > 12.0 && now - lastStepTime.current > 400) {
        lastStepTime.current = now;
        setStepCount((prev) => prev + 1);
        handlePhysicalStep();
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isCompassActive, handlePhysicalStep]);

  const handleSyncCompass = async () => {
    if (isCompassActive) {
      setIsCompassActive(false);
      return;
    }
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') setIsCompassActive(true);
        else alert('Device Orientation permission denied.');
      } catch (err) {
        alert('Could not start compass. Ensure you are on HTTPS.');
      }
    } else {
      setIsCompassActive(true);
    }
  };

  // ── Product selection ──────────────────────────────────────────────────────
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFocusedRackId(product.rackId);
    setActiveCategoryName(product.category);
    handleStopNavigation();
  };

  const handleClearSelection = () => {
    setSelectedProduct(undefined);
    setFocusedRackId(null);
    setActiveCategoryName(null);
    handleStopNavigation();
  };

  const handleSelectCategory = (rackId: string | null, categoryName: string | null) => {
    if (!rackId || !categoryName) {
      setActiveCategoryName(null);
      setFocusedRackId(null);
      setSelectedProduct(undefined);
      handleStopNavigation();
      return;
    }
    if (rackId === 'billing') {
      setFocusedRackId(null);
      setActiveCategoryName(categoryName);
      setSelectedProduct(undefined);
      handleCalculateRoute('billing', 'Billing Register');
      return;
    }
    setActiveCategoryName(categoryName);
    setFocusedRackId(rackId);
    setSelectedProduct(undefined);
    handleStopNavigation();
  };

  // ── Route helpers ──────────────────────────────────────────────────────────
  const getNearestNodeToUser = (): string => {
    let nearestId = 'entrance';
    let minDist = Infinity;
    Object.values(GRAPH_NODES).forEach((node) => {
      const dx = userPosition.x - node.x;
      const dz = userPosition.z - node.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist) { minDist = d; nearestId = node.id; }
    });
    return nearestId;
  };

  const handleCalculateRoute = (targetNodeId: string, targetName: string) => {
    const startId = getNearestNodeToUser();
    const result = findShortestPath(startId, targetNodeId);
    if (result.path.length > 0) {
      setRoutePath(result.path);
      setRouteDistance(result.distance);
      setInstructions(generateDirections(result.path, targetName));
      setIsNavigating(true);
      setCurrentSimIndex(0);
    }
  };

  const handleStartNavigation = () => {
    if (!selectedProduct) return;
    const frontId = `rack_${selectedProduct.rackId}_front`;
    const rearId = `rack_${selectedProduct.rackId}_rear`;
    const startId = getNearestNodeToUser();
    const frontRoute = findShortestPath(startId, frontId);
    const rearRoute = findShortestPath(startId, rearId);
    let route = frontRoute;
    if (rearRoute.path.length > 0 && (frontRoute.path.length === 0 || rearRoute.distance < frontRoute.distance)) {
      route = rearRoute;
    }
    if (route.path.length > 0) {
      setRoutePath(route.path);
      setRouteDistance(route.distance);
      setInstructions(generateDirections(route.path, selectedProduct.name));
      setIsNavigating(true);
      setCurrentSimIndex(0);
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setIsSimulating(false);
    setRoutePath([]);
    setRouteDistance(0);
    setInstructions([]);
    setCurrentSimIndex(0);
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
  };

  // ── Walk simulation ────────────────────────────────────────────────────────
  const startWalkSimulation = () => {
    if (routePath.length < 2) return;
    setIsSimulating(true);
    simProgressRef.current = {
      pathIndex: 0,
      currentPos: { x: userPosition.x, z: userPosition.z },
    };
    if (simTimerRef.current) clearInterval(simTimerRef.current);

    const speed = 0.1;

    simTimerRef.current = setInterval(() => {
      const { pathIndex, currentPos } = simProgressRef.current;

      if (pathIndex >= routePath.length - 1) {
        // Arrived!
        setIsSimulating(false);
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;

        const finalNode = routePath[routePath.length - 1];
        setUserPosition({ x: finalNode.x, z: finalNode.z });
        setCurrentUserNode(finalNode);
        setCurrentSimIndex(instructions.length - 1);

        // Show arrival popup with the searched product
        const prod = stateRef.current.selectedProduct;
        if (prod) {
          setArrivedProduct(prod);
          setShowArrivalPopup(true);
        }

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.65 } });
        return;
      }

      const nextNode = routePath[pathIndex + 1];
      const dx = nextNode.x - currentPos.x;
      const dz = nextNode.z - currentPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Update avatar facing angle towards movement direction
      const facing = Math.atan2(dx, dz);
      setAvatarFacingAngle(facing);

      if (dist <= speed) {
        const newPos = { x: nextNode.x, z: nextNode.z };
        setUserPosition(newPos);
        setCurrentUserNode(nextNode);
        simProgressRef.current = { pathIndex: pathIndex + 1, currentPos: newPos };
        setCurrentSimIndex((prev) => Math.min(instructions.length - 1, prev + 1));
      } else {
        const angle = Math.atan2(dz, dx);
        const newPos = {
          x: currentPos.x + Math.cos(angle) * speed,
          z: currentPos.z + Math.sin(angle) * speed,
        };
        setUserPosition(newPos);
        simProgressRef.current.currentPos = newPos;
      }
    }, 50);
  };

  const pauseWalkSimulation = () => {
    setIsSimulating(false);
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
  };

  // ── Cart ───────────────────────────────────────────────────────────────────
  const handleToggleCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  };

  // ── Quick nav shortcuts ────────────────────────────────────────────────────
  const handleQuickNavigateShortcut = (targetNodeId: string, label: string) => {
    setSelectedProduct(undefined);
    setFocusedRackId(null);
    setActiveCategoryName(null);
    handleCalculateRoute(targetNodeId, label);
  };

  const handleFocusRackIn3D = (rackId: string) => {
    setFocusedRackId(rackId);
    setSelectedProduct(undefined);
    const matchingRack = RACKS.find((r) => r.id === rackId);
    if (matchingRack) setActiveCategoryName(matchingRack.category);
    handleStopNavigation();
  };

  // ── Dynamic re-routing when physical walking ───────────────────────────────
  useEffect(() => {
    if (isNavigating && !isSimulating && selectedProduct) {
      const frontId = `rack_${selectedProduct.rackId}_front`;
      const rearId = `rack_${selectedProduct.rackId}_rear`;
      const startId = currentUserNode.id;
      const front = findShortestPath(startId, frontId);
      const rear = findShortestPath(startId, rearId);
      let route = front;
      if (rear.path.length > 0 && (front.path.length === 0 || rear.distance < front.distance)) route = rear;
      if (route.path.length > 0) {
        setRoutePath(route.path);
        setRouteDistance(route.distance);
        setInstructions(generateDirections(route.path, selectedProduct.name));
        setCurrentSimIndex(0);
      }
    }
  }, [currentUserNode, isNavigating, isSimulating, selectedProduct]);

  // Cleanup
  useEffect(() => () => { if (simTimerRef.current) clearInterval(simTimerRef.current); }, []);

  return (
    <ShellView>
      <div className="three-canvas-container">
        <SupermarketScene
          products={PRODUCTS}
          selectedProductId={selectedProduct?.id}
          onSelectProduct={handleSelectProduct}
          focusedRackId={focusedRackId}
          userPosition={userPosition}
          isNavigating={isNavigating}
          isSimulating={isSimulating}
          compassHeading={compassHeading}
          routePath={routePath}
          onCheckoutClick={() => handleQuickNavigateShortcut('billing', 'Billing Register')}
          avatarFacingAngle={avatarFacingAngle}
        />

        {/* HUD overlay */}
        <div className="hud-overlay-ui">
          {/* Top: search + pills */}
          <div className="hud-top-section">
            <SearchBar
              products={PRODUCTS}
              onSelectProduct={handleSelectProduct}
              onClear={handleClearSelection}
              selectedProduct={selectedProduct}
              userNodeName={currentUserNode.name}
              activeCategoryName={activeCategoryName}
              onSelectCategory={handleSelectCategory}
              isCompassActive={isCompassActive}
              onSyncCompass={handleSyncCompass}
            />
          </div>

          {/* Bottom sheet */}
          <BottomSheet
            selectedProduct={selectedProduct}
            activeCategoryName={activeCategoryName}
            onClearSelection={handleClearSelection}
            routeDistance={routeDistance}
            instructions={instructions}
            isNavigating={isNavigating}
            onStartNavigation={handleStartNavigation}
            onStopNavigation={handleStopNavigation}
            isSimulating={isSimulating}
            onStartSimulation={startWalkSimulation}
            onPauseSimulation={pauseWalkSimulation}
            currentSimIndex={currentSimIndex}
            cart={cart}
            onToggleCart={handleToggleCart}
            onQuickNavigate={handleQuickNavigateShortcut}
            onFocusRack={handleFocusRackIn3D}
            isCompassActive={isCompassActive}
            stepCount={stepCount}
          />
        </div>

        {/* Real compass HUD — fixed top-right */}
        <CompassHUD headingDeg={compassDegrees} isActive={isCompassActive} />

        {/* Arrival popup */}
        {showArrivalPopup && (
          <ArrivalPopup
            product={arrivedProduct}
            onClose={() => {
              setShowArrivalPopup(false);
              setArrivedProduct(null);
            }}
          />
        )}
      </div>
    </ShellView>
  );
};

export default App;
