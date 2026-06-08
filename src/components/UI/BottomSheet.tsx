import React, { useState } from 'react';
import {
  Navigation,
  Map,
  ShoppingCart,
  MapPin,
  Square,
  ChevronUp, 
  ChevronDown, 
  RotateCcw,
  CheckCircle,
  HelpCircle
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
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  
 
  
  // Cart/List States
  cart: Product[];
  onToggleCart: (product: Product) => void;
  
  // Quick navigation shortcuts
  onQuickNavigate: (targetId: string, label: string) => void;
  onFocusRack: (rackId: string) => void;

  isCompassActive?: boolean;
  stepCount?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  selectedProduct,
  onClearSelection,
  routeDistance,
  instructions,
  isNavigating,
  onStartNavigation,
  onStopNavigation, 
  currentSimIndex,
  cart,
  onToggleCart,
  onQuickNavigate,
  onFocusRack,
  isCompassActive = false,
  stepCount = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCartOnly, setShowCartOnly] = useState(false);

  // Cart operations
  const isInCart = selectedProduct ? cart.some((p) => p.id === selectedProduct.id) : false;

  // Directions mapping to icon
  const getDirectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'left':
        return <span className="direction-icon turn-left">↖️</span>;
      case 'right':
        return <span className="direction-icon turn-right">↗️</span>;
      case 'departure':
        return <span className="direction-icon start">📍</span>;
      case 'arrival':
        return <span className="direction-icon end">🏁</span>;
      default:
        return <span className="direction-icon straight">⬆️</span>;
    }
  };

  return (
    <div className={`bottom-sheet-container ${isExpanded ? 'expanded' : ''} ${isNavigating ? 'navigating-hud' : ''}`}>
      {/* 1. Expand Handle / Gesture Bar */}
      <div className="bottom-sheet-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="handle-bar" />
        <div className="header-toggle-icon">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </div>

      <div className="bottom-sheet-content">
        {/* ==================== STATE 1: ACTIVE NAVIGATION ==================== */}
        {isNavigating ? (
          <div className="navigation-state-panel">
            {/* Top primary instruction banner */}
            <div className="nav-primary-instruction">
              <div className="nav-arrow-icon">
                {instructions[currentSimIndex]?.icon === 'left' ? '⬅️' : 
                 instructions[currentSimIndex]?.icon === 'right' ? '➡️' : 
                 instructions[currentSimIndex]?.icon === 'arrival' ? '🎉' : '⬆️'}
              </div>
              <div className="nav-instruction-detail">
                <h3>{instructions[currentSimIndex]?.text || 'Recalculating route...'}</h3>
                {instructions[currentSimIndex + 1] && (
                  <p>Next: {instructions[currentSimIndex + 1].text}</p>
                )}
              </div>
            </div>

            {/* Distance & Time summary */}
            <div className="nav-summary-row">
              <div className="nav-metric">
                <span className="metric-value">{routeDistance}m</span>
                <span className="metric-label">Distance</span>
              </div>
              <div className="nav-metric-divider" />
              <div className="nav-metric">
                <span className="metric-value">{Math.round(routeDistance * 0.8)}s</span>
                <span className="metric-label">Est. Walk Time</span>
              </div>
            </div>

            {/* Real Walking Navigation Controls */}
<div className="nav-controls-row">
  <button className="nav-btn stop-btn" onClick={onStopNavigation}>
    <Square size={16} fill="currentColor" />
    <span>Stop Navigation</span>
  </button>
</div>

<div
  style={{
    marginTop: '10px',
    padding: '10px',
    borderRadius: '10px',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.25)',
    fontSize: '13px',
    textAlign: 'center'
  }}
>
  🚶 Walk physically with your phone.
  <br />
  Your position will update from the compass and step sensor.
</div>
            {/* Turn-by-Turn list (visible when expanded) */}
            {isExpanded && (
              <div className="expanded-directions-list">
                <h4 className="section-title">Step-by-Step Directions</h4>
                <div className="directions-steps-scroller">
                  {instructions.map((step, idx) => {
                    const isStepCompleted = idx < currentSimIndex;
                    const isStepCurrent = idx === currentSimIndex;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`direction-step-card ${isStepCompleted ? 'completed' : ''} ${isStepCurrent ? 'current' : ''}`}
                      >
                        {getDirectionIcon(step.icon)}
                        <div className="step-content">
                          <p className="step-text">{step.text}</p>
                          {step.distance > 0 && <span className="step-dist">({step.distance} meters)</span>}
                        </div>
                        {isStepCompleted && <CheckCircle size={16} className="step-status-icon completed-icon" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : selectedProduct ? (
          /* ==================== STATE 2: PRODUCT DETAIL ==================== */
          <div className="product-detail-panel">
            <div className="product-header">
              <span className="product-category-badge" style={{ borderColor: selectedProduct.imageColor, color: selectedProduct.imageColor }}>
                {selectedProduct.category}
              </span>
              <div className="product-title-row">
                <h2>{selectedProduct.name}</h2>
                <span className="product-price">${selectedProduct.price.toFixed(2)}</span>
              </div>
            </div>

            <p className="product-description">{selectedProduct.description}</p>

            {/* Aisle location info cards */}
            <div className="location-info-grid">
              <div className="info-card">
                <MapPin size={18} className="info-card-icon" />
                <div className="info-card-texts">
                  <span className="info-title">Aisle Section</span>
                  <span className="info-value">Rack {selectedProduct.rackId} ({selectedProduct.category})</span>
                </div>
              </div>
              <div className="info-card">
                <ChevronUp size={18} className="info-card-icon" />
                <div className="info-card-texts">
                  <span className="info-title">Shelf Placement</span>
                  <span className="info-value">{selectedProduct.shelf} of 5 (level Y = {(selectedProduct.shelf * 0.38).toFixed(1)}m)</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="actions-button-grid">
              <button className="primary-action-btn navigate-btn" onClick={onStartNavigation}>
                <Navigation size={18} fill="currentColor" />
                <span>Go to Item</span>
              </button>

              <button className="secondary-action-btn focus-btn" onClick={() => onFocusRack(selectedProduct.rackId)}>
                <Map size={18} />
                <span>Locate Shelf</span>
              </button>

              <button 
                className={`secondary-action-btn cart-btn ${isInCart ? 'in-cart' : ''}`} 
                onClick={() => onToggleCart(selectedProduct)}
              >
                <ShoppingCart size={18} />
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
            {showCartOnly ? (
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
                  
                  {isCompassActive && (
                    <div 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        marginTop: '8px',
                        letterSpacing: '0.2px'
                      }}
                    >
                      <span>🚶 Step Sensor Active: {stepCount} steps</span>
                    </div>
                  )}
                </div>

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

                {/* Educational guidance note */}
                <div className="guidance-banner">
                  <HelpCircle size={16} className="info-icon" />
                  <p>Search for products, select categories from the dropdown, or tap items on the 3D shelves to navigate.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
