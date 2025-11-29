import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;

// Simplex noise function (simplified for brevity)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i); // Avoid truncation effects in permutation
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
  vec2 uv = vUv;
  
  // Mouse interaction
  float dist = distance(uv, uMouse);
  float interaction = smoothstep(0.5, 0.0, dist) * 0.5;
  
  // Noise layers
  float n1 = snoise(uv * 3.0 + uTime * 0.1);
  float n2 = snoise(uv * 6.0 - uTime * 0.2 + interaction);
  
  float finalNoise = n1 * 0.5 + n2 * 0.5;
  
  // Color mixing
  vec3 color = mix(uColor1, uColor2, uv.y + finalNoise);
  color = mix(color, uColor3, uv.x + finalNoise);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

const LiquidBackground = ({ scrollY }) => {
    const meshRef = useRef();
    const { viewport, mouse } = useThree();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uColor1: { value: new THREE.Color('#240046') }, // Deep Purple
            uColor2: { value: new THREE.Color('#3c096c') }, // Lighter Purple
            uColor3: { value: new THREE.Color('#10002b') }, // Darkest
        }),
        []
    );

    useFrame((state) => {
        const { clock } = state;
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();

            // Smooth mouse movement
            meshRef.current.material.uniforms.uMouse.value.lerp(
                new THREE.Vector2((mouse.x + 1) / 2, (mouse.y + 1) / 2),
                0.1
            );

            // Scroll based color shifting (Simple implementation)
            // In a real app, you'd map scrollY to specific section colors
            // For now, let's just shift the hue slightly based on time
            // meshRef.current.material.uniforms.uColor1.value.setHSL(Math.sin(clock.getElapsedTime() * 0.1) * 0.1 + 0.7, 0.8, 0.2);
        }
    });

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1, 32, 32]} />
            <shaderMaterial
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
            />
        </mesh>
    );
};

export default LiquidBackground;
