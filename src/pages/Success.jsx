import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, User } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

const Success = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const orderId = searchParams.get('orderId');
    const { clearCart } = useStore();
    const mobile = location.state?.mobile;

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

                <h1 className="text-4xl font-heading font-bold text-charcoal-grey mb-6 tracking-tighter">Order Confirmed!</h1>

                <div className="flex justify-center mb-8">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderId || 'ETH-782'}`}
                        alt="Order QR Code"
                        className="rounded-xl border-4 border-white shadow-lg"
                    />
                </div>

                {/* Tickets Section */}
                <div className="space-y-6 mb-8 text-left">
                    <h2 className="text-xl font-bold text-charcoal-grey text-center">Your Tickets</h2>
                    {(location.state?.bookedItems || []).map((item) => (
                        <div key={item.id} className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-sunset-orange" />
                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                                <div>
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity} • ₹{item.price * item.quantity}</p>
                                    <p className="text-[10px] uppercase font-bold text-riverside-teal tracking-widest mt-1">Valid for Today</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center border-l border-dashed border-gray-300 pl-4">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ETH-${orderId || '782'}-${item.id}`}
                                    alt="QR"
                                    className="w-16 h-16 pointer-events-none"
                                />
                                <span className="text-[10px] font-bold text-gray-400 mt-1">SCAN ME</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <Link to="/login" className="w-full btn-orange py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold">
                        Go to Profile <User size={20} />
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
