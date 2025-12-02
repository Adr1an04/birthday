'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useStore } from '@/store/useStore';

interface SandGrain {
  position: [number, number, number];
  velocity: [number, number, number];
  id: string;
  settled: boolean;
  color: string;
}

const Sandbox = () => {
  const isSandboxFocused = useStore((state) => state.isSandboxFocused);
  const setSandboxFocused = useStore((state) => state.setSandboxFocused);
  const [sandGrains, setSandGrains] = useState<SandGrain[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const sandboxRef = useRef<THREE.Group>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const hoverPlaneRef = useRef<THREE.Mesh>(null);
  const triggerMeshRef = useRef<THREE.Mesh>(null);
  const isDrawing = useRef(false);
  const lastAddTime = useRef(0);
  
  // Sandbox configuration
  const sandboxPosValues = [-9, .74, 8.5]; // Used for group position
  const sandboxSize = 6; 
  const sandboxHeight = 0.5;
  const grainSize = 0.06;
  
  // Physics constants
  const gravity = -9.8; 
  const friction = 0.9;
  const bounce = 0.1;

  // Spatial Height Map for performant stacking
  // grid resolution: 1 unit / grainSize * 2 approx
  const heightMap = useRef<Map<string, number>>(new Map());

  const getGridKey = (x: number, z: number) => {
    const res = 0.1; // Resolution of the grid
    return `${Math.round(x / res)},${Math.round(z / res)}`;
  };

  // Memoized geometry/material
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(grainSize, 4, 4);
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.9,
      metalness: 0.0,
    });
    return { geometry: geo, material: mat };
  }, []);

  const sandColors = useMemo(() => ['#e6c288', '#dcb374', '#d4a562', '#c59655'], []);

  // Update instances
  useEffect(() => {
    if (instancedMeshRef.current && sandGrains.length > 0) {
      instancedMeshRef.current.count = sandGrains.length;
      const matrix = new THREE.Matrix4();
      const color = new THREE.Color();
      
      sandGrains.forEach((grain, i) => {
        matrix.makeTranslation(...grain.position);
        instancedMeshRef.current!.setMatrixAt(i, matrix);
        instancedMeshRef.current!.setColorAt(i, color.set(grain.color));
      });
      
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      if (instancedMeshRef.current.instanceColor) instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [sandGrains]);

  // Physics Loop
  useFrame((state, delta) => {
    if (!isSandboxFocused || sandGrains.length === 0) return;

    let needsUpdate = false;
    
    // Only process active grains to save performance? 
    // For simplicity we iterate all but verify 'settled' quickly.
    // Optimized: Map over state is expensive if array is huge. 
    // But React state is the bottleneck here. 
    // For 1000+ grains, we might want a ref-based physics system and only sync to state rarely.
    // However, for this "low latency" request, let's stick to state but optimize the logic.

    setSandGrains(prev => {
      let hasActive = false;
      const updated = prev.map(grain => {
        if (grain.settled) return grain;
        
        hasActive = true;
        let [vx, vy, vz] = grain.velocity;
        let [x, y, z] = grain.position;

        // Gravity
        vy += gravity * delta;

        // Friction (air resistance)
        vx *= friction;
        vz *= friction;

        // Move
        x += vx * delta;
        y += vy * delta;
        z += vz * delta;

        // Check Height Map Collision
        const key = getGridKey(x, z);
        const groundHeight = heightMap.current.get(key) || 0;
        const collisionY = groundHeight + grainSize;

        if (y <= collisionY) {
             y = collisionY;
             vy *= -bounce;
             vx *= 0.5; // Ground friction
             vz *= 0.5;

             if (Math.abs(vy) < 0.05) {
                 // Settle
                 grain.settled = true;
                 y = collisionY; // Snap
                 // Update height map
                 heightMap.current.set(key, y);
             }
        }
        
        // Boundary Check (Local Space)
        const limit = sandboxSize / 2 - 0.2;
        if (Math.abs(x) > limit) {
            x = Math.sign(x) * limit;
            vx *= -0.5;
        }
        if (Math.abs(z) > limit) {
            z = Math.sign(z) * limit;
            vz *= -0.5;
        }

        return {
            ...grain,
            position: [x, y, z] as [number, number, number],
            velocity: [vx, vy, vz] as [number, number, number]
        };
      });

      if (hasActive) needsUpdate = true;
      return hasActive ? updated : prev;
    });
  });

  const handlePointerMove = (event: any) => {
    if (!isSandboxFocused || !isDrawing.current) return;

    const now = Date.now();
    if (now - lastAddTime.current < 30) return; 
    lastAddTime.current = now;

    if (event.point) {
      addSandAtPoint(event.point);
    }
  };

  const addSandAtPoint = (worldPoint: THREE.Vector3) => {
    // Convert World Point to Local Point
    const localPoint = worldPoint.clone().sub(new THREE.Vector3(...sandboxPosValues));
    
    // Add some randomness to spawn
    const spawnX = localPoint.x + (Math.random() - 0.5) * 0.2;
    const spawnZ = localPoint.z + (Math.random() - 0.5) * 0.2;
    
    // Check current height at spawn location to spawn ABOVE it
    const key = getGridKey(spawnX, spawnZ);
    const currentH = heightMap.current.get(key) || 0;
    const spawnY = Math.max(currentH + 0.5, 2.0); // Fall from at least 2.0 units or above stack

    const newGrain: SandGrain = {
      position: [spawnX, spawnY, spawnZ],
      velocity: [
        (Math.random() - 0.5) * 0.2,
        -1.0, // Initial downward velocity
        (Math.random() - 0.5) * 0.2
      ],
      id: Math.random().toString(36).substr(2, 9),
      settled: false,
      color: sandColors[Math.floor(Math.random() * sandColors.length)]
    };

    setSandGrains(prev => [...prev, newGrain]);
  };

  const FrameBeam = ({ position, rotation, size }: { position: [number, number, number], rotation: [number, number, number], size: [number, number, number] }) => (
      <mesh position={position} rotation={rotation} receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>
  );

  return (
    <group ref={sandboxRef} position={sandboxPosValues}>
      {/* Sand Surface Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.01, 0]}>
        <planeGeometry args={[sandboxSize, sandboxSize]} />
        <meshStandardMaterial 
          color="#d4a574" 
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Frame Beams */}
      {/* Top */}
      <FrameBeam position={[0, sandboxHeight/2, -sandboxSize/2 - 0.1]} rotation={[0, 0, 0]} size={[sandboxSize + 0.4, sandboxHeight, 0.2]} />
      {/* Bottom */}
      <FrameBeam position={[0, sandboxHeight/2, sandboxSize/2 + 0.1]} rotation={[0, 0, 0]} size={[sandboxSize + 0.4, sandboxHeight, 0.2]} />
      {/* Left */}
      <FrameBeam position={[-sandboxSize/2 - 0.1, sandboxHeight/2, 0]} rotation={[0, 0, 0]} size={[0.2, sandboxHeight, sandboxSize]} />
      {/* Right */}
      <FrameBeam position={[sandboxSize/2 + 0.1, sandboxHeight/2, 0]} rotation={[0, 0, 0]} size={[0.2, sandboxHeight, sandboxSize]} />

      {/* Trigger mesh - click to focus */}
      {!isSandboxFocused && (
        <mesh
          ref={triggerMeshRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, sandboxHeight + 0.5, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSandboxFocused(true);
          }}
          onPointerEnter={() => setIsHovering(true)}
          onPointerLeave={() => setIsHovering(false)}
        >
          <planeGeometry args={[sandboxSize, sandboxSize]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {/* Interaction Plane - Active when focused */}
      {isSandboxFocused && (
        <mesh
          ref={hoverPlaneRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 1.5, 0]} // Higher up to catch clicks for "falling" sand
          onPointerDown={(e) => {
            e.stopPropagation();
            isDrawing.current = true;
            if (e.point) addSandAtPoint(e.point);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => {
            e.stopPropagation();
            isDrawing.current = false;
          }}
          onPointerLeave={(e) => {
            isDrawing.current = false;
            setIsHovering(false);
          }}
          onPointerEnter={(e) => {
            setIsHovering(true);
          }}
        >
          {/* Invisible plane that catches raycasts */}
          <planeGeometry args={[sandboxSize, sandboxSize]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {/* Sand Grains Instance Mesh */}
      <instancedMesh
          ref={instancedMeshRef}
          args={[geometry, material, 5000]} // Limit to 5000 for perf
          castShadow
          receiveShadow
      />

      {/* Instruction label */}
      <Html position={[0, sandboxHeight + 1.5, 0]} center>
        <div className={`px-3 py-1 rounded-lg backdrop-blur-sm border transition-all ${
          isHovering 
            ? 'bg-amber-500/30 border-amber-400/50' 
            : 'bg-black/40 border-white/20'
        }`}>
          <p className="text-white text-xs font-serif select-none whitespace-nowrap">
            {isSandboxFocused 
              ? (isHovering ? 'Click & drag to sculpt' : 'Sculpting...')
              : (isHovering ? 'Click to focus' : 'Sandbox')
            }
          </p>
        </div>
      </Html>
    </group>
  );
};

export default Sandbox;
