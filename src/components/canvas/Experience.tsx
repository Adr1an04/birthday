'use client';

import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import Image from 'next/image';
import { Howl } from 'howler';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Html, Stars } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { Candle } from './Candle';
import { Characters } from './Characters';
import { Park } from './Park';
import { StoryPoints } from './StoryPoints';
import { PersonalTokens } from './PersonalTokens';
import Sandbox from './Sandbox';

const CinematicCamera = ({ onComplete }: { onComplete: () => void }) => {
  const { camera } = useThree();
  const phase = useStore((state) => state.phase);
  const isBirthdayView = useStore((state) => state.isBirthdayView);
  const inspectionTarget = useStore((state) => state.inspectionTarget);
  const isSandboxFocused = useStore((state) => state.isSandboxFocused);
  const setCinematicAnimationCompleted = useStore((state) => state.setCinematicAnimationCompleted);
  const startTime = useRef<number | null>(null);
  
  // Target: Couple at [14, 1.55, 14.3]
  const lookAtTarget = new THREE.Vector3(14, 2, 14);
  
  // Define a CatmullRom curve for smooth flight around
  const curve = useMemo(() => {
      return new THREE.CatmullRomCurve3([
          new THREE.Vector3(20, 40, -60), // Start (Moon side, high)
          new THREE.Vector3(60, 20, 0),   // Mid (Wide side sweep)
          new THREE.Vector3(14, 25, 50)   // End (Behind, high)
      ]);
  }, []);

  useFrame((state) => {
    if (phase !== 'main' || isBirthdayView || inspectionTarget || isSandboxFocused) return;
    
    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTime.current;
    const duration = 18; // Longer sequence
    
    if (elapsed < duration) {
      const t = elapsed / duration;
      // Smooth ease out for the flight
      const ease = 1 - Math.pow(1 - t, 3);
      
      // Sample the curve
      const pos = curve.getPoint(ease);

      camera.position.copy(pos);
      camera.lookAt(lookAtTarget);
    } else {
        if (elapsed < duration + 0.1) {
             const endPos = curve.getPoint(1);
             camera.position.copy(endPos);
             camera.lookAt(lookAtTarget);
             setCinematicAnimationCompleted(true);
             onComplete();
        }
    }
  });

  return null;
};

const FloatingPhoto = ({ url, position, rotation, scale = 1, delay = 0 }: { url: string, position: [number, number, number], rotation: [number, number, number], scale?: number, delay?: number }) => {
    const texture = useTexture(url);
    const ref = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.5;
        }
    });

    return (
        <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
            <planeGeometry args={[3, 2]} />
            <meshBasicMaterial map={texture} transparent opacity={0.95} side={THREE.DoubleSide} />
            <mesh position={[0, 0, -0.01]}>
                 <planeGeometry args={[3.1, 2.1]} />
                 <meshBasicMaterial color="#000000" />
            </mesh>
        </mesh>
    );
};

const Confetti = () => {
    const confettiRef = useRef<THREE.Points>(null);
    const count = 200;
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 100;
            p[i * 3 + 1] = Math.random() * 50 + 20;
            p[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }
        return p;
    }, []);

    useFrame((state) => {
        if (confettiRef.current) {
            const positions = confettiRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                positions[i * 3 + 1] -= 0.1 + Math.random() * 0.1;
                if (positions[i * 3 + 1] < -10) {
                    positions[i * 3 + 1] = 70;
                }
            }
            confettiRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={confettiRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.5} color="#ffaa00" transparent opacity={0.8} />
        </points>
    );
};

const Fireflies = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 150;
  
  const [positions] = useMemo(() => {
    const p = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
      p[i*3] = (Math.random() - 0.5) * 60;
      p[i*3+1] = Math.random() * 8 + 0.5;
      p[i*3+2] = (Math.random() - 0.5) * 60;
    }
    return [p];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    
    for(let i=0; i<count; i++) {
      const i3 = i * 3;
      // Organic movement
      positions[i3+1] += Math.sin(time * 0.5 + positions[i3]) * 0.005;
      positions[i3] += Math.cos(time * 0.3 + positions[i3+1]) * 0.005;
      positions[i3+2] += Math.sin(time * 0.3 + positions[i3]) * 0.005;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#ffffaa" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
};

const FloatingLanterns = () => {
  const count = 30;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const initialPositions = useMemo(() => {
      const p = [];
      for(let i=0; i<count; i++) {
          p.push({
              x: (Math.random() - 0.5) * 120,
              y: Math.random() * 40,
              z: (Math.random() - 0.5) * 120 - 40, 
              speed: 0.3 + Math.random() * 0.5,
              offset: Math.random() * Math.PI * 2
          });
      }
      return p;
  }, []);

  useFrame((state) => {
      if (!mesh.current) return;
      const time = state.clock.elapsedTime;
      
      initialPositions.forEach((pos, i) => {
          const y = (pos.y + time * pos.speed) % 80; 
          const wobble = Math.sin(time + pos.offset) * 2;
          
          dummy.position.set(pos.x + wobble, y, pos.z);
          dummy.rotation.y = time * 0.2 + pos.offset;
          const scale = 1 + Math.sin(time * 2 + pos.offset) * 0.1;
          dummy.scale.set(scale, scale, scale);
          
          dummy.updateMatrix();
          mesh.current.setMatrixAt(i, dummy.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
          <cylinderGeometry args={[0.3, 0.2, 0.6, 8]} />
          <meshStandardMaterial color="#ffaa33" emissive="#ff6600" emissiveIntensity={2} toneMapped={false} transparent opacity={0.9} />
      </instancedMesh>
  );
};

const BirthdaySequence = () => {
    const { camera } = useThree();
    const isBirthdayView = useStore((state) => state.isBirthdayView);
    const setBirthdayView = useStore((state) => state.setBirthdayView);
    const cinematicAnimationCompleted = useStore((state) => state.cinematicAnimationCompleted);
    const birthdayAnimationCompleted = useStore((state) => state.birthdayAnimationCompleted);
    const setBirthdayAnimationCompleted = useStore((state) => state.setBirthdayAnimationCompleted);
    const [showContent, setShowContent] = useState(false);
    const startTime = useRef<number | null>(null);

    // Start: Current camera pos (roughly [14, 25, 50] looking at couple)
    // End: [14, 3, 16] (Eye level near couple) looking at Moon [20, 25, -120]
    const targetPos = new THREE.Vector3(14, 3, 16);
    const moonPos = new THREE.Vector3(20, 25, -120);
    
    // Store the camera position/rotation before entering birthday view
    const lastCameraState = useRef<{position: THREE.Vector3, quaternion: THREE.Quaternion} | null>(null);
    
    // Play sound when content is shown
    useEffect(() => {
        if (showContent && isBirthdayView) {
            const sound = new Howl({
                src: ['/confetti.mp3'],
                volume: 1.0,
            });
            sound.play();
        }
    }, [showContent, isBirthdayView]);

    useEffect(() => {
        if (isBirthdayView) {
            // Only save if we don't have a saved state yet
            if (!lastCameraState.current) {
                lastCameraState.current = {
                    position: camera.position.clone(),
                    quaternion: camera.quaternion.clone()
                };
            }

            // If birthday animation already completed, show content immediately
            if (birthdayAnimationCompleted) {
                camera.position.copy(targetPos);
                camera.lookAt(moonPos);
                setShowContent(true);
            }
        } else if (lastCameraState.current) {
            // Restore state when leaving - only if cinematic animation has completed
            if (cinematicAnimationCompleted) {
                camera.position.copy(lastCameraState.current.position);
                camera.quaternion.copy(lastCameraState.current.quaternion);
            }
            // Clear state after restoring
            lastCameraState.current = null;
        }
        
        // Keyboard listener for Escape
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isBirthdayView) {
                setBirthdayView(false);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isBirthdayView, camera, setBirthdayView, cinematicAnimationCompleted, birthdayAnimationCompleted, targetPos, moonPos]);

    useFrame((state) => {
        if (!isBirthdayView) {
            startTime.current = null;
            if (showContent) setShowContent(false);
            return;
        }

        // If birthday animation already completed, ensure content is shown and skip animation
        if (birthdayAnimationCompleted) {
            if (!showContent) {
                setShowContent(true);
            }
            return;
        }

        // Animation hasn't completed yet - play it
        if (startTime.current === null) {
            startTime.current = state.clock.elapsedTime;
        }

        const elapsed = state.clock.elapsedTime - startTime.current;
        const duration = 3; // 3 seconds to move to view

        if (elapsed < duration) {
            // Still animating - continue the camera movement
            camera.position.lerp(targetPos, 0.05);
            
            const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
            const targetLookAt = moonPos.clone();
            
            const mixLookAt = new THREE.Vector3().lerpVectors(currentLookAt, targetLookAt, 0.05);
            camera.lookAt(mixLookAt);

        } else {
            // Animation finished - set final position, mark as completed, and show content
            camera.position.copy(targetPos);
            camera.lookAt(moonPos);
            
            // Mark animation as completed AFTER it finishes
            if (!birthdayAnimationCompleted) {
                setBirthdayAnimationCompleted(true);
            }
            
            if (!showContent) {
                setShowContent(true);
            }
        }
    });

    return (
        <>
            {showContent && (
                <group>
                    <Confetti />

                    {/* Floating Photos around the moon view - evenly distributed individually */}
                    <FloatingPhoto url="/photo/1.JPG" position={[-35, 10, -70]} rotation={[0, 0.2, 0.1]} scale={5.5} delay={0} />
                    <FloatingPhoto url="/photo/2.JPG" position={[55, 35, -90]} rotation={[0, -0.2, -0.1]} scale={6} delay={1} />
                    <FloatingPhoto url="/photo/3.JPG" position={[-25, 30, -80]} rotation={[0, 0.1, 0.2]} scale={5.7} delay={2} />
                    <FloatingPhoto url="/photo/4.JPG" position={[45, 5, -65]} rotation={[0, -0.3, 0]} scale={5.5} delay={3} />
                    <FloatingPhoto url="/photo/5.JPG" position={[-10, 15, -85]} rotation={[0, 0.15, -0.1]} scale={5.6} delay={4} />
                    <FloatingPhoto url="/photo/6.png" position={[35, 25, -85]} rotation={[0, -0.25, 0.15]} scale={5.8} delay={5} />
                    <FloatingPhoto url="/photo/7.png" position={[-15, 35, -75]} rotation={[0, 0.3, 0.2]} scale={5.7} delay={6} />
                    <FloatingPhoto url="/photo/8.JPG" position={[10, 5, -60]} rotation={[0, 0.3, -0.1]} scale={6} delay={7} />
                    <FloatingPhoto url="/photo/9.JPG" position={[35, 15, -70]} rotation={[0, -0.15, -0.2]} scale={5.9} delay={8} />
                    <FloatingPhoto url="/photo/IMG_6867.JPG" position={[0, 38, -95]} rotation={[0, 0.25, 0.15]} scale={5.8} delay={9} />
                    <FloatingPhoto url="/photo/IMG_8021.JPG" position={[60, 10, -70]} rotation={[0, -0.2, -0.15]} scale={5.7} delay={10} />
                    <FloatingPhoto url="/photo/IMG_8012.JPG" position={[5, 12, -80]} rotation={[0, 0.35, -0.2]} scale={5.9} delay={11} />
                    <FloatingPhoto url="/photo/IMG_0172.JPG" position={[-40, 20, -75]} rotation={[0, 0.2, 0.1]} scale={5.8} delay={12} />
                    <FloatingPhoto url="/photo/IMG_1014.jpg" position={[65, 25, -85]} rotation={[0, -0.25, -0.1]} scale={6.0} delay={13} />
                    <FloatingPhoto url="/photo/date.png" position={[20, 45, -110]} rotation={[0, 0, 0]} scale={6.5} delay={14} />

                    {/* Main Birthday Message */}
                    <Html position={[20, 25, -120]} center distanceFactor={100} style={{ pointerEvents: 'none' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, type: "spring" }}
                            className="text-center px-4"
                        >
                            <div className="relative">
                                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-amber-100 leading-tight"
                                    style={{ 
                                        textShadow: '4px 4px 8px rgba(0,0,0,0.8), 0 0 20px rgba(251,191,36,0.8), 0 0 40px rgba(251,191,36,0.6)'
                                    }}>
                                    Happy Birthday!
                                </h1>
                                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/80 font-serif mt-4 italic"
                                    style={{ 
                                        textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)'
                                    }}>
                                    To my moon and stars...
                                </div>
                            </div>
                        </motion.div>
                    </Html>
                </group>
            )}
        </>
    );
};

const InspectionManager = () => {
    const { camera } = useThree();
    const inspectionTarget = useStore((state) => state.inspectionTarget);
    const setInspectionTarget = useStore((state) => state.setInspectionTarget);
    const lastCameraState = useRef<{position: THREE.Vector3, quaternion: THREE.Quaternion} | null>(null);
    
    useEffect(() => {
        if (inspectionTarget) {
            // Save
            lastCameraState.current = {
                position: camera.position.clone(),
                quaternion: camera.quaternion.clone()
            };
        } else if (lastCameraState.current) {
            // Restore
            camera.position.copy(lastCameraState.current.position);
            camera.quaternion.copy(lastCameraState.current.quaternion);
            lastCameraState.current = null;
        }
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && inspectionTarget) {
                setInspectionTarget(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inspectionTarget, camera, setInspectionTarget]);

    // Create a ref for the modal group
    const modalGroupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (!inspectionTarget) return;

        const targetPos = new THREE.Vector3(...inspectionTarget.position);
        // Position: much further back to see the object and context
        const viewPos = targetPos.clone().add(new THREE.Vector3(0, 5, 15));
        
        camera.position.lerp(viewPos, 0.05);
        
        const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
        const mixLookAt = new THREE.Vector3().lerpVectors(currentLookAt, targetPos, 0.05);
        camera.lookAt(mixLookAt);

        // Update modal position to stay in front of camera
        if (modalGroupRef.current) {
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            modalGroupRef.current.position.copy(camera.position).add(forward.multiplyScalar(4)); // Closer distance
            modalGroupRef.current.quaternion.copy(camera.quaternion);
        }
    });

    return (
        <>
            {inspectionTarget && (
                <group ref={modalGroupRef}>
                    <Html center transform distanceFactor={2.5} style={{ pointerEvents: 'none' }}> {/* Lower distance factor = smaller appearance */}
                         <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="w-32 pointer-events-auto"
                         >
                            <div className="bg-black/80 backdrop-blur-md border border-amber-500/50 p-2 rounded-lg text-amber-50 shadow-[0_0_30px_rgba(251,191,36,0.2)] flex flex-col items-center relative">
                                 <button 
                                    onClick={() => setInspectionTarget(null)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 transition-colors z-50 cursor-pointer text-[8px] leading-none"
                                 >
                                    ✕
                                 </button>
                                 {inspectionTarget.image && (
                                     <div className="w-full h-16 relative mb-1.5 rounded overflow-hidden border border-white/10 shrink-0">
                                         <Image 
                                            src={inspectionTarget.image} 
                                            alt={inspectionTarget.title}
                                            fill
                                            className="object-cover"
                                         />
                                     </div>
                                 )}
                                <h3 className="text-[10px] font-bold font-serif text-amber-300 mb-0.5 leading-tight">{inspectionTarget.title}</h3>
                                <p className="text-white/90 leading-tight font-serif text-center text-[9px]">{inspectionTarget.text}</p>
                                <div className="mt-1 text-[8px] text-white/50 italic text-center">
                                    Esc or ✕
                                </div>
                            </div>
                         </motion.div>
                    </Html>
                </group>
            )}
        </>
    );
};

const SandboxFocusManager = () => {
    const { camera } = useThree();
    const isSandboxFocused = useStore((state) => state.isSandboxFocused);
    const setSandboxFocused = useStore((state) => state.setSandboxFocused);
    const lastCameraState = useRef<{position: THREE.Vector3, quaternion: THREE.Quaternion} | null>(null);
    
    useEffect(() => {
        if (isSandboxFocused) {
            // Save camera state when focusing
            lastCameraState.current = {
                position: camera.position.clone(),
                quaternion: camera.quaternion.clone()
            };
        } else if (lastCameraState.current) {
            // Restore camera state when unfocusing
            camera.position.copy(lastCameraState.current.position);
            camera.quaternion.copy(lastCameraState.current.quaternion);
            lastCameraState.current = null;
        }
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSandboxFocused) {
                setSandboxFocused(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSandboxFocused, camera, setSandboxFocused]);

    useFrame(() => {
        if (!isSandboxFocused) return;

        // Sandbox position: [-15, 1.5, 14]
        const sandboxPos = new THREE.Vector3(-9, 3, 14);
        // Position camera to look at sandbox from a good angle
        const viewPos = sandboxPos.clone().add(new THREE.Vector3(0, 5, 15));
        
        camera.position.lerp(viewPos, 0.05);
        
        const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
        const mixLookAt = new THREE.Vector3().lerpVectors(currentLookAt, sandboxPos, 0.05);
        camera.lookAt(mixLookAt);
    });

    return null;
};

const SceneContent = () => {
  const phase = useStore((state) => state.phase);
  const isBirthdayView = useStore((state) => state.isBirthdayView);
  const inspectionTarget = useStore((state) => state.inspectionTarget);
  const isSandboxFocused = useStore((state) => state.isSandboxFocused);
  const isCandleLit = useStore((state) => state.isCandleLit);
  const groupRef = useRef<THREE.Group>(null);
  const [cinematicFinished, setCinematicFinished] = useState(false);

  const frontLight = useRef<THREE.PointLight>(null);
  const rimLight = useRef<THREE.PointLight>(null);
  const introAmbient = useRef<THREE.AmbientLight>(null);

  useFrame((state, delta) => {
    if (phase === 'intro') {
        // "Small" lighting initially (4/3), then "Flash" (100/80) when lit
        const targetFront = isCandleLit ? 100 : 4;
        const targetRim = isCandleLit ? 80 : 3;
        const targetAmbient = isCandleLit ? 4 : 0.2;
        
        // Lerp speed: fast adjustment for initial setup, faster flash effect
        const speed = isCandleLit ? 2 : 5;

        if (frontLight.current) frontLight.current.intensity = THREE.MathUtils.lerp(frontLight.current.intensity, targetFront, delta * speed);
        if (rimLight.current) rimLight.current.intensity = THREE.MathUtils.lerp(rimLight.current.intensity, targetRim, delta * speed);
        if (introAmbient.current) introAmbient.current.intensity = THREE.MathUtils.lerp(introAmbient.current.intensity, targetAmbient, delta * speed);
    }
  });

  return (
    <>
        <ambientLight intensity={0.2} color="#202030" />

        <group visible={phase === 'intro'}>
             <group position={[25, -6, 0]} rotation={[0, -0.5, 0]}>
                 <Candle scale={6} />
              </group>
             {/* Dynamic lights controlled by useFrame */}
             <pointLight ref={frontLight} position={[22, -3, 4]} intensity={3} distance={40} decay={1} color="#9090a0" />
             <pointLight ref={rimLight} position={[26, -3, -4]} intensity={2} distance={40} decay={1} color="#707090" />
             <ambientLight ref={introAmbient} intensity={0.1} color="#303040" />
        </group>

        {phase === 'main' && (
            <group ref={groupRef}>
               {!isBirthdayView && !cinematicFinished && <CinematicCamera onComplete={() => setCinematicFinished(true)} />}
               <BirthdaySequence />
               <InspectionManager />
               <SandboxFocusManager />
               
               <directionalLight 
                 position={[50, 50, 20]} 
                 intensity={0.8} 
                 color="#d0d0ff" 
                 castShadow 
                 shadow-bias={-0.0001}
               />
               <hemisphereLight 
                 args={["#202040", "#101010", 0.4]} 
               />

               <Park />
               {!isBirthdayView && !inspectionTarget && !isSandboxFocused && cinematicFinished && <StoryPoints />}
               {!isBirthdayView && !inspectionTarget && !isSandboxFocused && cinematicFinished && <PersonalTokens />}
               {!isBirthdayView && !inspectionTarget && cinematicFinished && <Sandbox />}
               <Characters />
               <Fireflies />
               <FloatingLanterns />
               
               {/* Standard Stars */}
               <Stars radius={100} depth={50} count={7000} factor={5} saturation={0} fade speed={0.5} />
               
               {/* Quarter Moon */}
               <group position={[20, 25, -120]} rotation={[0, 0, Math.PI / 6]}>
                 {/* Lit side of the moon */}
                 <mesh>
                   <sphereGeometry args={[12, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
                   <meshStandardMaterial 
                     color="#fff8e7" 
                     emissive="#fff8e7"
                     emissiveIntensity={0.2}
                     roughness={0.8}
                   />
                 </mesh>
                 
                 {/* Shadow sphere to create crescent shape */}
                 <mesh position={[-4, 0, 4]}>
                   <sphereGeometry args={[11.5, 64, 64]} />
                   <meshStandardMaterial color="#050505" roughness={1} metalness={0} />
                 </mesh>

                 {/* Subtle halo */}
                 <mesh scale={1.2} position={[0, 0, -1]}>
                    <circleGeometry args={[12, 64]} />
                    <meshBasicMaterial color="#fff8e7" transparent opacity={0.1} />
                 </mesh>
                 
                 <pointLight intensity={20} distance={100} decay={2} color="#fff8e7" position={[5, 0, 10]} />
               </group>

               <OrbitControls 
                  enabled={cinematicFinished && !isBirthdayView && !inspectionTarget && !isSandboxFocused}
                  target={[14, 2, 14]} 
                  maxPolarAngle={Math.PI / 2.5} 
                  minPolarAngle={Math.PI / 3.5} // Restrict vertical movement
                  enableZoom={false} // Disable zoom
                  minDistance={20}
                  maxDistance={60}
               />
            </group>
        )}
    </>
  );
};

export const Experience = () => {
  const phase = useStore((state) => state.phase);
  const isBirthdayView = useStore((state) => state.isBirthdayView);
  const setBirthdayView = useStore((state) => state.setBirthdayView);
  const inspectionTarget = useStore((state) => state.inspectionTarget);
  const setInspectionTarget = useStore((state) => state.setInspectionTarget);
  const isSandboxFocused = useStore((state) => state.isSandboxFocused);
  const setSandboxFocused = useStore((state) => state.setSandboxFocused);
  const [showOverlay, setShowOverlay] = useState(true);

  // Fade out overlay when entering main phase
  useEffect(() => {
    if (phase === 'main') {
        const timer = setTimeout(() => {
            setShowOverlay(false);
        }, 2000); // Allow 2s for fade out
        return () => clearTimeout(timer);
    } else {
        setShowOverlay(true);
    }
  }, [phase]);

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas
        shadows
        camera={{ position: [14, 6, 24], fov: 30 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent />
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      
            {/* Exit button overlay - always accessible */}
            {isBirthdayView && (
                <button 
                    onClick={() => {
                        setBirthdayView(false);
                        // Reset state
                    }}
                    className="fixed top-4 right-4 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/30 rounded-lg text-white text-base sm:text-lg font-serif transition-all z-50 shadow-lg"
                >
                    ✕ Return
                </button>
            )}

      {/* Close inspection button overlay */}
      {inspectionTarget && (
        <button 
          onClick={() => setInspectionTarget(null)}
          className="fixed top-4 right-4 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/30 rounded-lg text-white text-base sm:text-lg font-serif transition-all z-50 shadow-lg"
        >
          ✕ Close
        </button>
      )}

      {/* Close sandbox button overlay */}
      {isSandboxFocused && (
        <button 
          onClick={() => setSandboxFocused(false)}
          className="fixed top-4 right-4 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/30 rounded-lg text-white text-base sm:text-lg font-serif transition-all z-50 shadow-lg"
        >
          ✕ Exit Sandbox
        </button>
      )}
      
      <AnimatePresence>
        {phase === 'intro' && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
           >
             <div className="text-amber-100/60 font-serif italic text-2xl md:text-3xl tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                 Light the way...
             </div>
           </motion.div>
        )}
        {/* Simple transition overlay */}
        {phase === 'main' && showOverlay && (
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 bg-black z-20 pointer-events-none"
            />
        )}
      </AnimatePresence>
    </div>
  );
};
