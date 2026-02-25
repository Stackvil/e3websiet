import React from 'react';
import { motion } from 'framer-motion';

const DineSkeleton = () => {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col w-full relative">
            {/* Image Skeleton */}
            <div className="h-40 relative overflow-hidden bg-gray-50">
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

            {/* Content Skeleton */}
            <div className="p-3">
                <div className="mb-2 space-y-2">
                    {/* Stall Name */}
                    <div className="h-4 w-3/4 bg-gray-100 rounded relative overflow-hidden">
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
                    {/* Phone Number */}
                    <div className="h-3 w-1/2 bg-gray-50 rounded relative overflow-hidden">
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

                {/* Button Skeleton */}
                <div className="h-8 w-full bg-gray-100 rounded-lg relative overflow-hidden">
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
    );
};

export default DineSkeleton;
