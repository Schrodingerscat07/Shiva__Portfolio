'use client'

import React, { useState } from 'react'
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight"
import { HERO_CONTENT, PROJECTS, TIMELINE_DATA, SOCIAL_LINKS } from "@/constants/data";
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaKaggle } from 'react-icons/fa';

export function SplineSceneBasic() {
    const [activeTab, setActiveTab] = useState('home');

    const tabs = [
        { id: 'home', label: 'Intro' },
        { id: 'journey', label: 'Journey' },
        { id: 'projects', label: 'Works' }
    ];

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col border-b border-white/5">
            {/* Split Layout Container */}
            <div className="absolute inset-0 z-0 flex flex-col md:flex-row">
                {/* Left Side: Empty space for content */}
                <div className="flex-1" />

                {/* Right Side: 3D Model */}
                <div className="flex-1 relative">
                    <SplineScene
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full"
                    />
                    {/* Shadow overlay to blend 3D into the left content area */}
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 hidden md:block" />
                </div>
            </div>

            {/* Ambient Lighting / Spotlight */}
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20 z-10"
                fill="white"
            />

            {/* Frontmost Content Layer */}
            <div className="relative z-20 h-full w-full flex flex-col p-6 md:p-12 pointer-events-none">

                {/* Branding - Upper Right (Overlaying 3D area) */}
                <header className="flex justify-between items-start w-full pointer-events-auto">
                    <nav className="flex gap-6 md:gap-10">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`text-[10px] uppercase tracking-[0.3em] font-japanese transition-all duration-300 ${activeTab === tab.id
                                        ? 'text-white border-b border-white/40 pb-1'
                                        : 'text-neutral-600 hover:text-neutral-400'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-500 font-japanese tracking-tighter select-none">
                        {HERO_CONTENT.name}
                    </h1>
                </header>

                {/* Dashboard Center Content (Mainly Left-Aligned) */}
                <main className="flex-1 flex items-center px-4 md:px-20 max-w-2xl pointer-events-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'home' && (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-5xl md:text-8xl font-bold leading-[0.9] tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/20">
                                    {HERO_CONTENT.tagline.split(' ').map((word, i) => (
                                        <span key={i} className="block">{word}</span>
                                    ))}
                                </h2>
                                <p className="text-neutral-400 max-w-sm text-base md:text-lg leading-relaxed font-light">
                                    {HERO_CONTENT.description}
                                </p>
                                <div className="pt-4 flex gap-6 items-center">
                                    <a
                                        href={HERO_CONTENT.resumeLink}
                                        className="inline-block px-8 py-3 rounded-full bg-white text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-200 transition-transform active:scale-95"
                                    >
                                        Resume
                                    </a>
                                    <button
                                        onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="text-white/40 hover:text-white transition-colors uppercase tracking-[0.3em] text-[10px] font-bold"
                                    >
                                        Scroll Down ↓
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'journey' && (
                            <motion.div
                                key="journey"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="w-full max-h-[50vh] overflow-y-auto custom-scrollbar pr-6 space-y-6"
                            >
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">History</h3>
                                <div className="space-y-6">
                                    {TIMELINE_DATA.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="group">
                                            <span className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest">{item.year}</span>
                                            <h4 className="text-lg font-bold text-white group-hover:text-neutral-200 transition-colors">{item.title}</h4>
                                            <p className="text-neutral-500 text-xs mt-1 leading-relaxed">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'projects' && (
                            <motion.div
                                key="projects"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="w-full max-h-[50vh] overflow-y-auto custom-scrollbar pr-6 grid gap-4"
                            >
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 col-span-full">Spotlight Works</h3>
                                {PROJECTS.map((project) => (
                                    <div
                                        key={project.id}
                                        className="group p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-bold text-white group-hover:text-neutral-200">{project.title}</h4>
                                            <FaGithub size={16} className="text-neutral-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <p className="text-neutral-500 text-[10px] line-clamp-2 leading-tight">{project.description}</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Footer / Socials - Bottom Left */}
                <footer className="flex justify-between items-end w-full pointer-events-auto">
                    <div className="flex gap-6">
                        {SOCIAL_LINKS.map(link => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-600 hover:text-white transition-all transform hover:-translate-y-1 flex items-center gap-2 group"
                            >
                                {link.name === 'GitHub' && <FaGithub size={20} />}
                                {link.name === 'Kaggle' && <FaKaggle size={20} />}
                                <span className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {link.name}
                                </span>
                            </a>
                        ))}
                    </div>
                    <div className="hidden md:block">
                        <span className="text-[10px] text-neutral-800 uppercase tracking-[0.5em] font-bold">EST. 2024</span>
                    </div>
                </footer>
            </div>
        </div>
    )
}
