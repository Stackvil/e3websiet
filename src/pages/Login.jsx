import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { LogOut, User, Edit2, Save, X, Phone } from 'lucide-react';

import { API_URL } from '../config/api';
import AuthComponent from '../components/auth/AuthComponent';

const Login = ({ location = 'E3' }) => {
    const { user, setUser } = useStore();

    const navigate = useNavigate();

    // Profile Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate(location === 'E4' ? '/e4/login' : '/');
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



    const handleLoginSuccess = (userData) => {
        setUser(userData);
        if (userData.role === 'admin') {
            navigate('/admin');
        } else {
            if (location === 'E4') {
                navigate('/events');
            } else {
                navigate('/');
            }
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

                            {/* Rewards Section Integration */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mb-4 border border-indigo-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-bl-full opacity-20 transform translate-x-8 -translate-y-8" />

                                <div className="relative z-10">
                                    <p className="text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">Your Rewards</p>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                            {user.reward_points || 0}
                                        </span>
                                        <span className="text-gray-500 font-medium text-sm">Points</span>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                                    >
                                        View Full Profile & Offers &rarr;
                                    </button>
                                </div>
                            </div>

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
                className="w-full max-w-md"
            >


                <AuthComponent onSuccess={handleLoginSuccess} />
            </motion.div>
        </div>
    );
};

export default Login;
