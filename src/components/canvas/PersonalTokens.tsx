'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const TokenTooltip = ({ text, visible }: { text: string; visible: boolean }) => (
  <Html position={[0, 1.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none', width: '150px' }}>
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.8 }}
          className="text-center"
        >
          <div className="bg-white/90 backdrop-blur-md border border-amber-200 px-3 py-2 rounded-lg text-amber-900 font-serif text-xs shadow-lg font-bold">
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </Html>
);

const MedicalKit = ({ position }: { position: [number, number, number] }) => {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const setInspectionTarget = useStore((state) => state.setInspectionTarget);
  useCursor(hovered);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      group.current.rotation.y += 0.01;
    }
  });

  return (
    <group 
      ref={group} 
      position={position} 
      onClick={(e) => {
        e.stopPropagation();
        setInspectionTarget({
          position,
          title: "Estoofa the doctor",
          text: "I love you so much my future doctor, you are going to save lives and make the world a better place! I AM SO PROUD OF YOU!",
          image: "/photo/doctor.jpg"
        });
      }}
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      {/* Glow Light */}
      <pointLight distance={3} intensity={hovered ? 2 : 0.5} color="#ef4444" />
      
      {/* Box */}
      <mesh>
        <boxGeometry args={[0.6, 0.5, 0.3]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={hovered ? 0.5 : 0} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#991b1b" />
      </mesh>
      {/* Cross Vertical */}
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[0.1, 0.3, 0.02]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      {/* Cross Horizontal */}
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[0.3, 0.1, 0.02]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      
      <TokenTooltip text="Estoofa the doctor" visible={hovered} />
    </group>
  );
};

const Suitcase = ({ position }: { position: [number, number, number] }) => {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const setInspectionTarget = useStore((state) => state.setInspectionTarget);
  useCursor(hovered);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + 1) * 0.1;
      group.current.rotation.y -= 0.005;
    }
  });

  return (
    <group 
      ref={group} 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setInspectionTarget({
          position,
          title: "Bro is adventurous",
          text: "ur literally everywhere, te amo my adventurous soulmate",
          image: "/photo/2.JPG"
        });
      }}
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      {/* Glow Light */}
      <pointLight distance={3} intensity={hovered ? 2 : 0.5} color="#fbbf24" />

      {/* Main Body */}
      <mesh>
        <boxGeometry args={[0.6, 0.4, 0.2]} />
        <meshStandardMaterial color="#78350f" emissive="#78350f" emissiveIntensity={hovered ? 0.2 : 0} />
      </mesh>
      {/* Straps */}
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.05, 0.42, 0.22]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={hovered ? 0.5 : 0} />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.05, 0.42, 0.22]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={hovered ? 0.5 : 0} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      {/* Stickers (Flags approximation) */}
      <mesh position={[-0.1, -0.05, 0.11]} rotation={[0, 0, 0.2]}>
        <circleGeometry args={[0.08]} />
        <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.2} /> 
      </mesh>
      <mesh position={[0.15, 0.05, 0.11]} rotation={[0, 0, -0.1]}>
        <circleGeometry args={[0.08]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.2} /> 
      </mesh>

      <TokenTooltip text="Venezuela & Panama 🌎" visible={hovered} />
    </group>
  );
};

const DogBone = ({ position }: { position: [number, number, number] }) => {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const setInspectionTarget = useStore((state) => state.setInspectionTarget);
  useCursor(hovered);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + 2) * 0.1;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      group.current.rotation.y += 0.01;
    }
  });

  return (
    <group 
      ref={group} 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setInspectionTarget({
          position,
          title: "Duque says awawa!",
          text: "Duque is ur epic little doggie I love him, mi tequeno.",
          image: "/photo/duque.png"
        });
      }}
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      {/* Glow Light */}
      <pointLight distance={3} intensity={hovered ? 2 : 0.5} color="#ffffff" />

      {/* Shaft */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4]} />
        <meshStandardMaterial color="#f3f4f6" emissive="#f3f4f6" emissiveIntensity={hovered ? 0.3 : 0} />
      </mesh>
      {/* Ends Left */}
      <mesh position={[-0.2, 0.08, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#f3f4f6" emissive="#f3f4f6" emissiveIntensity={hovered ? 0.3 : 0} />
      </mesh>
      <mesh position={[-0.2, -0.08, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#f3f4f6" emissive="#f3f4f6" emissiveIntensity={hovered ? 0.3 : 0} />
      </mesh>
      {/* Ends Right */}
      <mesh position={[0.2, 0.08, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#f3f4f6" emissive="#f3f4f6" emissiveIntensity={hovered ? 0.3 : 0} />
      </mesh>
      <mesh position={[0.2, -0.08, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#f3f4f6" emissive="#f3f4f6" emissiveIntensity={hovered ? 0.3 : 0} />
      </mesh>

      <TokenTooltip text="Duque says awawa!" visible={hovered} />
    </group>
  );
};

const FamilyHeart = ({ position }: { position: [number, number, number] }) => {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const setInspectionTarget = useStore((state) => state.setInspectionTarget);
  useCursor(hovered);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.8) * 0.1;
      // Heartbeat scale
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      group.current.scale.set(scale, scale, scale);
      group.current.rotation.y += 0.005;
    }
  });

  const shape = React.useMemo(() => {
    const s = new THREE.Shape();
    const x = 0, y = 0;
    s.moveTo(x + 0.25, y + 0.25);
    s.bezierCurveTo(x + 0.25, y + 0.25, x + 0.20, y, x, y);
    s.bezierCurveTo(x - 0.30, y, x - 0.30, y + 0.35, x - 0.30, y + 0.35);
    s.bezierCurveTo(x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95);
    s.bezierCurveTo(x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35);
    s.bezierCurveTo(x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y);
    s.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    return s;
  }, []);

  return (
    <group 
      ref={group} 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setInspectionTarget({
          position,
          title: "Best sister & daughter",
          text: "You are loved by everyone around you, you light up the room and are such a good person.",
          image: "/photo/family.png"
        });
      }}
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      {/* Glow Light */}
      <pointLight distance={3} intensity={hovered ? 2 : 0.5} color="#ec4899" />

      <group rotation={[0, 0, Math.PI]} position={[-0.25, 0.5, 0]} scale={0.5}>
        <mesh>
            <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 }]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={hovered ? 0.8 : 0.5} />
        </mesh>
      </group>

      <TokenTooltip text="Loving Family & Sister 👨‍👩‍👧" visible={hovered} />
    </group>
  );
};

export const PersonalTokens = () => {
  // Park layout: Couple is roughly at [14, 1.55, 14.3] (lower right)
  // Spreading tokens across the park (up/left from couple)
  return (
    <group>
      {/* Medical Kit - Top Left area */}
      <MedicalKit position={[-15, 2, -15]} />
      
      {/* Suitcase - Mid Left area */}
      <Suitcase position={[-5, 1.8, 0]} />
      
      {/* Dog Bone - Near Center/Top */}
      <DogBone position={[5, 1.5, -20]} />
      
      {/* Family Heart - Mid Right area */}
      <FamilyHeart position={[20, 2.2, -5]} />
    </group>
  );
};
