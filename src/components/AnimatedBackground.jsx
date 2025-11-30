import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, useVideoTexture } from '@react-three/drei';
import { Vector2 } from 'three';
import bgImage from '../assets/bg-dark-splash.png';
import flowerCaveVideo from '../assets/flower_cave.mp4';
import journeyVideo from '../assets/journey_bg.mp4';

const FluidImageShader = {
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: null },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uResolution: { value: new Vector2(1, 1) },
    uImageResolution: { value: new Vector2(1, 1) },
    uOpacity: { value: 1.0 }
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
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec2 uImageResolution;
    uniform float uOpacity;
    varying vec2 vUv;

    // Simplex noise function
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Background cover logic
      vec2 ratio = vec2(
        min((uResolution.x / uResolution.y) / (uImageResolution.x / uImageResolution.y), 1.0),
        min((uResolution.y / uResolution.x) / (uImageResolution.y / uImageResolution.x), 1.0)
      );
      vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
      );

      // Mouse interaction
      vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
      vec2 mousePos = uMouse * aspect;
      vec2 uvPos = vUv * aspect;
      float dist = distance(uvPos, mousePos);
      
      // Magnifying Glass Effect
      float radius = 0.8; // Massive radius
      float magnification = 0.4; // Zoom strength
      
      vec2 magnifiedUv = uv;
      
      if (dist < radius) {
        // Calculate distortion
        // Smoothstep for soft edge
        float effect = smoothstep(radius, 0.0, dist);
        
        // Push pixels away from center to create zoom/magnify effect
        vec2 direction = uvPos - mousePos;
        magnifiedUv = uv - (direction * effect * magnification);
      }

      // Fluid distortion (applied on top of magnification)
      float noise = snoise(magnifiedUv * 5.0 + uTime * 0.1);
      float wave = snoise(magnifiedUv * 2.0 - uTime * 0.05);
      
      vec2 distortedUv = magnifiedUv + vec2(noise, wave) * 0.01; 
      
      // RGB Shift
      float r = texture2D(uTexture, distortedUv + vec2(0.001, 0.0)).r;
      float g = texture2D(uTexture, distortedUv).g;
      float b = texture2D(uTexture, distortedUv - vec2(0.001, 0.0)).b;

      // Darken slightly for text readability
      vec3 color = vec3(r, g, b) * 0.6; 

      gl_FragColor = vec4(color, uOpacity);
    }
  `
};

const BackgroundMesh = ({ shader, opacity, texture }) => {
  const mesh = useRef();
  const { size, viewport } = useThree();
  const mouse = useRef(new Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTexture: { value: texture || null },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uResolution: { value: new Vector2(size.width, size.height) },
      uImageResolution: { value: texture ? new Vector2(texture.image.width, texture.image.height) : new Vector2(1, 1) },
      uOpacity: { value: opacity }
    }),
    [texture] // Re-create uniforms when texture changes
  );

  useFrame((state) => {
    const { clock, pointer } = state;
    if (mesh.current) {
      mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();

      // Smooth opacity transition
      mesh.current.material.uniforms.uOpacity.value += (opacity - mesh.current.material.uniforms.uOpacity.value) * 0.05;

      // Smooth mouse
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
        vertexShader={shader.vertexShader}
        fragmentShader={shader.fragmentShader}
        transparent={true}
      />
    </mesh>
  );
};

const VideoMesh = ({ video, opacity }) => {
  const texture = useVideoTexture(video, {
    start: true,
    muted: true,
    loop: true,
    playsInline: true,
    crossOrigin: 'Anonymous'
  });

  const mesh = useRef();
  const { size, viewport } = useThree();

  useFrame(() => {
    if (mesh.current) {
      // Smooth opacity transition
      mesh.current.material.opacity += (opacity - mesh.current.material.opacity) * 0.05;
    }
  });

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent={true} opacity={0} toneMapped={false} />
    </mesh>
  );
};

const FluidMesh = ({ opacity }) => {
  const texture = useTexture(bgImage);
  return (
    <BackgroundMesh
      shader={FluidImageShader}
      texture={texture}
      opacity={opacity}
    />
  );
};

const AnimatedBackground = ({ variant = 'default' }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
        gl={{ antialias: false, powerPreference: "high-performance" }} // Disable antialiasing for speed
      >
        <React.Suspense fallback={null}>
          {/* Fluid Background (Default) */}
          <FluidMesh opacity={variant === 'default' ? 1.0 : 0.0} />

          {/* Journey Video Background (Timeline) */}
          <VideoMesh video={journeyVideo} opacity={variant === 'journey' ? 1.0 : 0.0} />

          {/* Flower Cave Video Background (Projects) */}
          <VideoMesh video={flowerCaveVideo} opacity={variant === 'cave' ? 1.0 : 0.0} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;
