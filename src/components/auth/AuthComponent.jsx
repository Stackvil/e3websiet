import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Phone, CheckCircle, Smartphone, RefreshCw } from 'lucide-react';
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

    // Resend OTP countdown (60 seconds)
    const [resendTimer, setResendTimer] = useState(0);
    const timerRef = useRef(null);

    // Start 60-second countdown whenever we enter OTP step
    const startResendTimer = () => {
        setResendTimer(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Step 1: Request OTP
    const handleSendOtp = async (e) => {
        e?.preventDefault();
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

            // Move to OTP step and start countdown
            setStep('otp');
            setOtp('');
            startResendTimer();

            // Dev mode: auto-fill OTP
            if (data.debugOtp) {
                console.log("Dev OTP:", data.debugOtp);
                setOtp(data.debugOtp);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP (same as send, but from OTP step)
    const handleResend = async () => {
        if (resendTimer > 0 || isLoading) return;
        setError('');
        setIsLoading(true);
        setOtp('');

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

            if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');

            startResendTimer();
            if (data.debugOtp) {
                console.log("Dev OTP:", data.debugOtp);
                setOtp(data.debugOtp);
            }
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
                credentials: 'include',
                body: JSON.stringify({ mobile, otp })  // location now comes from OTP record
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Invalid OTP');

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.isNewUser) {
                    setStep('profile');
                } else {
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

            const res = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            const updatedUser = await res.json();
            if (!res.ok) throw new Error(updatedUser.message || 'Failed to update profile');

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

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden font-body">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-charcoal-grey mb-1">
                        {step === 'mobile' ? 'Login / Signup' : step === 'otp' ? 'Verify OTP' : 'Complete Profile'}
                    </h2>
                    <p className="text-gray-400 text-xs font-medium">
                        {step === 'mobile'
                            ? 'Enter your mobile number'
                            : step === 'otp'
                                ? `Code sent to +91 ${mobile}`
                                : 'Tell us a bit about yourself'}
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
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-50 text-red-500 text-xs p-3 rounded-lg mb-4 font-bold flex items-center gap-2"
                    >
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">

                {/* ── Step 1: Mobile ── */}
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
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">
                                Mobile Number
                            </label>
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

                {/* ── Step 2: OTP ── */}
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
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">
                                Enter 6-Digit Code
                            </label>
                            <div className="relative group">
                                <Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-sunset-orange transition-colors" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="• • • • • •"
                                    className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-lg font-bold text-xl tracking-[0.3em] text-charcoal-grey outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange text-center"
                                    required
                                    pattern="[0-9]{6}"
                                    maxLength="6"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Resend OTP row */}
                        <div className="flex items-center justify-between px-1">
                            <button
                                type="button"
                                onClick={() => { setStep('mobile'); setError(''); }}
                                className="text-xs text-gray-400 hover:text-charcoal-grey font-bold transition-colors"
                            >
                                ← Change number
                            </button>

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendTimer > 0 || isLoading}
                                className={`flex items-center gap-1.5 text-xs font-bold transition-all ${resendTimer > 0
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-sunset-orange hover:text-orange-600 active:scale-95'
                                    }`}
                            >
                                <RefreshCw size={12} className={resendTimer > 0 ? '' : 'group-hover:rotate-180 transition-transform'} />
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                            </button>
                        </div>

                        {/* Progress bar for countdown */}
                        {resendTimer > 0 && (
                            <div className="w-full h-0.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-sunset-orange/40 rounded-full"
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${(resendTimer / 60) * 100}%` }}
                                    transition={{ duration: 1, ease: 'linear' }}
                                />
                            </div>
                        )}

                        <div className="flex gap-2 pt-1">
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

                {/* ── Step 3: Profile ── */}
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
