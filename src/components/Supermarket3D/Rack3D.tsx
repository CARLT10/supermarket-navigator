import React from 'react';
import { Html } from '@react-three/drei';
import { type Rack } from '../../data/layout';
import { type Product } from '../../data/products';
import { ProductPlaceholder } from './ProductPlaceholder';

interface Rack3DProps {
  rack: Rack;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  selectedProductId?: string;
}

export const Rack3D: React.FC<Rack3DProps> = ({
  rack,
  products,
  onSelectProduct,
  selectedProductId,
}) => {
  const shelfYPositions = [0.1, 0.5, 0.9, 1.3, 1.7];

  // Filter products assigned to this rack
  const rackProducts = products.filter((p) => p.rackId === rack.id);

  // Grid wires counts for backing mesh
  const verticalWiresCount = 7;
  const horizontalWiresCount = 13;

  return (
    <group position={[rack.x, 0, rack.z]}>
      {/* 1. CENTRAL VERTICAL SUPPORT FRAME */}
      {/* Central Post Left */}
      <mesh position={[-rack.width / 3, rack.height / 2, 0]} castShadow>
        <boxGeometry args={[0.035, rack.height, 0.035]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Central Post Right */}
      <mesh position={[rack.width / 3, rack.height / 2, 0]} castShadow>
        <boxGeometry args={[0.035, rack.height, 0.035]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* 2. WIRE GRID BACKING PANEL (Divider) */}
      {/* Vertical Wires */}
      {Array.from({ length: verticalWiresCount }).map((_, i) => {
        const spacingX = (rack.width - 0.1) / (verticalWiresCount - 1);
        const posX = -rack.width / 2 + 0.05 + i * spacingX;
        return (
          <mesh key={`v-wire-${i}`} position={[posX, rack.height / 2, 0]}>
            <boxGeometry args={[0.005, rack.height - 0.04, 0.005]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}
      {/* Horizontal Wires */}
      {Array.from({ length: horizontalWiresCount }).map((_, i) => {
        const posY = 0.02 + (i * (rack.height - 0.04)) / (horizontalWiresCount - 1);
        return (
          <mesh key={`h-wire-${i}`} position={[0, posY, 0]}>
            <boxGeometry args={[rack.width - 0.08, 0.005, 0.005]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}

      {/* 3. BASE PLATFORM (With Red Kickplates) */}
      {/* Platform Base Structure */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[rack.width, 0.08, rack.depth]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>
      {/* Front Red Kickplate */}
      <mesh position={[0, 0.04, rack.depth / 2 - 0.005]} castShadow>
        <boxGeometry args={[rack.width, 0.08, 0.01]} />
        <meshStandardMaterial color="#be123c" roughness={0.3} />
      </mesh>
      {/* Back Red Kickplate */}
      <mesh position={[0, 0.04, -rack.depth / 2 + 0.005]} castShadow>
        <boxGeometry args={[rack.width, 0.08, 0.01]} />
        <meshStandardMaterial color="#be123c" roughness={0.3} />
      </mesh>
      {/* Base Platform Top Plate */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[rack.width + 0.01, 0.005, rack.depth + 0.01]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>

      {/* 4. DOUBLE-SIDED SHELVES */}
      {shelfYPositions.map((shelfY, index) => {
        // Render shelves on front and back (omit if bottom shelf is merged with base platform)
        return (
          <group key={`shelf-${index}`}>
            {/* Front Shelf Board */}
            <mesh position={[0, shelfY, rack.depth / 4]} castShadow receiveShadow>
              <boxGeometry args={[rack.width - 0.02, 0.015, rack.depth / 2 - 0.02]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            {/* Front Shelf Red Pricing Label Strip */}
            <mesh position={[0, shelfY, rack.depth / 2 - 0.01]} castShadow>
              <boxGeometry args={[rack.width - 0.02, 0.02, 0.005]} />
              <meshStandardMaterial color="#be123c" roughness={0.2} />
            </mesh>
            {/* Front Support Brackets */}
            <mesh position={[-rack.width / 3, shelfY - 0.03, rack.depth / 4]} castShadow>
              <boxGeometry args={[0.015, 0.06, rack.depth / 2 - 0.04]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
            </mesh>
            <mesh position={[rack.width / 3, shelfY - 0.03, rack.depth / 4]} castShadow>
              <boxGeometry args={[0.015, 0.06, rack.depth / 2 - 0.04]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
            </mesh>

            {/* Back Shelf Board */}
            <mesh position={[0, shelfY, -rack.depth / 4]} castShadow receiveShadow>
              <boxGeometry args={[rack.width - 0.02, 0.015, rack.depth / 2 - 0.02]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            {/* Back Shelf Red Pricing Label Strip */}
            <mesh position={[0, shelfY, -rack.depth / 2 + 0.01]} castShadow>
              <boxGeometry args={[rack.width - 0.02, 0.02, 0.005]} />
              <meshStandardMaterial color="#be123c" roughness={0.2} />
            </mesh>
            {/* Back Support Brackets */}
            <mesh position={[-rack.width / 3, shelfY - 0.03, -rack.depth / 4]} castShadow>
              <boxGeometry args={[0.015, 0.06, rack.depth / 2 - 0.04]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
            </mesh>
            <mesh position={[rack.width / 3, shelfY - 0.03, -rack.depth / 4]} castShadow>
              <boxGeometry args={[0.015, 0.06, rack.depth / 2 - 0.04]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
            </mesh>

            {/* Products on this shelf (covers both front and back placement automatically) */}
            <ProductPlaceholder
              products={rackProducts}
              shelfLevel={index + 1}
              shelfY={shelfY + 0.008}
              rackWidth={rack.width - 0.08}
              rackDepth={rack.depth}
              onSelectProduct={onSelectProduct}
              selectedProductId={selectedProductId}
            />
          </group>
        );
      })}

      {/* 5. CATEGORY BILLBOARD */}
      <group position={[0, rack.height + 0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.18, 0.02]} />
          <meshStandardMaterial color="#be123c" roughness={0.4} />
        </mesh>
        
        {/* Support pegs holding the sign */}
        <mesh position={[-0.2, -0.12, 0]} castShadow>
          <boxGeometry args={[0.02, 0.12, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0.2, -0.12, 0]} castShadow>
          <boxGeometry args={[0.02, 0.12, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Billboard text using drei Html (Front Side) */}
        <Html 
          transform 
          occlude
          distanceFactor={3.5}
          position={[0, 0, 0.012]}
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: '#be123c',
              color: '#ffffff',
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 800,
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 2px 4px rgb(0 0 0 / 0.15)',
            }}
          >
            {rack.name}
          </div>
        </Html>

        {/* Billboard text using drei Html (Back Side) */}
        <Html 
          transform 
          occlude
          distanceFactor={3.5}
          position={[0, 0, -0.012]}
          rotation={[0, Math.PI, 0]}
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: '#be123c',
              color: '#ffffff',
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 800,
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 2px 4px rgb(0 0 0 / 0.15)',
            }}
          >
            {rack.name}
          </div>
        </Html>
      </group>
    </group>
  );
};
export default Rack3D;
