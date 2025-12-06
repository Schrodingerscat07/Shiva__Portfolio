import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { FaGithub } from 'react-icons/fa';
import AnimatedBackground from '../components/AnimatedBackground';
import ErrorBoundary from '../components/ErrorBoundary';
import LiquidText from '../components/LiquidText';
import RevealText from '../components/RevealText';
import { HERO_CONTENT, TIMELINE_DATA, PROJECTS, SOCIAL_LINKS } from '../constants/data';
import MagneticButton from '../components/MagneticButton';

const Section = ({ children, className = "", id = "" }) => (
    <section id={id} className={`min-h-screen flex flex-col justify-center items-center p-8 relative z-10 ${className}`}>
        {children}
    </section>
);

function Home() {
    const [bgVariant, setBgVariant] = useState('default');

    useEffect(() => {
        const handleScroll = () => { };
        window.addEventListener("scroll", handleScroll);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (entry.target.id === 'hero') setBgVariant('default');
                        if (entry.target.id === 'journey') setBgVariant('journey');
                        if (entry.target.id === 'projects') setBgVariant('cave');
                    }
                });
            },
            { threshold: 0.2 }
        );

        const sections = ['hero', 'journey', 'projects'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            sections.forEach(id => {
                const element = document.getElementById(id);
                if (element) observer.unobserve(element);
            });
        };
    }, []);

    return (
        <div className="min-h-screen text-white font-sans selection:bg-primary selection:text-white overflow-x-hidden">
            <ErrorBoundary>
                <AnimatedBackground variant={bgVariant} />
            </ErrorBoundary>

            <main className="relative z-10">
                <div
                    className={`fixed inset-0 pointer-events-none z-0 transition-all duration-1000 ease-in-out ${bgVariant === 'default' ? 'backdrop-blur-sm bg-black/20' : 'backdrop-blur-none bg-transparent'
                        }`}
                />

                <div className="fixed top-8 left-8 z-50 mix-blend-difference">
                    <span
                        className="font-japanese font-bold text-xl tracking-tighter text-white cursor-pointer"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <LiquidText>SHIVA</LiquidText>
                    </span>
                </div>

                <div className="fixed top-8 right-8 z-50 flex items-center gap-6 mix-blend-difference">
                    {SOCIAL_LINKS.map((link) => (
                        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors font-japanese text-xs uppercase tracking-widest">
                            <LiquidText>{link.name}</LiquidText>
                        </a>
                    ))}
                    <div className="h-4 w-[1px] bg-white/20"></div>
                    <a href={HERO_CONTENT.resumeLink} className="text-white/70 hover:text-white transition-colors font-japanese text-xs uppercase tracking-widest cursor-pointer">
                        <LiquidText>Resume</LiquidText>
                    </a>
                </div>

                <Section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60 pointer-events-none z-0" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-center relative z-10 flex flex-col items-center justify-center h-full pt-32"
                    >
                        <LiquidText>
                            <h1
                                className="font-japanese text-[10rem] md:text-[13rem] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80 mix-blend-overlay"
                                style={{
                                    filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.5)) blur(1px)',
                                    WebkitTextStroke: '1px rgba(255,255,255,0.2)'
                                }}
                            >
                                {HERO_CONTENT.name}
                            </h1>
                        </LiquidText>

                        <div className="mt-8 mb-24">
                            <RevealText
                                text={HERO_CONTENT.tagline}
                                className="font-japanese text-xl md:text-2xl text-white/90 tracking-widest uppercase font-light"
                                delay={0.5}
                            />
                        </div>

                        <div className="flex gap-8 items-center">
                            <MagneticButton
                                onClick={() => document.getElementById('journey').scrollIntoView({ behavior: 'smooth' })}
                                className="group relative px-8 py-3 rounded-full bg-transparent border border-white/20 text-white font-japanese text-base overflow-hidden transition-all duration-300 hover:border-white/60 min-w-[140px]"
                            >
                                <span className="absolute inset-0 w-full h-full bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                                    <LiquidText>Journey</LiquidText>
                                </span>
                            </MagneticButton>

                            <div className="h-8 w-[1px] bg-white/20"></div>

                            <MagneticButton
                                onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}
                                className="group relative px-8 py-3 rounded-full bg-transparent border border-white/20 text-white font-japanese text-base overflow-hidden transition-all duration-300 hover:border-white/60 min-w-[140px]"
                            >
                                <span className="absolute inset-0 w-full h-full bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                                    <LiquidText>Works</LiquidText>
                                </span>
                            </MagneticButton>
                        </div>

                        <div className="absolute bottom-12 max-w-md">
                            <RevealText
                                text={HERO_CONTENT.description}
                                className="text-white/40 font-japanese text-xs leading-relaxed"
                                delay={1.0}
                            />
                        </div>
                    </motion.div>
                </Section>

                <Section id="journey" className="min-h-screen flex items-center justify-center relative py-20">
                    <div className="max-w-4xl w-full relative z-10">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="font-japanese text-4xl md:text-5xl font-bold text-white mb-16 text-center"
                        >
                            <LiquidText>Journey</LiquidText>
                        </motion.h2>

                        <div className="relative border-l-2 border-white/10 ml-4 md:ml-0 space-y-12">
                            {TIMELINE_DATA.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="relative pl-8 md:pl-12 group"
                                >
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#FFD700] shadow-[0_0_10px_#FFD700] group-hover:scale-125 transition-transform duration-300" />

                                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-black/50 transition-all duration-300">
                                        <span className="font-japanese text-[#FFD700] text-sm tracking-wider mb-2 block"><LiquidText>{item.year}</LiquidText></span>
                                        <h3 className="font-japanese text-xl font-bold text-white mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}><LiquidText>{item.title}</LiquidText></h3>
                                        <p className="font-japanese text-white/80 text-sm mb-2"><LiquidText>{item.institution || item.project || item.event}</LiquidText></p>
                                        <p className="font-japanese text-white/60 text-sm leading-relaxed"><LiquidText>{item.description}</LiquidText></p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section id="projects" className="min-h-screen flex items-center justify-center relative py-20">
                    <div className="max-w-6xl w-full relative z-10 px-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="font-japanese text-4xl md:text-5xl font-bold text-black mb-16 text-center"
                        >
                            <LiquidText>Selected Works</LiquidText>
                        </motion.h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {PROJECTS.map((project, index) => (
                                <Tilt key={project.id} options={{ max: 15, scale: 1.02, speed: 400 }} className="h-full">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl h-full hover:border-white/30 transition-all duration-300 group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-japanese text-xl font-bold text-white group-hover:text-[#FFD700] transition-colors"><LiquidText>{project.title}</LiquidText></h3>
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                                                <FaGithub size={20} />
                                            </a>
                                        </div>
                                        <p className="font-japanese text-white/60 text-sm mb-6 leading-relaxed h-20 overflow-hidden"><LiquidText>{project.description}</LiquidText></p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {project.tech.map((t) => (
                                                <span key={t} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-white/50 font-japanese">
                                                    <LiquidText>{t}</LiquidText>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                                            <span className="font-japanese text-xs text-white/40"><LiquidText>{project.stat}</LiquidText></span>
                                        </div>
                                    </motion.div>
                                </Tilt>
                            ))}
                        </div>
                    </div>
                </Section>

                <CubeSection />

                <footer className="py-12 text-center text-gray-500 text-sm relative z-10">
                    <p><LiquidText>&copy; {new Date().getFullYear()} Shiva. Built with React, Three.js & Antigravity.</LiquidText></p>
                </footer>
            </main>
        </div>
    );
}

// Separate component for the Cube Section to manage its own state
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import RubiksCube from '../components/cube/RubiksCube';
import CubeControls from '../components/cube/CubeControls';
import { Suspense } from 'react';

const CubeSection = () => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [hoveredProject, setHoveredProject] = useState(null);

    return (
        <Section id="cube-interaction" className="min-h-screen flex items-center justify-center relative py-20 overflow-hidden">
            {/* Japanese Style Background */}
            <div className="absolute inset-0 bg-[#0a0a0a] z-0">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, #2a2a2a 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>
            </div>

            <div className="w-full h-full absolute inset-0 z-10">
                <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                        <Environment preset="city" />

                        <RubiksCube rotation={rotation} onProjectHover={setHoveredProject} />

                        <OrbitControls enableZoom={false} enablePan={false} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Computer Vision Controls */}
            <div className="absolute bottom-8 right-8 z-20">
                <CubeControls onRotationChange={setRotation} />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20">
                <p className="text-white/40 font-japanese text-xs tracking-widest uppercase">
                    Move your hand to rotate the cube
                </p>
            </div>

            {/* Project Details Popup Overlay */}
            {hoveredProject && (
                <div className="absolute top-1/2 left-8 md:left-20 -translate-y-1/2 z-30 max-w-sm w-full pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        style={{ borderColor: hoveredProject.color }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-japanese text-2xl font-bold text-white mb-1">{hoveredProject.title}</h3>
                                <span className="text-xs font-japanese text-white/50 uppercase tracking-wider">{hoveredProject.stat}</span>
                            </div>
                            <div className="w-3 h-3 rounded-full shadow-[0_0_15px]" style={{ backgroundColor: hoveredProject.color, boxShadow: `0 0 15px ${hoveredProject.color}` }} />
                        </div>

                        <p className="font-japanese text-white/80 text-sm mb-6 leading-relaxed">{hoveredProject.description}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {hoveredProject.tech.map((t) => (
                                <span key={t} className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-japanese">
                                    {t}
                                </span>
                            ))}
                        </div>

                        <a
                            href={hoveredProject.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group cursor-pointer"
                        >
                            <FaGithub className="text-white/70 group-hover:text-white transition-colors" />
                            <span className="text-xs font-japanese text-white/70 group-hover:text-white transition-colors uppercase tracking-widest">View Code</span>
                        </a>
                    </motion.div>
                </div>
            )}
        </Section>
    );
};

export default Home;
