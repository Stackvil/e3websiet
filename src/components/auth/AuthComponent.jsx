import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, Phone, Lock, User, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config/api';

const AuthComponent = ({ onClose, onSuccess }) => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Shared Data
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Signup Specific Data
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');

    const resetForm = () => {
        setError('');
        setIsOtpSent(false);
        setOtp('');
        setPassword('');
        setShowPassword(false);
        setName('');
    };

    const toggleMode = (newMode) => {
        setMode(newMode);
        resetForm();
    };

    // --- Login Logic ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/e3/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, password })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Login failed');

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onSuccess(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Signup Logic: Step 1 (Send OTP) ---
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
                    location: 'E3',
                    isSignup: true
                })
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.code === 'USER_EXISTS' || res.status === 400) {
                    throw new Error(data.message || 'User already registered. Please login.');
                }
                throw new Error(data.message || 'Failed to send OTP');
            }

            setIsOtpSent(true);

            if (data.debugOtp) {
                alert(`SIMULATION MODE: Your OTP is ${data.debugOtp}`);
            }
        } catch (err) {
            setError(err.message);
            // If user exists, suggest switching to login mode or just show error
            if (err.message.includes('already registered')) {
                // Optional: auto-switch to login? For now let's just show the error clearly.
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- Signup Logic: Step 2 (Verify & Create) ---
    const handleSignupVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/signup-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile,
                    otp,
                    password,
                    name: name || 'User',
                    location: 'E3'
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Verification failed');

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onSuccess(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 relative overflow-hidden font-body">
            {/* Header / Tabs */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-charcoal-grey mb-2">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <div className="flex gap-4 text-sm font-bold">
                        <button
                            onClick={() => toggleMode('login')}
                            className={`pb-1 border-b-2 transition-colors ${mode === 'login' ? 'text-sunset-orange border-sunset-orange' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => toggleMode('signup')}
                            className={`pb-1 border-b-2 transition-colors ${mode === 'signup' ? 'text-sunset-orange border-sunset-orange' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                        >
                            Signup
                        </button>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
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
                        className="bg-red-50 text-red-500 text-sm p-4 rounded-xl mb-6 font-bold flex items-center gap-3"
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
                {mode === 'login' ? (
                    <motion.form
                        key="login-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleLogin}
                        className="space-y-4"
                    >
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Mobile Number</label>
                            <div className="relative">
                                <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="9876543210"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange"
                                    required
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Password</label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-orange py-4 rounded-xl font-bold text-lg shadow-xl shadow-sunset-orange/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Logging in...' : 'Login'} <LogIn size={20} />
                        </button>
                    </motion.form>
                ) : (
                    // Signup Flow
                    !isOtpSent ? (
                        <motion.form
                            key="signup-step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleSendOtp}
                            className="space-y-4"
                        >
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Mobile Number</label>
                                <div className="relative">
                                    <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        placeholder="9876543210"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange"
                                        required
                                        pattern="[0-9]{10}"
                                        maxLength="10"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 ml-1">We'll send an OTP to verify this number.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-orange py-4 rounded-xl font-bold text-lg shadow-xl shadow-sunset-orange/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Sending...' : 'Verify Mobile'} <ArrowRight size={20} />
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="signup-step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleSignupVerify}
                            className="space-y-4"
                        >
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    className="w-full text-center py-4 bg-gray-50 rounded-xl font-bold text-2xl tracking-[0.5em] outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange"
                                    required
                                    maxLength="6"
                                    pattern="[0-9]{6}"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Name"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sunset-orange/20 transition-all border border-transparent focus:border-sunset-orange"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOtpSent(false)}
                                    className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 btn-orange py-4 rounded-xl font-bold text-lg shadow-xl shadow-sunset-orange/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Creating...' : 'Create Account'} <CheckCircle size={20} />
                                </button>
                            </div>
                        </motion.form>
                    )
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthComponent;
