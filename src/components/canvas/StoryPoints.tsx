'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface StoryPointProps {
  position: [number, number, number];
  text: string;
  delay?: number;
}

const StoryPoint = ({ position, text, delay = 0 }: StoryPointProps) => {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.2;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          setActive(!active);
        }}
        onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHovered(true);
        }}
        onPointerOut={() => {
            document.body.style.cursor = 'auto';
            setHovered(false);
        }}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={active ? "#ffaa44" : "#ffffff"}
          emissive={active ? "#ffaa44" : "#ffffff"}
          emissiveIntensity={active ? 2 : 0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <mesh scale={1.5}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>

      <Html position={[0, 0.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <AnimatePresence>
          {(active || hovered) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-48 text-center"
            >
              <div className={`bg-black/60 backdrop-blur-sm border border-white/10 p-3 rounded-lg text-white font-serif italic text-sm shadow-lg ${active ? 'bg-amber-900/40 border-amber-500/30' : ''}`}>
                "{text}"
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  );
};

export const StoryPoints = () => {
  const points = [
    { position: [2, 0, -3] as [number, number, number], text: "This is where we sat...", delay: 0 },
    { position: [-2, 1.5, -5] as [number, number, number], text: "The moon was watching us...", delay: 2 },
    { position: [0, 0.5, 2] as [number, number, number], text: "I knew in this moment...", delay: 4 },
  ];

  return (
    <group>
      {points.map((point, index) => (
        <StoryPoint key={index} {...point} />
      ))}
    </group>
  );
};
