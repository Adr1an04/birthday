'use client';

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

// --- Birthday Trigger Bubble ---
const BirthdayTriggerBubble = ({ position }: { position: [number, number, number] }) => {
  const [hovered, setHovered] = useState(false);
  const setBirthdayView = useStore((state) => state.setBirthdayView);
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1; // Faster bounce
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          setBirthdayView(true);
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
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color="#fbbf24" // Brighter gold
          emissive="#fbbf24"
          emissiveIntensity={hovered ? 4 : 2}
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Extra glow ring for distinctiveness */}
      <mesh scale={1.5}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
      </mesh>

      {/* Particle effect ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
         <ringGeometry args={[0.4, 0.45, 32]} />
         <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>

      <Html position={[0, 1, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.8 }}
              className="w-40 text-center"
            >
               <div className="bg-amber-500/20 backdrop-blur-md border border-amber-300/60 px-3 py-2 rounded-xl text-white font-bold font-serif text-sm shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse">
                ✨ Click for Surprise ✨
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  );
};

// --- Standard Message Bubble ---
interface MessageBubbleProps {
  position: [number, number, number];
  text: string;
}

const MessageBubble = ({ position, text }: MessageBubbleProps) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
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
        onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHovered(true);
        }}
        onPointerOut={() => {
            document.body.style.cursor = 'auto';
            setHovered(false);
        }}
      >
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color="#ffaa44"
          emissive="#ffaa44"
          emissiveIntensity={hovered ? 1.5 : 0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <mesh scale={1.5}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={0.05} />
      </mesh>

      <Html position={[0, 0.8, 0]} center distanceFactor={12} style={{ pointerEvents: 'none', width: '200px' }}>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.8 }}
              className="text-center"
            >
              <div className="bg-black/70 backdrop-blur-md border border-amber-500/40 px-4 py-3 rounded-xl text-amber-50 font-serif text-sm shadow-[0_0_15px_rgba(251,191,36,0.3)]">
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
  const messages = [
    { 
      position: [10, 2, 10] as [number, number, number], 
      text: "I'm so proud of the woman you've become" 
    },
    { 
      position: [18, 2.5, 18] as [number, number, number], 
      text: "You're doing amazing, keep going" 
    },
    { 
      position: [8, 3, 16] as [number, number, number], 
      text: "I'll never forget our first date here..." 
    },
    { 
      position: [20, 2.5, 12] as [number, number, number], 
      text: "Our first kiss under these stars was magical" 
    },
    {
      position: [14, 3.5, 6] as [number, number, number],
      text: "Every moment with you is a gift"
    }
  ];

  return (
    <group>
      {/* Unique Birthday Trigger Bubble */}
      <BirthdayTriggerBubble position={[14, 2.5, 14.3]} />

      {/* Standard Message Bubbles */}
      {messages.map((msg, index) => (
        <MessageBubble key={index} position={msg.position} text={msg.text} />
      ))}
    </group>
  );
};
