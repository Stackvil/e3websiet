import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email/Pass selection, 2: OTP Entry
    const [isOtpLogin, setIsOtpLogin] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5001/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            setStep(2);
            setIsOtpLogin(true);
        } catch (err) {
            alert('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5001/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } else {
                alert(data.message || 'Invalid OTP');
            }
        } catch (err) {
            alert('OTP error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.user.role === 'admin') navigate('/admin');
                else navigate('/');
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            alert('Login error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-heading font-bold text-charcoal-grey">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Sign in to your Ethree account</p>
                </div>

                <form onSubmit={step === 1 ? handleSubmit : handleVerifyOtp} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-charcoal-grey mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={step === 2}
                            className={`w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-sunset-orange focus:ring-1 focus:ring-sunset-orange transition-all outline-none ${step === 2 ? 'bg-gray-50' : ''}`}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    {step === 1 ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-charcoal-grey mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-sunset-orange focus:ring-1 focus:ring-sunset-orange transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-sunset-orange text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-sunset-orange/20 transition-all active:scale-95"
                            >
                                Sign In
                            </button>
                            <div className="flex items-center gap-4 my-4">
                                <div className="h-[1px] bg-gray-200 flex-grow"></div>
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">OR</span>
                                <div className="h-[1px] bg-gray-200 flex-grow"></div>
                            </div>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                className="w-full border-2 border-riverside-teal text-riverside-teal py-4 rounded-xl font-bold text-lg hover:bg-riverside-teal hover:text-white transition-all active:scale-95"
                            >
                                Login with OTP
                            </button>
                        </>
                    ) : (
                        <>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <label className="block text-sm font-bold text-charcoal-grey mb-2">Enter OTP (Sent to Email)</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-sunset-orange focus:ring-1 focus:ring-sunset-orange transition-all outline-none"
                                    placeholder="123456"
                                    maxLength={6}
                                    required
                                />
                            </motion.div>
                            <button
                                type="submit"
                                className="w-full bg-riverside-teal text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-riverside-teal/20 transition-all active:scale-95"
                            >
                                Verify & Proceed
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-gray-400 text-sm font-bold hover:text-charcoal-grey"
                            >
                                Back to Password
                            </button>
                        </>
                    )}
                </form>

                <div className="mt-8 pt-8 border-t text-center">
                    <p className="text-gray-500 text-sm">
                        Don't have an account? <button className="text-sunset-orange font-bold hover:underline">Register Now</button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
