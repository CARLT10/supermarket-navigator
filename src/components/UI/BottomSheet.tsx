import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ShoppingCart, 
  MapPin, 
  Play, 
  Pause, 
  Square, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw
} from 'lucide-react';
import { type Product } from '../../data/products';
import { type NavigationInstruction } from '../../utils/textDirections';

interface BottomSheetProps {
  // Global States
  selectedProduct?: Product;
  activeCategoryName: string | null;
  onClearSelection: () => void;
  
  // Navigation States
  routeDistance: number;
  instructions: NavigationInstruction[];
  isNavigating: boolean;
  isAlreadyThere: boolean;
  alreadyThereName: string;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  
  // Simulation States
  isSimulating: boolean;
  onStartSimulation: () => void;
  onPauseSimulation: () => void;
  currentSimIndex: number;
  
  // Cart/List States
  cart: Product[];
  onToggleCart: (product: Product) => void;
  
  // Quick navigation shortcuts
  onQuickNavigate: (targetId: string, label: string) => void;
  onFocusRack: (rackId: string) => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  selectedProduct,
  onClearSelection,
  instructions,
  isNavigating,
  isAlreadyThere,
  alreadyThereName,
  onStartNavigation,
  onStopNavigation,
  isSimulating,
  onStartSimulation,
  onPauseSimulation,
  cart,
  onToggleCart,
  onQuickNavigate,
  onFocusRack,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCartOnly, setShowCartOnly] = useState(false);

  useEffect(() => {
    if (isAlreadyThere || isNavigating || selectedProduct) {
      setIsExpanded(false);
    }
  }, [isAlreadyThere, isNavigating, selectedProduct]);

  // Cart operations
  const isInCart = selectedProduct ? cart.some((p) => p.id === selectedProduct.id) : false;

  const hasSelectedProduct = !!selectedProduct;
  const containerClasses = [
    'bottom-sheet-container',
    isExpanded && !isAlreadyThere ? 'expanded' : '',
    isAlreadyThere ? 'already-there-active' : '',
    isNavigating ? 'navigating-hud' : '',
    hasSelectedProduct ? 'product-detail-active' : '',
    !isAlreadyThere && !isNavigating && !hasSelectedProduct ? 'home-active' : '',
    showCartOnly ? 'cart-active' : '',
  ].filter(Boolean).join(' ');

  const destinationName = selectedProduct?.name || 
    (instructions.length > 0 ? instructions[instructions.length - 1].text.replace('You have reached ', '').replace(/\.$/, '') : 'Destination');

  return (
    <div className={containerClasses}>
      {/* 1. Expand Handle / Gesture Bar */}
      <div 
        className="bottom-sheet-header" 
        onClick={() => !isAlreadyThere && !isNavigating && setIsExpanded(!isExpanded)}
        style={{ cursor: isNavigating ? 'default' : 'pointer' }}
      >
        {!isAlreadyThere && !isNavigating && (
          <div className="header-toggle-icon">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        )}
      </div>

      <div className="bottom-sheet-content">
        {/* ==================== STATE 1: ALREADY THERE ==================== */}
        {isAlreadyThere ? (
          <div className="already-there-panel">
            <div className="already-there-row">
              <div className="already-there-message">
                <span className="already-there-icon">📍</span>
                <span>You are already at <strong>{alreadyThereName}</strong>.</span>
              </div>
              <button className="already-there-close-btn" onClick={onStopNavigation}>
                OK
              </button>
            </div>
          </div>
        ) : isNavigating ? (
          <div className="navigation-state-panel">
            {/* Top primary instruction banner */}
            <div className="nav-primary-instruction">
              <div className="nav-arrow-icon">🧭</div>
              <div className="nav-instruction-detail">
                <h3>Navigating to {destinationName}</h3>
                <p>Follow the path shown on the map</p>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="nav-controls-row">
              {!isSimulating ? (
                <button className="nav-btn simulate-btn" onClick={onStartSimulation}>
                  <Play size={16} fill="currentColor" />
                  <span>Start Walk Sim</span>
                </button>
              ) : (
                <button className="nav-btn pause-btn" onClick={onPauseSimulation}>
                  <Pause size={16} fill="currentColor" />
                  <span>Pause Walk</span>
                </button>
              )}
              
              <button className="nav-btn stop-btn" onClick={onStopNavigation}>
                <Square size={16} fill="currentColor" />
                <span>Exit Route</span>
              </button>
            </div>
          </div>
        ) : selectedProduct ? (
          /* ==================== STATE 2: PRODUCT DETAIL ==================== */
          <div className="product-detail-panel">
            <div className="product-detail-layout">
              <div className="product-detail-left">
                <span className="product-category-badge" style={{ borderColor: selectedProduct.imageColor, color: selectedProduct.imageColor }}>
                  {selectedProduct.category}
                </span>
                <h2>{selectedProduct.name}</h2>
                <p className="product-description">{selectedProduct.description}</p>
              </div>
              <div className="product-detail-right">
                <span className="product-price">₹{selectedProduct.price.toFixed(2)}</span>
                <button className="primary-action-btn navigate-btn mini-navigate-btn" onClick={onStartNavigation}>
                  <Navigation size={13} fill="currentColor" />
                  <span>Go to Item</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="actions-button-grid">
              <button 
                className={`secondary-action-btn cart-btn ${isInCart ? 'in-cart' : ''}`} 
                onClick={() => onToggleCart(selectedProduct)}
              >
                <ShoppingCart size={15} />
                <span>{isInCart ? 'Remove from Cart' : 'Add to List'}</span>
              </button>

              <button className="secondary-action-btn close-btn" onClick={onClearSelection}>
                <span>Back to Map</span>
              </button>
            </div>
          </div>
        ) : (
          /* ==================== STATE 3: OVERVIEW / DEFAULT ==================== */
          <div className="overview-panel">
            {showCartOnly && isExpanded ? (
              <div className="shopping-cart-view animate-fade-in">
                <div className="cart-header">
                  <h3>📝 Shopping List ({cart.length} items)</h3>
                  <button className="text-btn" onClick={() => setShowCartOnly(false)}>Back to Store</button>
                </div>
                
                {cart.length === 0 ? (
                  <div className="empty-cart-state">
                    <ShoppingCart size={40} className="empty-cart-icon" />
                    <p>Your shopping list is empty. Add products to navigate your trip!</p>
                  </div>
                ) : (
                  <div className="cart-items-list">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item-row" onClick={() => onToggleCart(item)}>
                        <div className="cart-item-info" onClick={(e) => { e.stopPropagation(); onFocusRack(item.rackId); }}>
                          <span className="cart-item-dot" style={{ backgroundColor: item.imageColor }} />
                          <div>
                            <span className="cart-item-name">{item.name}</span>
                            <span className="cart-item-desc">Rack {item.rackId} • Shelf {item.shelf}</span>
                          </div>
                        </div>
                        <button className="cart-item-nav" onClick={(e) => {
                          e.stopPropagation();
                          onQuickNavigate(`rack_${item.rackId}_front`, item.name);
                        }}>
                          🧭 Go
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="home-dashboard">
                <div className="dashboard-header">
                  <h2>Supermarket Assistant</h2>
                  <p>Smart indoor pathfinder. Entrance position active.</p>
                </div>

                {/* Only show shortcuts & shopping list in expanded state */}
                {isExpanded && (
                  <>
                    {/* Shopping Cart Shortcut bar */}
                    <div className="shopping-cart-bar" onClick={() => setShowCartOnly(true)}>
                      <div className="cart-summary">
                        <ShoppingCart size={18} />
                        <span>View Shopping List ({cart.length} items)</span>
                      </div>
                      <div className="avatar-stack">
                        {cart.slice(0, 3).map((item) => (
                          <span key={item.id} className="avatar-dot" style={{ backgroundColor: item.imageColor }} />
                        ))}
                        {cart.length > 3 && <span className="avatar-more">+{cart.length - 3}</span>}
                      </div>
                    </div>

                    {/* Predefined destination shortcuts */}
                    <h4 className="section-title">Quick Destinations</h4>
                    <div className="shortcuts-scroller">
                      <button className="shortcut-card" onClick={() => onQuickNavigate('entrance', 'Entrance')}>
                        <RotateCcw size={16} />
                        <div className="shortcut-details">
                          <span className="shortcut-name">Entrance</span>
                          <span className="shortcut-desc">Reset Location</span>
                        </div>
                      </button>
                      <button className="shortcut-card" onClick={() => onQuickNavigate('billing', 'Billing Counter')}>
                        <ShoppingCart size={16} />
                        <div className="shortcut-details">
                          <span className="shortcut-name">Checkout</span>
                          <span className="shortcut-desc">Billing Register</span>
                        </div>
                      </button>
                      <button className="shortcut-card" onClick={() => onQuickNavigate('exit', 'Supermarket Exit')}>
                        <MapPin size={16} />
                        <div className="shortcut-details">
                          <span className="shortcut-name">Exit Gate</span>
                          <span className="shortcut-desc">Exit Supermarket</span>
                        </div>
                      </button>
                    </div>
                  </>
                )}


              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
