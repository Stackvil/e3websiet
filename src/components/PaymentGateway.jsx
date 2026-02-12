import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { API_URL } from '../config/api';

const PaymentGateway = ({ amount, isOpen, onClose }) => {
    const [method, setMethod] = useState('upi'); // upi, card, netbanking
    const [isPaying, setIsPaying] = useState(false);
    const navigate = useNavigate();

    const { user, cart, addTicket, closeCart } = useStore();

    if (!isOpen) return null;

    const handlePay = async () => {
        setIsPaying(true);
        const token = localStorage.getItem('token');
        const location = cart[0]?.location || 'E3'; // Assume location based on first item or default

        try {
            const response = await fetch(`${API_URL}/orders/${location.toLowerCase()}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        id: item._id || item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity || 1,
                        details: item.details
                    }))
                }),
            });

            const result = await response.json();

            if (result.success && result.access_key) {
                if (result.mode === 'iframe' && window.EasebuzzCheckout) {
                    const easebuzzCheckout = new window.EasebuzzCheckout(result.key, result.env);
                    const options = {
                        access_key: result.access_key,
                        onResponse: (response) => {
                            if (response.status === 'success') {
                                navigate(`/success?orderId=${result.txnid}&location=${location}`);
                                onClose();
                            } else {
                                navigate(`/failed?orderId=${result.txnid}&location=${location}`);
                                onClose();
                            }
                        }
                    };
                    easebuzzCheckout.initiatePayment(options);
                    setIsPaying(false);
                } else {
                    window.location.href = result.payment_url;
                }
            } else {
                alert('Payment Initiation Failed: ' + (result.message || 'Error'));
                setIsPaying(false);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Something went wrong. Please try again.');
            setIsPaying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-charcoal-grey/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md relative z-10 border border-gray-100"
            >
                {/* Razorpay-style Header */}
                <div className="bg-[#1D2B44] text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Ethree Entertainment</h2>
                        <p className="text-blue-300 text-xs">ethree.vijayawada@payment</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs opacity-60 block">Amount</span>
                        <span className="text-xl font-bold">₹{amount}</span>
                    </div>
                </div>

                <div className="p-8">
                    {isPaying ? (
                        <div className="py-12 text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-16 h-16 border-4 border-riverside-teal border-t-transparent rounded-full mx-auto mb-6"
                            />
                            <p className="font-bold text-charcoal-grey">Processing Payment...</p>
                            <p className="text-gray-400 text-sm mt-2">Please do not close the window</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => setMethod('upi')}
                                    className={`flex-1 p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${method === 'upi' ? 'border-riverside-teal bg-teal-50 text-riverside-teal' : 'border-gray-100 text-gray-400'}`}
                                >
                                    <Smartphone size={24} />
                                    <span className="text-xs font-bold">UPI</span>
                                </button>
                                <button
                                    onClick={() => setMethod('card')}
                                    className={`flex-1 p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${method === 'card' ? 'border-riverside-teal bg-teal-50 text-riverside-teal' : 'border-gray-100 text-gray-400'}`}
                                >
                                    <CreditCard size={24} />
                                    <span className="text-xs font-bold">Card</span>
                                </button>
                                <button
                                    onClick={() => setMethod('netbanking')}
                                    className={`flex-1 p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${method === 'netbanking' ? 'border-riverside-teal bg-teal-50 text-riverside-teal' : 'border-gray-100 text-gray-400'}`}
                                >
                                    <Building size={24} />
                                    <span className="text-xs font-bold">Net Banking</span>
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                {method === 'upi' && (
                                    <div className="space-y-3">
                                        <div onClick={handlePay} className="p-4 border rounded-xl flex items-center justify-between hover:border-riverside-teal cursor-pointer transition-colors active:bg-gray-50">
                                            <span className="font-medium">PhonePe</span>
                                            <div className="w-4 h-4 rounded-full border border-gray-300" />
                                        </div>
                                        <div onClick={handlePay} className="p-4 border rounded-xl flex items-center justify-between hover:border-riverside-teal cursor-pointer transition-colors active:bg-gray-50">
                                            <span className="font-medium">Google Pay</span>
                                            <div className="w-4 h-4 rounded-full border border-gray-300" />
                                        </div>
                                    </div>
                                )}
                                {method === 'card' && (
                                    <div className="space-y-4">
                                        <input type="text" placeholder="Card Number" className="w-full p-3 border rounded-xl outline-none focus:border-riverside-teal" />
                                        <div className="flex gap-4">
                                            <input type="text" placeholder="Expiry" className="w-1/2 p-3 border rounded-xl outline-none focus:border-riverside-teal" />
                                            <input type="password" placeholder="CVV" className="w-1/2 p-3 border rounded-xl outline-none focus:border-riverside-teal" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handlePay}
                                className="w-full bg-riverside-teal text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                            >
                                Pay ₹{amount}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
                                <ShieldCheck size={14} />
                                <span>Secured by dummy Razorpay</span>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentGateway;
