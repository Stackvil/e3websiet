import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';

const Success = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCart } = useStore();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-creamy-white flex items-center justify-center p-6 pt-24">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-riverside-teal/10 max-w-lg w-full text-center border border-riverside-teal/5"
            >
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle size={48} />
                </div>

                <h1 className="text-4xl font-heading font-bold text-charcoal-grey mb-4 tracking-tighter">Order Confirmed!</h1>
                <p className="text-gray-500 text-lg mb-8">
                    Thank you for your order. We've received it and are preparing it now.
                    Your order ID is <span className="font-bold text-charcoal-grey">#{orderId || 'ETH-782'}</span>.
                </p>

                <div className="space-y-4">
                    <Link to="/" className="w-full btn-orange py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold">
                        Back to Home <Home size={20} />
                    </Link>
                    <Link to="/dine" className="w-full text-riverside-teal font-bold hover:underline flex items-center justify-center gap-2">
                        Browse More Food <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="mt-12 p-6 bg-gray-50 rounded-2xl text-left border border-gray-100">
                    <h3 className="font-bold text-charcoal-grey mb-2">Next Steps</h3>
                    <ul className="text-sm text-gray-500 space-y-2">
                        <li>• Show your order ID at the respective stall.</li>
                        <li>• Real-time updates will be sent to your profile.</li>
                        <li>• Enjoy your meal on the river bank!</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default Success;
