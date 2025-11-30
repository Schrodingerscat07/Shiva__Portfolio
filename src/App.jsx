import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Tilt } from 'react-tilt';
import AnimatedBackground from './components/AnimatedBackground';
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

import CustomCursor from './components/CustomCursor';
import ErrorBoundary from './components/ErrorBoundary';

// ...

function App() {
  const [bgVariant, setBgVariant] = useState('default');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
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
    <div className="min-h-screen text-white font-sans selection:bg-primary selection:text-white overflow-x-hidden cursor-none">
      <CustomCursor />
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
        <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-12 py-4 flex gap-12 items-center shadow-lg">
          <span className="font-display font-bold text-2xl tracking-tighter text-white cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>SHIVA</span>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <div className="flex gap-8 items-center">
            <button onClick={() => document.getElementById('journey').scrollIntoView({ behavior: 'smooth' })} className="text-gray-300 hover:text-white transition-colors font-medium text-lg">
              Journey
            </button>
            <button onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })} className="text-gray-300 hover:text-white transition-colors font-medium text-lg">
              Works
            </button>
          </div>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <div className="flex gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors font-medium text-lg">
                {link.name}
              </a>
            ))}
          </div>
          <MagneticButton className="bg-white text-black px-6 py-2 rounded-full text-base font-semibold hover:bg-gray-200 transition-colors shadow-md">
            Resume
          </MagneticButton>
        </nav>

        <Section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Gradient Overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60 pointer-events-none z-0" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl relative z-10 p-8 rounded-3xl"
          >
            <h1
              className="font-sans text-8xl md:text-9xl font-bold mb-4 tracking-tighter text-white"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.4)' }}
            >
              {HERO_CONTENT.name}
            </h1>
            <p className="text-3xl md:text-5xl font-medium text-white/60 mb-8 leading-relaxed font-sans tracking-tight">
              {HERO_CONTENT.tagline}
            </p>
            <p className="text-xl md:text-2xl text-white/40 max-w-3xl mx-auto font-sans">
              {HERO_CONTENT.description}
            </p>
          </motion.div>
        </Section>

        {/* Timeline Section */}
        <Section className="py-20" id="journey">
          <h2 className="font-display text-4xl font-bold mb-20 text-center italic text-white/90 hover:text-white transition-colors duration-300 drop-shadow-lg">Journey</h2>

          <div className="relative max-w-4xl mx-auto px-4">
            {/* Continuous Line Background */}
            <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-white/10 md:left-1/2 md:-ml-[1px]" />

            <div className="space-y-16">
              {TIMELINE_DATA.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline Marker */}
                  <div className="absolute left-[19px] top-0 md:left-1/2 md:-ml-[8px] z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                      className="w-4 h-4 rounded-full border-2 border-black shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                      style={{ backgroundColor: '#FFD700' }} // Gold
                    >
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-full h-full rounded-full bg-white/30"
                      />
                    </motion.div>
                  </div>

                  {/* Content Card */}
                  <div className="ml-12 md:ml-0 md:w-1/2">
                    <div className={`p-6 rounded-xl border border-white/10 backdrop-blur-sm relative overflow-hidden group hover:border-[#FFD700]/30 transition-colors duration-500
                      ${index % 2 === 0 ? 'md:mr-12' : 'md:ml-12'}`}
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} // Dark overlay on content only
                    >
                      {/* Inner Highlight */}
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <span className="inline-block px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-xs font-mono font-bold mb-3">
                        {item.year}
                      </span>

                      <h3 className="font-display text-2xl font-bold text-white mb-1" style={{ textShadow: '1px 1px 3px #000000' }}>
                        {item.title}
                      </h3>

                      {(item.institution || item.project || item.event) && (
                        <p className="text-white/80 text-sm font-medium mb-3 italic">
                          {item.institution || item.project || item.event}
                        </p>
                      )}

                      <p className="text-white/60 text-sm leading-relaxed font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Empty space for the other side */}
                  <div className="hidden md:block md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Projects Section */}
        <Section id="projects">
          <h2 className="font-display text-3xl font-bold mb-16 italic text-white/70 hover:text-white transition-colors duration-300">Selected Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4">
            {PROJECTS.map((project) => (
              <Tilt key={project.id} options={{ max: 15, scale: 1.02, speed: 400 }} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl h-full flex flex-col hover:border-white/20 transition-all group shadow-2xl"
                >
                  <div className="mb-4 flex justify-between items-start">
                    <h3 className="font-display text-2xl font-bold text-white/80 group-hover:text-white transition-colors duration-300">{project.title}</h3>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                  </div>
                  <p className="text-white/60 group-hover:text-white transition-colors duration-300 mb-6 flex-grow">{project.description}</p>

                  <div className="mb-6">
                    <div className="text-xs font-mono text-white/40 group-hover:text-white/60 transition-colors duration-300 mb-2">TECH STACK</div>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map(t => (
                        <span key={t} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-xs text-white/60 group-hover:text-white transition-colors duration-300 font-medium">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                    <span className="text-sm font-mono text-blue-400 font-bold">{project.stat}</span>
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white hover:underline underline-offset-4 transition-colors duration-300">
                      View Code &rarr;
                    </a>
                  </div>
                </motion.div>
              </Tilt>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <footer className="py-12 text-center text-gray-500 text-sm relative z-10">
          <p>&copy; {new Date().getFullYear()} Shiva. Built with React, Three.js & Antigravity.</p>
        </footer>

      </main>
    </div>
  );
}

export default App;
