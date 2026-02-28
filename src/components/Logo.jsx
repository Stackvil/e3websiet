import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className }) => {
    return (
        <div className={`flex flex-col items-center gap-1 select-none ${className}`}>
            {/* Logo Image */}
            <motion.div
                className="relative w-48 h-20 md:w-64 md:h-24 flex items-center justify-center p-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <img
                    src="/logo.jpeg"
                    alt="E3 Logo"
                    className="w-full h-full object-contain rounded-lg"
                />
            </motion.div>

            {/* Powered By Line */}
            <motion.p
                className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                powered by <span className="text-gray-400">JAAN ENTERTAINMENT PVT LTD</span>
            </motion.p>
        </div>
    );
};

export default Logo;
