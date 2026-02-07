import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
const Cart = () => {
    const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, clearCart, user, setUser } = useStore();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false); // Kept for logic compatibility but unused for modal
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const [isProcessing, setIsProcessing] = useState(false);

    const initiatePayment = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/payment/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: totalPrice,
                    firstname: user?.name?.split(' ')[0] || 'User',
                    email: user?.email || 'noprovided@example.com',
                    phone: user?.mobile || user?.phone || mobile || '9999999999',
                    productinfo: `Booking for ${cart.length} items`,
                    items: cart
                }),
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = result.payment_url;
            } else {
                alert('Payment Initiation Failed: ' + result.message);
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert(`Payment Error: ${error.message}`);
            setIsProcessing(false);
        }
    };

    const handlePayClick = () => {
        if (cart.length === 0) return;

        if (user) {
            initiatePayment();
        } else {
            setShowAuthModal(true);
        }
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!isOtpSent) {
                // Send OTP
                const response = await fetch('http://127.0.0.1:5001/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mobile })
                });
                const data = await response.json();
                if (data.message) {
                    alert(data.message); // Show dummy OTP
                    setIsOtpSent(true);
                }
            } else {
                // Verify OTP
                const response = await fetch('http://127.0.0.1:5001/api/auth/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mobile, otp })
                });
                const data = await response.json();

                if (data.token) {
                    setUser(data.user);
                    setShowAuthModal(false);
                    // Proceed to payment immediately with the new user data
                    setIsProcessing(true);
                    // Call initiate payment logic manually since we have data
                    // Or just rely on state update? State update might be slow for immediate call, pass user explicitly

                    // Re-using initiatePayment logic but with explicit user data
                    const paymentRes = await fetch('http://127.0.0.1:5001/api/payment/initiate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: totalPrice,
                            firstname: data.user.name?.split(' ')[0] || 'User',
                            email: data.user.email || 'noprovided@example.com',
                            phone: data.user.mobile || mobile,
                            productinfo: `Booking for ${cart.length} items`,
                            items: cart
                        }),
                    });
                    const result = await paymentRes.json();
                    if (result.success) {
                        window.location.href = result.payment_url;
                    } else {
                        alert('Payment Failed: ' + result.message);
                        setIsProcessing(false);
                    }
                } else {
                    alert(data.message || 'Verification Failed');
                }
            }
        } catch (error) {
            console.error(error);
            alert('Error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-[100] overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleCart}
                            className="absolute inset-0 bg-charcoal-grey/60 backdrop-blur-sm"
                        />

                        <div className="absolute inset-y-0 right-0 max-w-full flex">
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="w-screen max-w-md"
                            >
                                <div className="h-full flex flex-col bg-white shadow-2xl relative">
                                    {/* Header */}
                                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-creamy-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-sunset-orange rounded-2xl flex items-center justify-center text-white">
                                                <ShoppingBag size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-heading font-bold">Your Order</h2>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{cart.length} Stalls Selected</p>
                                            </div>
                                        </div>
                                        <button onClick={toggleCart} className="p-2 hover:bg-gray-200 rounded-xl transition-all">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    {/* Items */}
                                    <div className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar">
                                        {cart.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                                <ShoppingBag size={80} className="mb-6" />
                                                <p className="text-xl font-bold uppercase tracking-tighter">Your cart is empty</p>
                                                <button
                                                    onClick={toggleCart}
                                                    className="mt-6 text-sunset-orange font-bold underline"
                                                >
                                                    Browse Stalls
                                                </button>
                                            </div>
                                        ) : (
                                            cart.map((item) => (
                                                <div key={item.id} className="flex gap-6 group">
                                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-grow flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                                                                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-riverside-teal font-bold uppercase tracking-widest mt-1">{item.stall}</p>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <span className="font-heading font-bold text-sunset-orange">₹{item.price}</span>
                                                            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1 border border-gray-100">
                                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm">
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm">
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Footer */}
                                    {cart.length > 0 && (
                                        <div className="p-8 bg-creamy-white border-t border-gray-100 space-y-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Subtotal</span>
                                                <span className="text-3xl font-heading font-bold text-charcoal-grey">₹{totalPrice}</span>
                                            </div>

                                            <button
                                                onClick={handlePayClick}
                                                disabled={isProcessing}
                                                className="w-full btn-orange py-5 rounded-[2rem] text-lg flex items-center justify-center gap-4 shadow-xl shadow-sunset-orange/20 disabled:opacity-50"
                                            >
                                                {isProcessing ? 'Processing...' : 'Pay'} <ArrowRight size={20} />
                                            </button>

                                            <button
                                                onClick={clearCart}
                                                className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-all"
                                            >
                                                Clear Selection
                                            </button>
                                        </div>
                                    )}

                                    {/* Auth Prompt Overlay (Login/Register) */}
                                    <AnimatePresence>
                                        {showAuthModal && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center p-8"
                                            >
                                                <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl border border-gray-100">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h3 className="text-xl font-bold font-heading">
                                                            {isOtpSent ? 'Verify OTP' : 'Login / Signup'}
                                                        </h3>
                                                        <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                                            <X size={20} />
                                                        </button>
                                                    </div>

                                                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                                                        {!isOtpSent ? (
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                                                                <input
                                                                    type="tel"
                                                                    value={mobile}
                                                                    onChange={(e) => setMobile(e.target.value)}
                                                                    placeholder="9876543210"
                                                                    pattern="[0-9]{10}"
                                                                    className="w-full p-3 bg-gray-50 rounded-xl font-medium outline-none border-2 border-transparent focus:border-sunset-orange"
                                                                    autoFocus
                                                                    required
                                                                />
                                                                <p className="text-xs text-gray-400 mt-2">Dummy OTP: 123456</p>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enter OTP</label>
                                                                <input
                                                                    type="text"
                                                                    value={otp}
                                                                    onChange={(e) => setOtp(e.target.value)}
                                                                    placeholder="123456"
                                                                    className="w-full p-3 bg-gray-50 rounded-xl font-medium outline-none border-2 border-transparent focus:border-sunset-orange"
                                                                    autoFocus
                                                                    required
                                                                />
                                                            </div>
                                                        )}

                                                        <button
                                                            type="submit"
                                                            disabled={isLoading || isProcessing}
                                                            className="w-full btn-orange py-4 rounded-xl font-bold shadow-lg shadow-sunset-orange/20 mt-4 disabled:opacity-50"
                                                        >
                                                            {isLoading ? 'Processing...' : (isOtpSent ? 'Verify & Pay' : 'Send OTP')}
                                                        </button>
                                                    </form>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Cart;
