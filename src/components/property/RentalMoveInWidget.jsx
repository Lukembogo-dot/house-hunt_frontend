import React, { useState, useEffect } from 'react';
import { FaTruck, FaMoneyBillWave, FaCalculator, FaCheckCircle, FaCalendarAlt, FaWifi, FaBroom, FaRoute } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const RentalMoveInWidget = ({ property }) => {
    if (!property || !property.price) return null;

    const rent = property.price;

    // --- STATE ---
    const [depositMonths, setDepositMonths] = useState(1);
    const [moverType, setMoverType] = useState('pickup');
    const [distance, setDistance] = useState(10); // km
    const [utilityDeposit, setUtilityDeposit] = useState(2500);
    const [agencyFee, setAgencyFee] = useState(false);

    // Extras
    const [needsWifi, setNeedsWifi] = useState(true);

    // --- RATES (Calibrated) ---
    const MOVER_BASE_RATES = {
        self: 0,
        pickup: 2500, // User Benchmark
        canter: 8000,
        lorry: 20000
    };

    const COST_PER_KM = {
        self: 0,
        pickup: 100, // User Benchmark
        canter: 200,
        lorry: 350
    };

    const EXTRAS_COST = {
        wifi: 3000, // Typical installation
        cleaning: 2500 // Typical thorough cleaning
    };

    // --- CALCULATIONS ---
    // 1. Rent (Fixed)
    const firstMonthRent = rent;

    // 2. Transport
    const baseTransport = MOVER_BASE_RATES[moverType];
    const distanceCost = Math.round(distance * COST_PER_KM[moverType]);
    const totalTransport = baseTransport > 0 ? baseTransport + distanceCost : 0;

    // 3. Deposits & Fees
    const totalDeposit = rent * depositMonths;
    const totalAgency = agencyFee ? rent * 0.5 : 0;

    // 4. Extras
    const wifiCost = needsWifi ? EXTRAS_COST.wifi : 0;

    // 5. GRAND TOTAL
    const totalUpfront = firstMonthRent + totalDeposit + totalTransport + utilityDeposit + totalAgency + wifiCost;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border border-blue-100 dark:border-gray-700 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md">
                    <FaCalculator />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white leading-tight">Move-In Budgeter</h3>
                    <p className="text-xs text-gray-500">Plan your finances accurately</p>
                </div>
            </div>

            <div className="space-y-5 text-sm">

                {/* 1. RENT */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-600 dark:text-gray-400">First Month Rent</span>
                    <span className="font-bold text-gray-900 dark:text-white">Ksh {firstMonthRent.toLocaleString()}</span>
                </div>

                {/* 2. DEPOSIT */}
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Security Deposit</span>
                        <span className="font-bold text-gray-900 dark:text-white">{depositMonths} Month{depositMonths > 1 ? 's' : ''}</span>
                    </div>
                    <input
                        type="range" min="1" max="3" step="1"
                        value={depositMonths}
                        onChange={(e) => setDepositMonths(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="mt-2 text-right text-xs font-bold text-gray-600 dark:text-gray-400">
                        Ksh {totalDeposit.toLocaleString()}
                    </div>
                </div>

                {/* 3. LOGISTICS (Movers + Distance) */}
                <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2 flex items-center gap-2">
                        <FaTruck className="text-green-600" /> Logistics
                    </span>
                    <div className="grid grid-cols-4 gap-1 mb-3">
                        {['self', 'pickup', 'canter', 'lorry'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setMoverType(type)}
                                className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-semibold border transition-all ${moverType === type
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {moverType !== 'self' && (
                        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500 flex items-center gap-1"><FaRoute /> Distance ({distance} km)</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-200">+ Ksh {distanceCost.toLocaleString()}</span>
                            </div>
                            <input
                                type="range" min="1" max="50" step="1"
                                value={distance}
                                onChange={(e) => setDistance(Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Total Moving</span>
                                <span className="text-sm font-bold text-green-600">Ksh {totalTransport.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. ESSENTIAL ADD-ONS */}
                <div className="space-y-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">One-Time Costs</span>

                    {/* WiFi */}
                    <div onClick={() => setNeedsWifi(!needsWifi)} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-transparent hover:border-blue-200">
                        <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${needsWifi ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                <FaWifi size={10} />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">Internet Install</span>
                        </div>
                        <span className={`font-semibold text-xs ${needsWifi ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {needsWifi ? `+ ${EXTRAS_COST.wifi.toLocaleString()}` : 'No'}
                        </span>
                    </div>

                    {/* Utility Deposit */}
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">Utility Deposits</span>
                        </div>
                        <span className="font-semibold text-xs text-gray-900 dark:text-white">Ksh {utilityDeposit.toLocaleString()}</span>
                    </div>

                    {/* Agency Fee */}
                    <div onClick={() => setAgencyFee(!agencyFee)} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 transition border border-transparent hover:border-blue-200">
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${agencyFee ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                                {agencyFee && <FaCheckCircle className="text-white text-[10px]" />}
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-gray-700 dark:text-gray-300">Agency Fee (50%)</span>
                                <span className="text-[9px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider mt-1">Where Applicable</span>
                            </div>
                        </div>
                        <span className={`font-semibold text-xs ${agencyFee ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                            Ksh {totalAgency.toLocaleString()}
                        </span>
                    </div>
                </div>

            </div>

            {/* TOTAL BANNER */}
            <motion.div
                key={totalUpfront}
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                className="mt-6 bg-gray-900 dark:bg-black text-white p-4 rounded-xl shadow-xl border-t-4 border-green-500 relative overflow-hidden"
            >
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Total Upfront</span>
                        <span className="text-xs text-green-400">Cash Required</span>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-white leading-none tracking-tight">Ksh {totalUpfront.toLocaleString()}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RentalMoveInWidget;
