import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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

  // Product Name with simple word wrap (wrapped to avoid overlapping illustration)
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  const words = name.split(' ');
  let line = '';
  let y = 116;
  const maxWidth = 135; // Leave space on the right for illustration badge
  const lineHeight = 17;

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
  ctx.font = '14px system-ui';
  for (let i = 0; i < 5; i++) {
    ctx.fillText('★', 16 + i * 13, 172);
  }

  // Draw circular illustration badge on the right
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(195, 128, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw vector icon based on product details
  const nameL = name.toLowerCase();
  ctx.save();
  ctx.translate(195, 128); // center of the badge

  if (nameL.includes('apple')) {
    // Red Apple illustration
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 2, 16, 0, Math.PI * 2);
    ctx.fill();
    // Stem
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.quadraticCurveTo(5, -20, 8, -18);
    ctx.stroke();
    // Leaf
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(6, -18, 5, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (nameL.includes('strawberry')) {
    // Strawberry illustration
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.bezierCurveTo(-14, 10, 0, 20, 0, 20);
    ctx.bezierCurveTo(0, 20, 14, 10, 12, -8);
    ctx.bezierCurveTo(10, -18, -10, -18, -12, -8);
    ctx.fill();
    // Seed dots
    ctx.fillStyle = '#fde047';
    for (let i = -6; i <= 6; i += 4) {
      ctx.fillRect(i, -2, 2, 2);
      ctx.fillRect(i - 2, 6, 2, 2);
    }
    // Leaf cap
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(-14, -10);
    ctx.lineTo(0, -5);
    ctx.lineTo(14, -10);
    ctx.lineTo(8, -16);
    ctx.lineTo(0, -12);
    ctx.lineTo(-8, -16);
    ctx.closePath();
    ctx.fill();
  } else if (nameL.includes('banana')) {
    // Curved Banana illustration
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-10, -10, 20, 0.2, Math.PI / 2);
    ctx.stroke();
    // Tip
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(10, 10, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (nameL.includes('orange') || nameL.includes('peach')) {
    // Orange illustration
    ctx.fillStyle = nameL.includes('peach') ? '#fb923c' : '#f97316';
    ctx.beginPath();
    ctx.arc(0, 2, 16, 0, Math.PI * 2);
    ctx.fill();
    // Leaf
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(4, -14, 4, 7, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (nameL.includes('milk') || nameL.includes('dairy') || nameL.includes('yogurt') || category === 'Dairy') {
    // Milk Carton illustration
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-10, -6, 20, 22);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(0, -18);
    ctx.lineTo(10, -6);
    ctx.closePath();
    ctx.fill();
    // Label stripe
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-10, 2, 20, 6);
  } else if (nameL.includes('bread') || nameL.includes('baguette') || nameL.includes('croissant') || category === 'Bakery') {
    // Loaf of Bread illustration
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, 3, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Score marks
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -4); ctx.lineTo(-6, 8);
    ctx.moveTo(-2, -6); ctx.lineTo(2, 6);
    ctx.moveTo(6, -4); ctx.lineTo(10, 8);
    ctx.stroke();
  } else if (nameL.includes('soda') || nameL.includes('cola') || nameL.includes('beverage') || category === 'Beverages') {
    // Soda Can illustration
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-10, -12, 20, 24);
    // Silver tab/top
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-8, -15, 16, 3);
    ctx.fillRect(-8, 12, 16, 3);
    // Curved white slash
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-15, 0, 12, -Math.PI / 4, Math.PI / 4);
    ctx.stroke();
  } else if (nameL.includes('chips') || nameL.includes('snacks') || category === 'Snacks') {
    // Snack Bag illustration
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-12, -15);
    ctx.lineTo(12, -15);
    ctx.lineTo(10, 15);
    ctx.lineTo(-10, 15);
    ctx.closePath();
    ctx.fill();
    // Zigzag top
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -15);
    for (let x = -12; x <= 12; x += 4) {
      ctx.lineTo(x, -17 + (x % 8 === 0 ? 3 : 0));
    }
    ctx.stroke();
  } else {
    // Generic Box Icon matching product category
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-12, -12, 24, 24);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-8, -8, 16, 16);
  }

  ctx.restore();

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

// Global cache for sharing product packaging textures across duplicated items
const textureCache: Record<string, THREE.CanvasTexture> = {};

const getProductTexture = (name: string, category: string, primaryColor: string) => {
  const key = `${name}-${category}-${primaryColor}`;
  if (!textureCache[key]) {
    const canvas = createProductTextureCanvas(name, category, primaryColor);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    textureCache[key] = tex;
  }
  return textureCache[key];
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
    return getProductTexture(product.name, product.category, product.imageColor);
  }, [product.name, product.category, product.imageColor]);

  const pinRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isSelected && pinRef.current) {
      const time = state.clock.getElapsedTime();
      pinRef.current.position.y = boxHeight + 0.08 + Math.sin(time * 4) * 0.015;
      pinRef.current.rotation.y = time * 2.0;
    }
  });

  // Determine if this item has a custom 3D model
  const id = product.id;
  let custom3DModel = null;

  switch (id) {
    // === RACK A1: FRUITS ===
    case 'f1': // Red Apples
      custom3DModel = (
        <group>
          <mesh position={[0, boxWidth * 0.45, 0]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.45, 16, 16]} />
            <meshStandardMaterial 
              color="#ef4444" 
              roughness={0.25} 
              metalness={0.1}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxWidth * 0.85, 0]} rotation={[0.1, 0, 0.2]}>
            <cylinderGeometry args={[0.002, 0.002, 0.015, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          <mesh position={[0.006, boxWidth * 0.88, 0.004]} rotation={[0.4, 0.2, -0.5]}>
            <boxGeometry args={[0.01, 0.001, 0.014]} />
            <meshStandardMaterial color="#22c55e" roughness={0.6} />
          </mesh>
        </group>
      );
      break;

    case 'f2': // Bananas
      custom3DModel = (
        <group>
          {/* Stem/Crown */}
          <mesh position={[0, boxWidth * 0.6, 0.015]} rotation={[0, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.005, 0.008, 0.03, 8]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          {/* Banana 1 */}
          <mesh rotation={[0.2, 0.3, 0.5]} position={[-0.01, boxWidth * 0.32, 0]} castShadow receiveShadow>
            <torusGeometry args={[boxWidth * 0.4, 0.011, 8, 16, Math.PI / 2]} />
            <meshStandardMaterial 
              color="#eab308" 
              roughness={0.4} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Banana 2 */}
          <mesh rotation={[0.2, -0.3, 0.4]} position={[0.01, boxWidth * 0.3, 0]} castShadow>
            <torusGeometry args={[boxWidth * 0.38, 0.011, 8, 16, Math.PI / 2]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
          {/* Banana 3 */}
          <mesh rotation={[0.3, 0, 0.6]} position={[0, boxWidth * 0.35, 0.015]} castShadow>
            <torusGeometry args={[boxWidth * 0.35, 0.011, 8, 16, Math.PI / 2]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        </group>
      );
      break;

    case 'f3': // Strawberries
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.45, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
            <coneGeometry args={[boxWidth * 0.42, boxHeight * 0.85, 16]} />
            <meshStandardMaterial 
              color="#dc2626" 
              roughness={0.35} 
              metalness={0.1}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.84, 0]}>
            <cylinderGeometry args={[boxWidth * 0.44, boxWidth * 0.2, 0.01, 8]} />
            <meshStandardMaterial color="#16a34a" roughness={0.6} />
          </mesh>
        </group>
      );
      break;

    case 'f4': // Oranges
      custom3DModel = (
        <group>
          <mesh position={[0, boxWidth * 0.45, 0]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.45, 16, 16]} />
            <meshStandardMaterial 
              color="#f97316" 
              roughness={0.6} 
              metalness={0.1}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxWidth * 0.88, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.01, 6]} />
            <meshStandardMaterial color="#3f6212" roughness={0.8} />
          </mesh>
        </group>
      );
      break;

    case 'f5': // Blueberries
      custom3DModel = (
        <group>
          {/* Clear pint container */}
          <mesh position={[0, boxHeight * 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.1, boxHeight * 0.75, boxDepth * 1.1]} />
            <meshStandardMaterial 
              color="#cbd5e1" 
              transparent 
              opacity={0.4} 
              roughness={0.1} 
              metalness={0.1} 
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.76, 0]}>
            <boxGeometry args={[boxWidth * 1.12, 0.01, boxDepth * 1.12]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.2} />
          </mesh>
          {/* Berries inside container */}
          {Array.from({ length: 6 }).map((_, i) => {
            const rx = ((i % 3) - 1) * 0.018;
            const rz = (Math.floor(i / 3) - 0.5) * 0.02;
            const ry = 0.015 + (i % 2) * 0.012;
            return (
              <mesh key={`bb-${i}`} position={[rx, ry, rz]} castShadow>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
              </mesh>
            );
          })}
        </group>
      );
      break;

    case 'f6': // Green Grapes
      custom3DModel = (
        <group>
          {/* Grape bunch stem */}
          <mesh position={[0, boxHeight * 0.6, 0]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.003, 0.004, 0.06, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          {/* Grape spheres */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 6;
            const gx = Math.cos(angle) * (i > 5 ? 0.006 : 0.015);
            const gz = Math.sin(angle) * (i > 5 ? 0.006 : 0.015);
            const gy = 0.015 + Math.floor(i / 2) * 0.016;
            return (
              <mesh key={`gp-${i}`} position={[gx, gy, gz]} castShadow>
                <sphereGeometry args={[0.011, 8, 8]} />
                <meshStandardMaterial 
                  color="#84cc16" 
                  roughness={0.4} 
                  transparent 
                  opacity={0.85} 
                />
              </mesh>
            );
          })}
        </group>
      );
      break;

    case 'f7': // Watermelon (Mini)
      custom3DModel = (
        <group>
          <mesh position={[0, boxWidth * 0.55, 0]} scale={[1.2, 1, 1]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.55, 18, 18]} />
            <meshStandardMaterial 
              color="#047857" 
              roughness={0.2} 
              metalness={0.05}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Light green stripes */}
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh 
              key={`stripe-${i}`} 
              position={[0, boxWidth * 0.55, 0]} 
              scale={[1.21, 1.01, 1.01]} 
              rotation={[0, (i * Math.PI) / 4, 0]}
            >
              <sphereGeometry args={[boxWidth * 0.55, 8, 8, 0, 0.08, 0, Math.PI]} />
              <meshStandardMaterial color="#10b981" roughness={0.25} />
            </mesh>
          ))}
        </group>
      );
      break;

    case 'f8': // Peaches
      custom3DModel = (
        <group>
          <group position={[0, boxWidth * 0.45, 0]}>
            <mesh position={[-0.002, 0, 0]} castShadow receiveShadow>
              <sphereGeometry args={[boxWidth * 0.44, 16, 16]} />
              <meshStandardMaterial 
                color="#fdba74" 
                roughness={0.6} 
                emissive={isSelected ? '#38bdf8' : '#000000'}
                emissiveIntensity={isSelected ? 0.35 : 0}
              />
            </mesh>
            <mesh position={[0.002, 0, 0]} castShadow>
              <sphereGeometry args={[boxWidth * 0.44, 16, 16]} />
              <meshStandardMaterial color="#fca5a5" roughness={0.6} />
            </mesh>
          </group>
          {/* Leaf */}
          <mesh position={[0.005, boxWidth * 0.85, 0.005]} rotation={[0.3, 0.5, -0.6]}>
            <boxGeometry args={[0.012, 0.001, 0.018]} />
            <meshStandardMaterial color="#16a34a" roughness={0.5} />
          </mesh>
        </group>
      );
      break;

    // === RACK A2: VEGETABLES ===
    case 'v1': // Carrots
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.42, 0]} rotation={[Math.PI, 0, 0.05]} castShadow receiveShadow>
            <coneGeometry args={[boxWidth * 0.28, boxHeight * 0.8, 8]} />
            <meshStandardMaterial 
              color="#ea580c" 
              roughness={0.5} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Leafy greens */}
          <mesh position={[0.01, boxHeight * 0.82, 0]} rotation={[0.2, 0, -0.1]}>
            <cylinderGeometry args={[0.002, 0.012, 0.04, 6]} />
            <meshStandardMaterial color="#16a34a" roughness={0.7} />
          </mesh>
        </group>
      );
      break;

    case 'v2': // Broccoli Crown
      custom3DModel = (
        <group>
          {/* Stalk */}
          <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.012, 0.016, 0.05, 8]} />
            <meshStandardMaterial color="#86efac" roughness={0.8} />
          </mesh>
          {/* Head - Group of spheres to look textured */}
          <group position={[0, 0.05, 0]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[boxWidth * 0.55, 12, 12]} />
              <meshStandardMaterial 
                color="#15803d" 
                roughness={0.9} 
                emissive={isSelected ? '#38bdf8' : '#000000'}
                emissiveIntensity={isSelected ? 0.35 : 0}
              />
            </mesh>
            <mesh position={[-0.01, 0.01, -0.01]} castShadow>
              <sphereGeometry args={[boxWidth * 0.3, 8, 8]} />
              <meshStandardMaterial color="#166534" roughness={0.95} />
            </mesh>
            <mesh position={[0.01, 0.01, 0.01]} castShadow>
              <sphereGeometry args={[boxWidth * 0.3, 8, 8]} />
              <meshStandardMaterial color="#166534" roughness={0.95} />
            </mesh>
          </group>
        </group>
      );
      break;

    case 'v3': // Roma Tomatoes
      custom3DModel = (
        <group>
          <mesh position={[0, boxWidth * 0.5, 0]} scale={[1, 1.25, 1]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.45, 16, 16]} />
            <meshStandardMaterial 
              color="#dc2626" 
              roughness={0.2} 
              metalness={0.1}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxWidth * 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 0.012, 6]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
        </group>
      );
      break;

    case 'v4': // Spinach Bag
      custom3DModel = (
        <group>
          {/* Puffed plastic bag */}
          <mesh position={[0, boxHeight * 0.48, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.2, boxHeight * 0.85, boxDepth * 0.65]} />
            <meshStandardMaterial 
              color="#16a34a" 
              transparent 
              opacity={0.5} 
              roughness={0.2} 
              metalness={0.15}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Sealed top and bottom crimps */}
          <mesh position={[0, boxHeight * 0.91, 0]}>
            <boxGeometry args={[boxWidth * 1.25, 0.01, 0.015]} />
            <meshStandardMaterial color="#14532d" roughness={0.5} />
          </mesh>
          <mesh position={[0, boxHeight * 0.05, 0]}>
            <boxGeometry args={[boxWidth * 1.25, 0.01, 0.015]} />
            <meshStandardMaterial color="#14532d" roughness={0.5} />
          </mesh>
          {/* Internal leaves */}
          <mesh position={[0, boxHeight * 0.45, 0]}>
            <sphereGeometry args={[boxWidth * 0.45, 8, 8]} />
            <meshStandardMaterial color="#14532d" roughness={0.9} />
          </mesh>
        </group>
      );
      break;

    case 'v5': // Potatoes (5lb)
      custom3DModel = (
        <group>
          {/* Mesh sack outer shape */}
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.5, boxWidth * 0.5, boxHeight * 0.8, 10]} />
            <meshStandardMaterial 
              color="#b45309" 
              roughness={0.8} 
              transparent 
              opacity={0.6}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* gathered top */}
          <mesh position={[0, boxHeight * 0.85, 0]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color="#7c2d12" />
          </mesh>
          {/* Potatoes inside */}
          <mesh position={[-0.01, boxHeight * 0.25, -0.01]} castShadow>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          <mesh position={[0.01, boxHeight * 0.35, 0.01]} castShadow>
            <sphereGeometry args={[0.022, 6, 6]} />
            <meshStandardMaterial color="#854d0e" roughness={0.9} />
          </mesh>
          <mesh position={[-0.005, boxHeight * 0.55, 0.005]} castShadow>
            <sphereGeometry args={[0.021, 6, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
        </group>
      );
      break;

    case 'v6': // Red Onions
      custom3DModel = (
        <group>
          <mesh position={[0, boxWidth * 0.45, 0]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.45, 12, 12]} />
            <meshStandardMaterial 
              color="#701a75" 
              roughness={0.4} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Tapered dry stem */}
          <mesh position={[0, boxWidth * 0.9, 0]} rotation={[0.05, 0, -0.05]}>
            <coneGeometry args={[0.006, 0.025, 6]} />
            <meshStandardMaterial color="#a21caf" roughness={0.8} />
          </mesh>
        </group>
      );
      break;

    case 'v7': // Cucumber
      custom3DModel = (
        <group position={[0, 0.015, 0]} rotation={[0.05, 0.05, Math.PI / 2.05]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.013, 0.013, boxHeight * 1.3, 12]} />
            <meshStandardMaterial 
              color="#14532d" 
              roughness={0.5} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
        </group>
      );
      break;

    case 'v8': // Bell Pepper Mix
      custom3DModel = (
        <group>
          {/* Red pepper */}
          <group position={[-0.018, boxWidth * 0.38, -0.01]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[boxWidth * 0.55, boxWidth * 0.7, boxWidth * 0.55]} />
              <meshStandardMaterial color="#dc2626" roughness={0.15} metalness={0.1} />
            </mesh>
            <mesh position={[0, boxWidth * 0.36, 0]}>
              <cylinderGeometry args={[0.002, 0.002, 0.01, 6]} />
              <meshStandardMaterial color="#15803d" />
            </mesh>
          </group>
          {/* Yellow pepper */}
          <group position={[0.018, boxWidth * 0.38, -0.01]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[boxWidth * 0.55, boxWidth * 0.7, boxWidth * 0.55]} />
              <meshStandardMaterial color="#eab308" roughness={0.15} metalness={0.1} />
            </mesh>
            <mesh position={[0, boxWidth * 0.36, 0]}>
              <cylinderGeometry args={[0.002, 0.002, 0.01, 6]} />
              <meshStandardMaterial color="#15803d" />
            </mesh>
          </group>
          {/* Orange pepper */}
          <group position={[0, boxWidth * 0.4, 0.015]} rotation={[0, 0.5, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[boxWidth * 0.52, boxWidth * 0.7, boxWidth * 0.52]} />
              <meshStandardMaterial 
                color="#f97316" 
                roughness={0.15} 
                metalness={0.1} 
                emissive={isSelected ? '#38bdf8' : '#000000'}
                emissiveIntensity={isSelected ? 0.35 : 0}
              />
            </mesh>
            <mesh position={[0, boxWidth * 0.36, 0]}>
              <cylinderGeometry args={[0.002, 0.002, 0.01, 6]} />
              <meshStandardMaterial color="#15803d" />
            </mesh>
          </group>
        </group>
      );
      break;

    // === RACK B1: DAIRY ===
    case 'd1': // Whole Milk
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 0.9, boxHeight * 0.75, boxDepth * 0.9]} />
            <meshStandardMaterial 
              color="#f8fafc" 
              roughness={0.3} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Gabled Top */}
          <mesh position={[0, boxHeight * 0.83, 0]}>
            <cylinderGeometry args={[0, boxWidth * 0.65, boxHeight * 0.16, 4]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          {/* Red Cap */}
          <mesh position={[0.012, boxHeight * 0.88, 0.012]}>
            <cylinderGeometry args={[0.008, 0.008, 0.01, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} />
          </mesh>
        </group>
      );
      break;

    case 'd2': // Cheddar Cheese Block
      custom3DModel = (
        <group position={[0, boxHeight * 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.7, boxWidth * 0.7, boxHeight * 0.4, 3]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              roughness={0.4} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Red wax wrapping back edge */}
          <mesh position={[0, 0, 0]} scale={[1.01, 0.98, 1.01]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[boxWidth * 0.7, boxWidth * 0.7, boxHeight * 0.4, 3, 1, true, 0, Math.PI]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} />
          </mesh>
        </group>
      );
      break;

    case 'd3': // Greek Yogurt (32oz)
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.58, boxWidth * 0.48, boxHeight * 0.9, 16]} />
            <meshStandardMaterial 
              color="#ffffff" 
              roughness={0.3} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Blue Lid */}
          <mesh position={[0, boxHeight * 0.92, 0]}>
            <cylinderGeometry args={[boxWidth * 0.6, boxWidth * 0.6, boxHeight * 0.06, 16]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.2} metalness={0.1} />
          </mesh>
        </group>
      );
      break;

    case 'd4': // Unsalted Butter
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.28, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.3, boxHeight * 0.55, boxDepth * 0.8]} />
            <meshStandardMaterial 
              color="#fef08a" 
              roughness={0.5} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Wrap stripe */}
          <mesh position={[0, boxHeight * 0.28, 0]}>
            <boxGeometry args={[boxWidth * 0.5, boxHeight * 0.56, boxDepth * 0.82]} />
            <meshStandardMaterial color="#eab308" roughness={0.6} />
          </mesh>
        </group>
      );
      break;

    case 'd5': // Organic Brown Eggs
      custom3DModel = (
        <group>
          {/* Carton Base */}
          <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.4, 0.03, boxDepth * 1.1]} />
            <meshStandardMaterial 
              color="#94a3b8" 
              roughness={0.95} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Eggs inside */}
          {Array.from({ length: 6 }).map((_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const ex = (col - 1) * 0.03;
            const ez = (row - 0.5) * 0.035;
            return (
              <mesh key={`egg-${i}`} position={[ex, 0.034, ez]} scale={[1, 1.3, 1]} castShadow>
                <sphereGeometry args={[0.012, 10, 10]} />
                <meshStandardMaterial color="#d97706" roughness={0.7} />
              </mesh>
            );
          })}
        </group>
      );
      break;

    case 'd6': // Almond Milk (Unsweetened)
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 0.9, boxHeight * 0.75, boxDepth * 0.9]} />
            <meshStandardMaterial 
              color="#fef08a" 
              roughness={0.35} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Gabled Top */}
          <mesh position={[0, boxHeight * 0.83, 0]}>
            <cylinderGeometry args={[0, boxWidth * 0.65, boxHeight * 0.16, 4]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
          {/* Blue Cap */}
          <mesh position={[0.012, boxHeight * 0.88, 0.012]}>
            <cylinderGeometry args={[0.008, 0.008, 0.01, 8]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
        </group>
      );
      break;

    case 'd7': // Cream Cheese
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.2, boxHeight * 0.5, boxDepth * 0.9]} />
            <meshStandardMaterial 
              color="#ffffff" 
              roughness={0.25} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Green Lid */}
          <mesh position={[0, boxHeight * 0.52, 0]}>
            <boxGeometry args={[boxWidth * 1.24, boxHeight * 0.06, boxDepth * 0.94]} />
            <meshStandardMaterial color="#16a34a" roughness={0.3} metalness={0.1} />
          </mesh>
        </group>
      );
      break;

    case 'd8': // Sour Cream
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.55, boxWidth * 0.45, boxHeight * 0.9, 16]} />
            <meshStandardMaterial 
              color="#ffffff" 
              roughness={0.3} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Blue Stripe */}
          <mesh position={[0, boxHeight * 0.45, 0]} scale={[1.01, 0.3, 1.01]}>
            <cylinderGeometry args={[boxWidth * 0.53, boxWidth * 0.5, boxHeight * 0.9, 16, 1, true]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
          {/* White Lid */}
          <mesh position={[0, boxHeight * 0.92, 0]}>
            <cylinderGeometry args={[boxWidth * 0.57, boxWidth * 0.57, boxHeight * 0.06, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        </group>
      );
      break;

    // === RACK B2: BAKERY ===
    case 'b1': // Sourdough Bread
      custom3DModel = (
        <group>
          <mesh position={[0, boxWidth * 0.35, 0]} scale={[1.4, 0.8, 1.1]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.5, 16, 16]} />
            <meshStandardMaterial 
              color="#b45309" 
              roughness={0.85} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Scored cross lines */}
          <mesh position={[0, boxWidth * 0.74, 0]} rotation={[0.1, 0, 0.1]}>
            <boxGeometry args={[boxWidth * 0.4, 0.002, 0.005]} />
            <meshStandardMaterial color="#fef08a" />
          </mesh>
          <mesh position={[0, boxWidth * 0.74, 0]} rotation={[0.1, Math.PI / 2, 0.1]}>
            <boxGeometry args={[boxWidth * 0.4, 0.002, 0.005]} />
            <meshStandardMaterial color="#fef08a" />
          </mesh>
        </group>
      );
      break;

    case 'b2': // Butter Croissants
      custom3DModel = (
        <group>
          <mesh position={[0, boxWidth * 0.25, 0]} rotation={[0.1, 0, Math.PI / 6]} castShadow receiveShadow>
            <torusGeometry args={[boxWidth * 0.35, 0.016, 8, 16, Math.PI * 1.1]} />
            <meshStandardMaterial 
              color="#eab308" 
              roughness={0.55} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
        </group>
      );
      break;

    case 'b3': // Chocolate Muffins
      custom3DModel = (
        <group>
          {/* Ribbed paper cup */}
          <mesh position={[0, boxHeight * 0.25, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.44, boxWidth * 0.36, boxHeight * 0.5, 12]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          {/* Domed top */}
          <mesh position={[0, boxHeight * 0.55, 0]} scale={[1, 0.8, 1]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.5, 12, 12]} />
            <meshStandardMaterial 
              color="#451a03" 
              roughness={0.9} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Choc chips */}
          <mesh position={[0.01, boxHeight * 0.88, 0.01]}>
            <sphereGeometry args={[0.005, 4, 4]} />
            <meshStandardMaterial color="#1a0f08" roughness={0.9} />
          </mesh>
          <mesh position={[-0.012, 0.09, 0.008]}>
            <sphereGeometry args={[0.005, 4, 4]} />
            <meshStandardMaterial color="#1a0f08" roughness={0.9} />
          </mesh>
        </group>
      );
      break;

    case 'b4': // Chocolate Chip Cookies
      custom3DModel = (
        <group>
          {/* Cookie 1 (Bottom) */}
          <mesh position={[0, 0.006, 0]} rotation={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[boxWidth * 0.48, boxWidth * 0.48, 0.01, 10]} />
            <meshStandardMaterial 
              color="#854d0e" 
              roughness={0.8} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Cookie 2 (Middle) */}
          <mesh position={[0.005, 0.018, 0.005]} rotation={[0, -0.6, 0]} castShadow>
            <cylinderGeometry args={[boxWidth * 0.48, boxWidth * 0.48, 0.01, 10]} />
            <meshStandardMaterial color="#a16207" roughness={0.8} />
          </mesh>
          {/* Cookie 3 (Top) */}
          <mesh position={[-0.003, 0.03, -0.003]} rotation={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[boxWidth * 0.46, boxWidth * 0.46, 0.01, 10]} />
            <meshStandardMaterial color="#854d0e" roughness={0.8} />
          </mesh>
        </group>
      );
      break;

    case 'b5': // Whole Wheat Bread
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.42, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.4, boxHeight * 0.8, boxDepth * 0.95]} />
            <meshStandardMaterial 
              color="#b45309" 
              roughness={0.65} 
              transparent 
              opacity={0.9}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Twist tie */}
          <mesh position={[boxWidth * 0.72, boxHeight * 0.42, 0]} castShadow>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
      break;

    case 'b6': // Bagels (Plain 6pk)
      custom3DModel = (
        <group>
          {/* Stacked bagels inside sleeve */}
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow>
            <torusGeometry args={[boxWidth * 0.35, 0.014, 8, 12]} />
            <meshStandardMaterial 
              color="#eab308" 
              roughness={0.6} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0.002, boxHeight * 0.22, 0.002]} castShadow>
            <torusGeometry args={[boxWidth * 0.34, 0.014, 8, 12]} />
            <meshStandardMaterial color="#eab308" roughness={0.6} />
          </mesh>
          <mesh position={[-0.002, boxHeight * 0.68, -0.002]} castShadow>
            <torusGeometry args={[boxWidth * 0.33, 0.014, 8, 12]} />
            <meshStandardMaterial color="#facc15" roughness={0.6} />
          </mesh>
          {/* Transparent sleeve wrapper */}
          <mesh position={[0, boxHeight * 0.45, 0]}>
            <cylinderGeometry args={[boxWidth * 0.48, boxWidth * 0.48, boxHeight * 0.9, 10]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.35} roughness={0.1} />
          </mesh>
        </group>
      );
      break;

    case 'b7': // Apple Pie
      custom3DModel = (
        <group>
          {/* Aluminum pan */}
          <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.7, boxWidth * 0.65, 0.02, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Pie Crust */}
          <mesh position={[0, 0.02, 0]} scale={[1, 0.25, 1]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.68, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial 
              color="#ca8a04" 
              roughness={0.65} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Lattice stripes */}
          <mesh position={[0, 0.028, 0]} scale={[1, 0.25, 1]}>
            <sphereGeometry args={[boxWidth * 0.69, 12, 12, 0, Math.PI * 2, 0, Math.PI / 3]} />
            <meshStandardMaterial color="#a16207" roughness={0.7} />
          </mesh>
        </group>
      );
      break;

    case 'b8': // Cinnamon Rolls
      custom3DModel = (
        <group>
          {/* Tin tray */}
          <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.35, 0.012, boxDepth * 1.35]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Rolls grid */}
          {Array.from({ length: 4 }).map((_, i) => {
            const rx = ((i % 2) - 0.5) * boxWidth * 0.6;
            const rz = (Math.floor(i / 2) - 0.5) * boxDepth * 0.6;
            return (
              <group key={`roll-${i}`} position={[rx, 0.015, rz]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.022, 0.022, 0.02, 10]} />
                  <meshStandardMaterial 
                    color="#b45309" 
                    roughness={0.6} 
                    emissive={isSelected ? '#38bdf8' : '#000000'}
                    emissiveIntensity={isSelected ? 0.35 : 0}
                  />
                </mesh>
                <mesh position={[0, 0.011, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.002, 10]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.5} />
                </mesh>
              </group>
            );
          })}
        </group>
      );
      break;

    // === RACK C1: SNACKS ===
    case 's1': // Potato Chips (Classic)
      custom3DModel = (
        <group>
          {/* Puffed yellow pillow bag */}
          <mesh position={[0, boxHeight * 0.48, 0]} scale={[1.1, 1, 0.75]} rotation={[0.05, 0.05, 0]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.55, 12, 12]} />
            <meshStandardMaterial 
              color="#eab308" 
              roughness={0.15} 
              metalness={0.15}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Top seal */}
          <mesh position={[0, boxHeight * 0.9, 0]}>
            <boxGeometry args={[boxWidth * 1.15, 0.01, 0.015]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.4} />
          </mesh>
          {/* Bottom seal */}
          <mesh position={[0, boxHeight * 0.06, 0]}>
            <boxGeometry args={[boxWidth * 1.15, 0.01, 0.015]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.4} />
          </mesh>
        </group>
      );
      break;

    case 's2': // Tortilla Chips
      custom3DModel = (
        <group>
          {/* Puffed orange pillow bag */}
          <mesh position={[0, boxHeight * 0.48, 0]} scale={[1.15, 1, 0.75]} rotation={[-0.05, 0.05, 0.02]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.56, 12, 12]} />
            <meshStandardMaterial 
              color="#ea580c" 
              roughness={0.15} 
              metalness={0.15}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Sealed ends */}
          <mesh position={[0, boxHeight * 0.91, 0]}>
            <boxGeometry args={[boxWidth * 1.2, 0.01, 0.015]} />
            <meshStandardMaterial color="#ea580c" metalness={0.4} />
          </mesh>
          <mesh position={[0, boxHeight * 0.05, 0]}>
            <boxGeometry args={[boxWidth * 1.2, 0.01, 0.015]} />
            <meshStandardMaterial color="#ea580c" metalness={0.4} />
          </mesh>
          {/* Clear window showing chips */}
          <mesh position={[0, boxHeight * 0.4, boxDepth * 0.35]}>
            <boxGeometry args={[boxWidth * 0.5, boxHeight * 0.25, 0.005]} />
            <meshStandardMaterial color="#facc15" roughness={0.3} />
          </mesh>
        </group>
      );
      break;

    case 's3': // Chocolate Bar (Dark)
      custom3DModel = (
        <group rotation={[0.05, 0.1, 0.12]}>
          <mesh position={[0, boxHeight * 0.52, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 0.85, boxHeight * 0.95, 0.015]} />
            <meshStandardMaterial 
              color="#451a03" 
              roughness={0.4} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Foil paper tear */}
          <mesh position={[0, boxHeight * 0.88, 0.001]} scale={[0.92, 0.2, 1.1]}>
            <boxGeometry args={[boxWidth * 0.85, boxHeight, 0.015]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      );
      break;

    case 's4': // Mixed Nuts Bag
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.35, boxWidth * 0.5, boxHeight * 0.9, 12]} />
            <meshStandardMaterial 
              color="#b45309" 
              roughness={0.3} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Flat top edge */}
          <mesh position={[0, boxHeight * 0.9, 0]}>
            <boxGeometry args={[boxWidth * 0.8, 0.01, 0.012]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        </group>
      );
      break;

    case 's5': // Gummy Bears
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.48, 0]} scale={[1.05, 1, 0.65]} rotation={[0.02, -0.02, 0]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.52, 12, 12]} />
            <meshStandardMaterial 
              color="#f43f5e" 
              roughness={0.25} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.88, 0]}>
            <boxGeometry args={[boxWidth * 1.1, 0.01, 0.012]} />
            <meshStandardMaterial color="#be123c" roughness={0.5} />
          </mesh>
          <mesh position={[0, boxHeight * 0.08, 0]}>
            <boxGeometry args={[boxWidth * 1.1, 0.01, 0.012]} />
            <meshStandardMaterial color="#be123c" roughness={0.5} />
          </mesh>
          {/* Window */}
          <mesh position={[0, boxHeight * 0.45, boxDepth * 0.28]}>
            <boxGeometry args={[boxWidth * 0.45, boxHeight * 0.2, 0.005]} />
            <meshStandardMaterial color="#fbbf24" transparent opacity={0.7} roughness={0.2} />
          </mesh>
        </group>
      );
      break;

    case 's6': // Popcorn (Butter)
      custom3DModel = (
        <group>
          {/* striped bucket */}
          <mesh position={[0, boxHeight * 0.42, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.56, boxWidth * 0.42, boxHeight * 0.8, 16]} />
            <meshStandardMaterial 
              color="#ef4444" 
              roughness={0.3} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* White stripes */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh 
              key={`pstripe-${i}`} 
              position={[0, boxHeight * 0.42, 0]} 
              scale={[1.01, 1.002, 1.01]} 
              rotation={[0, (i * Math.PI) / 3, 0]}
            >
              <cylinderGeometry args={[boxWidth * 0.56, boxWidth * 0.42, boxHeight * 0.8, 8, 1, true, 0, 0.2]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
          ))}
          {/* Popcorn overflow */}
          <group position={[0, boxHeight * 0.82, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[boxWidth * 0.53, 8, 8]} />
              <meshStandardMaterial color="#fef08a" roughness={0.9} />
            </mesh>
            <mesh position={[0.01, 0.015, -0.01]}>
              <sphereGeometry args={[boxWidth * 0.2, 6, 6]} />
              <meshStandardMaterial color="#fef08a" roughness={0.9} />
            </mesh>
            <mesh position={[-0.015, 0.01, 0.015]}>
              <sphereGeometry args={[boxWidth * 0.18, 6, 6]} />
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>
          </group>
        </group>
      );
      break;

    case 's7': // Pretzels (Twists)
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.48, 0]} scale={[1.1, 1, 0.68]} rotation={[-0.03, -0.03, 0]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.55, 12, 12]} />
            <meshStandardMaterial 
              color="#2563eb" 
              roughness={0.2} 
              metalness={0.1}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.9, 0]}>
            <boxGeometry args={[boxWidth * 1.15, 0.01, 0.012]} />
            <meshStandardMaterial color="#1e40af" roughness={0.5} />
          </mesh>
          <mesh position={[0, boxHeight * 0.06, 0]}>
            <boxGeometry args={[boxWidth * 1.15, 0.01, 0.012]} />
            <meshStandardMaterial color="#1e40af" roughness={0.5} />
          </mesh>
        </group>
      );
      break;

    case 's8': // Granola Bars (Oat & Honey)
      custom3DModel = (
        <group>
          {/* Cardboard box */}
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.05, boxHeight * 0.9, boxDepth * 0.95]} />
            <meshStandardMaterial 
              color="#d97706" 
              roughness={0.5} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.45, 0.002]}>
            <boxGeometry args={[boxWidth * 1.07, boxHeight * 0.35, boxDepth * 0.96]} />
            <meshStandardMaterial color="#15803d" roughness={0.6} />
          </mesh>
        </group>
      );
      break;

    // === RACK C2: BEVERAGES ===
    case 'be1': // Spring Water (24pk)
      custom3DModel = (
        <group>
          {/* Shrink-wrap Case */}
          <mesh position={[0, boxHeight * 0.35, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.5, boxHeight * 0.65, boxDepth * 1.25]} />
            <meshStandardMaterial 
              color="#38bdf8" 
              transparent 
              opacity={0.45} 
              roughness={0.15} 
              metalness={0.1}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* caps inside case */}
          <mesh position={[-boxWidth * 0.42, boxHeight * 0.68, -boxDepth * 0.32]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.015, 8]} />
            <meshStandardMaterial color="#2563eb" roughness={0.5} />
          </mesh>
          <mesh position={[boxWidth * 0.42, boxHeight * 0.68, -boxDepth * 0.32]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.015, 8]} />
            <meshStandardMaterial color="#2563eb" roughness={0.5} />
          </mesh>
          <mesh position={[-boxWidth * 0.42, boxHeight * 0.68, boxDepth * 0.32]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.015, 8]} />
            <meshStandardMaterial color="#2563eb" roughness={0.5} />
          </mesh>
          <mesh position={[boxWidth * 0.42, boxHeight * 0.68, boxDepth * 0.32]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.015, 8]} />
            <meshStandardMaterial color="#2563eb" roughness={0.5} />
          </mesh>
        </group>
      );
      break;

    case 'be2': // Cola Soda (6pk)
      custom3DModel = (
        <group>
          {/* Cardboard 6-pack wrapping */}
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.35, boxHeight * 0.9, boxDepth * 0.9]} />
            <meshStandardMaterial 
              color="#dc2626" 
              roughness={0.45} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Can tops */}
          <mesh position={[-boxWidth * 0.34, boxHeight * 0.91, -boxDepth * 0.22]}>
            <cylinderGeometry args={[0.015, 0.015, 0.005, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[boxWidth * 0.34, boxHeight * 0.91, -boxDepth * 0.22]}>
            <cylinderGeometry args={[0.015, 0.015, 0.005, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-boxWidth * 0.34, boxHeight * 0.91, boxDepth * 0.22]}>
            <cylinderGeometry args={[0.015, 0.015, 0.005, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[boxWidth * 0.34, boxHeight * 0.91, boxDepth * 0.22]}>
            <cylinderGeometry args={[0.015, 0.015, 0.005, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
      break;

    case 'be3': // Organic Orange Juice
      custom3DModel = (
        <group>
          {/* Orange liquid */}
          <mesh position={[0, boxHeight * 0.44, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.46, boxWidth * 0.46, boxHeight * 0.85, 12]} />
            <meshStandardMaterial 
              color="#f97316" 
              roughness={0.2} 
              transparent 
              opacity={0.8}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* bottle neck */}
          <mesh position={[0, boxHeight * 0.9, 0]} castShadow>
            <cylinderGeometry args={[boxWidth * 0.22, boxWidth * 0.46, boxHeight * 0.12, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
          </mesh>
          {/* Green Cap */}
          <mesh position={[0, boxHeight * 0.98, 0]}>
            <cylinderGeometry args={[boxWidth * 0.24, boxWidth * 0.24, boxHeight * 0.05, 10]} />
            <meshStandardMaterial color="#16a34a" roughness={0.4} />
          </mesh>
        </group>
      );
      break;

    case 'be4': // Green Tea (12pk)
      custom3DModel = (
        <group>
          {/* Green box case */}
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.45, boxHeight * 0.9, boxDepth * 1.05]} />
            <meshStandardMaterial 
              color="#16a34a" 
              roughness={0.45} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* label card */}
          <mesh position={[0, boxHeight * 0.45, boxDepth * 0.53]}>
            <boxGeometry args={[boxWidth * 1.1, boxHeight * 0.45, 0.002]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>
      );
      break;

    case 'be5': // Dark Roast Coffee Beans
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.46, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.12, boxHeight * 0.9, boxDepth * 0.88]} />
            <meshStandardMaterial 
              color="#451a03" 
              roughness={0.7} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Gold valve */}
          <mesh position={[0, boxHeight * 0.65, boxDepth * 0.45]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.003, 8]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Top clip */}
          <mesh position={[0, boxHeight * 0.93, 0]}>
            <boxGeometry args={[boxWidth * 1.18, 0.02, 0.03]} />
            <meshStandardMaterial color="#1c0d02" roughness={0.9} />
          </mesh>
        </group>
      );
      break;

    case 'be6': // Apple Cider
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.52, boxWidth * 0.52, boxHeight * 0.75, 16]} />
            <meshStandardMaterial 
              color="#b45309" 
              transparent 
              opacity={0.8} 
              roughness={0.25} 
              metalness={0.05}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* tapered top */}
          <mesh position={[0, boxHeight * 0.84, 0]} castShadow>
            <cylinderGeometry args={[boxWidth * 0.22, boxWidth * 0.52, boxHeight * 0.15, 16]} />
            <meshStandardMaterial color="#b45309" transparent opacity={0.8} />
          </mesh>
          {/* neck */}
          <mesh position={[0, boxHeight * 0.93, 0]} castShadow>
            <cylinderGeometry args={[boxWidth * 0.18, boxWidth * 0.18, boxHeight * 0.06, 12]} />
            <meshStandardMaterial color="#b45309" transparent opacity={0.8} />
          </mesh>
          {/* White Cap */}
          <mesh position={[0, boxHeight * 0.97, 0]}>
            <cylinderGeometry args={[boxWidth * 0.2, boxWidth * 0.2, 0.015, 10]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Ring handle */}
          <mesh position={[boxWidth * 0.28, boxHeight * 0.75, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.016, 0.005, 8, 12]} />
            <meshStandardMaterial color="#b45309" transparent opacity={0.8} />
          </mesh>
        </group>
      );
      break;

    case 'be7': // Sparkling Water (Lemon 12pk)
      custom3DModel = (
        <group>
          {/* Yellow/Green box case */}
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.45, boxHeight * 0.9, boxDepth * 1.05]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              roughness={0.45} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Yellow accents */}
          <mesh position={[0, boxHeight * 0.45, boxDepth * 0.53]}>
            <boxGeometry args={[boxWidth * 1.05, boxHeight * 0.4, 0.002]} />
            <meshStandardMaterial color="#a3e635" roughness={0.5} />
          </mesh>
        </group>
      );
      break;

    case 'be8': // Energy Drink (4pk)
      custom3DModel = (
        <group>
          {/* Purple cardboard carrier */}
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 0.95, boxHeight * 0.9, boxDepth * 0.95]} />
            <meshStandardMaterial 
              color="#7c3aed" 
              roughness={0.4} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {/* Slim cans inside */}
          <mesh position={[-boxWidth * 0.22, boxHeight * 0.91, -boxDepth * 0.22]}>
            <cylinderGeometry args={[0.014, 0.014, 0.005, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[boxWidth * 0.22, boxHeight * 0.91, -boxDepth * 0.22]}>
            <cylinderGeometry args={[0.014, 0.014, 0.005, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-boxWidth * 0.22, boxHeight * 0.91, boxDepth * 0.22]}>
            <cylinderGeometry args={[0.014, 0.014, 0.005, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[boxWidth * 0.22, boxHeight * 0.91, boxDepth * 0.22]}>
            <cylinderGeometry args={[0.014, 0.014, 0.005, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
      break;


    case 'f9': // Pears
      custom3DModel = (
        <group>
          {/* Tapered green body */}
          <mesh position={[0, boxWidth * 0.4, 0]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.44, 16, 16]} />
            <meshStandardMaterial 
              color="#a3e635" 
              roughness={0.4} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxWidth * 0.72, 0]}>
            <cylinderGeometry args={[boxWidth * 0.2, boxWidth * 0.38, boxWidth * 0.4, 12]} />
            <meshStandardMaterial color="#a3e635" roughness={0.4} />
          </mesh>
          {/* Stem */}
          <mesh position={[0, boxWidth * 0.94, 0]} rotation={[0.1, 0, 0.2]}>
            <cylinderGeometry args={[0.002, 0.002, 0.018, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
        </group>
      );
      break;

    case 'f10': // Mangoes
      custom3DModel = (
        <group>
          {/* Oblong kidney-shaped yellow-orange sphere */}
          <mesh position={[0, boxWidth * 0.45, 0]} scale={[1.3, 1, 0.85]} rotation={[0.1, 0.2, 0.3]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.42, 16, 16]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              roughness={0.25} 
              metalness={0.05}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
        </group>
      );
      break;

    case 'v9': // Garlic Bulbs
      custom3DModel = (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.024, 12, 12]} />
            <meshStandardMaterial 
              color="#f8fafc" 
              roughness={0.7} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 5;
            const gx = Math.cos(angle) * 0.012;
            const gz = Math.sin(angle) * 0.012;
            return (
              <mesh key={`garlic-${i}`} position={[gx, 0.016, gz]} castShadow>
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.75} />
              </mesh>
            );
          })}
          <mesh position={[0, 0.04, 0]} rotation={[0.05, 0, -0.05]}>
            <coneGeometry args={[0.003, 0.02, 6]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
          </mesh>
        </group>
      );
      break;

    case 'v10': // Sweet Potatoes
      custom3DModel = (
        <group>
          <mesh position={[0, 0.022, 0]} scale={[1.4, 0.8, 0.8]} rotation={[0.05, 0.1, Math.PI / 12]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.52, 12, 12]} />
            <meshStandardMaterial 
              color="#b45309" 
              roughness={0.8} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
        </group>
      );
      break;

    case 'd9': // Paneer (Cottage Cheese)
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.15, boxHeight * 0.5, boxDepth * 1.15]} />
            <meshStandardMaterial 
              color="#ffffff" 
              roughness={0.6} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.25, 0]} scale={[1.02, 1.02, 1.02]}>
            <boxGeometry args={[boxWidth * 1.15, boxHeight * 0.5, boxDepth * 1.15]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
          </mesh>
        </group>
      );
      break;

    case 'd10': // Salted Butter
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.28, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 1.3, boxHeight * 0.55, boxDepth * 0.8]} />
            <meshStandardMaterial 
              color="#fef08a" 
              roughness={0.5} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.28, 0]}>
            <boxGeometry args={[boxWidth * 0.5, boxHeight * 0.56, boxDepth * 0.82]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
        </group>
      );
      break;

    case 'b9': // Garlic Bread
      custom3DModel = (
        <group>
          <mesh position={[0, 0.015, 0]} scale={[1.8, 0.65, 0.8]} rotation={[0, 0.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.018, 0.018, boxWidth * 1.5, 12]} />
            <meshStandardMaterial 
              color="#d97706" 
              roughness={0.8} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          {Array.from({ length: 4 }).map((_, i) => {
            const rx = (i - 1.5) * 0.025;
            return (
              <mesh key={`gcut-${i}`} position={[rx, 0.025, 0]} rotation={[0, 0, Math.PI / 6]}>
                <boxGeometry args={[0.002, 0.01, 0.025]} />
                <meshStandardMaterial color="#fef08a" />
              </mesh>
            );
          })}
        </group>
      );
      break;

    case 'b10': // Blueberry Muffins
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.25, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.44, boxWidth * 0.36, boxHeight * 0.5, 12]} />
            <meshStandardMaterial color="#2563eb" roughness={0.7} />
          </mesh>
          <mesh position={[0, boxHeight * 0.55, 0]} scale={[1, 0.8, 1]} castShadow receiveShadow>
            <sphereGeometry args={[boxWidth * 0.5, 12, 12]} />
            <meshStandardMaterial 
              color="#ca8a04" 
              roughness={0.8} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0.005, boxHeight * 0.88, 0.008]}>
            <sphereGeometry args={[0.006, 5, 5]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
          </mesh>
          <mesh position={[-0.01, boxHeight * 0.86, -0.01]}>
            <sphereGeometry args={[0.006, 5, 5]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
          </mesh>
        </group>
      );
      break;

    case 's9': // Cheese Balls Tub
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.42, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.5, boxWidth * 0.5, boxHeight * 0.8, 16]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.35} 
              roughness={0.1}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.85, 0]}>
            <cylinderGeometry args={[boxWidth * 0.52, boxWidth * 0.52, boxHeight * 0.06, 16]} />
            <meshStandardMaterial color="#ea580c" roughness={0.3} />
          </mesh>
          {Array.from({ length: 5 }).map((_, i) => {
            const rx = ((i % 2) - 0.5) * 0.024;
            const rz = (Math.floor(i / 2) - 0.5) * 0.024;
            const ry = 0.02 + (i % 3) * 0.03;
            return (
              <mesh key={`cball-${i}`} position={[rx, ry, rz]} castShadow>
                <sphereGeometry args={[0.015, 6, 6]} />
                <meshStandardMaterial color="#f97316" roughness={0.8} />
              </mesh>
            );
          })}
        </group>
      );
      break;

    case 's10': // Salted Peanuts
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.34, boxWidth * 0.46, boxHeight * 0.9, 12]} />
            <meshStandardMaterial 
              color="#d97706" 
              roughness={0.4} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.9, 0]}>
            <boxGeometry args={[boxWidth * 0.76, 0.01, 0.012]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.6} />
          </mesh>
        </group>
      );
      break;

    case 'be9': // Coconut Water
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[boxWidth * 0.9, boxHeight * 0.88, boxDepth * 0.9]} />
            <meshStandardMaterial 
              color="#22c55e" 
              roughness={0.3} 
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0.015, boxHeight * 0.94, -0.015]} rotation={[0.2, 0, -0.1]}>
            <cylinderGeometry args={[0.002, 0.002, 0.03, 6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
        </group>
      );
      break;

    case 'be10': // Mango Juice
      custom3DModel = (
        <group>
          <mesh position={[0, boxHeight * 0.44, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[boxWidth * 0.44, boxWidth * 0.44, boxHeight * 0.84, 12]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              roughness={0.2} 
              transparent 
              opacity={0.8}
              emissive={isSelected ? '#38bdf8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
            />
          </mesh>
          <mesh position={[0, boxHeight * 0.89, 0]} castShadow>
            <cylinderGeometry args={[boxWidth * 0.22, boxWidth * 0.44, boxHeight * 0.12, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.35} roughness={0.1} />
          </mesh>
          <mesh position={[0, boxHeight * 0.97, 0]}>
            <cylinderGeometry args={[boxWidth * 0.24, boxWidth * 0.24, boxHeight * 0.05, 10]} />
            <meshStandardMaterial color="#16a34a" roughness={0.4} />
          </mesh>
        </group>
      );
      break;

    default:
      break;
  }

  if (custom3DModel) {
    return (
      <group 
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onSelectProduct(product);
        }}
      >
        {custom3DModel}
        {/* Micro selection ring and floating location pin under/above the selected product */}
        {isSelected && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
              <ringGeometry args={[boxWidth / 2 + 0.005, boxWidth / 2 + 0.018, 32]} />
              <meshBasicMaterial color="#38bdf8" side={2} />
            </mesh>
            {/* Floating 3D Location Pin above the product */}
            <group ref={pinRef} position={[0, boxHeight + 0.08, 0]}>
              <mesh position={[0, 0.04, 0]} castShadow>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} emissive="#ef4444" emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[0, 0.01, 0]} rotation={[Math.PI, 0, 0]} castShadow>
                <coneGeometry args={[0.015, 0.04, 8]} />
                <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} emissive="#ef4444" emissiveIntensity={0.5} />
              </mesh>
            </group>
          </>
        )}
      </group>
    );
  }

  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelectProduct(product);
      }}
    >
      {isCylinder ? (
        <mesh castShadow receiveShadow position={[0, boxHeight / 2, 0]}>
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
        <mesh castShadow receiveShadow position={[0, boxHeight / 2, 0]}>
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

      {/* Micro selection ring and floating location pin under/above the selected product */}
      {isSelected && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[boxWidth / 2 + 0.005, boxWidth / 2 + 0.018, 32]} />
            <meshBasicMaterial color="#38bdf8" side={2} />
          </mesh>
          {/* Floating 3D Location Pin above the product */}
          <group ref={pinRef} position={[0, boxHeight + 0.08, 0]}>
            <mesh position={[0, 0.04, 0]} castShadow>
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} emissive="#ef4444" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.01, 0]} rotation={[Math.PI, 0, 0]} castShadow>
              <coneGeometry args={[0.015, 0.04, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} emissive="#ef4444" emissiveIntensity={0.5} />
            </mesh>
          </group>
        </>
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
          <group key={`${product.id}-${idx}`}>
            {Array.from({ length: 10 }).map((_, d) => {
              const itemSpacing = boxWidth + 0.02;
              const itemPosX = posX + (d - 4.5) * itemSpacing;
              // Add a slight realistic depth stagger to make it look like a physical shelf stock
              const staggerZ = ((d % 2 === 0 ? 1 : -1) * 0.008) + (d * 0.002);
              const itemPosZ = posZ + staggerZ;

              return (
                <ProductItem
                  key={`${product.id}-${idx}-${d}`}
                  product={product}
                  isSelected={isSelected}
                  position={[itemPosX, 0, itemPosZ]}
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
      })}
    </group>
  );
};
