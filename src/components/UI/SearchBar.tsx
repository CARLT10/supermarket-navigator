import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Compass } from 'lucide-react';
import { type Product } from '../../data/products';

interface SearchBarProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onClear: () => void;
  selectedProduct?: Product;
  userNodeName: string;
  activeCategoryName: string | null;
  onSelectCategory: (rackId: string | null, categoryName: string | null) => void;
  isCompassActive?: boolean;
  onSyncCompass?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  products,
  onSelectProduct,
  onClear,
  selectedProduct,
  userNodeName,
  activeCategoryName,
  onSelectCategory,
  isCompassActive = false,
  onSyncCompass,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastSelectedNameRef = useRef<string>('');

  // Sync with selected product from external components
  useEffect(() => {
    if (selectedProduct) {
      setQuery(selectedProduct.name);
      lastSelectedNameRef.current = selectedProduct.name;
    } else {
      if (query === lastSelectedNameRef.current) {
        setQuery('');
      }
      lastSelectedNameRef.current = '';
    }
  }, [selectedProduct]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions based on query and active category
  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = products.filter(
        (p) =>
          (!activeCategoryName || p.category === activeCategoryName) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
           p.category.toLowerCase().includes(query.toLowerCase()))
      );
      setSuggestions(filtered);
    } else if (activeCategoryName) {
      // Suggest items in active category when input is focused but empty
      const filtered = products.filter((p) => p.category === activeCategoryName);
      setSuggestions(filtered);
    } else {
      // Suggest default items when category is "All Categories" and input is focused but empty
      setSuggestions(products);
    }
  }, [query, activeCategoryName, products]);

  // Toggle scroll indicator when suggestions load or dropdown state changes
  useEffect(() => {
    if (isOpen && suggestions.length > 5) {
      setShowScrollIndicator(true);
    } else {
      setShowScrollIndicator(false);
    }
  }, [isOpen, suggestions]);

  const handleScroll = () => {
    if (dropdownRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 20;
      if (isNearBottom && showScrollIndicator) {
        setShowScrollIndicator(false);
      } else if (!isNearBottom && !showScrollIndicator && suggestions.length > 5) {
        setShowScrollIndicator(true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    
    if (selectedProduct && val !== selectedProduct.name) {
      onClear();
    }
  };

  const handleSelectSuggestion = (product: Product) => {
    setQuery(product.name);
    onSelectProduct(product);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    onClear();
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      {/* Row 1: Main Search Input Box (takes full width) */}
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        
        {query && (
          <button className="clear-btn" onClick={handleClear} type="button">
            <X size={16} />
          </button>
        )}

        {/* Compass sync button on the right */}
        {onSyncCompass && (
          <>
            <div className="search-divider" />
            <button 
              type="button"
              className={`compass-sync-btn ${isCompassActive ? 'active' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                onSyncCompass();
              }}
              title="Sync Phone Compass"
            >
              <Compass size={16} className={isCompassActive ? 'spinning-compass' : ''} />
            </button>
          </>
        )}
      </div>

      {/* Row 2: Category Selector + Location Indicator (stacked underneath) */}
      <div className="search-meta-row">
        {/* Category Dropdown Selector */}
        <div className="category-select-wrapper">
          <select
            value={activeCategoryName || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                onSelectCategory(null, null);
              } else {
                const rackMap: Record<string, string> = {
                  'Fruits': 'A1',
                  'Vegetables': 'A2',
                  'Dairy': 'B1',
                  'Bakery': 'B2',
                  'Snacks': 'C1',
                  'Beverages': 'C2',
                };
                onSelectCategory(rackMap[val], val);
              }
            }}
            className="category-dropdown-select"
          >
            <option value="">All Categories</option>
            <option value="Fruits">Fruits 🍎</option>
            <option value="Vegetables">Vegetables 🥕</option>
            <option value="Dairy">Dairy 🥛</option>
            <option value="Bakery">Bakery 🍞</option>
            <option value="Snacks">Snacks 🍿</option>
            <option value="Beverages">Beverages 🥤</option>
          </select>
        </div>

        {/* GPS location pill indicator */}
        <div className="current-location-indicator">
          <MapPin size={14} className="pin-icon" />
          <span>{userNodeName === 'Supermarket Entrance' ? 'Entrance' : userNodeName.replace(' Shelf Access', '').replace(' Aisle', '')}</span>
        </div>
      </div>

      {/* Auto suggestions dropdown list */}
      {isOpen && suggestions.length > 0 && (
        <div className="search-dropdown-wrapper">
          <div 
            ref={dropdownRef}
            className="search-suggestions-dropdown"
            onScroll={handleScroll}
          >
            <div className="suggestions-header">
              {activeCategoryName ? `${activeCategoryName} Products` : 'Suggested Products'}
            </div>
            {suggestions.map((p) => (
              <div
                key={p.id}
                className="search-suggestion-item"
                onClick={() => handleSelectSuggestion(p)}
              >
                <div 
                  className="suggestion-color-dot" 
                  style={{ backgroundColor: p.imageColor }} 
                />
                <div className="suggestion-details">
                  <div className="suggestion-name">{p.name}</div>
                  <div className="suggestion-category">
                    {p.category} • Rack {p.rackId} • Shelf {p.shelf}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {showScrollIndicator && (
            <div className="scroll-indicator-fade">
              <div className="scroll-indicator-arrow">
                <span>More items below</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="chevron-down-animated"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
