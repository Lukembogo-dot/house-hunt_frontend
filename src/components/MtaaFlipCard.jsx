import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FaWater, FaWifi, FaBus, FaShieldAlt, FaStar,
    FaMapMarkerAlt, FaInfoCircle, FaArrowRight, FaCity,
    FaTimes, FaRoad, FaShoppingBasket, FaUserTie, FaCheckCircle,
    FaExclamationTriangle, FaWalking, FaMotorcycle, FaSignal, FaBolt, FaUtensils, FaTint,
    FaBroom, FaTrash, FaSchool, FaHospital, FaDumbbell, FaLightbulb
} from 'react-icons/fa';
import { calculatePersonaMatches, calculateTrueCostBreakdown } from '../utils/mtaaAlgoEngine';
import InsightLocker from './property/InsightLocker';

// --- SHARED HELPER: Status Colors ---
const getStatusColors = (type, value) => {
    if (!value) return 'text-gray-500 bg-gray-50 border-gray-100';

    if (type === 'water') {
        if (value.includes('24/7')) return 'text-blue-700 bg-blue-50 border-blue-200';
        if (value.includes('Rationed')) return 'text-orange-700 bg-orange-50 border-orange-200';
        return 'text-red-700 bg-red-50 border-red-200';
    }
    if (type === 'opinion') {
        if (value === 'Affordable') return 'text-green-700 bg-green-50 border-green-200';
        if (value === 'Fair Value') return 'text-blue-700 bg-blue-50 border-blue-200';
        if (value === 'Overpriced') return 'text-red-700 bg-red-50 border-red-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-100';
};

const MtaaFlipCard = ({ property }) => {
    const [isOpen, setIsOpen] = useState(false);
    const score = property.mtaaScore;

    // ✅ CALCULATE DERIVED INSIGHTS
    const personas = useMemo(() =>
        calculatePersonaMatches({
            breakdown: {
                water: score.water?.includes('24/7') ? 100 : 50,
                security: parseFloat(score.security) * 20,
                vibe: score.amenities?.supermarket ? 80 : 50,
                roads: score.roadCondition === 'Tarmac' ? 100 : 50
            },
            averages: {}
        }), [score]
    );

    const costBreakdown = useMemo(() =>
        calculateTrueCostBreakdown({
            averages: {
                rent: 0,
                commutePeak: score.fare || 0,
                commuteOffPeak: score.fareOffPeak || 0
            }
        }), [score]
    );

    // Helper for storytelling noise sources
    const getNoiseStory = () => {
        const level = score.amenities?.noiseLevel || 'Moderate';
        const sources = score.amenities?.noiseSources || [];

        if (level === 'Silent') return "This area is a rare quiet haven, perfect for deep work or light sleepers.";

        if (sources.length > 0) {
            const sourceText = sources.join(' and ');
            if (level === 'Noisy' || level.includes('Club')) {
                return `The energy is high here. Residents report consistent sound from local ${sourceText}.`;
            }
            return `It's generally manageable, though the tranquility is occasionally interrupted by ${sourceText}.`;
        }
        return "Expect the standard rhythm of the city; not too quiet, not too loud.";
    };

    return (
        <>
            {/* === 1. COMPACT CARD (Grid View) === */}
            <motion.div
                layoutId={`card-${property.id}`}
                onClick={() => setIsOpen(true)}
                className="relative w-full h-96 cursor-pointer group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
            >
                <div className={`h-48 w-full relative bg-gradient-to-br ${property.gradient} flex items-center justify-center overflow-hidden`}>
                    {property.image ? (
                        <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                        <FaCity className="absolute text-white opacity-10 text-[10rem] -bottom-6 -right-6 rotate-12" />
                    )}
                    {!property.image && (
                        <div className="z-10 text-center px-4">
                            <h3 className="text-2xl font-black text-white drop-shadow-md uppercase tracking-tight leading-none">{property.title}</h3>
                        </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/30">
                        <FaStar className="text-yellow-300 text-sm" />
                        <span className="text-sm font-bold text-white">{property.rating}</span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 border border-white/10 group-hover:bg-black/60 transition">
                        <FaInfoCircle /> See Full Analysis
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1 truncate">{property.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center gap-2 mb-4 uppercase tracking-wide">
                        <FaMapMarkerAlt className="text-red-500" /> {property.location}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1">
                            KES {property.rentRange}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getStatusColors('opinion', property.rentOpinion)}`}>
                            {property.rentOpinion}
                        </span>
                        <span className="text-xs text-gray-500">for {property.unitType}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {personas.map((p, i) => (
                            <span key={i} className="text-[10px] font-bold uppercase bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2.5 py-1 rounded-md border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                                {p.icon} {p.name}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* === 2. EXPANDED MODAL (Narrative View) === */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        <motion.div
                            layoutId={`card-${property.id}`}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className={`relative h-28 shrink-0 bg-gradient-to-br ${property.gradient} flex items-end p-6 justify-between`}>
                                <div className="z-10 text-white w-full flex justify-between items-end">
                                    <div>
                                        <h2 className="text-3xl font-black drop-shadow-md leading-none mb-1">{property.title}</h2>
                                        <p className="text-white/90 text-sm font-bold flex items-center gap-2"><FaMapMarkerAlt /> {property.location}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-yellow-300 text-2xl font-black drop-shadow-sm">{property.rating} <FaStar className="text-xl" /></div>
                                        <span className="text-[10px] uppercase font-bold text-white/80">{property.reviews} Verified Reviews</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition backdrop-blur-sm"><FaTimes /></button>
                                <FaCity className="absolute text-white opacity-10 text-[10rem] -bottom-4 -left-10 rotate-12" />
                            </div>

                            {/* SCROLLABLE NARRATIVE BODY */}
                            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900 space-y-6">
                                <InsightLocker propertyId={property.id || property._id}>
                                    {/* 1. THE COMMUTE STORY */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <h4 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase mb-3"><FaBus /> The Commute</h4>

                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="mt-1 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                {score.distanceToStage?.includes('Boda') ? <FaMotorcycle /> : <FaWalking />}
                                            </div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                <p className="mb-1">
                                                    Getting to the stage is <strong className="text-gray-900 dark:text-white">{score.distanceToStage?.toLowerCase() || 'easy'}</strong>.
                                                    Once there, matatus are available <strong className="text-blue-600">{score.matatuAvailability?.toLowerCase() || 'regularly'}</strong>.
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Prices range from <strong className="text-gray-900 dark:text-white">{score.fareOffPeak} KES</strong> (Off-Peak) to <strong className="text-gray-900 dark:text-white">{score.fare} KES</strong> (Peak).
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. UTILITIES & MANAGEMENT */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Water Card */}
                                        <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border shadow-sm ${score.water.includes('24/7') ? 'border-blue-100 dark:border-blue-900/50' : 'border-orange-100 dark:border-orange-900/50'}`}>
                                            <h4 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 text-xs uppercase mb-2"><FaWater /> Water Situation</h4>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
                                                You can expect <strong className="text-blue-600">{score.water?.replace('Council Water', '')}</strong> supply here.
                                            </p>
                                            {score.waterSource && <p className="text-xs text-gray-500">Source: {score.waterSource}</p>}
                                            {score.waterRationingSchedule && (
                                                <p className="text-xs text-orange-600 font-bold mt-2 flex items-center gap-1">
                                                    <FaExclamationTriangle /> Rationing: {score.waterRationingSchedule}
                                                </p>
                                            )}
                                        </div>

                                        {/* Management Card */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                                            <h4 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 text-xs uppercase mb-2"><FaUserTie /> Landlord Vibe</h4>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-800 dark:text-white">Responsiveness</span>
                                                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{score.management?.responsiveness || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-800 dark:text-white">Attitude</span>
                                                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{score.management?.responsiveness || 'Within 24h'}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-800 dark:text-white">Attitude</span>
                                                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{score.management?.friendliness || 'Professional'}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-t pt-2 mt-2">
                                                <span className="text-xs text-gray-500 font-bold uppercase">Avg Rating</span>
                                                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                                    {score.management?.rating || '3.0'} <FaStar size={10} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. INTERNET / DIGITAL PULSE (Enhanced) */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/50 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <h4 className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-400 text-sm uppercase mb-3"><FaWifi /> The Digital Pulse</h4>

                                            <div className="space-y-3">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    For the remote workers and streamers: reliable internet is <strong className={`${score.internetReliability >= 4 ? 'text-green-600' : 'text-red-500'}`}>{score.internetReliability >= 4 ? 'a guarantee' : 'a gamble'}</strong> here.
                                                </p>

                                                <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-indigo-500 uppercase font-bold mb-1">Dominant Provider</span>
                                                        {/* ✅ FIX: Fetch from either property (individual) or topInternet (aggregate) */}
                                                        <span className="font-bold text-gray-900 dark:text-white">{score.internetProvider || score.topInternet || 'Not Reported'}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs text-indigo-500 uppercase font-bold mb-1">Avg Speed</span>
                                                        <div className="flex items-center gap-1 justify-end">
                                                            <span className="font-bold text-gray-900 dark:text-white">{score.internetSpeed || 'N/A'}</span>
                                                            {score.internetSpeed && <FaCheckCircle className="text-indigo-400 text-xs" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                {score.internetReliability && (
                                                    <p className="text-xs text-gray-500 italic">
                                                        Residents rate the stability <strong className="text-gray-800 dark:text-gray-200">{score.internetReliability}/5</strong>. {score.internetReliability < 3 ? "Keep a backup dongle handy." : "Zoom calls flow smoothly without jitters."}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* ✅ NEW: CTA to Contribute Stats */}
                                        <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-800/30 flex items-center justify-between">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">Using a different provider?</span>
                                            <Link to="/add-review" className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-full flex items-center gap-1 transition shadow-sm">
                                                <FaSignal size={10} /> Contribute Speed Stats
                                            </Link>
                                        </div>
                                    </div>

                                    {/* 4. SECURITY & LIFESTYLE */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <h4 className="flex items-center gap-2 font-bold text-green-700 dark:text-green-400 text-sm uppercase mb-3"><FaShieldAlt /> Security Detail</h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                            The area is rated <strong className="text-green-600">{score.security}/5</strong>.
                                            Residents describe it as <strong className="text-gray-900 dark:text-white">{score.safeAtNight}</strong> at night.
                                        </p>

                                        {/* NARRATIVE FEATURES LIST */}
                                        {score.securityFeatures && score.securityFeatures.length > 0 ? (
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                Protected by: <span className="text-gray-800 dark:text-gray-200 font-medium">{score.securityFeatures.join(', ')}</span>.
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No specific security features reported yet.</p>
                                        )}
                                    </div>

                                    {/* 5. ROADS & RAIN REALITY */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <h4 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase mb-3"><FaRoad /> Street Conditions</h4>

                                        <div className="flex flex-col gap-3">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Daily access is via <strong className="text-gray-900 dark:text-white">{score.roadCondition || 'Standard Road'}</strong>.
                                            </p>

                                            {/* Rain Story */}
                                            {score.rainySeasonFeatures && score.rainySeasonFeatures.length > 0 ? (
                                                <div className={`text-xs p-3 rounded-lg border flex gap-2 items-start ${score.rainySeasonFeatures.some(f => ['Flooded', 'Muddy'].includes(f)) ? 'bg-orange-50 border-orange-100 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200' : 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'}`}>
                                                    <FaWater className="mt-0.5 text-sm" />
                                                    <span>
                                                        <strong>Rain Check:</strong> Residents warn that this road becomes <strong className="lowercase">{score.rainySeasonFeatures.join(' and ')}</strong> when the heavens open.
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic flex items-center gap-1"><FaCheckCircle className="text-gray-300" /> No drainage or mud issues reported yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 6. NOISE & SOUNDSCAPE (Enhanced Storytelling) */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <h4 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase mb-3"><FaExclamationTriangle /> Soundscape & Serenity</h4>

                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">General Vibe:</span>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${score.amenities?.noiseLevel === 'Silent' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                                    {score.amenities?.noiseLevel || 'Moderate'}
                                                </span>
                                            </div>

                                            {/* ✅ NEW: Narrative Explanation of Noise Sources */}
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {getNoiseStory()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 7. AMENITIES CHECK */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-orange-100 dark:border-orange-900/50 shadow-sm">
                                        <h4 className="flex items-center gap-2 font-bold text-orange-700 dark:text-orange-400 text-sm uppercase mb-3"><FaShoppingBasket /> Daily Convenience</h4>

                                        <div className="space-y-3">
                                            {/* Supermarket Status */}
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1 rounded-full ${score.amenities?.supermarket ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {score.amenities?.supermarket ? <FaCheckCircle size={10} /> : <FaTimes size={10} />}
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {score.amenities?.supermarket
                                                        ? "There is a supermarket within walking distance."
                                                        : "Heads up: No major supermarket nearby."}
                                                </p>
                                            </div>

                                            {/* Food Options */}
                                            {score.food && score.food.length > 0 && (
                                                <div className="pt-2 border-t border-dashed border-orange-200 dark:border-orange-800">
                                                    <span className="text-xs text-orange-600 font-bold uppercase mb-1 block">Street Food Scene:</span>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                                        You can easily find {score.food.join(', ')} nearby.
                                                    </p>
                                                </div>
                                            )}
                                            {score.food && score.food.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {score.food.map(f => (
                                                        <span key={f} className="text-[10px] bg-orange-50 border border-orange-200 text-orange-700 px-2 py-1 rounded-md flex items-center gap-1">
                                                            <FaUtensils size={8} /> {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 8. SANITATION, SOCIAL & LIFESTYLE (New Sections) */}

                                    {/* Hygiene & Sanitation */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-teal-100 dark:border-teal-900/50 shadow-sm">
                                        <h4 className="flex items-center gap-2 font-bold text-teal-700 dark:text-teal-400 text-sm uppercase mb-3"><FaBroom /> Hygiene & Sanitation</h4>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                                <div className="text-xs text-teal-600 font-bold uppercase mb-1">Cleanliness</div>
                                                <div className="font-bold text-gray-900 dark:text-white">{score.sanitation?.cleanliness || 'N/A'}/5</div>
                                            </div>
                                            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                                <div className="text-xs text-teal-600 font-bold uppercase mb-1">Garbage</div>
                                                <div className="text-xs font-medium text-gray-900 dark:text-white">{score.sanitation?.garbage || 'Unknown'}</div>
                                            </div>
                                            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                                <div className="text-xs text-teal-600 font-bold uppercase mb-1">Sewer</div>
                                                <div className="text-xs font-medium text-gray-900 dark:text-white">{score.sanitation?.sewer ? 'Connected' : 'Septic'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Social & Facilities Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Social Amenities */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-100 dark:border-purple-900/50 shadow-sm">
                                            <h4 className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-400 text-xs uppercase mb-2"><FaMapMarkerAlt /> Neighborhood Reach</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1"><FaSchool className="text-xs" /> Schools</span>
                                                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{score.social?.schools}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1"><FaShoppingBasket className="text-xs" /> Malls</span>
                                                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{score.social?.malls}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1"><FaHospital className="text-xs" /> Medical</span>
                                                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{score.social?.hospitals}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Building Facilities */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                                            <h4 className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-400 text-xs uppercase mb-2"><FaDumbbell /> Building Perks</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {score.facilities && score.facilities.length > 0 ? score.facilities.map((f, i) => (
                                                    <span key={i} className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 px-2 py-1 rounded-md">{f}</span>
                                                )) : <span className="text-xs text-gray-400 italic">No specific facilities listed.</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resident Suggestions */}
                                    {score.improvements && score.improvements.length > 0 && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-100 dark:border-yellow-800/50 shadow-sm">
                                            <h4 className="flex items-center gap-2 font-bold text-yellow-700 dark:text-yellow-400 text-sm uppercase mb-3"><FaLightbulb /> Resident Wishlist</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {score.improvements.map((imp, i) => (
                                                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 italic">"{imp}"</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </InsightLocker>
                            </div>

                            {/* Footer CTA */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center gap-4 shrink-0">
                                <div className="text-xs text-gray-500"><span className="font-bold text-gray-900 dark:text-white">{property.rentOpinion}</span> for this area.</div>
                                <Link to={`/living-feed?buildingName=${encodeURIComponent(property.title)}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition text-sm flex items-center gap-2">
                                    Read Full Reviews <FaArrowRight />
                                </Link>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MtaaFlipCard;