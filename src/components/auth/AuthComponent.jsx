import React, { useState } from 'react';
import { X, ArrowRight, Phone, CheckCircle, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config/api';

const AuthComponent = ({ onClose, onSuccess, initialLocation = 'E3' }) => {
    // Mode: 'mobile' -> 'otp' -> 'profile'
    const [step, setStep] = useState('mobile');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Data
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Step 1: Request OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile,
                    location: initialLocation
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

            // Success -> Move to OTP step
            setStep('otp');
            // If dev mode sends OTP in response, log it
            if (data.debugOtp) console.log("Dev OTP:", data.debugOtp);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({
                    mobile,
                    otp,
                    location: initialLocation
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Invalid OTP');

            if (data.token) {
                // Save session
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.isNewUser) {
                    setStep('profile');
                    // onSuccess will be called after profile completion
                } else {
                    // Existing user - done
                    if (onSuccess) onSuccess(data.user);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Complete Profile (New Users Only)
    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const locationPath = initialLocation.toLowerCase(); // e3 or e4

            const res = await fetch(`${API_URL}/profile/${locationPath}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    email
                })
            });

            const updatedUser = await res.json();
            if (!res.ok) throw new Error(updatedUser.message || 'Failed to update profile');

            // Update local storage with new details (token remains same)
            // But we might want to merge with existing user data to keep ID/role etc if backend didn't return everything
            // Backend returns profile without password, so it should be fine.
            // Let's ensure we merge just in case backend response is partial, though typically it returns full profile.
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const finalUser = { ...currentUser, ...updatedUser };

            localStorage.setItem('user', JSON.stringify(finalUser));

            if (onSuccess) onSuccess(finalUser);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden font-body">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-charcoal-grey mb-1">
                        {step === 'mobile' ? 'Login / Signup' : step === 'otp' ? 'Verify OTP' : 'Complete Profile'}
                    </h2>
                    <p className="text-gray-400 text-xs font-medium">
                        {step === 'mobile' ? 'Enter mobile number' : step === 'otp' ? `Code sent to +91 ${mobile}` : 'Tell us a bit about yourself'}
                    </p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                )}
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-50 text-red-500 text-xs p-3 rounded-lg mb-4 font-bold flex items-center gap-2"
                    >
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></div>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
                {step === 'mobile' && (
                    <motion.form
                        key="step-mobile"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleSendOtp}
                        className="space-y-4"
                    >
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Mobile Number</label>
                            <div className="relative group">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-sunset-orange transition-colors" />
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="9876543210"
                                    className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-lg font-bold text-lg text-charcoal-grey outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange"
                                    required
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || mobile.length < 10}
                            className="w-full btn-orange py-3 rounded-lg font-bold text-base shadow-lg shadow-sunset-orange/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Sending...' : 'Get OTP'} <ArrowRight size={18} />
                        </button>
                    </motion.form>
                )}

                {step === 'otp' && (
                    <motion.form
                        key="step-otp"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-4"
                    >
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Enter 6-Digit Code</label>
                            <div className="relative group">
                                <Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-sunset-orange transition-colors" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="123456"
                                    className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-lg font-bold text-xl tracking-[0.2em] text-charcoal-grey outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange text-center"
                                    required
                                    pattern="[0-9]{6}"
                                    maxLength="6"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setStep('mobile')}
                                className="px-4 py-3 rounded-lg font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || otp.length < 6}
                                className="flex-1 btn-orange py-3 rounded-lg font-bold text-base shadow-lg shadow-sunset-orange/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Verifying...' : 'Verify'} <CheckCircle size={18} />
                            </button>
                        </div>
                    </motion.form>
                )}

                {step === 'profile' && (
                    <motion.form
                        key="step-profile"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleCompleteProfile}
                        className="space-y-4"
                    >
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-3 py-3 bg-gray-50 rounded-lg font-bold text-charcoal-grey outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange"
                                required
                                minLength="2"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Email Address (Optional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="w-full px-3 py-3 bg-gray-50 rounded-lg font-bold text-charcoal-grey outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="w-full btn-orange py-3 rounded-lg font-bold text-base shadow-lg shadow-sunset-orange/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Saving...' : 'Complete Profile'} <ArrowRight size={18} />
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthComponent;
