import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LegalModal from '../pages/LegalModal';

const ConsentBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [legalDoc, setLegalDoc] = useState(null);

    useEffect(() => {
        const consent = localStorage.getItem('e3PolicyAccepted');
        if (!consent) setIsVisible(true);
    }, []);

    const handleAccept = () => {
        localStorage.setItem('e3PolicyAccepted', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] bg-gray-900 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl"
                >
                    <p className="text-sm text-gray-300 text-center sm:text-left">
                        🍪 By using Jaan Entertainment, you agree to our{' '}
                        <button onClick={() => setLegalDoc('terms')} className="text-sunset-orange font-semibold hover:underline">Terms</button> &{' '}
                        <button onClick={() => setLegalDoc('privacy')} className="text-sunset-orange font-semibold hover:underline">Privacy Policy</button>.
                        We use cookies to improve your experience.
                    </p>
                    <button
                        onClick={handleAccept}
                        className="shrink-0 px-5 py-2 bg-sunset-orange text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        I Accept
                    </button>
                </motion.div>
            )}
            {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />}
        </AnimatePresence>
    );
};

export default ConsentBanner;
