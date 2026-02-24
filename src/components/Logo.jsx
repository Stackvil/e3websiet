import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className }) => {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            {/* Logo Image Part */}
            <motion.div
                className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center translate-y-2 md:translate-y-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <img
                    src="/e3logo (2).png"
                    alt="E3 Logo"
                    className="w-full h-full object-contain drop-shadow-md"
                />
            </motion.div>

            {/* Text Part */}
            <div className="flex flex-col justify-center translate-y-1">
                <motion.h1
                    className="text-5xl font-black tracking-wide text-[#FFD700] italic leading-none"
                    style={{ fontFamily: 'Arial, sans-serif', transform: 'skewX(-10deg)', letterSpacing: '0.05em' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    ETHREE
                </motion.h1>

                <motion.div
                    className="flex items-center gap-2 text-sm font-bold text-gray-700 mt-1 ml-1"
                    style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <span className="italic">eat</span>
                    <span className="text-[#FFD700] text-lg leading-[0]">•</span>
                    <span className="italic">enjoy</span>
                    <span className="text-[#FFD700] text-lg leading-[0]">•</span>
                    <span className="italic">entertain</span>
                </motion.div>

                {/* Yellow Underline */}
                <motion.div
                    className="h-[2px] bg-[#FFD700] mt-1 -ml-4 w-[115%]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 0.95 }}
                    style={{ originX: 0 }}
                    transition={{ delay: 0.6 }}
                />

                {/* Powered By Line */}
                <motion.p
                    className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1 ml-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    powered by <span className="text-gray-500">JAAN ENTERTAINMENT PVT LTD</span>
                </motion.p>
            </div>
        </div>
    );
};

export default Logo;
