import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className }) => {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            {/* Logo Graphic Part */}
            <motion.div
                className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center -mb-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    {/* Tilted Yellow Square Background */}
                    <motion.rect
                        x="18" y="18" width="64" height="64" rx="12"
                        fill="#FFD700"
                        transform="rotate(-15 50 50)"
                    />

                    {/* The White "E3" Graphic - Thicker, stylized paths like the reference */}
                    <g transform="rotate(-15 50 50) translate(20, 22) scale(0.6)">
                        {/* Left 'E' Shape */}
                        <path
                            d="M10,10 L45,10 C48,10 50,12 50,15 L50,15 L50,15 L18,15 L18,38 L45,38 C48,38 50,40 50,43 L50,43 L50,43 L18,43 L18,75 L45,75 C48,75 50,77 50,80 L50,80 L50,80 L10,80 C7,80 5,78 5,75 L5,15 C5,12 7,10 10,10 Z"
                            fill="white"
                        />

                        {/* Right '3' Shape (Mirrored E) */}
                        <path
                            d="M90,10 L55,10 C52,10 50,12 50,15 L50,15 L50,15 L82,15 L82,38 L55,38 C52,38 50,40 50,43 L50,43 L50,43 L82,43 L82,75 L55,75 C52,75 50,77 50,80 L50,80 L50,80 L90,80 C93,80 95,78 95,75 L95,15 C95,12 93,10 90,10 Z"
                            fill="white"
                        />
                        {/* Vertical separator line to define the split cleanly if needed, or rely on the gap */}
                    </g>

                    {/* Orbiting bits */}
                    <motion.path
                        d="M8,80 Q5,85 12,90"
                        stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round"
                    />
                    <motion.path
                        d="M92,20 Q95,15 88,10"
                        stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round"
                    />

                </svg>
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
                    animate={{ scaleX: 1 }}
                    style={{ originX: 0 }}
                    transition={{ delay: 0.6 }}
                />
            </div>
        </div>
    );
};

export default Logo;
