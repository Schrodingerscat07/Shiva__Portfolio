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

      // Fluid distortion
      float noise = snoise(uv * 5.0 + uTime * 0.1);
      float wave = snoise(uv * 2.0 - uTime * 0.05);
      
      vec2 distortedUv = uv + vec2(noise, wave) * 0.01; 
      
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

const SumieShader = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
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
    uniform vec2 uResolution;
    uniform float uOpacity;
    varying vec2 vUv;

    // Random and Noise functions
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    #define OCTAVES 6
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = .5;
      float frequency = 0.;
      for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
      }
      return value;
    }

    void main() {
      vec2 st = vUv;
      st.x *= uResolution.x/uResolution.y;

      // Domain Warping for Ink Flow
      vec2 q = vec2(0.);
      q.x = fbm( st + 0.00 * uTime);
      q.y = fbm( st + vec2(1.0));

      vec2 r = vec2(0.);
      r.x = fbm( st + 1.0 * q + vec2(1.7,9.2)+ 0.15 * uTime );
      r.y = fbm( st + 1.0 * q + vec2(8.3,2.8)+ 0.126 * uTime);

      float f = fbm(st + r);

      // Ink Color Mapping
      // Mix between dark grey/black ink and paper-like background
      // For dark mode: Black background, smoky grey/white ink
      vec3 color = mix(vec3(0.05, 0.05, 0.05), vec3(0.7, 0.7, 0.75), clamp((f*f)*4.0, 0.0, 1.0));

      // Vignette
      float dist = distance(vUv, vec2(0.5));
      color *= 1.0 - dist * 0.5;

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

      if (mesh.current.material.uniforms.uMouse) {
        mesh.current.material.uniforms.uMouse.value.copy(mouse.current);
      }
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

const SumieMesh = ({ opacity }) => {
  return (
    <BackgroundMesh
      shader={SumieShader}
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
          {/* Sumi-e Background (Hero/Default) */}
          <SumieMesh opacity={variant === 'default' ? 1.0 : 0.0} />

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
