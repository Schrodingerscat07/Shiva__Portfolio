import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { FaGithub } from 'react-icons/fa';
import AnimatedBackground from './components/AnimatedBackground';
import ErrorBoundary from './components/ErrorBoundary';
import LiquidText from './components/LiquidText';
import { HERO_CONTENT, TIMELINE_DATA, PROJECTS, SOCIAL_LINKS } from './constants/data';
import './index.css';

const Section = ({ children, className = "", id = "" }) => (
  <section id={id} className={`min-h-screen flex flex-col justify-center items-center p-8 relative z-10 ${className}`}>
    {children}
  </section>
);

const MagneticButton = ({ children, className = "", onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.button>
  );
};

function App() {
  const [bgVariant, setBgVariant] = useState('default');

  useEffect(() => {
    const handleScroll = () => { }; // Placeholder if scrollY is needed later
    window.addEventListener("scroll", handleScroll);

    // Intersection Observer for Background Switching
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
      { threshold: 0.2 } // Trigger when 20% of the section is visible
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
      {/* 3D Background Layer */}
      <ErrorBoundary>
        <AnimatedBackground variant={bgVariant} />
      </ErrorBoundary>

      {/* Content Layer */}
      <main className="relative z-10">

        {/* Navigation */}
        {/* Global Blur Overlay */}
        {/* Global Blur Overlay - Only visible on Hero (default) */}
        <div
          className={`fixed inset-0 pointer-events-none z-0 transition-all duration-1000 ease-in-out ${bgVariant === 'default' ? 'backdrop-blur-sm bg-black/20' : 'backdrop-blur-none bg-transparent'
            }`}
        />
        {/* Navigation - Split Layout */}

        {/* Top Left: Name */}
        <div className="fixed top-8 left-8 z-50 mix-blend-difference">
          <span
            className="font-japanese font-bold text-xl tracking-tighter text-white cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <LiquidText>SHIVA</LiquidText>
          </span>
        </div>

        {/* Top Right: Socials & Resume */}
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
          {/* Gradient Overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60 pointer-events-none z-0" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center relative z-10 flex flex-col items-center justify-center h-full pt-32"
          >
            {/* Huge Title with Blur/Glow Effect */}
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

            {/* Subtitle */}
            <p className="font-japanese text-xl md:text-2xl text-white/90 mt-8 mb-24 tracking-widest uppercase font-light">
              <LiquidText>{HERO_CONTENT.tagline}</LiquidText>
            </p>

            {/* Action Buttons: Journey | Works */}
            <div className="flex gap-8 items-center">
              <MagneticButton
                onClick={() => document.getElementById('journey').scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white font-japanese text-base hover:bg-white/10 transition-all duration-300 min-w-[120px]"
              >
                <LiquidText>Journey</LiquidText>
              </MagneticButton>

              <div className="h-8 w-[1px] bg-white/20"></div>

              <MagneticButton
                onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white font-japanese text-base hover:bg-white/10 transition-all duration-300 min-w-[120px]"
              >
                <LiquidText>Works</LiquidText>
              </MagneticButton>
            </div>

            {/* Small Description at bottom */}
            <p className="absolute bottom-12 text-white/40 font-japanese text-xs max-w-md leading-relaxed">
              <LiquidText>{HERO_CONTENT.description}</LiquidText>
            </p>
          </motion.div>
        </Section>

        {/* Journey Section */}
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
                  {/* Timeline Marker */}
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

        {/* Selected Works Section */}
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

        {/* Footer */}
        <footer className="py-12 text-center text-gray-500 text-sm relative z-10">
          <p><LiquidText>&copy; {new Date().getFullYear()} Shiva. Built with React, Three.js & Antigravity.</LiquidText></p>
        </footer>

      </main>
    </div>
  );
}

export default App;
