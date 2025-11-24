'use client';

import React, { useRef, useEffect, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber';
import { Howl, Howler } from 'howler';
import { useStore } from '@/store/useStore';
import * as THREE from 'three';

let introMusic: Howl | null = null;
let mainMusic: Howl | null = null;
let transitionScheduled = false;

export function Candle(props: any) {
  const group = useRef<THREE.Group>(null)
  const { nodes, materials, animations } = useGLTF('/lit_candle.glb') as any
  const { actions } = useAnimations(animations, group)
  
  const [isLit, setIsLit] = useState(false);
  const setPhase = useStore((state) => state.setPhase);
  const setAudioPlaying = useStore((state) => state.setAudioPlaying);

  useEffect(() => {
    const unlockAudio = () => {
      if (Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    if (!introMusic && typeof window !== 'undefined') {
      console.log("Initializing Intro Music...");
      introMusic = new Howl({
        src: ['/song.mp3'],
        volume: 0,
        html5: true,
        onloaderror: (id, err) => console.error('Intro music load error:', err),
        onplayerror: (id, err) => {
           console.error('Intro music play error:', err);
           introMusic?.once('unlock', () => introMusic?.play());
        }
      });
    }

    if (!mainMusic && typeof window !== 'undefined') {
      console.log("Initializing Main Music...");
      mainMusic = new Howl({
        src: ['/instrumentalsong.mp3'],
        loop: true,
        volume: 0,
        html5: true,
        preload: true, 
        onload: () => console.log("Main music loaded successfully."),
        onloaderror: (id, err) => console.error('Main music load error:', err),
        onplayerror: (id, err) => console.error('Main music play error:', err)
      });
    }

    return () => {
       document.removeEventListener('click', unlockAudio);
       document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  useEffect(() => {
    const action = actions["Take 01"];
    
    if (action) {
      if (isLit) {
        action.reset().fadeIn(0.5).play();
        action.setLoop(THREE.LoopRepeat, Infinity);
      } else {
        action.stop();
      }
    }
  }, [isLit, actions]);

  const handleIgnite = (e: any) => {
    e.stopPropagation();
    if (isLit) return;
    
    console.log("Igniting candle...");
    setIsLit(true);
    setAudioPlaying(true);
    
    if (Howler.ctx.state === 'suspended') {
      Howler.ctx.resume().then(() => {
        console.log("Audio context resumed");
        playIntro();
      });
    } else {
        playIntro();
    }

    function playIntro() {
        if (introMusic) {
          console.log("Playing intro music...");
          introMusic.volume(0.6); 
          introMusic.play();
          introMusic.fade(0, 0.6, 1000);

          if (introMusic.state() === 'loaded') {
              scheduleCrossfade(introMusic.duration());
          } else {
              introMusic.once('load', () => {
                if (introMusic) scheduleCrossfade(introMusic.duration());
              });
          }

        } else {
          console.error("Intro music not initialized");
        }
    }

    function scheduleCrossfade(duration: number) {
        if (transitionScheduled) return;
        transitionScheduled = true;

        const crossfadeDuration = 2;
        const timeUntilTrigger = (duration - crossfadeDuration) * 1000;

        console.log(`Song duration: ${duration}s. Triggering crossfade in ${timeUntilTrigger}ms`);

        setTimeout(() => {
            console.log(">>> CROSSFADE START <<<");
            
            introMusic?.fade(0.6, 0, crossfadeDuration * 1000);

            if (mainMusic) {
                if (mainMusic.state() === 'loaded') {
                    startMain();
                } else {
                    mainMusic.once('load', startMain);
                }
            }
        }, timeUntilTrigger);
    }

    function startMain() {
         console.log("Starting Main Music...");
         if (!mainMusic) return;
         
         if (mainMusic.state() === 'unloaded') {
            mainMusic.load();
         }

         mainMusic.seek(2); 
         mainMusic.volume(0);
         const id = mainMusic.play();
         console.log("Main music play ID:", id);
         
         mainMusic.fade(0, 0.8, 2000, id);
    }

    setTimeout(() => {
      setPhase('main');
    }, 6000);
  };

  const fireScale = isLit ? [0.116, 0.116, 0.194] : [0, 0, 0];
  const bigFireScale = isLit ? [0.489, 0.489, 0.817] : [0, 0, 0];

  return (
    <group ref={group} {...props} dispose={null} onClick={handleIgnite} 
      onPointerOver={() => document.body.style.cursor = 'pointer'} 
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="Root">
            <group name="Armature_Lady" position={[-43.5, 0.121, 0.722]}>
              <primitive object={nodes.Armature_Lady_rootJoint} />
            </group>
            <group
              name="candle001"
              position={[-3.055, -2.395, 0.374]}
              rotation={[-0.005, -0.031, -2.904]}
              scale={[1.28, 1.28, 1.68]}>
              <mesh
                name="candle001_0"
                castShadow
                receiveShadow
                geometry={nodes.candle001_0.geometry}
                material={materials.candle_material}
              />
            </group>
            
            <group name="fire001" position={[3.51, -2.796, 5.202]} scale={fireScale as any} />
            <group name="fire002" position={[3.616, -2.735, 5.047]} scale={fireScale as any} />
            <group name="fire003" position={[3.779, 3.241, 0.991]} scale={fireScale as any} />
            <group name="fire004" position={[3.694, 3.371, 0.7]} scale={fireScale as any} />
            
            <group name="fire005" position={[-3.071, -2.39, 1.001]} scale={fireScale as any}>
              <mesh
                name="fire005_0"
                castShadow
                receiveShadow
                geometry={nodes.fire005_0.geometry}
                material={materials.fire_mat}
                morphTargetDictionary={nodes.fire005_0.morphTargetDictionary}
                morphTargetInfluences={nodes.fire005_0.morphTargetInfluences}
              />
               {isLit && (
                  <pointLight 
                    color="#ffaa00" 
                    distance={8} 
                    decay={2} 
                    intensity={2} 
                    position={[0, 2, 0]} 
                  />
               )}
            </group>

            <group
              name="fire006"
              position={[-3.552, -6.233, 1.364]}
              rotation={[0.146, 0.196, -0.061]}
              scale={bigFireScale as any}
            />

            <group name="Armature_Monk" position={[-41.901, 0.121, 0.722]}>
              <primitive object={nodes.Armature_Monk_rootJoint} />
            </group>
            <group name="Armature_Peasant" position={[-40.179, 0.121, 0.722]}>
              <primitive object={nodes.Armature_Peasant_rootJoint} />
            </group>
            <group name="Armature_Knight" position={[-38.311, 0.121, 0.722]}>
              <primitive object={nodes.Armature_Knight_rootJoint} />
            </group>
            <group name="Armature_imp" position={[-36.654, 0.121, 0.722]}>
              <primitive object={nodes.Armature_imp_rootJoint} />
            </group>
            <group name="Armature_Baba_Yaga" position={[-45.842, 0.082, 0.722]}>
              <primitive object={nodes.Armature_Baba_Yaga_rootJoint} />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/lit_candle.glb')
