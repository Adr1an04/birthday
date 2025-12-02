'use client';

import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

function CoupleModel(props: any) {
  try {
    const gltf = useGLTF('/us.glb') as any;
    const { nodes, scene } = gltf;
    const node = nodes && nodes['tripo_node_d76e81f1-1c5f-4ac8-824c-160969097c4e'];

    if (node) {
      return (
        <group {...props} dispose={null} rotation={[Math.PI / 2, Math.PI / 2, -0.15]} position={[14, 1.55, 14.3]} scale={2.5}>
          <mesh castShadow receiveShadow geometry={node.geometry} material={node.material} />
        </group>
      );
    }

    if (scene) {
      return (
        <group {...props} dispose={null} rotation={[Math.PI / 2, 0, ]} position={[0, -1.9, 2]}>
          <primitive object={scene} />
        </group>
      );
    }

    return null;
  } catch (e) {
    console.error('Error loading couple model:', e);
    return null;
  }
}

useGLTF.preload('/us.glb');

export const Characters = () => {
  return (
    <group>
      <Suspense fallback={null}>
        <CoupleModel />
      </Suspense>
    </group>
  );
};

