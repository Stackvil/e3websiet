import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const ConsentBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('consentBannerAccepted');
        if (!consent) {
            // Show after a short delay
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('consentBannerAccepted', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 dark:bg-gray-900/95 dark:border-gray-800"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-sunset-orange/10 rounded-full">
                            <Cookie className="w-6 h-6 text-sunset-orange" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                Site Policy
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                                We use cookies to improve your experience and keep you signed in. By using our site, you agree to our policies.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAccept}
                                    className="px-4 py-2 bg-sunset-orange text-white rounded-lg text-sm font-bold hover:bg-sunset-orange/90 transition-colors shadow-lg shadow-sunset-orange/20"
                                >
                                    I Understand
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConsentBanner;
