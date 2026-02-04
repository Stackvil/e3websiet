import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import PaymentGateway from './PaymentGateway';

const Cart = () => {
    const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, clearCart, user, setUser } = useStore();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [showMobilePrompt, setShowMobilePrompt] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');

    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handlePayClick = () => {
        if (cart.length === 0) return;

        if (user?.mobile) {
            setIsPaymentOpen(true);
        } else {
            setShowMobilePrompt(true);
        }
    };

    const handleMobileSubmit = (e) => {
        e.preventDefault();
        if (mobileNumber.length >= 10) {
            setUser({ mobile: mobileNumber });
            setShowMobilePrompt(false);
            setIsPaymentOpen(true);
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
                                                className="w-full btn-orange py-5 rounded-[2rem] text-lg flex items-center justify-center gap-4 shadow-xl shadow-sunset-orange/20"
                                            >
                                                Pay <ArrowRight size={20} />
                                            </button>

                                            <button
                                                onClick={clearCart}
                                                className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-all"
                                            >
                                                Clear Selection
                                            </button>
                                        </div>
                                    )}

                                    {/* Mobile Number Prompt Overlay */}
                                    <AnimatePresence>
                                        {showMobilePrompt && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center p-8"
                                            >
                                                <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl border border-gray-100">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h3 className="text-xl font-bold font-heading">Quick Login</h3>
                                                        <button onClick={() => setShowMobilePrompt(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                                            <X size={20} />
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-500 text-sm mb-6">Enter your mobile number to continue with your payment.</p>

                                                    <form onSubmit={handleMobileSubmit}>
                                                        <input
                                                            type="tel"
                                                            value={mobileNumber}
                                                            onChange={(e) => setMobileNumber(e.target.value)}
                                                            placeholder="Mobile Number"
                                                            className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border-2 border-transparent focus:border-sunset-orange mb-4"
                                                            autoFocus
                                                            pattern="[0-9]{10}"
                                                            title="Please enter a valid 10-digit mobile number"
                                                            required
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="w-full btn-orange py-4 rounded-xl font-bold shadow-lg shadow-sunset-orange/20"
                                                        >
                                                            Continue to Pay
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

            <PaymentGateway
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                amount={totalPrice}
            />
        </>
    );
};

export default Cart;
