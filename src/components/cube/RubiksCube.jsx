import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { PROJECTS } from '../../constants/data';

const CUBE_SIZE = 1;
const SPACING = 0.02; // Tighter spacing for realism
const TOTAL_SIZE = CUBE_SIZE + SPACING;
const STICKER_SIZE = 0.85; // Leave black border
const STICKER_OFFSET = 0.51; // Slightly above the face

// Standard Rubik's Cube Colors
const PALETTE = [
    '#B90000', // Right (Red)
    '#FF5900', // Left (Orange)
    '#FFFFFF', // Top (White)
    '#FFD500', // Bottom (Yellow)
    '#009E60', // Front (Green)
    '#0045AD', // Back (Blue)
];

const Sticker = ({ color, position, rotation, project, hovered }) => {
    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
            <meshStandardMaterial
                color={color}
                roughness={0.2}
                metalness={0.1}
                emissive={project ? color : '#000000'}
                emissiveIntensity={project ? (hovered ? 0.6 : 0.3) : 0}
            />
        </mesh>
    );
};

const Cubelet = ({ position, project, onHover, stickerColors }) => {
    const [hovered, setHovered] = useState(false);

    const handlePointerOver = (e) => {
        e.stopPropagation();
        setHovered(true);
        if (project) onHover(project);
    };

    const handlePointerOut = (e) => {
        e.stopPropagation();
        setHovered(false);
        if (project) onHover(null);
    };

    // Sticker definitions: [pos, rot, colorIndex]
    // 0: Right (x+), 1: Left (x-), 2: Top (y+), 3: Bottom (y-), 4: Front (z+), 5: Back (z-)
    const stickers = useMemo(() => {
        const list = [];
        const [x, y, z] = position;

        // Right
        if (x === 1) list.push({ pos: [STICKER_OFFSET, 0, 0], rot: [0, Math.PI / 2, 0], color: stickerColors[0] });
        // Left
        if (x === -1) list.push({ pos: [-STICKER_OFFSET, 0, 0], rot: [0, -Math.PI / 2, 0], color: stickerColors[1] });
        // Top
        if (y === 1) list.push({ pos: [0, STICKER_OFFSET, 0], rot: [-Math.PI / 2, 0, 0], color: stickerColors[2] });
        // Bottom
        if (y === -1) list.push({ pos: [0, -STICKER_OFFSET, 0], rot: [Math.PI / 2, 0, 0], color: stickerColors[3] });
        // Front
        if (z === 1) list.push({ pos: [0, 0, STICKER_OFFSET], rot: [0, 0, 0], color: stickerColors[4] });
        // Back
        if (z === -1) list.push({ pos: [0, 0, -STICKER_OFFSET], rot: [0, Math.PI, 0], color: stickerColors[5] });

        return list;
    }, [position, stickerColors]);

    return (
        <group position={[position[0] * TOTAL_SIZE, position[1] * TOTAL_SIZE, position[2] * TOTAL_SIZE]}>
            {/* Black Plastic Base */}
            <RoundedBox
                args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]}
                radius={0.05}
                smoothness={4}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.1} />
            </RoundedBox>

            {/* Stickers */}
            {stickers.map((s, i) => (
                <Sticker
                    key={i}
                    position={s.pos}
                    rotation={s.rot}
                    color={project ? project.color : s.color} // If project piece, make stickers project color
                    project={project}
                    hovered={hovered}
                />
            ))}


        </group>
    );
};

const RubiksCube = ({ rotation, onProjectHover }) => {
    const groupRef = useRef();

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation.x, 0.1);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation.y, 0.1);
        }
    });

    // Generate 27 cubelets with random colors and mapped projects
    const cubeletsData = useMemo(() => {
        const data = [];
        let projectIndex = 0;

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const position = [x, y, z];
                    const isInternal = x === 0 && y === 0 && z === 0;

                    // Randomize sticker colors for "unsolved" look
                    // We assign a random color from PALETTE to each of the 6 potential sticker positions
                    const stickerColors = Array(6).fill(0).map(() => PALETTE[Math.floor(Math.random() * PALETTE.length)]);

                    let project = null;

                    // Map projects to Center faces for visibility
                    const isCenterFace =
                        (x === 0 && y === 0 && Math.abs(z) === 1) ||
                        (x === 0 && Math.abs(y) === 1 && z === 0) ||
                        (Math.abs(x) === 1 && y === 0 && z === 0);

                    if (isCenterFace && projectIndex < PROJECTS.length) {
                        project = PROJECTS[projectIndex];
                        projectIndex++;
                    }

                    if (!isInternal) {
                        data.push({ position, project, stickerColors });
                    }
                }
            }
        }
        return data;
    }, []);

    return (
        <group ref={groupRef}>
            {cubeletsData.map(({ position, project, stickerColors }, i) => (
                <Cubelet
                    key={i}
                    position={position}
                    project={project}
                    onHover={onProjectHover}
                    stickerColors={stickerColors}
                />
            ))}
        </group>
    );
};

export default RubiksCube;
