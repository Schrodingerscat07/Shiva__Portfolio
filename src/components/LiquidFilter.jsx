import React, { useState, useEffect } from 'react';

const LiquidFilter = () => {
    const [freq, setFreq] = useState("0.01 0.02");

    useEffect(() => {
        let frame;
        let time = 0;

        const animate = () => {
            time += 0.005;
            const freqX = 0.01 + Math.sin(time) * 0.005;
            const freqY = 0.02 + Math.cos(time) * 0.005;
            setFreq(`${freqX} ${freqY}`);
            frame = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
            <defs>
                <filter id="liquid-text-filter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency={freq}
                        numOctaves="1"
                        result="warp"
                    />
                    <feDisplacementMap
                        xChannelSelector="R"
                        yChannelSelector="G"
                        scale="10"
                        in="SourceGraphic"
                        in2="warp"
                    />
                </filter>
            </defs>
        </svg>
    );
};

export default LiquidFilter;
