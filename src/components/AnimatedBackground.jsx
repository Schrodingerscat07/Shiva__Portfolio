import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useVideoTexture } from '@react-three/drei';
import { Vector2 } from 'three';
import flowerCaveVideo from '../assets/flower_cave.mp4';
import spiralFlowersVideo from '../assets/spiralflowflowers.mp4';
import OceanWaveVideo from '../assets/Ocean_Wave_Cinematic_Loop_Video.mp4';

const LiquidDistortionShader = {
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: null },
    uResolution: { value: new Vector2(1, 1) },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uRadius: { value: 0.25 },
    uStrength: { value: 0.2 },
    uOpacity: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uRadius;
    uniform float uStrength;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Correct aspect ratio for mouse interaction
      float aspect = uResolution.x / uResolution.y;
      vec2 aspectCorrectedUV = vec2(uv.x * aspect, uv.y);
      vec2 aspectCorrectedMouse = vec2(uMouse.x * aspect, uMouse.y);

      // Calculate distance from mouse
      float dist = distance(aspectCorrectedUV, aspectCorrectedMouse);

      // Calculate distortion
      float effect = smoothstep(uRadius, 0.0, dist);
      vec2 distortion = (uv - uMouse) * effect * uStrength;

      // Apply distortion to UVs
      vec2 distortedUV = uv - distortion;

      vec4 color = texture2D(uTexture, distortedUV);
      gl_FragColor = vec4(color.rgb, uOpacity);
    }
  `
};

const VideoMesh = ({ videoSrc, opacity, isActive }) => {
  const texture = useVideoTexture(videoSrc, {
    unsuspend: 'canplay',
    muted: true,
    loop: true,
    start: true,
    crossOrigin: 'Anonymous'
  });

  useEffect(() => {
    if (texture.image) {
      if (isActive) {
        texture.image.play().catch(e => console.warn("Play failed", e));
      } else {
        texture.image.pause();
      }
    }
  }, [isActive, texture]);

  const mesh = useRef();
  const { size, viewport } = useThree();
  const mouse = useRef(new Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTexture: { value: texture },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uResolution: { value: new Vector2(size.width, size.height) },
      uRadius: { value: 0.25 },
      uStrength: { value: 0.2 },
      uOpacity: { value: opacity }
    }),
    [texture]
  );

  useFrame((state) => {
    const { clock, pointer } = state;
    if (mesh.current) {
      mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();

      // Smooth opacity transition
      mesh.current.material.uniforms.uOpacity.value += (opacity - mesh.current.material.uniforms.uOpacity.value) * 0.05;

      // Smooth mouse movement
      mouse.current.x += (pointer.x * 0.5 + 0.5 - mouse.current.x) * 0.1;
      mouse.current.y += (pointer.y * 0.5 + 0.5 - mouse.current.y) * 0.1;

      mesh.current.material.uniforms.uMouse.value.copy(mouse.current);
      mesh.current.material.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={LiquidDistortionShader.vertexShader}
        fragmentShader={LiquidDistortionShader.fragmentShader}
        transparent={true}
      />
    </mesh>
  );
};

const AnimatedBackground = ({ variant = 'default' }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <Suspense fallback={null}>
          {/* Hero Video (Default) - Spiral Flow Flowers */}
          <VideoMesh
            videoSrc={spiralFlowersVideo}
            opacity={variant === 'default' ? 1.0 : 0.0}
            isActive={variant === 'default'}
          />

          {/* Ocean Video (Journey) */}
          <VideoMesh
            videoSrc={OceanWaveVideo}
            opacity={variant === 'journey' ? 1.0 : 0.0}
            isActive={variant === 'journey'}
          />

          {/* Flower Cave Video (Projects) */}
          <VideoMesh
            videoSrc={flowerCaveVideo}
            opacity={variant === 'cave' ? 1.0 : 0.0}
            isActive={variant === 'cave'}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;
