import React from 'react';

export const Characters = () => {
  return (
    <group position={[0, -1.85, 2]} rotation={[0.2, 0, 0]}>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
         <planeGeometry args={[4, 2.5]} />
         <meshBasicMaterial color="#021502" transparent opacity={0.7} />
      </mesh>

      <group position={[-0.8, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <capsuleGeometry args={[0.35, 1.4, 8, 16]} />
          <meshStandardMaterial color="#c07070" roughness={0.9} />
        </mesh>
        
        <mesh position={[0, 0, 0.9]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#e0ac69" roughness={0.5} />
        </mesh>

        <group position={[0, 0.05, 0.9]}>
           <mesh position={[0, -0.1, -0.1]}>
              <sphereGeometry args={[0.35, 32, 32]} />
              <meshStandardMaterial color="#151515" roughness={0.9} />
           </mesh>
           {Array.from({ length: 25 }).map((_, i) => {
             const angle = (i / 25) * Math.PI * 2;
             const r = 0.28 + Math.random() * 0.05;
             return (
               <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * r * 0.5 + 0.1, Math.random() * 0.2]}>
                 <sphereGeometry args={[0.08 + Math.random() * 0.04, 16, 16]} />
                 <meshStandardMaterial color="#151515" roughness={0.8} />
               </mesh>
             )
           })}
        </group>
      </group>

      <group position={[0.8, 0, 0]}>
         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <capsuleGeometry args={[0.38, 1.5, 8, 16]} />
          <meshStandardMaterial color="#4a5a7a" roughness={0.9} />
        </mesh>

        <mesh position={[0, 0, 0.95]}>
          <sphereGeometry args={[0.31, 32, 32]} />
          <meshStandardMaterial color="#dcb890" roughness={0.5} />
        </mesh>

        <group position={[0, 0.1, 1.05]}>
           <mesh position={[0, 0, 0.05]} scale={[1, 0.8, 1]}>
             <sphereGeometry args={[0.32, 32, 32]} />
             <meshStandardMaterial color="#2a1a10" roughness={1} />
           </mesh>
           {Array.from({ length: 40 }).map((_, i) => {
              const phi = Math.acos(-1 + (2 * i) / 40);
              const theta = Math.sqrt(40 * Math.PI) * phi;
              const r = 0.32;
              
              return (
                <mesh key={i} position={[
                  r * Math.cos(theta) * Math.sin(phi),
                  r * Math.sin(theta) * Math.sin(phi) + 0.05,
                  r * Math.cos(phi) + 0.05
                ]}>
                  <sphereGeometry args={[0.06 + Math.random() * 0.03, 8, 8]} />
                  <meshStandardMaterial color="#2a1a10" />
                </mesh>
              )
           })}
        </group>
      </group>
    </group>
  );
};
