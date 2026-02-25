import React from 'react';
import { motion } from 'framer-motion';

const RideSkeleton = () => {
    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 flex flex-col aspect-[3/5] md:aspect-[3/4] w-full shadow-lg">
            {/* Image Skeleton */}
            <div className="h-[60%] relative overflow-hidden bg-white/5">
                <motion.div
                    animate={{
                        x: ['-100%', '100%'],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
            </div>

            {/* Content Skeleton */}
            <div className="p-2 flex flex-col h-[40%] justify-between bg-white/95">
                <div className="flex flex-col items-center pt-1">
                    <div className="h-3 w-2/3 bg-gray-200 rounded-full relative overflow-hidden">
                        <motion.div
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pb-1">
                    <div className="h-7 bg-gray-100 rounded-md relative overflow-hidden">
                        <motion.div
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                    </div>
                    <div className="h-7 bg-orange-100 rounded-md relative overflow-hidden">
                        <motion.div
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RideSkeleton;
