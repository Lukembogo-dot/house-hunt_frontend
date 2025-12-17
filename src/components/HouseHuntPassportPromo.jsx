import React from 'react';
import { motion } from 'framer-motion';

const HouseHuntPassportPromo = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 p-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg transform hover:scale-[1.01] transition-transform cursor-pointer"
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="text-xl">🎟️</span> House Hunt Passport
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">
                        Unlock <strong>Full Market Reports</strong>, Contact Owners directly, and more!
                    </p>
                </div>
                <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg shadow-md hover:opacity-90 transition">
                    Get Access
                </button>
            </div>
        </motion.div>
    );
};

export default HouseHuntPassportPromo;
