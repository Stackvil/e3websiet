import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { LogOut, User, Edit2, Save, X, Phone } from 'lucide-react';

const Login = () => {
    const { user, setUser } = useStore();
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Mobile Entry, 2: OTP Entry
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Profile Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleStartEdit = () => {
        setEditName(user.name || '');
        setEditEmail(user.email || '');
        setIsEditing(true);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        const updatedUser = { ...user, name: editName, email: editEmail };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Server error');
            }

            setStep(2);
        } catch (err) {
            console.error('OTP Error:', err);
            alert(`Failed to send OTP: ${err.message}. Is the server running?`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp })
            });
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);

                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                alert(data.message || 'Invalid OTP');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to the server. Please ensure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center"
                >
                    <div className="w-24 h-24 bg-riverside-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 text-riverside-teal">
                        <User size={48} />
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSaveProfile} className="space-y-4 mb-6 text-left">
                            <h2 className="text-2xl font-bold font-heading text-center mb-6">Edit Profile</h2>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl font-medium outline-none border-2 border-transparent focus:border-riverside-teal"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl font-medium outline-none border-2 border-transparent focus:border-riverside-teal"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={18} /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-riverside-teal text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Save
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h1 className="text-3xl font-heading font-bold text-charcoal-grey mb-2">Welcome Back!</h1>
                            <p className="text-xl font-bold text-sunset-orange mb-1">
                                {user.role === 'admin' ? 'Admin' : (user.name || user.mobile)}
                            </p>
                            <p className="text-gray-400 text-sm mb-8">{user.mobile}</p>

                            {user.role === 'admin' && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="w-full bg-riverside-teal text-white mb-3 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    Go to Admin Dashboard
                                </button>
                            )}

                            <button
                                onClick={handleStartEdit}
                                className="w-full border-2 border-gray-100 text-riverside-teal mb-3 py-4 rounded-xl font-bold text-lg hover:border-riverside-teal hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Edit2 size={20} /> Edit Profile
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full border-2 border-transparent text-gray-400 py-2 rounded-xl font-bold text-sm hover:text-red-500 transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-heading font-bold text-charcoal-grey">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Sign in using your mobile number</p>
                </div>

                <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="space-y-6">
                    {step === 1 ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-charcoal-grey mb-2">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-sunset-orange focus:ring-1 focus:ring-sunset-orange transition-all outline-none"
                                    placeholder="Enter your 10-digit number"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-2">Dummy OTP: 123456</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-sunset-orange text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-sunset-orange/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </>
                    ) : (
                        <>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <label className="block text-sm font-bold text-charcoal-grey mb-2">Enter OTP</label>
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
                                disabled={isLoading}
                                className="w-full bg-riverside-teal text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-riverside-teal/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-gray-400 text-sm font-bold hover:text-charcoal-grey"
                            >
                                Change Mobile Number
                            </button>
                        </>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
