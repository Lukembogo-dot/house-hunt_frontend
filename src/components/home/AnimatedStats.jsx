// src/components/home/AnimatedStats.jsx
// Animated counters section showcasing platform statistics with rich visual effects

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaHome, FaUsers, FaMapMarkedAlt, FaHandshake, FaStar, FaSearch, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const stats = [
    {
        icon: FaHome,
        value: 2500,
        suffix: '+',
        label: 'Properties Listed',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        icon: FaUsers,
        value: 1000,
        suffix: '+',
        label: 'Active Users',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-500/10'
    },
    {
        icon: FaMapMarkedAlt,
        value: 50,
        suffix: '+',
        label: 'Neighborhoods',
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-500/10'
    },
    {
        icon: FaHandshake,
        value: 500,
        suffix: '+',
        label: 'Verified Agents',
        color: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-500/10'
    },
    {
        icon: FaStar,
        value: 4.8,
        suffix: '',
        label: 'User Rating',
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'bg-yellow-500/10',
        isDecimal: true
    }
];

// Animated counter hook
const useCounter = (end, duration = 2000, isDecimal = false, inView = false) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;

        let startTime;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = easeOutQuart * end;

            setCount(isDecimal ? currentValue : Math.floor(currentValue));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isDecimal, inView]);

    return isDecimal ? count.toFixed(1) : count.toLocaleString();
};

const StatCard = ({ stat, index, inView }) => {
    const count = useCounter(stat.value, 2500, stat.isDecimal, inView);
    const Icon = stat.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
        >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Animated background gradient blob */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className={`absolute -top-10 -right-10 w-32 h-32 ${stat.bgColor} rounded-full blur-2xl`}
                />

                {/* Icon with pulse animation */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className={`relative w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white text-2xl mb-4 shadow-lg`}
                >
                    <Icon />
                </motion.div>

                {/* Counter */}
                <div className="relative">
                    <span className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {count}{stat.suffix}
                    </span>
                </div>

                {/* Label */}
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-2">
                    {stat.label}
                </p>
            </div>
        </motion.div>
    );
};

// ✨ Trust Features Component
const TrustFeatures = ({ inView }) => {
    const features = [
        { icon: FaSearch, title: 'Property Scouts', desc: "Can't find what you need? Our scouts will hunt for you", color: 'text-blue-500' },
        { icon: FaShieldAlt, title: 'Verified Listings', desc: 'Every property is checked before publishing', color: 'text-green-500' },
        { icon: FaHeadset, title: '24/7 Support', desc: 'Our team is always ready to assist you', color: 'text-purple-500' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-[2px] shadow-2xl"
        >
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8">
                <div className="text-center mb-6">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="inline-block text-4xl mb-3"
                    >
                        🎯
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Don't See Your Dream Home Yet?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        Our dedicated scouts are on standby to find exactly what you're looking for
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.7 + idx * 0.1 }}
                            className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className={`p-2 rounded-lg bg-white dark:bg-gray-700 shadow ${feature.color}`}>
                                <feature.icon className="text-xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{feature.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        to="/wanted/post"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
                    >
                        <FaSearch />
                        Let Our Scouts Find It For You
                    </Link>
                    <p className="text-xs text-gray-400 mt-3">Free service • No obligations • Quick responses</p>
                </div>
            </div>
        </motion.div>
    );
};

const AnimatedStats = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-16 px-6 relative overflow-hidden">
            {/* ✨ ANIMATED GRADIENT MESH BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-950" />

            {/* Animated floating orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 100, 50, 0],
                        y: [0, -50, 50, 0],
                        scale: [1, 1.2, 0.8, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-20 left-[10%] w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 40, 0],
                        y: [0, 60, -30, 0],
                        scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, 60, -40, 0],
                        y: [0, -40, 60, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl"
                />
            </div>

            {/* Rotating decorative rings */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-40 -left-40 w-80 h-80 border-2 border-dashed border-blue-200/40 dark:border-blue-800/30 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-40 -right-40 w-96 h-96 border-2 border-dashed border-purple-200/40 dark:border-purple-800/30 rounded-full"
                />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/4 right-[20%] w-48 h-48 border border-pink-200/30 dark:border-pink-800/20 rounded-full"
                />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                        style={{
                            left: `${10 + Math.random() * 80}%`,
                            top: `${10 + Math.random() * 80}%`,
                        }}
                        className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
                    />
                ))}
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200/50 dark:border-blue-700/50"
                    >
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Our Impact
                    </motion.span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                        Trusted by Thousands Across Kenya
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Join the growing community of house hunters and agents finding their perfect match
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {stats.map((stat, index) => (
                        <StatCard key={index} stat={stat} index={index} inView={inView} />
                    ))}
                </div>

                {/* ✨ Trust Features Section */}
                <TrustFeatures inView={inView} />
            </div>
        </section>
    );
};

export default AnimatedStats;

