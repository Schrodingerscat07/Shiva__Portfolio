import {
    FaGithub,
    FaKaggle,
    FaLinkedin,
    FaTwitter
} from 'react-icons/fa';

export const HERO_CONTENT = {
    name: "SHIVA",
    tagline: "Machine Learning & Computer Vision",
    description: "Crafting intelligent systems with deep learning and vision.",
    resumeLink: "#",
    socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com"
    }
};

export const TIMELINE_DATA = [
    {
        year: "2024",
        title: "Enrolled in BS Data Science",
        institution: "IIT Madras",
        description: "Deepening foundations in mathematics and data analysis."
    },
    {

        year: "2024",
        title: "ML From Scratch",
        description: "Implemented core algorithms (Regression, etc.) without libraries to understand the math."
    },
    {
        year: "2025",
        title: "Hackathon Winner",
        event: "IIIT-Hyderabad",
        description: "Quantum Radar Signal Processing project won top honors."
    },
    {
        year: "2025",
        title: "AlgoArena",
        description: "Launched a gamified E-learning platform for coding enthusiasts."
    }
];

export const PROJECTS = [
    {
        id: "project-a",
        title: "Ideologies vs Economic Factors",
        description: "Analytics on how political ideologies impact country economies using multi-model comparative analysis.",
        tech: ["R Language", "XGBoost", "Random Forest", "Linear Regression"],
        stat: "Multi-model comparative analysis",
        link: "https://github.com/Schrodingerscat07/r-ideologies-vs-economic-factors",
        color: "#4285F4" // Google Blue-ish
    },
    {
        id: "project-b",
        title: "Quantum Enhanced Radar",
        description: "Naval target detection using Grover's Algorithm and Phase Kickback. Implemented The Oracle for state marking.",
        tech: ["Python", "Qiskit", "AerSimulator", "NumPy"],
        stat: "O(√N) Search Speedup",
        link: "https://github.com/Schrodingerscat07/Quantum-Enhanced-Radar-Signal-Processing-for-Naval-Target-Detection",
        color: "#EA4335" // Google Red-ish
    },
    {
        id: "project-c",
        title: "AlgoArena",
        description: "A gamified e-learning platform for coding with real-time progress tracking.",
        tech: ["Flutter", "TypeScript", "Firebase"],
        stat: "Gamified Learning",
        link: "https://github.com/Schrodingerscat07/ALGOARENA",
        color: "#FBBC05" // Google Yellow-ish
    }
];

export const SOCIAL_LINKS = [
    {
        name: "GitHub",
        url: "https://github.com/Schrodingerscat07",
        icon: "FaGithub"
    },
    {
        name: "Kaggle",
        url: "https://www.kaggle.com/shivasai77",
        icon: "FaKaggle"
    }
];
