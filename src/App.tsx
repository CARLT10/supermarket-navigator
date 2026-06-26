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
// Helper to determine whether a product is placed on the front or back of the shelf,
// and return its correct access node ID in the graph.
const getProductTargetNodeId = (product: Product): string => {
  const shelfProducts = PRODUCTS.filter(
    (p) => p.rackId === product.rackId && p.shelf === product.shelf
  );
  const idx = shelfProducts.findIndex((p) => p.id === product.id);
  const isBack = idx % 2 === 1;
  return `rack_${product.rackId}_${isBack ? 'rear' : 'front'}`;
};

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
  const [isAlreadyThere, setIsAlreadyThere] = useState(false);
  const [alreadyThereName, setAlreadyThereName] = useState('');
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

  // 5. Compass Orientation States
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [isCompassActive, setIsCompassActive] = useState(false);

  // Compass orientation listener
  useEffect(() => {
    if (!isCompassActive) {
      setCompassHeading(null);
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        // e.alpha represents rotation around z-axis in degrees
        const headingRad = (e.alpha * Math.PI) / 180;
        setCompassHeading(headingRad);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isCompassActive]);

  const handleSyncCompass = async () => {
    if (isCompassActive) {
      setIsCompassActive(false);
      setCompassHeading(null);
      return;
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

  const handleCalculateRoute = (targetNodeId: string, targetName: string) => {
    const startNodeId = getNearestNodeToUser();
    
    if (startNodeId === targetNodeId) {
      setIsAlreadyThere(true);
      setAlreadyThereName(targetName);
      setIsNavigating(false);
      return;
    }
    setIsAlreadyThere(false);
    setAlreadyThereName('');

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

  const handleStartNavigation = () => {
    if (!selectedProduct) return;

    const startNodeId = getNearestNodeToUser();
    const targetNodeId = getProductTargetNodeId(selectedProduct);

    if (startNodeId === targetNodeId) {
      setIsAlreadyThere(true);
      setAlreadyThereName(selectedProduct.name);
      setIsNavigating(false);
      return;
    }
    setIsAlreadyThere(false);
    setAlreadyThereName('');

    // Compute path to the correct shelf access point (front or rear)
    const selectedRoute = findShortestPath(startNodeId, targetNodeId);

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
    setIsAlreadyThere(false);
    setAlreadyThereName('');
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
    const product = PRODUCTS.find((p) => p.name === label);
    if (product) {
      setSelectedProduct(product);
      setFocusedRackId(product.rackId);
      setActiveCategoryName(product.category);
      const correctTargetNodeId = getProductTargetNodeId(product);
      handleCalculateRoute(correctTargetNodeId, product.name);
    } else {
      // Reset selection details
      setSelectedProduct(undefined);
      setFocusedRackId(null);
      setActiveCategoryName(null);
      handleCalculateRoute(targetNodeId, label);
    }
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
      const startNodeId = currentUserNode.id;
      const targetNodeId = getProductTargetNodeId(selectedProduct);
      const selectedRoute = findShortestPath(startNodeId, targetNodeId);

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
            onClearSelection={handleClearSelection}
            routeDistance={routeDistance}
            instructions={instructions}
            isNavigating={isNavigating}
            isAlreadyThere={isAlreadyThere}
            alreadyThereName={alreadyThereName}
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
