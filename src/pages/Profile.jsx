import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Award, Gift, LogOut, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const Profile = () => {
    const { user, setUser, logout } = useStore();
    const navigate = useNavigate();

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editMobile, setEditMobile] = useState('');

    // Fetch latest profile on mount
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };

        fetchProfile();
    }, [user, navigate, setUser]);

    const handleStartEdit = () => {
        setEditName(user.name || '');
        setEditEmail(user.email || '');
        setEditMobile(user.mobile || '');
        setIsEditing(true);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editName,
                    email: editEmail
                    // Mobile is typically not editable directly or needs OTP, checking schema...
                    // Schema allows name, email, mobile. Let's send what user edited.
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist locally
                setIsEditing(false);
            } else {
                console.error("Failed to update profile");
                // Optionally handle error UI
            }
        } catch (err) {
            console.error("Error updating profile", err);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-creamy-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-riverside-teal to-dark-teal p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <User size={120} />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                                    <p className="text-teal-100 flex items-center gap-2">
                                        <span className="bg-accent-gold text-bg-deep text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                            Member
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={handleStartEdit}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
                                >
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-lg">
                                <h2 className="text-xl font-bold text-charcoal-grey border-b border-gray-100 pb-2">
                                    Edit Information
                                </h2>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full p-3 bg-gray-50 rounded-xl font-medium outline-none border-2 border-gray-100 focus:border-riverside-teal"
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
                                        className="w-full p-3 bg-gray-50 rounded-xl font-medium outline-none border-2 border-gray-100 focus:border-riverside-teal"
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label>
                                    <input
                                        type="tel"
                                        value={editMobile}
                                        disabled
                                        className="w-full p-3 bg-gray-200 rounded-xl font-medium outline-none border-2 border-gray-100 text-gray-500 cursor-not-allowed"
                                        placeholder="Mobile Number"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200"
                                    >
                                        <X size={18} /> Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-riverside-teal text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Personal Info */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-charcoal-grey border-b border-gray-100 pb-2">
                                        Personal Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-gray-600">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-riverside-teal">
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Email</p>
                                                <p className="font-medium text-charcoal-grey">{user.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-600">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-riverside-teal">
                                                <Phone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Mobile</p>
                                                <p className="font-medium text-charcoal-grey">{user.mobile || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rewards Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-charcoal-grey border-b border-gray-100 pb-2 flex items-center gap-2">
                                        <Award className="text-accent-gold" /> Rewards & Points
                                    </h3>

                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-bl-full opacity-20 transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500" />

                                        <div className="relative z-10">
                                            <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-1">Current Balance</p>
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                                    {user.reward_points || 0}
                                                </span>
                                                <span className="text-gray-500 font-medium">Points</span>
                                            </div>

                                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-indigo-100 flex items-start gap-3">
                                                <Gift className="text-purple-500 shrink-0 mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">Special Offer!</p>
                                                    <p className="text-xs text-gray-600 leading-snug">
                                                        Get <span className="font-bold text-indigo-600">500 Reward Points</span> to unlock a <span className="font-bold text-purple-600">Free Ride Ticket!</span> 🎟️
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex gap-3 items-center">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm shrink-0">
                                            💡
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Earn <strong className="text-orange-600">10 Points</strong> for every transaction above <strong className="text-orange-600">₹300</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Logout Button */}
                        <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={async () => {
                                    // Logout logic
                                    try {
                                        await fetch(`${API_URL}/auth/logout`, {
                                            method: 'POST',
                                            credentials: 'include'
                                        });
                                    } catch (e) {
                                        console.error("Logout failed", e);
                                    }
                                    setUser(null);
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    navigate('/login');
                                }}
                                className="flex items-center gap-2 px-6 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors border border-red-100"
                            >
                                <LogOut size={18} />
                                Logout
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
