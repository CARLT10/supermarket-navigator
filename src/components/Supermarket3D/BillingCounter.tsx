import React from 'react';
import { Html } from '@react-three/drei';
import { BILLING_COUNTER, EXIT } from '../../data/layout';

interface BillingCounterProps {
  onCheckoutClick?: () => void;
}

export const BillingCounter: React.FC<BillingCounterProps> = ({ onCheckoutClick }) => {
  return (
    <group>
      {/* 1. Cashier Counter Desk */}
      <group position={[BILLING_COUNTER.x, 0.4, BILLING_COUNTER.z]}>
        {/* Table/Desk */}
        <mesh castShadow receiveShadow onClick={() => onCheckoutClick?.()}>
          <boxGeometry args={[1.4, 0.8, 0.7]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
        </mesh>
        
        {/* Counter Top (Wood/Glass effect) */}
        <mesh position={[0, 0.41, 0]} castShadow receiveShadow onClick={() => onCheckoutClick?.()}>
          <boxGeometry args={[1.45, 0.04, 0.75]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.1} emissive="#0369a1" emissiveIntensity={0.2} />
        </mesh>

        {/* Pos Terminal Monitor / Cashier Screen */}
        <group position={[0.2, 0.6, 0.1]} rotation={[0, -Math.PI / 4, 0]}>
          {/* Base Stand */}
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          {/* Screen Box */}
          <mesh position={[0, 0.15, 0]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.25, 0.18, 0.03]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {/* Screen Display Glowing Face */}
          <mesh position={[0, 0.15, 0.016]} rotation={[0.2, 0, 0]}>
            <planeGeometry args={[0.23, 0.16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Billing Counter Label */}
        <group position={[0, 1.4, 0]}>
          <Html
            transform
            occlude
            distanceFactor={3.5}
            style={{
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: '#0284c7',
                color: '#ffffff',
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 700,
                fontSize: '13px',
                padding: '3px 8px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                border: '1.5px solid #38bdf8',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.15)',
              }}
            >
              🛒 Billing Counter
            </div>
          </Html>
        </group>
      </group>

      {/* 2. Exit Gate / Checkout Lane */}
      <group position={[EXIT.x, 0, EXIT.z]}>
        {/* Metal Gate Pillars */}
        <mesh position={[-0.4, 0.6, -0.2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.4, 0.6, -0.2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Turnstile/Barrier Arm */}
        <mesh position={[0, 0.8, -0.2]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.78, 0.05, 0.05]} />
          <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* Exit Label Sign */}
        <group position={[0, 2.0, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.22, 0.02]} />
            <meshStandardMaterial color="#16a34a" roughness={0.4} />
          </mesh>
          {/* Supporting double hangers */}
          <mesh position={[-0.2, 0.15, 0]} castShadow>
            <boxGeometry args={[0.02, 0.15, 0.01]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0.2, 0.15, 0]} castShadow>
            <boxGeometry args={[0.02, 0.15, 0.01]} />
            <meshStandardMaterial color="#475569" />
          </mesh>

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
                background: '#15803d',
                color: '#ffffff',
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 800,
                fontSize: '14px',
                padding: '2px 10px',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                letterSpacing: '1px',
                border: '1px solid #4ade80',
              }}
            >
              EXIT 🚪
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
};
