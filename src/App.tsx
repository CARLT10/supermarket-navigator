import React, { useState, useEffect, useRef } from 'react';
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
import { AIAssistant } from './components/UI/AIAssistant';

export const App: React.FC = () => {
  // 1. Core Selected States
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [focusedRackId, setFocusedRackId] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>([]);

  // 2. User Positioning State (Default: Entrance)
  const [userPosition, setUserPosition] = useState<{ x: number; z: number }>(ENTRANCE);
  const [currentUserNode, setCurrentUserNode] = useState<GraphNode>(GRAPH_NODES.entrance);

  // 3. Navigation Route States
  const [isNavigating, setIsNavigating] = useState(false);
  const [routePath, setRoutePath] = useState<GraphNode[]>([]);
  const [routeDistance, setRouteDistance] = useState(0);
  const [instructions, setInstructions] = useState<NavigationInstruction[]>([]);
  
  // 4. Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const simTimerRef = useRef<any>(null);
  const simProgressRef = useRef({
    pathIndex: 0,
    currentPos: { x: ENTRANCE.x, z: ENTRANCE.z }
  });

  // 5. Compass Orientation & Pedometer States
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [isCompassActive, setIsCompassActive] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const lastStepTime = useRef<number>(0);

  // Sync state reference to avoid stale closures in browser event callbacks
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

  // Handle a step detected by phone accelerometer sensor
  const handlePhysicalStep = () => {
    const { userPosition: currentPos, isNavigating: nav, routePath: path, compassHeading: heading, isSimulating: sim } = stateRef.current;
    
    // Ignore physical steps if walking simulation is already moving the character automatically
    if (sim) return;

    const stepLength = 0.55; // stride length in meters

    if (nav && path.length >= 2) {
      // 1. NAVIGATION MODE: Move avatar along the planned route line
      const targetNode = path[1];
      if (!targetNode) return;

      const dx = targetNode.x - currentPos.x;
      const dz = targetNode.z - currentPos.z;
      const distToTarget = Math.sqrt(dx * dx + dz * dz);

      if (distToTarget <= stepLength) {
        // Arrive at next route node!
        setUserPosition({ x: targetNode.x, z: targetNode.z });
        setCurrentUserNode(targetNode);
      } else {
        // Move towards target node along the route segment
        const angle = Math.atan2(dz, dx);
        setUserPosition({
          x: currentPos.x + Math.cos(angle) * stepLength,
          z: currentPos.z + Math.sin(angle) * stepLength,
        });
      }
    } else {
      // 2. FREE ROAM MODE: Walk in the direction the phone is physically pointing
      // If compass is synced, walk matching heading. Standard R3F camera North is Z-
      const walkAngle = heading !== null ? heading : -Math.PI / 2;

      // Note: in three.js scene, camera forward vector points towards negative Z
      // When alpha = 0 (pointing North), character walks in negative Z direction
      const moveX = Math.sin(walkAngle) * stepLength;
      const moveZ = -Math.cos(walkAngle) * stepLength; // Z- is forward

      const newX = Math.max(-7.0, Math.min(7.0, currentPos.x + moveX));
      const newZ = Math.max(-5.5, Math.min(5.5, currentPos.z + moveZ));

      setUserPosition({ x: newX, z: newZ });

      // Find and snap to nearest graph node to keep userNode state updated
      let nearestNode = GRAPH_NODES.entrance;
      let minDist = Infinity;
      Object.values(GRAPH_NODES).forEach((node) => {
        const dist = Math.sqrt((newX - node.x) ** 2 + (newZ - node.z) ** 2);
        if (dist < minDist) {
          minDist = dist;
          nearestNode = node;
        }
      });
      setCurrentUserNode(nearestNode);
    }
  };

  // Compass and Accelerometer Motion orientation listener
  useEffect(() => {
    if (!isCompassActive) {
      setCompassHeading(null);
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // iOS webkitCompassHeading check (provides absolute magnetic compass heading, 0-360 deg)
      let heading = (e as any).webkitCompassHeading;
      
      // Fallback to standard alpha (absolute if using deviceorientationabsolute)
      if (heading === undefined || heading === null) {
        heading = e.alpha;
      }

      if (heading !== null && heading !== undefined) {
        const headingRad = (heading * Math.PI) / 180;
        setCompassHeading(headingRad);
      }
    };

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      
      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      
      // Magnitude of force vector
      const magnitude = Math.sqrt(x*x + y*y + z*z);
      
      const now = Date.now();
      const threshold = 12.2; // step impact threshold in m/s^2 (gravity is ~9.8)
      
      if (magnitude > threshold && now - lastStepTime.current > 450) {
        lastStepTime.current = now;
        setStepCount((prev) => prev + 1);
        handlePhysicalStep();
      }
    };

    // Listen to standard and absolute orientation events plus accelerometer motion
    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isCompassActive]);

  const handleSyncCompass = async () => {
    if (isCompassActive) {
      setIsCompassActive(false);
      setCompassHeading(null);
      return;
    }

    // Check if running on a secure origin (required by mobile browsers to access sensors)
    const isSecureOrigin = typeof window !== 'undefined' && 
      (window.location.protocol === 'https:' || 
       window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1');

    if (!isSecureOrigin) {
      alert("Mobile web browsers restrict sensor access to secure (HTTPS) origins.\n\nPlease open the app via an HTTPS tunnel (e.g. npx ngrok http 5173) or enable insecure flags in your mobile browser.");
    }

    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setIsCompassActive(true);
        } else {
          alert('Device Orientation permission was denied.');
        }
      } catch (err) {
        console.error('Compass sensor permission error:', err);
        alert('Could not start compass sensor. Ensure you are accessing via HTTPS.');
      }
    } else {
      setIsCompassActive(true);
    }
  };

  // Handle product click/search selection
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFocusedRackId(product.rackId);
    setActiveCategoryName(product.category);
    
    // If navigating, reset old navigation
    handleStopNavigation();
  };

  const handleClearSelection = () => {
    setSelectedProduct(undefined);
    setFocusedRackId(null);
    setActiveCategoryName(null);
    handleStopNavigation();
  };

  // Quick category pills click action
  const handleSelectCategory = (rackId: string | null, categoryName: string | null) => {
    if (rackId === null || categoryName === null) {
      setActiveCategoryName(null);
      setFocusedRackId(null);
      setSelectedProduct(undefined);
      handleStopNavigation();
      return;
    }

    if (rackId === 'billing') {
      // Focus on billing
      setFocusedRackId(null);
      setActiveCategoryName(categoryName);
      setSelectedProduct(undefined);
      handleCalculateRoute('billing', 'Billing Register');
      return;
    }

    // Standard rack focus
    setActiveCategoryName(categoryName);
    setFocusedRackId(rackId);
    setSelectedProduct(undefined);
    handleStopNavigation();
  };

  // Find nearest graph node to user current position to start routing
  const getNearestNodeToUser = (): string => {
    let nearestNodeId = 'entrance';
    let minDistance = Infinity;

    Object.values(GRAPH_NODES).forEach((node) => {
      const dx = userPosition.x - node.x;
      const dz = userPosition.z - node.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDistance) {
        minDistance = dist;
        nearestNodeId = node.id;
      }
    });

    return nearestNodeId;
  };

  // Multi-destination routing: Product is inside a rack which has multiple access nodes.
  // We compute the shortest path to either of the access nodes and select the best.
  const handleCalculateRoute = (targetNodeId: string, targetName: string) => {
    const startNodeId = getNearestNodeToUser();
    const result = findShortestPath(startNodeId, targetNodeId);

    if (result.path.length > 0) {
      setRoutePath(result.path);
      setRouteDistance(result.distance);
      const steps = generateDirections(result.path, targetName);
      setInstructions(steps);
      setIsNavigating(true);
      setCurrentSimIndex(0);
    }
  };

  // Start navigation for selected product
  const handleStartNavigation = () => {
    if (!selectedProduct) return;

    // Find the product's rack access points in graph
    const frontAccessNodeId = `rack_${selectedProduct.rackId}_front`;
    const rearAccessNodeId = `rack_${selectedProduct.rackId}_rear`;

    const startNodeId = getNearestNodeToUser();

    // Compute path to both front and rear access points
    const frontRoute = findShortestPath(startNodeId, frontAccessNodeId);
    const rearRoute = findShortestPath(startNodeId, rearAccessNodeId);

    // Pick the shorter path
    let selectedRoute = frontRoute;
    if (rearRoute.path.length > 0 && (frontRoute.path.length === 0 || rearRoute.distance < frontRoute.distance)) {
      selectedRoute = rearRoute;
    }

    if (selectedRoute.path.length > 0) {
      setRoutePath(selectedRoute.path);
      setRouteDistance(selectedRoute.distance);
      const steps = generateDirections(selectedRoute.path, selectedProduct.name);
      setInstructions(steps);
      setIsNavigating(true);
      setCurrentSimIndex(0);
    }
  };

  // Exit navigation
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

  // Simulation: Move user dot step-by-step along the nodes in 3D
  const startWalkSimulation = () => {
    if (routePath.length < 2) return;
    setIsSimulating(true);

    // Initialize progress reference
    simProgressRef.current = {
      pathIndex: 0,
      currentPos: { x: userPosition.x, z: userPosition.z }
    };

    if (simTimerRef.current) clearInterval(simTimerRef.current);

    const speed = 0.12; // meters per tick (50ms) ~ 2.4 m/s (brisk simulation walk)
    
    simTimerRef.current = setInterval(() => {
      const { pathIndex, currentPos } = simProgressRef.current;
      
      if (pathIndex >= routePath.length - 1) {
        // Reached destination!
        setIsSimulating(false);
        if (simTimerRef.current) {
          clearInterval(simTimerRef.current);
          simTimerRef.current = null;
        }

        // Snap user to final node
        const finalNode = routePath[routePath.length - 1];
        setUserPosition({ x: finalNode.x, z: finalNode.z });
        setCurrentUserNode(finalNode);
        setCurrentSimIndex(instructions.length - 1);

        // Confetti explosion effect on arrival!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
        return;
      }

      const nextNode = routePath[pathIndex + 1];
      const dx = nextNode.x - currentPos.x;
      const dz = nextNode.z - currentPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance <= speed) {
        // Arrived at next node, target the next segment
        const newPos = { x: nextNode.x, z: nextNode.z };
        setUserPosition(newPos);
        setCurrentUserNode(nextNode);
        
        simProgressRef.current = {
          pathIndex: pathIndex + 1,
          currentPos: newPos
        };

        // Advance turn instructions index based on current node completion
        // Find which instruction step corresponds to this node
        setCurrentSimIndex((prev) => Math.min(instructions.length - 1, prev + 1));
      } else {
        // Move along the vector
        const angle = Math.atan2(dz, dx);
        const newPos = {
          x: currentPos.x + Math.cos(angle) * speed,
          z: currentPos.z + Math.sin(angle) * speed
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

  // Cart / Shopping List Management
  const handleToggleCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        // Trigger soft haptic feel
        return [...prev, product];
      }
    });
  };

  // Quick navigation destinations shortcut handler
  const handleQuickNavigateShortcut = (targetNodeId: string, label: string) => {
    // Reset selection details
    setSelectedProduct(undefined);
    setFocusedRackId(null);
    setActiveCategoryName(null);

    // Calculate route
    handleCalculateRoute(targetNodeId, label);
  };

  // Focus rack in 3D (camera pans there)
  const handleFocusRackIn3D = (rackId: string) => {
    setFocusedRackId(rackId);
    setSelectedProduct(undefined);
    const matchingRack = RACKS.find((r) => r.id === rackId);
    if (matchingRack) {
      setActiveCategoryName(matchingRack.category);
    }
    handleStopNavigation();
  };

  // Dynamic Re-routing (Active Pathfinder)
  useEffect(() => {
    if (isNavigating && !isSimulating && selectedProduct) {
      const frontAccessNodeId = `rack_${selectedProduct.rackId}_front`;
      const rearAccessNodeId = `rack_${selectedProduct.rackId}_rear`;
      const startNodeId = currentUserNode.id;

      const frontRoute = findShortestPath(startNodeId, frontAccessNodeId);
      const rearRoute = findShortestPath(startNodeId, rearAccessNodeId);

      let selectedRoute = frontRoute;
      if (rearRoute.path.length > 0 && (frontRoute.path.length === 0 || rearRoute.distance < frontRoute.distance)) {
        selectedRoute = rearRoute;
      }

      if (selectedRoute.path.length > 0) {
        setRoutePath(selectedRoute.path);
        setRouteDistance(selectedRoute.distance);
        const steps = generateDirections(selectedRoute.path, selectedProduct.name);
        setInstructions(steps);
        setCurrentSimIndex(0);
      }
    }
  }, [currentUserNode, isNavigating, isSimulating, selectedProduct]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  return (
    <ShellView>
      {/* 3D Canvas Screen Visualizer */}
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
        />

        {/* HUD overlay UI layout (Floating Search and details) */}
        <div className="hud-overlay-ui">
          {/* Top section: search bar & pills */}
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

          {/* Bottom section: sliding sheets panel */}
          <BottomSheet
            selectedProduct={selectedProduct}
            activeCategoryName={activeCategoryName}
            onSelectProduct={handleSelectProduct}
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
          
          {/* Conversational AI Assistant Widget */}
          <AIAssistant 
            products={PRODUCTS}
            onSelectProduct={handleSelectProduct}
            onNavigateToCategory={(category) => {
              // Find first rack matching category
              const rack = RACKS.find(r => r.category.toLowerCase() === category.toLowerCase());
              if (rack) {
                handleSelectCategory(rack.id, category);
              }
            }}
            onNavigateToNode={handleQuickNavigateShortcut}
          />
        </div>
      </div>
    </ShellView>
  );
};

export default App;
