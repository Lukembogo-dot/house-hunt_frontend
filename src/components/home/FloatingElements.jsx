// src/components/home/FloatingElements.jsx
// Animated floating decorative elements for visual appeal

import React from 'react';
import { motion } from 'framer-motion';

// Floating blob animation component
const FloatingBlob = ({
    size = 'w-64 h-64',
    color = 'bg-blue-500/20',
    position = 'top-0 left-0',
    delay = 0,
    duration = 8
}) => {
    return (
        <motion.div
            animate={{
                x: [0, 30, -20, 0],
                y: [0, -40, 20, 0],
                scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay
            }}
            className={`absolute ${size} ${color} rounded-full blur-3xl ${position} pointer-events-none`}
        />
    );
};

// Floating icon element
const FloatingIcon = ({
    icon: Icon,
    position = 'top-10 left-10',
    size = 'w-12 h-12',
    color = 'text-blue-500',
    bgColor = 'bg-blue-100 dark:bg-blue-900/30',
    delay = 0
}) => {
    return (
        <motion.div
            animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay
            }}
            className={`absolute ${position} ${size} ${bgColor} rounded-xl flex items-center justify-center ${color} shadow-lg pointer-events-none`}
        >
            <Icon className="text-2xl" />
        </motion.div>
    );
};

// Animated gradient ring
const GradientRing = ({
    size = 'w-96 h-96',
    position = 'top-0 left-0',
    duration = 20
}) => {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'linear'
            }}
            className={`absolute ${size} ${position} pointer-events-none`}
        >
            <div className="w-full h-full rounded-full border-2 border-dashed border-gray-200/50 dark:border-gray-700/50" />
        </motion.div>
    );
};

// Particle dots
const ParticleDots = ({ count = 20 }) => {
    const dots = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {dots.map((dot) => (
                <motion.div
                    key={dot.id}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: dot.duration,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: dot.delay
                    }}
                    style={{
                        left: `${dot.x}%`,
                        top: `${dot.y}%`,
                        width: dot.size,
                        height: dot.size,
                    }}
                    className="absolute bg-blue-500/30 dark:bg-blue-400/20 rounded-full"
                />
            ))}
        </div>
    );
};

// Main FloatingElements wrapper
const FloatingElements = ({ variant = 'default', children }) => {
    const variants = {
        default: (
            <>
                <FloatingBlob
                    size="w-72 h-72"
                    color="bg-blue-500/10"
                    position="top-20 -left-20"
                    delay={0}
                />
                <FloatingBlob
                    size="w-96 h-96"
                    color="bg-purple-500/10"
                    position="bottom-20 -right-20"
                    delay={2}
                />
                <FloatingBlob
                    size="w-64 h-64"
                    color="bg-pink-500/10"
                    position="top-1/2 left-1/3"
                    delay={4}
                />
                <ParticleDots count={15} />
            </>
        ),
        hero: (
            <>
                <FloatingBlob
                    size="w-80 h-80"
                    color="bg-blue-600/15"
                    position="-top-20 -left-40"
                    duration={10}
                />
                <FloatingBlob
                    size="w-96 h-96"
                    color="bg-indigo-500/15"
                    position="-bottom-40 -right-40"
                    duration={12}
                    delay={1}
                />
                <FloatingBlob
                    size="w-72 h-72"
                    color="bg-purple-600/10"
                    position="top-1/3 right-1/4"
                    duration={8}
                    delay={2}
                />
                <GradientRing size="w-[500px] h-[500px]" position="-top-60 -right-60" duration={30} />
                <GradientRing size="w-[400px] h-[400px]" position="-bottom-40 -left-40" duration={25} />
            </>
        ),
        minimal: (
            <>
                <FloatingBlob
                    size="w-64 h-64"
                    color="bg-gray-500/5"
                    position="top-0 right-0"
                    duration={15}
                />
                <FloatingBlob
                    size="w-48 h-48"
                    color="bg-gray-500/5"
                    position="bottom-0 left-0"
                    duration={12}
                    delay={3}
                />
            </>
        )
    };

    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                {variants[variant] || variants.default}
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export { FloatingBlob, FloatingIcon, GradientRing, ParticleDots };
export default FloatingElements;
