import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useVideoTexture } from '@react-three/drei';
import { Vector2 } from 'three';
import flowerCaveVideo from '../assets/flower_cave.mp4';
import journeyVideo from '../assets/journey_bg.mp4';

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

const SumieMesh = ({ opacity }) => {
  return (
    <BackgroundMesh
      shader={SumieShader}
      opacity={opacity}
    />
  );
};

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
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <Suspense fallback={null}>
          {/* Journey Video Background (Hero & Timeline) */}
          <VideoMesh
            videoSrc={journeyVideo}
            opacity={(variant === 'default' || variant === 'journey') ? 1.0 : 0.0}
            isActive={variant === 'default' || variant === 'journey'}
          />

          {/* Flower Cave Video Background (Projects) */}
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
