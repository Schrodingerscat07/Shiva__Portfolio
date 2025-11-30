import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

const LiquidText = ({ children, className = "" }) => {
    const textRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Motion values for the filter
    const frequency = useSpring(0, { stiffness: 200, damping: 10 });
    const scale = useSpring(0, { stiffness: 200, damping: 10 });

    const handleMouseEnter = () => {
        setIsHovered(true);
        frequency.set(0.02); // Base frequency for turbulence
        scale.set(100);      // Increased Displacement scale for visibility
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        frequency.set(0);
        scale.set(0);
    };

    // Unique ID for the filter, persisted across renders
    const filterId = useMemo(() => `liquid-filter-${Math.random().toString(36).substr(2, 9)}`, []);

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ zIndex: 50 }} // Ensure it's on top to catch events
        >
            {/* The SVG Filter Definition */}
            <LiquidFilter filterId={filterId} scale={scale} />

            <motion.div style={{ filter: `url(#${filterId})` }}>
                {children}
            </motion.div>
        </div>
    );
};

// Helper component to animate SVG filter attributes
const LiquidFilter = ({ filterId, scale }) => {
    const displacementRef = useRef(null);

    useEffect(() => {
        const unsubscribe = scale.on("change", (latest) => {
            if (displacementRef.current) {
                // SVG DOM API: scale.baseVal is the way to set it
                displacementRef.current.scale.baseVal = latest;
            }
        });
        return unsubscribe;
    }, [scale]);

    return (
        <svg className="absolute w-0 h-0" style={{ display: 'block' }}>
            <defs>
                <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.02"
                        numOctaves="3"
                        result="noise"
                    >
                        <animate
                            attributeName="baseFrequency"
                            dur="10s"
                            values="0.02;0.04;0.02"
                            repeatCount="indefinite"
                        />
                    </feTurbulence>
                    <feDisplacementMap
                        ref={displacementRef}
                        in="SourceGraphic"
                        in2="noise"
                        scale="0"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </defs>
        </svg>
    );
};

export default LiquidText;
