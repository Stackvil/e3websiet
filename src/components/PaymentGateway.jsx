import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Building, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { API_URL } from '../config/api';

const PaymentGateway = ({ amount, isOpen, onClose }) => {
    const [method, setMethod] = useState('upi');
    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { user, cart, closeCart } = useStore();

    if (!isOpen) return null;

    // Read location from JWT token
    const getLocation = () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return (payload.type || 'E3').toUpperCase();
            }
        } catch (_) { }
        return 'E3';
    };

    const handlePay = async () => {
        setIsPaying(true);
        setError('');
        const token = localStorage.getItem('token');
        const location = getLocation();

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

            if (response.status === 401) {
                setError('Session expired. Please log in again.');
                setIsPaying(false);
                return;
            }

            if (result.success && result.access_key) {
                if (result.mode === 'iframe' && window.EasebuzzCheckout) {
                    // Easebuzz hosted iframe mode
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
                } else if (result.payment_url) {
                    // Hosted redirect mode
                    window.location.href = result.payment_url;
                } else {
                    setError('Could not get a payment URL. Please try again.');
                    setIsPaying(false);
                }
            } else {
                setError(result.message || 'Payment initiation failed. Please try again.');
                setIsPaying(false);
            }
        } catch (err) {
            console.error('Payment Error:', err);
            setError('Network error. Please check your connection and try again.');
            setIsPaying(false);
        }
    };

    const methods = [
        { id: 'upi', label: 'UPI', icon: Smartphone },
        { id: 'card', label: 'Card', icon: CreditCard },
        { id: 'netbanking', label: 'Net Banking', icon: Building },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-charcoal-grey/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md relative z-10 border border-gray-100"
            >
                {/* Header */}
                <div className="bg-[#1D2B44] text-white p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Ethree Entertainment</h2>
                        <p className="text-blue-300 text-xs mt-0.5">Secure Checkout · {getLocation()}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs opacity-60 block">Total Amount</span>
                        <span className="text-2xl font-black">₹{amount}</span>
                    </div>
                </div>

                <div className="p-6">
                    {isPaying ? (
                        <div className="py-14 text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                className="w-14 h-14 border-4 border-riverside-teal border-t-transparent rounded-full mx-auto mb-5"
                            />
                            <p className="font-bold text-charcoal-grey text-lg">Redirecting to Payment...</p>
                            <p className="text-gray-400 text-sm mt-2">Please do not close this window</p>
                        </div>
                    ) : (
                        <>
                            {/* Error message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-600">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Method selector */}
                            <div className="flex gap-3 mb-6">
                                {methods.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setMethod(id)}
                                        className={`flex-1 p-3 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all text-sm font-bold ${method === id
                                                ? 'border-riverside-teal bg-teal-50 text-riverside-teal shadow-sm'
                                                : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                            }`}
                                    >
                                        <Icon size={22} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Method description */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600">
                                {method === 'upi' && (
                                    <div className="space-y-1">
                                        <p className="font-bold text-charcoal-grey text-xs uppercase tracking-wider mb-2">Pay via UPI</p>
                                        <p>You will be redirected to Easebuzz to complete payment using your UPI app (PhonePe, GPay, Paytm, etc.)</p>
                                    </div>
                                )}
                                {method === 'card' && (
                                    <div className="space-y-1">
                                        <p className="font-bold text-charcoal-grey text-xs uppercase tracking-wider mb-2">Debit / Credit Card</p>
                                        <p>You will be redirected to Easebuzz's secure page to enter your card details. All major cards accepted.</p>
                                    </div>
                                )}
                                {method === 'netbanking' && (
                                    <div className="space-y-1">
                                        <p className="font-bold text-charcoal-grey text-xs uppercase tracking-wider mb-2">Net Banking</p>
                                        <p>You will be redirected to Easebuzz to complete payment via your bank's internet banking portal.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePay}
                                className="w-full bg-riverside-teal hover:bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-riverside-teal/20 active:scale-[0.98]"
                            >
                                Pay ₹{amount}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
                                <ShieldCheck size={13} />
                                <span>256-bit SSL secured · Powered by Easebuzz</span>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentGateway;
