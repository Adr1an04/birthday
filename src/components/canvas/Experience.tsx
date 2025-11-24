'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Stars, Cloud, Instance, Instances } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Candle } from './Candle';
import { StoryPoints } from './StoryPoints';
import { Characters } from './Characters';
import { Suspense, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const GrassField = () => {
  return (
    <group position={[0, -2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 64, 64]} />
        <meshStandardMaterial color="#052b05" roughness={0.8} metalness={0.1} />
      </mesh>
       <fog attach="fog" args={['#051005', 5, 35]} />
    </group>
  );
};

const Trees = () => {
  const count = 100;
  const range = 40;
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * range;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      pos.push({ position: [x, -2, z], scale: 0.5 + Math.random() * 1.5 });
    }
    return pos;
  }, []);

  return (
    <Instances range={count}>
      <coneGeometry args={[1.5, 6, 8]} />
      <meshStandardMaterial color="#031a03" roughness={0.9} />
      {positions.map((data, i) => (
        <Instance key={i} position={data.position as any} scale={[data.scale, data.scale, data.scale]} />
      ))}
    </Instances>
  );
};

const SceneContent = () => {
  const phase = useStore((state) => state.phase);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (phase === 'main' && groupRef.current) {
    }
  });

  return (
    <>
        <ambientLight intensity={0.2} color="#051505" />

        <group visible={phase === 'intro'}>
             <group position={[11.5, -3, 0]} rotation={[0, -0.5, 0]}>
                 <Candle scale={3} />
              </group>
             <pointLight position={[10, 0, 2]} intensity={1} distance={10} color="#404050" />
        </group>

        {phase === 'main' && (
            <group>
               <GrassField />
               <Trees />
               <StoryPoints />
               <Characters />
               <Stars radius={100} depth={50} count={7000} factor={5} saturation={0} fade speed={0.5} />
               <Cloud opacity={0.3} speed={0.2} segments={20} position={[0, 10, -10]} color="#303050" />
               
               <group position={[20, 25, -120]}>
                 <mesh>
                   <sphereGeometry args={[12, 32, 32]} />
                   <meshStandardMaterial emissive="#ffffdd" emissiveIntensity={2} color="#ffffdd" />
                 </mesh>
                 <pointLight intensity={200} distance={1000} decay={1} color="#d0d0ff" />
               </group>

               <OrbitControls 
                  target={[0, 2, 0]} 
                  maxPolarAngle={Math.PI / 2.1}
                  minPolarAngle={0}
                  enableZoom={true}
                  minDistance={1}
                  maxDistance={20}
               />
            </group>
        )}
    </>
  );
}

export const Experience = () => {
  const phase = useStore((state) => state.phase);

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">
      <AnimatePresence>
        {phase === 'main' && (
             <motion.div 
                initial={{ opacity: 1 }} 
                animate={{ opacity: 0 }} 
                transition={{ duration: 3, ease: "easeInOut" }}
                className="absolute inset-0 bg-black z-10 pointer-events-none"
             />
        )}
      </AnimatePresence>

      <Canvas camera={{ position: [0, 1, 8], fov: 45 }} shadows>
        <Suspense fallback={null}>
          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.0} radius={0.4} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <Noise opacity={0.05} />
          </EffectComposer>
          
          <SceneContent />
          
        </Suspense>
      </Canvas>
      
      <AnimatePresence>
        {phase === 'intro' && (
            <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 pb-[15vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 2 } }}
            >
            <div className="text-amber-100/60 font-serif italic text-2xl md:text-3xl tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                Light the way...
            </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
