import React, { useMemo } from 'react';
import * as THREE from 'three';
import { type Product } from '../../data/products';

// Dynamic, offline canvas texture generator for products
const createProductTextureCanvas = (name: string, category: string, primaryColor: string): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background packaging gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, primaryColor);
  grad.addColorStop(0.65, primaryColor);
  grad.addColorStop(1, '#0f172a'); // dark navy bottom
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // White label card in the middle
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8, 70, 240, 115);

  // Accent stripe matching product color
  ctx.fillStyle = primaryColor;
  ctx.fillRect(8, 70, 240, 10);

  // Category header
  ctx.fillStyle = '#64748b'; // slate grey
  ctx.font = '900 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(category.toUpperCase(), 16, 96);

  // Product Name with simple word wrap
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  const words = name.split(' ');
  let line = '';
  let y = 118;
  const maxWidth = 220;
  const lineHeight = 18;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, 16, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 16, y);

  // Gold stars at the bottom of the label
  ctx.fillStyle = '#fbbf24'; // amber-400
  ctx.font = '16px system-ui';
  for (let i = 0; i < 5; i++) {
    ctx.fillText('★', 16 + i * 14, 172);
  }

  // Barcode container box
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(16, 195, 224, 45);

  // Draw black barcode lines
  ctx.fillStyle = '#0f172a';
  let startX = 26;
  const barHeight = 28;
  const widths = [2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 1, 3, 2];
  
  for (let i = 0; i < widths.length; i++) {
    const width = widths[i];
    ctx.fillRect(startX, 200, width, barHeight);
    startX += width + (i % 3 === 0 ? 3 : 1);
  }

  // Draw barcode numbers
  ctx.fillStyle = '#64748b';
  ctx.font = '9px monospace';
  ctx.fillText('0  74139  02602  6', 45, 236);

  return canvas;
};

interface ProductItemProps {
  product: Product;
  isSelected: boolean;
  position: [number, number, number];
  boxWidth: number;
  boxHeight: number;
  boxDepth: number;
  isCylinder: boolean;
  onSelectProduct: (product: Product) => void;
}

// Subcomponent to optimize performance with useMemo texture caching
const ProductItem: React.FC<ProductItemProps> = ({
  product,
  isSelected,
  position,
  boxWidth,
  boxHeight,
  boxDepth,
  isCylinder,
  onSelectProduct,
}) => {
  const texture = useMemo(() => {
    const canvas = createProductTextureCanvas(product.name, product.category, product.imageColor);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [product.name, product.category, product.imageColor]);

  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelectProduct(product);
      }}
    >
      {isCylinder ? (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[boxWidth / 2, boxWidth / 2, boxHeight, 16]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.25}
            metalness={0.2}
            emissive={isSelected ? '#38bdf8' : '#000000'}
            emissiveIntensity={isSelected ? 0.35 : 0}
          />
        </mesh>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.3}
            metalness={0.1}
            emissive={isSelected ? '#38bdf8' : '#000000'}
            emissiveIntensity={isSelected ? 0.35 : 0}
          />
        </mesh>
      )}

      {/* Micro selection ring under the selected product */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -boxHeight / 2 + 0.005, 0]}>
          <ringGeometry args={[0.07, 0.09, 32]} />
          <meshBasicMaterial color="#38bdf8" side={2} />
        </mesh>
      )}
    </group>
  );
};

interface ProductPlaceholderProps {
  products: Product[];
  shelfLevel: number;
  shelfY: number;
  rackWidth: number;
  rackDepth: number;
  onSelectProduct: (product: Product) => void;
  selectedProductId?: string;
}

export const ProductPlaceholder: React.FC<ProductPlaceholderProps> = ({
  products,
  shelfLevel,
  shelfY,
  rackWidth,
  rackDepth: _rackDepth,
  onSelectProduct,
  selectedProductId,
}) => {
  // Filter products belonging to this shelf level
  const shelfProducts = products.filter((p) => p.shelf === shelfLevel);

  if (shelfProducts.length === 0) return null;

  return (
    <group position={[0, shelfY, 0]}>
      {shelfProducts.map((product, idx) => {
        // Place odd indexes on the back shelf (Z < 0) and even indexes on the front shelf (Z > 0)
        const isBack = idx % 2 === 1;
        
        // Calculate X position along the shelf width
        const itemsPerSide = Math.ceil(shelfProducts.length / 2);
        const sideIndex = Math.floor(idx / 2);
        
        const spacing = rackWidth / (itemsPerSide + 1);
        const posX = -rackWidth / 2 + spacing * (sideIndex + 1);
        
        // Z position: Front shelf center is at Z = +0.15, Back shelf center is at Z = -0.15.
        // Stagger slightly (+-0.02) to look realistic.
        const staggerZ = (sideIndex % 2 === 0 ? 0.025 : -0.025);
        const posZ = isBack ? -0.15 + staggerZ : 0.15 + staggerZ;
        
        // Box measurements for physical display
        const boxHeight = 0.13 + (idx % 3) * 0.02;
        const boxWidth = 0.07 + (idx % 2) * 0.015;
        const boxDepth = 0.07 + (idx % 3) * 0.01;

        const isSelected = selectedProductId === product.id;
        const isCylinder = idx % 3 === 2; // Cans vs Boxes ratio

        return (
          <ProductItem
            key={`${product.id}-${idx}`}
            product={product}
            isSelected={isSelected}
            position={[posX, boxHeight / 2, posZ]}
            boxWidth={boxWidth}
            boxHeight={boxHeight}
            boxDepth={boxDepth}
            isCylinder={isCylinder}
            onSelectProduct={onSelectProduct}
          />
        );
      })}
    </group>
  );
};
