import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, Home, RefreshCcw } from 'lucide-react';

const Failed = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const location = searchParams.get('location');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border-2 border-red-50"
            >
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <XCircle size={48} />
                </div>

                <h1 className="text-3xl font-heading font-bold text-charcoal-grey mb-2">Payment Failed</h1>
                <p className="text-gray-500 mb-6">
                    We couldn't process your payment. Any deducted amount will be refunded within 5-7 business days.
                </p>

                {orderId && (
                    <div className="bg-gray-50 p-4 rounded-xl mb-8 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Transaction ID</p>
                        <p className="font-mono font-bold text-charcoal-grey">{orderId}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full btn-orange py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-sunset-orange/20"
                    >
                        <RefreshCcw size={20} /> Try Again
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 text-gray-400 font-bold hover:text-charcoal-grey transition-colors flex items-center justify-center gap-2"
                    >
                        <Home size={20} /> Return to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Failed;
